import { expect, test, type Page, type APIRequestContext, type Route } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});

async function openTester(page: Page, request: APIRequestContext) {
  const response = await request.post("/api/studio/wakewords", {
    data: { phrase: `Testing ${Date.now()}`, language: "en" },
  });
  expect(response.ok()).toBeTruthy();
  const word = await response.json();
  await page.addInitScript(() => {
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    (window as any).testingTracks = [];
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await getUserMedia(constraints);
      (window as any).testingTracks.push(...stream.getTracks());
      return stream;
    };
  });
  await page.route(`**/wakewords/${word.id}/models?*`, (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: "test-version",
            word_id: word.id,
            model_id: "tester",
            trained_at: "2026-10-20T10:00:00Z",
            checksums: {},
            metrics: {},
          },
        ],
        total: 1,
        offset: 0,
        limit: 100,
      },
    }),
  );
  await page.route("**/archive/tester.json", (route) =>
    route.fulfill({ json: { micro: { probability_cutoff: 0.9, sliding_window_size: 5 } } }),
  );
  await page.goto(`/#/testing?word=${word.id}`);
  await expect(page.getByRole("heading", { name: "Testing", exact: true })).toBeVisible();
  await expect(page.locator("[data-action=start-testing]")).toBeEnabled();
}

test("switches saved sensitivity and fits a narrow viewport", async ({ page, request }) => {
  await openTester(page, request);
  await expect(page.locator("nav a").last()).toHaveText("Testing");
  await expect(page.locator("[data-action=sensitivity] option[value=slight]")).toContainText("0.95");
  await page.locator("[data-action=sensitivity]").selectOption("very");
  await expect(page.locator("[data-threshold]")).toContainText("0.80");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("img", { name: /Live detection probability/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("loads the production worker and releases real browser microphone resources on incompatible model", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openTester(page, request);
  await page.route("**/archive/tester.tflite", (route) =>
    route.fulfill({ contentType: "application/octet-stream", body: Buffer.from("not-a-tflite-model") }),
  );
  await page.locator("[data-action=start-testing]").click();
  await expect(page.getByRole("alert")).toContainText("int8 streaming microWakeWord");
  await expect.poll(() => page.evaluate(() => (window as any).testingTracks.length)).toBe(1);
  expect(
    await page.evaluate(() =>
      (window as any).testingTracks.every((track: MediaStreamTrack) => track.readyState === "ended"),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("stops the real microphone while model loading is pending", async ({ page, request }) => {
  await openTester(page, request);
  let held: Route | undefined;
  await page.route("**/archive/tester.tflite", (route) => {
    held = route;
  });
  await page.locator("[data-action=start-testing]").click();
  await expect.poll(() => Boolean(held)).toBe(true);
  await page.locator("[data-action=stop-testing]").click();
  await expect(page.locator("[data-action=start-testing]")).toBeEnabled();
  expect(
    await page.evaluate(() =>
      (window as any).testingTracks.every((track: MediaStreamTrack) => track.readyState === "ended"),
    ),
  ).toBe(true);
  await held!.fulfill({ body: "late model response" }).catch(() => {});
  await page.getByRole("link", { name: "Wakewords", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Wakewords", exact: true })).toBeVisible();
});

test("runs a real microWakeWord model through browser microphone, worklet and worker", async ({ page, request }) => {
  test.skip(!process.env.STUDIO_TEST_MODEL, "Set STUDIO_TEST_MODEL to a local int8 streaming .tflite model.");
  const model = await readFile(process.env.STUDIO_TEST_MODEL!);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openTester(page, request);
  await page.route("**/archive/tester.tflite", (route) =>
    route.fulfill({ contentType: "application/octet-stream", body: model }),
  );
  await page.locator("[data-action=start-testing]").click();
  await expect(page.locator(".testing-actions [role=status]")).toHaveText(/Listening|Above threshold/);
  await expect.poll(() => page.locator("[data-red-trace]").getAttribute("points")).toMatch(/\d+,\d+/);
  await page.locator("[data-action=sensitivity]").selectOption("very");
  await expect(page.locator("[data-threshold]")).toContainText("0.80");
  await page.getByRole("link", { name: "Wakewords", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Wakewords", exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      (window as any).testingTracks.every((track: MediaStreamTrack) => track.readyState === "ended"),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
