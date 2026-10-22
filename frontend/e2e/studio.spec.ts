import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

async function word(request: APIRequestContext, model: string) {
  const response = await request.post("/api/studio/wakewords", {
    data: { phrase: model, language: "en", model_id: model },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}
async function content(page: Page) {
  await page.locator("#studio-content").focus();
}

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

test("Downloaded preserves old links and saves per-wakeword augmentation selections", async ({ page, request }) => {
  const a = await word(request, "browser_online_datasets");
  await page.goto(`/#/negative-datasets?word=${a.id}`);
  await expect(page.getByRole("heading", { name: "Downloaded", exact: true })).toBeVisible();
  await expect(page.locator('nav [data-page="online-datasets"]')).toHaveAttribute("aria-current", "page");
  const augmentation = page.locator("[data-augmentation-datasets]");
  await expect(augmentation.locator("article")).toHaveCount(4);
  await expect(page.locator('input[type="search"]')).toHaveCount(0);
  await expect(augmentation).toContainText("per wakeword");
  await expect(augmentation.locator('input[type="checkbox"]')).toHaveCount(4);
  for (const checkbox of await page.locator('[data-dataset-id], [data-augmentation-id] input[type="checkbox"]').all())
    await expect(checkbox).toBeChecked();
  await augmentation.locator('[data-augmentation-id="fma_16k"] input').uncheck();
  await augmentation.locator('[data-action="save-augmentation"]').click();
  await expect(augmentation.locator('[data-action="save-augmentation"]')).toBeEnabled();
  await page.reload();
  await expect(augmentation.locator('[data-augmentation-id="fma_16k"] input')).not.toBeChecked();
  await expect(augmentation.locator(".studio-status")).toHaveText(["installed", "installed", "installed", "installed"]);
  await page.goto(`/#/train?word=${a.id}`);
  await expect(page.locator("[data-training-prerequisites]")).toHaveCount(0);
  await expect(page.locator("[data-training-blocked]")).toBeVisible();
  await expect(page.locator('[data-action="start-training"]')).toBeDisabled();
  await expect(page.locator("[data-training-blocked] a")).toHaveAttribute("href", `#/online-datasets?word=${a.id}`);
  expect(
    (await request.put(`/api/studio/wakewords/${a.id}/datasets`, { data: { dataset_ids: [] } })).ok(),
  ).toBeTruthy();
  await page.reload();
  await expect(page.locator("[data-training-blocked]")).toHaveCount(0);
  await expect(page.locator('[data-action="start-training"]')).toBeEnabled();
});

test("dark mode follows the system and remembers an explicit light choice", async ({ page, request }) => {
  const a = await word(request, "browser_theme");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`/#/automate?word=${a.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme", "dark");
  const toggle = page.getByRole("button", { name: "Dark mode", exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".studio-app")).toHaveCSS("background-color", "rgb(16, 25, 35)");
  await expect(page.getByRole("heading", { name: "Automatic collection", exact: true })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: test.info().outputPath(`studio-dark-${width}.png`), fullPage: true });
  }
  await toggle.click();
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".studio-app")).toHaveCSS("background-color", "rgb(245, 247, 250)");
});

test("real kiosk collection, keyboard labels, focus suppression and workspace isolation", async ({ page, request }) => {
  const a = await word(request, "browser_a");
  const b = await word(request, "browser_b");
  const fixtures = await (await request.get("/__test/fixtures")).json();
  const enrolled = await request.post("/api/studio/devices", {
    data: { url: fixtures.leader, password: fixtures.password, role: "leader" },
  });
  expect(enrolled.ok()).toBeTruthy();
  const leader = await enrolled.json();
  const discovered = await (await request.post(`/api/studio/devices/${leader.id}/refresh`)).json();
  expect(discovered[0].credentials_status).toBe("credentials_required");
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
          data: { engine: "mww", source_phrase: "Hello robot", word_id: a.id },
        })
      ).ok(),
    ).toBeTruthy();
  }
  const collect = async () => {
    const job = await (await request.post(`/api/studio/wakewords/${a.id}/collection/jobs`, { data: {} })).json();
    expect((await (await request.post("/__test/drain-collection")).json()).ran).toBe(true);
    return (await (await request.get(`/api/studio/jobs/${job.id}`)).json()).result;
  };
  expect((await collect()).new).toBe(2);
  expect((await collect()).new).toBe(0);
  await page.goto(`/#/classify?word=${a.id}`);
  await expect(page.locator("[data-progress]")).toContainText("2 pending");
  const current = page.locator("[data-classify-current]");
  const original = await current.getAttribute("data-sample-id");
  // Letter shortcuts keep working after a button was clicked (and so focused).
  await page.getByRole("button", { name: "Positive (P)", exact: true }).focus();
  await page.keyboard.press("n");
  await expect(page.locator("[data-progress]")).toContainText("1 reviewed");
  await expect(current).not.toHaveAttribute("data-sample-id", original!);
  await page.keyboard.press("z");
  await expect(page.locator("[data-progress]")).toContainText("0 reviewed");
  await expect(page.locator("[data-progress]")).toContainText("2 pending");
  await content(page);
  await expect(page.locator("[data-waveform]")).toHaveAttribute("data-ready", "true");
  await page.keyboard.press("Space");
  await expect
    .poll(async () => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime > 0))
    .toBe(true);
  await page.keyboard.press("r");
  await page.keyboard.press("p");
  await expect(page.locator("[data-progress]")).toContainText("1 reviewed");
  await page.keyboard.press("z");
  await expect(page.locator("[data-progress]")).toContainText("2 pending");
  await page.keyboard.press("s");
  await expect(page.locator("[data-progress]")).toContainText("1 skipped");
  await page.keyboard.press("d");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.keyboard.press("n");
  await expect(page.locator("[data-progress]")).toContainText("1 reviewed");
  await page.locator("#studio-word").selectOption(b.id);
  await expect(page.getByText("No pending recordings for this workspace.")).toBeVisible();
  expect((await (await request.get(`/api/studio/wakewords/${b.id}/samples`)).json()).total).toBe(0);
  await page.reload();
  await expect(page.locator("#studio-word")).toHaveValue(b.id);
  await page.locator("#studio-word").selectOption(a.id);
  await expect(page.locator("[data-progress]")).toContainText("1 pending");
});

test("200-entry real catalog pagination, filtering, selection and server error", async ({ page, request }) => {
  const a = await word(request, "catalog_a");
  await page.goto(`/#/negative-datasets?word=${a.id}`);
  await expect(page.locator("[data-dataset-id]")).toHaveCount(50);
  for (let offset = 0; offset < 200; offset += 50) {
    await expect(page.locator(".studio-pagination")).toContainText(`${offset + 1}–${offset + 50} of 200`);
    await expect(page.getByText(`Corpus ${String(offset).padStart(3, "0")}`, { exact: true })).toBeVisible();
    if (offset < 150) await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await page.locator('[data-dataset-id="dataset_199"]').uncheck();
  await page.locator('[data-action="save-datasets"]').click();
  await expect
    .poll(
      async () => (await (await request.get(`/api/studio/wakewords/${a.id}/datasets?status=selected`)).json()).total,
    )
    .toBe(199);
  await expect(page.locator('[name="dataset-status"]')).toHaveCount(0);
  await expect(page.getByText("CC-BY")).toHaveCount(0);
  // Exercise a genuine FastAPI validation response, not a mocked UI endpoint.
  await page.locator('[data-page="wakewords"]').click();
  await page.locator('[data-form="create"] input[name="phrase"]').fill("Duplicate");
  await page.locator('[data-form="create"] input[name="language"]').fill("x".repeat(36));
  await page.locator('[data-form="create"] button').click();
  await expect(page.locator('[role="alert"]')).toBeVisible();
});

test("compact responsive navigation is keyboard usable without horizontal overflow", async ({ page, request }) => {
  const a = await word(request, "narrow_a");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/#/classify?word=${a.id}`);
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await menu.click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await menu.click();
  await page.locator('[data-page="samples"]').click();
  await expect(page.getByRole("heading", { name: "Samples", exact: true })).toBeVisible();
  await expect(page.locator("#studio-content")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(menu).not.toBeVisible();
});

test("browser generates and selects a batch, queues real training and downloads its archive", async ({
  page,
  request,
}) => {
  const a = await word(request, "browser_training");
  expect(
    (await request.put(`/api/studio/wakewords/${a.id}/datasets`, { data: { dataset_ids: [] } })).ok(),
  ).toBeTruthy();
  await page.goto(`/#/artificial?word=${a.id}`);
  await page.locator('[name="samples"]').fill("3");
  // Batching is internal; use the current explicit-provider submission workflow.
  for (const input of await page.locator("[data-engine]").all()) {
    if ((await input.getAttribute("data-engine")) !== "qwen3" && (await input.isChecked())) await input.uncheck();
  }
  await page.locator('[data-engine="qwen3"]').check();
  const generated = page.waitForResponse(
    (response) => response.url().endsWith("/generation/submissions") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Generate dataset" }).click();
  expect((await generated).ok()).toBeTruthy();
  expect((await (await request.post("/__test/drain-gpu")).json()).ran).toBe(true);
  await page.reload();
  await expect(page.locator("[data-batch-id]")).toBeEnabled();
  await page.locator("[data-batch-id]").check();
  const selected = page.waitForResponse(
    (response) => response.url().endsWith("/generation/batches") && response.request().method() === "PUT",
  );
  await page.locator('[data-action="save-batches"]').click();
  expect((await selected).ok()).toBeTruthy();
  await page.locator('[data-page="train"]').click();
  await expect(page.getByText("3 selected artificial", { exact: true })).toBeVisible();
  const queued = page.waitForResponse(
    (response) => response.url().endsWith("/training/jobs") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Start training", exact: true }).click();
  const job = await (await queued).json();
  expect((await (await request.post("/__test/drain-gpu")).json()).ran).toBe(true);
  const completed = await (await request.get(`/api/studio/jobs/${job.id}`)).json();
  expect(completed.status).toBe("complete");
  await expect(page.getByRole("dialog", { name: "Global job queue" })).toHaveCount(0);
  const versions = await (await request.get(`/api/studio/wakewords/${a.id}/models`)).json();
  expect(versions.total).toBe(1);
  await page.locator('[data-page="deploy"]').click();
  await expect(page.locator(`[data-version-id="${versions.items[0].id}"] [data-run-number]`)).toHaveText("Run #1");
  const archive = await request.get(`/api/studio/wakewords/${a.id}/models/${versions.items[0].id}/archive`);
  expect(archive.ok()).toBeTruthy();
  expect(archive.headers()["content-type"]).toBe("application/zip");
  expect((await archive.body()).subarray(0, 2).toString()).toBe("PK");
});

test("single-model preview plays isolated audio without creating a dataset", async ({ page, request }) => {
  const a = await word(request, "browser_preview");
  await page.goto(`/#/artificial?word=${a.id}`);
  await expect(page.locator('[data-preview="qwen3"]')).toBeEnabled();
  const queued = page.waitForResponse(
    (response) => response.url().endsWith("/generation/previews") && response.request().method() === "POST",
  );
  await page.locator('[data-preview="qwen3"]').click();
  const preview = await (await queued).json();
  expect(preview.payload.recipe.engines).toEqual(["qwen3"]);
  expect((await (await request.post("/__test/drain-gpu")).json()).ran).toBe(true);
  const audio = page.locator('[data-preview-audio="qwen3"]');
  await expect(page.getByRole("dialog", { name: "Global job queue" })).toHaveCount(0);
  await expect(audio).toBeVisible();
  await expect
    .poll(async () => audio.evaluate((element: HTMLAudioElement) => element.readyState))
    .toBeGreaterThanOrEqual(2);
  await expect.poll(async () => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  expect((await (await request.get(`/api/studio/wakewords/${a.id}/generation/batches`)).json()).total).toBe(0);
  expect((await request.get(`/api/studio/wakewords/${a.id}/generation/recipe`)).status()).toBe(404);
});

test("all pages have compact controls and no narrow-screen overflow", async ({ page, request }) => {
  const words = (await (await request.get("/api/studio/wakewords")).json()).items;
  const trained = words.find((item: { phrase: string }) => item.phrase === "browser_training");
  const reviewed = words.find((item: { phrase: string }) => item.phrase === "browser_a");
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "wakewords",
      "kiosks",
      "negative-datasets",
      "artificial",
      "scrape",
      "classify",
      "samples",
      "train",
      "deploy",
      "automate",
    ]) {
      const selected = ["samples", "classify"].includes(route) ? reviewed : trained;
      await page.goto(`/#/${route}?word=${selected.id}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("#studio-word")).toHaveValue(selected.id);
      await page.waitForLoadState("networkidle");
      await page.mouse.move(0, 0);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth <= innerWidth
          ? []
          : Array.from(document.querySelectorAll("#studio-content *"))
              .filter((element) => element.getBoundingClientRect().right > innerWidth)
              .map((element) => ({
                tag: element.tagName,
                class: element.className,
                right: element.getBoundingClientRect().right,
              })),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}px: ${JSON.stringify(overflow)}`,
      ).toBeTruthy();
      for (const checkbox of await page.locator('input[type="checkbox"]').all()) {
        if (!(await checkbox.isVisible())) continue;
        const box = await checkbox.boundingBox();
        expect(box?.width, `${route} checkbox width`).toBeLessThanOrEqual(22);
        expect(box?.height, `${route} checkbox height`).toBeLessThanOrEqual(22);
      }
      for (const button of await page.locator("button.studio-primary").all()) {
        if (await button.isVisible()) await expect(button).toHaveCSS("background-color", "rgb(36, 100, 73)");
      }
      if (route === "negative-datasets" && width === 1280) {
        const row = page.locator(".studio-dataset-row").first();
        const checkbox = await row.locator("input").boundingBox();
        const button = await row.getByRole("button", { name: "Download" }).boundingBox();
        const bounds = await row.boundingBox();
        expect(checkbox!.x - bounds!.x).toBeLessThan(5);
        expect(bounds!.x + bounds!.width - button!.x - button!.width).toBeLessThan(5);
      }
      if (route === "samples" && width === 390) {
        expect((await page.locator("table").boundingBox())!.width).toBeGreaterThanOrEqual(680);
        await expect(page.locator('[data-action="relabel"]').first().locator("option:checked")).toHaveText(
          "Set label…",
        );
      }
      await page.screenshot({ path: test.info().outputPath(`polish-${route}-${width}.png`), fullPage: true });
    }
  }
});

test("workspace creation hides identity and permanent deletion blocks active jobs", async ({ page, request }) => {
  await page.goto("/#/wakewords");
  await expect(page.locator('[name="model_id"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Legacy import" })).toHaveCount(0);
  await page.locator('[data-form="create"] [name="phrase"]').fill("Temporary browser workspace");
  const created = page.waitForResponse(
    (response) => response.url().endsWith("/api/studio/wakewords") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Create wakeword", exact: true }).click();
  const a = await (await created).json();
  expect(a.model_id).toMatch(/^[a-z0-9][a-z0-9_-]{0,63}$/);
  await expect(page.locator("#studio-word")).toHaveValue(a.id);
  await expect(page.locator('[data-form="edit"]')).toHaveCount(0);
  const overview = page
    .locator(".studio-card")
    .filter({ has: page.getByRole("heading", { name: `${a.phrase} · Overview`, exact: true }) });
  const deleteButton = overview.getByRole("button", { name: "Delete workspace", exact: true });
  await expect(deleteButton).toBeVisible();
  await expect(overview.getByText("Actions", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Rename / change language", exact: true })).toHaveCount(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(deleteButton).toBeVisible();
    const bounds = (await overview.boundingBox())!;
    const button = (await deleteButton.boundingBox())!;
    expect(button.x).toBeGreaterThan(bounds.x + bounds.width / 2);
    expect(button.x + button.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(button.y - bounds.y).toBeLessThan(30);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await deleteButton.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.locator('[data-action="cancel-delete"]').click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect((await request.get(`/api/studio/wakewords/${a.id}`)).ok()).toBeTruthy();
  const queued = await request.post(`/api/studio/wakewords/${a.id}/generation/previews`, {
    data: {
      language: "en",
      english_accent: "mixed",
      tts_mode: "hybrid",
      engines: ["qwen3"],
      samples: 1,
      batch_size: 1,
    },
  });
  expect(queued.ok()).toBeTruthy();
  const job = await queued.json();
  await deleteButton.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.locator('[data-action="confirm-delete"]').click();
  await expect(page.getByRole("alert")).toContainText("Cancel queued or active jobs");
  expect((await request.post(`/api/studio/jobs/${job.id}/cancel`)).ok()).toBeTruthy();
  const removed = page.waitForResponse(
    (response) => response.url().endsWith(`/wakewords/${a.id}`) && response.request().method() === "DELETE",
  );
  await page.locator('[data-action="confirm-delete"]').click();
  expect((await removed).status()).toBe(204);
  await expect(page.locator("#studio-word")).not.toHaveValue(a.id);
  expect((await request.get(`/api/studio/wakewords/${a.id}`)).status()).toBe(404);
  expect((await request.get(`/api/studio/jobs/${job.id}`)).status()).toBe(404);
});

test("workspace Automate controls scoped collection and explicitly opted-in publication", async ({ page, request }) => {
  const a = await word(request, "automate_a");
  expect(
    (await request.put(`/api/studio/wakewords/${a.id}/datasets`, { data: { dataset_ids: [] } })).ok(),
  ).toBeTruthy();
  const b = await word(request, "automate_b");
  const fixtures = await (await request.get("/__test/fixtures")).json();
  const enrolled = await request.post("/api/studio/devices", {
    data: { url: fixtures.leader, password: fixtures.password, role: "leader" },
  });
  expect(enrolled.ok()).toBeTruthy();
  const leader = await enrolled.json();
  const followers = await (await request.post(`/api/studio/devices/${leader.id}/refresh`)).json();
  await request.post(`/api/studio/devices/${followers[0].id}/credentials`, { data: { password: fixtures.password } });
  for (const device of [leader, followers[0]])
    await request.put(`/api/studio/devices/${device.id}/source-mappings`, {
      data: { engine: "mww", source_phrase: "Hello robot", word_id: a.id },
    });
  expect((await request.post("/__test/new-clips")).ok()).toBeTruthy();
  await page.goto(`/#/automate?word=${a.id}`);
  await page.locator('[name="classification-enabled"]').check();
  await page.getByRole("button", { name: "Save automation settings", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Automation settings saved");
  await page.locator('[data-page="classify"]').click();
  await page.locator('[data-action="collect-now"]').click();
  await expect(page.getByRole("dialog", { name: "Global job queue" })).toHaveCount(0);
  expect((await (await request.post("/__test/drain-collection")).json()).ran).toBe(true);
  expect((await (await request.post("/__test/drain-gpu")).json()).ran).toBe(true);
  const samples = await (await request.get(`/api/studio/wakewords/${a.id}/samples`)).json();
  expect(samples.items.every((sample: { label: string }) => sample.label === "negative")).toBe(true);
  expect(samples.total).toBe(2);
  expect((await (await request.get(`/api/studio/wakewords/${b.id}/samples`)).json()).total).toBe(0);
  const generated = await (
    await request.post(`/api/studio/wakewords/${a.id}/generation/submissions`, {
      data: {
        language: "en",
        english_accent: "mixed",
        tts_mode: "hybrid",
        engines: ["qwen3"],
        samples: 2,
        batch_size: 1,
      },
    })
  ).json();
  await request.post("/__test/drain-gpu");
  await request.put(`/api/studio/wakewords/${a.id}/generation/batches`, { data: { batch_ids: generated.batch_ids } });
  const train = async () => {
    const job = await (await request.post(`/api/studio/wakewords/${a.id}/training/jobs`)).json();
    await request.post("/__test/drain-gpu");
    expect((await (await request.get(`/api/studio/jobs/${job.id}`)).json()).status).toBe("complete");
  };
  await train();
  expect(await (await request.get(`/api/studio/wakewords/${a.id}/deployment/status`)).json()).toEqual([]);
  await page.goto(`/#/automate?word=${a.id}`);
  await page.locator('[name="after-training"]').check();
  await page.getByRole("button", { name: "Save automation settings", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Automation settings saved");
  await train();
  const delivery = await (await request.get(`/api/studio/wakewords/${a.id}/deployment/status`)).json();
  expect(delivery.some((item: { state: string }) => item.state === "published")).toBe(true);
  await page.locator("#studio-word").selectOption(b.id);
  await expect(page.locator('[name="after-training"]')).not.toBeChecked();
});

test("kiosk addresses survive refresh and the global queue follows jobs across wakewords", async ({
  page,
  request,
}) => {
  const a = await word(request, "queue_cedar"),
    b = await word(request, "queue_willow");
  const fixtures = await (await request.get("/__test/fixtures")).json();
  const leader = await (
    await request.post("/api/studio/devices", {
      data: { url: fixtures.leader, password: fixtures.password, role: "leader" },
    })
  ).json();
  const [follower] = await (await request.post(`/api/studio/devices/${leader.id}/refresh`)).json();
  await page.goto(`/#/kiosks?word=${a.id}`);
  const row = page.locator(`[data-device-id="${follower.id}"]`);
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await row.locator('[name="device-url"]').fill("http://10.8.0.42:2324");
  await row.getByRole("button", { name: "Save address", exact: true }).click();
  await expect(row).toContainText("http://10.8.0.42:2324");
  await page.getByRole("button", { name: "Refresh followers", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Fleet membership refreshed");
  await expect(row).toContainText("http://10.8.0.42:2324");
  // Restore the fixture address locally before running work against it.
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await row.locator('[name="device-url"]').fill(fixtures.follower);
  await row.getByRole("button", { name: "Save address", exact: true }).click();
  await expect(row.locator("[data-device-edit]")).toHaveCount(0);
  await page.locator('[data-page="artificial"]').click();
  await page.locator('[data-preview="qwen3"]').click();
  const drawer = page.getByRole("dialog", { name: "Global job queue" });
  await expect(drawer).toHaveCount(0);
  await page.getByRole("button", { name: "Open global job queue" }).click();
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("queue_cedar");
  const card = drawer.locator("[data-job-id]").filter({ hasText: "queue_cedar" }).first();
  await card.getByText("View logs", { exact: true }).click();
  await expect(card.getByText("Job ", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Close job queue", exact: true }).click();
  await page.locator("#studio-word").selectOption(b.id);
  await page.getByRole("button", { name: "Open global job queue" }).click();
  await expect(drawer).toContainText("queue_cedar");
  await card.locator('[data-action="cancel-job"]').click();
  await expect(drawer.locator("[data-job-id]").filter({ hasText: "queue_cedar" }).first()).toContainText("cancelled");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open global job queue" })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open global job queue" }).click();
  await expect(drawer).toHaveCSS("width", "390px");
  await page.screenshot({ path: test.info().outputPath("fleet-queue-mobile.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Open global job queue" }).click();
  await page.locator("[data-job-queue-backdrop]").click({ position: { x: 10, y: 100 } });
  await expect(drawer).toHaveCount(0);
  await page.goto(`/#/kiosks?word=${b.id}`);
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toContainText("rediscovered");
  await page.locator("#studio-word").evaluate((element: HTMLSelectElement) => element.focus());
  await expect(page.getByRole("button", { name: "Keep kiosk", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Keep kiosk", exact: true }).click();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/studio/devices/${follower.id}`, async (route) => {
    await held;
    await route.continue();
  });
  await page.getByRole("button", { name: "Remove from Studio", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("alertdialog")).toBeFocused();
  release();
  await expect(row).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh registry", exact: true })).toBeFocused();
});
