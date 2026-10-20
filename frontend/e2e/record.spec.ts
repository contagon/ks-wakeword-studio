import { expect, test } from '@playwright/test';

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });

test('records through real browser media, trims, saves and finds microphone provenance', async ({ page, request }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const response = await request.post('/api/studio/wakewords', { data: { phrase: 'Browser recording', language: 'en', model_id: 'browser_record' } });
  expect(response.ok()).toBeTruthy(); const word = await response.json();
  // VAD model availability is deliberately independent of real browser capture/decoding.
  await page.route('**/samples/capture/preview', async route => {
    await route.fulfill({ json: { duration_s: 3, start_s: 0.2, end_s: 2.8, trim_method: 'silero', warning: null } });
  });
  await page.goto(`/#/record?word=${word.id}`);
  await expect(page.getByRole('heading', { name: 'Record', exact: true })).toBeVisible();
  await page.locator('[data-label=negative]').click();
  await page.locator('#studio-content').focus(); await page.keyboard.press('Space');
  await expect(page.locator('[data-action=record-toggle]')).toContainText('Stop recording');
  await expect(page.locator('.studio-capture-timer')).toHaveText('00:03');
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Review your sample' })).toBeVisible();
  await expect(page.locator('[data-action=play-capture]')).toBeEnabled();
  await page.locator('[data-action=adjust-trim]').click();
  await page.locator('[name=trim-start]').fill('1.2'); await page.locator('[name=trim-end]').fill('2.4');
  await page.locator('[data-action=play-capture]').click();
  await expect(page.locator('[data-action=play-capture]')).toContainText('Stop preview');
  await page.locator('[data-action=save-capture]').click();
  await expect(page.getByRole('status').filter({ hasText: 'Sample saved' })).toBeVisible();
  const saved = await (await request.get(`/api/studio/wakewords/${word.id}/samples?source=microphone`)).json();
  expect(saved.total).toBe(1); expect(saved.items[0].label).toBe('negative');
  expect(saved.items[0].capture).toMatchObject({ trim_method: 'manual', start_s: 1.2, end_s: 2.4 });
  await page.getByRole('link', { name: 'View samples' }).click();
  await expect(page.locator('[data-row-id]')).toContainText('microphone');
  await expect(page.locator('[data-form=import]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
