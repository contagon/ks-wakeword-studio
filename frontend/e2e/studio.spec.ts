import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

async function word(request: APIRequestContext, model: string) {
  const response = await request.post('/api/studio/wakewords', { data: { phrase: model, language: 'en', model_id: model } });
  expect(response.ok()).toBeTruthy();
  return response.json();
}
async function content(page: Page) { await page.locator('#studio-content').focus(); }

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = []; browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(browserErrors.get(page)).toEqual([]); });

test('real kiosk collection, keyboard labels, focus suppression and workspace isolation', async ({ page, request }) => {
  const a = await word(request, 'browser_a');
  const b = await word(request, 'browser_b');
  const fixtures = await (await request.get('/__test/fixtures')).json();
  const enrolled = await request.post('/api/studio/devices', { data: { url: fixtures.leader, token: fixtures.token, role: 'leader' } });
  expect(enrolled.ok()).toBeTruthy();
  const leader = await enrolled.json();
  const discovered = await (await request.post(`/api/studio/devices/${leader.id}/refresh`)).json();
  expect(discovered[0].credentials_status).toBe('credentials_required');
  expect((await request.post(`/api/studio/devices/${discovered[0].id}/credentials`, { data: { token: fixtures.token } })).ok()).toBeTruthy();
  for (const device of [leader, discovered[0]]) {
    expect((await request.put(`/api/studio/devices/${device.id}/source-mappings`, { data: { engine: 'mww', source_phrase: 'Hello robot', word_id: a.id } })).ok()).toBeTruthy();
  }
  expect((await (await request.post('/api/studio/scrape', { data: {} })).json()).new).toBe(2);
  expect((await (await request.post('/api/studio/scrape', { data: {} })).json()).already_seen).toBe(2);
  await page.goto(`/#/classify?word=${a.id}`);
  await expect(page.locator('[data-progress]')).toContainText('2 pending');
  const current = page.locator('[data-classify-current]');
  const original = await current.getAttribute('data-sample-id');
  const search = page.getByRole('searchbox', { name: 'Queue search' });
  await search.focus();
  await search.pressSequentially('pnszrd');
  await expect(current).toHaveAttribute('data-sample-id', original!);
  await expect(page.locator('[data-progress]')).toContainText('0 reviewed');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Positive (P)', exact: true }).focus();
  await page.keyboard.press('n');
  await expect(page.locator('[data-progress]')).toContainText('0 reviewed');
  await content(page);
  await expect(page.locator('[data-waveform]')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('Space');
  await expect.poll(async () => page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.currentTime > 0)).toBe(true);
  await page.keyboard.press('r');
  await page.keyboard.press('p');
  await expect(page.locator('[data-progress]')).toContainText('1 reviewed');
  await page.keyboard.press('z');
  await expect(page.locator('[data-progress]')).toContainText('2 pending');
  await page.keyboard.press('s');
  await expect(page.locator('[data-progress]')).toContainText('1 skipped');
  await page.keyboard.press('d');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.keyboard.press('n');
  await expect(page.locator('[data-progress]')).toContainText('1 reviewed');
  await page.locator('#studio-word').selectOption(b.id);
  await expect(page.getByText('No pending recordings for this workspace.')).toBeVisible();
  expect((await (await request.get(`/api/studio/wakewords/${b.id}/samples`)).json()).total).toBe(0);
  await page.reload();
  await expect(page.locator('#studio-word')).toHaveValue(b.id);
  await page.locator('#studio-word').selectOption(a.id);
  await expect(page.locator('[data-progress]')).toContainText('1 pending');
});

test('200-entry real catalog pagination, search, selection and server error', async ({ page, request }) => {
  const a = await word(request, 'catalog_a');
  await page.goto(`/#/negative-datasets?word=${a.id}`);
  await expect(page.locator('[data-dataset-id]')).toHaveCount(50);
  for (let offset = 0; offset < 200; offset += 50) {
    await expect(page.locator('.studio-pagination')).toContainText(`${offset + 1}–${offset + 50} of 200`);
    await expect(page.getByText(`Corpus ${String(offset).padStart(3, '0')}`, { exact: true })).toBeVisible();
    if (offset < 150) await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('searchbox').fill('Corpus 199');
  await expect(page.locator('[data-dataset-id]')).toHaveCount(1);
  await page.locator('[data-dataset-id="dataset_199"]').check();
  await page.getByRole('button', { name: 'Save selection' }).click();
  await expect.poll(async () => (await (await request.get(`/api/studio/wakewords/${a.id}/datasets?status=selected`)).json()).total).toBe(1);
  await page.getByRole('searchbox').fill('no such corpus');
  await expect(page.getByText('No catalog datasets match these filters.')).toBeVisible();
  // Exercise a genuine FastAPI validation response, not a mocked UI endpoint.
  await page.locator('[data-page="wakewords"]').click();
  await page.locator('[data-form="create"] input[name="phrase"]').fill('Duplicate');
  await page.locator('[data-form="create"] input[name="model_id"]').fill('catalog_a');
  await page.locator('[data-form="create"] button').click();
  await expect(page.locator('[role="alert"]')).toBeVisible();
});

test('compact responsive navigation is keyboard usable without horizontal overflow', async ({ page, request }) => {
  const a = await word(request, 'narrow_a');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/#/classify?word=${a.id}`);
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await menu.click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await menu.click();
  await page.locator('[data-page="samples"]').click();
  await expect(page.getByRole('heading', { name: 'Samples', exact: true })).toBeVisible();
  await expect(page.locator('#studio-content')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(menu).not.toBeVisible();
});

test('browser generates and selects a batch, queues real training and downloads its archive', async ({ page, request }) => {
  const a = await word(request, 'browser_training');
  await page.goto(`/#/artificial?word=${a.id}`);
  await page.locator('[name="samples"]').fill('3');
  await page.locator('[name="batch-size"]').fill('1');
  await page.locator('[name="tts-mode"]').selectOption('modern');
  const generated = page.waitForResponse(response => response.url().endsWith('/generation/jobs') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Generate batch' }).click();
  expect((await generated).ok()).toBeTruthy();
  expect((await (await request.post('/__test/drain-gpu')).json()).ran).toBe(true);
  await page.reload();
  await expect(page.locator('[data-batch-id]')).toBeEnabled();
  await page.locator('[data-batch-id]').check();
  const selected = page.waitForResponse(response => response.url().endsWith('/generation/batches') && response.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Save batch selection' }).click();
  expect((await selected).ok()).toBeTruthy();
  await page.locator('[data-page="train"]').click();
  await expect(page.getByText('3 selected artificial', { exact: true })).toBeVisible();
  const queued = page.waitForResponse(response => response.url().endsWith('/training/jobs') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Start training', exact: true }).click();
  const job = await (await queued).json();
  expect((await (await request.post('/__test/drain-gpu')).json()).ran).toBe(true);
  const completed = await (await request.get(`/api/studio/jobs/${job.id}`)).json();
  expect(completed.status).toBe('complete');
  const versions = await (await request.get(`/api/studio/wakewords/${a.id}/models`)).json();
  expect(versions.total).toBe(1);
  await page.locator('[data-page="deploy"]').click();
  await expect(page.locator('main').getByText(versions.items[0].id, { exact: true }).first()).toBeVisible();
  const archive = await request.get(`/api/studio/wakewords/${a.id}/models/${versions.items[0].id}/archive`);
  expect(archive.ok()).toBeTruthy();
  expect(archive.headers()['content-type']).toBe('application/zip');
  expect((await archive.body()).subarray(0, 2).toString()).toBe('PK');
});
