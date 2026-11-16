import { expect, test } from "@playwright/test";
import { createWord } from "./helpers";

test.use({
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});

test("records through real browser media, trims, saves and finds the recorded source", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const word = await createWord(request, "Browser recording", "browser_record");
  // VAD model availability is deliberately independent of real browser capture/decoding.
  await page.route("**/samples/capture/preview", async (route) => {
    await route.fulfill({ json: { duration_s: 3, start_s: 0.2, end_s: 2.8, trim_method: "silero", warning: null } });
  });
  await page.goto(`/#/manual?word=${word.id}`);
  await expect(page.getByRole("heading", { name: "Manual", exact: true })).toBeVisible();
  await page.locator("[data-label=negative]").click();
  await page.locator("#studio-content").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-action=record-toggle]")).toContainText("Stop recording");
  await expect(page.locator(".studio-capture-timer")).toHaveText("00:03");
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Review your sample" })).toBeVisible();
  await expect(page.locator("[data-action=play-capture]")).toBeEnabled();
  await page.locator("[data-action=adjust-trim]").click();
  await page.locator("[name=trim-start]").fill("1.2");
  await page.locator("[name=trim-end]").fill("2.4");
  await page.locator("[data-action=play-capture]").click();
  await expect(page.locator("[data-action=play-capture]")).toContainText("Stop preview");
  await page.locator("[data-action=save-capture]").click();
  await expect(page.getByRole("status").filter({ hasText: "Sample saved" })).toBeVisible();
  const saved = await (await request.get(`/api/studio/wakewords/${word.id}/samples?source=microphone`)).json();
  expect(saved.total).toBe(1);
  expect(saved.items[0].label).toBe("negative");
  expect(saved.items[0].capture).toMatchObject({ trim_method: "manual", start_s: 1.2, end_s: 2.4 });
  await page.getByRole("link", { name: "View samples" }).click();
  await expect(page.locator("[data-row-id]")).toContainText("Recorded");
  await expect(page.locator("[data-form=import]")).toHaveCount(0);
  // Reopen the crop against the full source and expand both edges without undoing first.
  await page.locator('[data-action="edit"]').click();
  const dialog = page.getByRole("dialog", { name: "Edit sample", exact: true });
  await expect(dialog).toContainText("Current trim: 1.20–2.40 s");
  await expect(dialog).toContainText("1.20 s retained");
  await expect(dialog.locator('[name="trim-start"]')).toHaveValue("1.2");
  await expect(dialog.locator('[name="trim-end"]')).toHaveValue("2.4");
  expect(Number(await dialog.locator('[name="trim-end"]').getAttribute("max"))).toBeGreaterThanOrEqual(3);
  await dialog.locator('[name="trim-start"]').fill("0.4");
  await dialog.locator('[name="trim-end"]').fill("2.8");
  await expect(dialog).toContainText("2.40 s retained");
  await dialog.locator('[data-action="save-sample"]').click();
  await expect(dialog).not.toBeVisible();
  const updated = await (await request.get(`/api/studio/wakewords/${word.id}/samples`)).json();
  expect(updated.items[0]).toMatchObject({ trim_start_s: 0.4, trim_end_s: 2.8 });
  await page.locator('[data-action="edit"]').click();
  await dialog.locator('[data-action="undo"]').click();
  await expect(dialog).toContainText("Current trim: 1.20–2.40 s");
  await expect(page.locator("[data-row-id]")).toContainText("1.20–2.40 s");
  // The dialog edits like the Trim page: drag handles, double-click to set the start, Space and Enter shortcuts.
  await expect(dialog.getByRole("slider")).toHaveCount(2);
  const wave = dialog.locator(".studio-trim-wave");
  const bounds = (await wave.boundingBox())!;
  await wave.dblclick({ position: { x: bounds.width / 10, y: bounds.height / 2 } });
  const start = Number(await dialog.locator('[name="trim-start"]').inputValue());
  expect(start).toBeLessThan(1.2);
  await page.keyboard.press("Space");
  await expect(dialog.locator('[data-action="toggle-playback"]')).toContainText("Pause");
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
  const shortcutSaved = await (await request.get(`/api/studio/wakewords/${word.id}/samples`)).json();
  expect(shortcutSaved.items[0].trim_start_s).toBeCloseTo(start, 2);
  expect(errors).toEqual([]);
});
