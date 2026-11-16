import { expect, test, type APIRequestContext } from "@playwright/test";
import { createWord } from "./helpers";

async function collectReviewSamples(request: APIRequestContext, suffix = "") {
  const word = await createWord(request, `Browser trim queue${suffix}`, `browser_trim_queue${suffix}`);
  const fixtures = await (await request.get("/__test/fixtures")).json();
  const devices = await (await request.get("/api/studio/devices")).json();
  let leader = devices.find((device: { url: string }) => device.url === fixtures.leader);
  if (!leader) {
    const enrolled = await request.post("/api/studio/devices", {
      data: { url: fixtures.leader, password: fixtures.password, role: "leader" },
    });
    expect(enrolled.ok()).toBeTruthy();
    leader = await enrolled.json();
  }
  const discovered = await (await request.post(`/api/studio/devices/${leader.id}/refresh`)).json();
  expect(
    (
      await request.post(`/api/studio/devices/${discovered[0].id}/credentials`, {
        data: { password: fixtures.password },
      })
    ).ok(),
  ).toBeTruthy();
  for (const device of [leader, discovered[0]]) {
    expect(
      (
        await request.put(`/api/studio/devices/${device.id}/source-mappings`, {
          data: { engine: "mww", source_phrase: "Hello robot", word_id: word.id },
        })
      ).ok(),
    ).toBeTruthy();
  }
  expect((await request.post("/__test/new-clips")).ok()).toBeTruthy();
  expect((await request.post(`/api/studio/wakewords/${word.id}/collection/jobs`, { data: {} })).ok()).toBeTruthy();
  expect((await (await request.post("/__test/drain-collection")).json()).ran).toBe(true);
  const samples = await (await request.get(`/api/studio/wakewords/${word.id}/samples`)).json();
  expect(samples.total).toBe(2);
  for (const sample of samples.items) {
    expect(
      (
        await request.post(`/api/studio/wakewords/${word.id}/samples/${sample.id}/label`, {
          data: { label: "positive", expected_revision: sample.revision },
        })
      ).ok(),
    ).toBeTruthy();
  }
  return word;
}

test("trims a real review queue with draggable edges, keyboard controls, save, skip and undo", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const word = await collectReviewSamples(request);
  await page.goto(`/#/trim?word=${word.id}`);
  await expect(page.getByRole("heading", { name: "Trim", exact: true })).toBeVisible();
  await expect(page.locator("[data-progress]")).toContainText("2 remaining");
  const current = page.locator("[data-trim-current]");
  const first = await current.getAttribute("data-sample-id");
  const start = page.locator("[name=trim-start]");
  const end = page.locator("[name=trim-end]");
  await expect(start).toBeVisible();
  await expect(page.locator("[data-action=play-original]")).toBeEnabled();
  await expect(page.locator("[data-playhead]")).toContainText("0.00");

  const wave = page.locator(".studio-trim-wave");
  const bounds = (await wave.boundingBox())!;
  await wave.click({ position: { x: bounds.width / 4, y: bounds.height / 2 } });
  await page.keyboard.press("[");
  await expect(start).toHaveValue("0.05");
  const startHandle = page.getByRole("slider", { name: "Trim start", exact: true });
  await startHandle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(start).toHaveValue("0.06");
  await page.keyboard.press("Shift+ArrowRight");
  await expect(start).toHaveValue("0.16");
  await page.keyboard.press("Shift+ArrowLeft");
  await expect(start).toHaveValue("0.06");

  const endHandle = page.getByRole("slider", { name: "Trim end", exact: true });
  const handleBounds = (await endHandle.boundingBox())!;
  await page.mouse.move(handleBounds.x + handleBounds.width / 2, handleBounds.y + handleBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.9, bounds.y + bounds.height / 2);
  await page.mouse.up();
  await expect.poll(async () => Number(await end.inputValue())).toBeCloseTo(0.18, 2);
  await page.locator("[data-action=play-capture]").click();
  await expect
    .poll(async () => Number((await page.locator("[data-playhead]").textContent())!.match(/[\d.]+/)![0]))
    .toBeGreaterThan(0.06);
  await page.locator("#studio-content").focus();
  await page.keyboard.press("Enter");
  await expect(current).not.toHaveAttribute("data-sample-id", first!);
  await expect(page.locator("[data-progress]")).toContainText("1 remaining");
  await expect
    .poll(async () => Number((await page.locator("[data-playhead]").textContent())!.match(/[\d.]+/)![0]))
    .toBeGreaterThan(0);

  const saved = await (await request.get(`/api/studio/wakewords/${word.id}/samples/${first}`)).json();
  expect(saved.trim_status).toBe("manual");
  expect(saved.trim_start_s).toBeCloseTo(0.06, 2);
  expect(saved.trim_end_s).toBeCloseTo(0.18, 2);
  await page.keyboard.press("s");
  await expect(current).toHaveCount(0);
  await expect(page.locator("[data-progress]")).toContainText("1 skipped");
  await expect(page.locator("[data-action=undo-trim]")).toBeEnabled();
  await page.keyboard.press("z");
  await expect(current).toHaveAttribute("data-sample-id", first!);
  await expect(page.locator("[data-playhead]")).toContainText("0.00");
  expect((await (await request.get(`/api/studio/wakewords/${word.id}/samples/${first}`)).json()).trim_status).toBe(
    "needs_review",
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: test.info().outputPath(`trim-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test("double-click positions the start and shortcuts stay consistent after editing and mouse clicks", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const word = await collectReviewSamples(request, "_shortcuts");
  await page.goto(`/#/trim?word=${word.id}`);
  const current = page.locator("[data-trim-current]");
  const start = page.locator("[name=trim-start]");
  const end = page.locator("[name=trim-end]");
  await expect(page.locator("[data-action=play-original]")).toBeEnabled();
  await start.fill("0.03");
  await end.fill("0.15");
  await page.locator("[data-action=play-original]").click();
  await expect(end).toBeFocused();

  const wave = page.locator(".studio-trim-wave");
  const bounds = (await wave.boundingBox())!;
  await wave.dblclick({ position: { x: bounds.width / 4, y: bounds.height / 2 } });
  await expect(start).toHaveValue("0.05");
  await expect(end).toHaveValue("0.15");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-playhead]")).toContainText("0.15 s");
  await page.locator("[data-action=play-original]").click();
  await expect(wave).toBeFocused();
  const first = await current.getAttribute("data-sample-id");
  await page.keyboard.press("Enter");
  await expect(current).not.toHaveAttribute("data-sample-id", first!);
  await expect(page.locator("[data-action=play-original]")).toBeEnabled();
  await end.fill("0.16");
  await page.keyboard.press("Space");
  await expect(end).toHaveValue("0.16");
  await page.keyboard.press("Enter");
  await expect(current).toHaveCount(0);
  await expect(page.locator("[data-progress]")).toContainText("0 remaining");
  expect(errors).toEqual([]);
});
