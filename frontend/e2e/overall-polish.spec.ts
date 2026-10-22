import { expect, test } from '@playwright/test';

test('selection actions sit at the far right on desktop and mobile', async ({ page, request }) => {
  const response = await request.post('/api/studio/wakewords', { data: { phrase: 'Overall layout', language: 'en', model_id: 'overall_layout' } });
  expect(response.ok()).toBeTruthy();
  const word = await response.json();
  for (const route of ['online-datasets', 'artificial']) {
    await page.goto(`/#/${route}?word=${word.id}`);
    const actions = page.getByRole('button', { name: 'Save selection', exact: true });
    await expect(actions).toHaveCount(route === 'online-datasets' ? 2 : 1);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const button of await actions.all()) {
        const gap = await button.evaluate(element => element.parentElement!.getBoundingClientRect().right - element.getBoundingClientRect().right);
        expect(Math.abs(gap)).toBeLessThan(1);
      }
    }
  }
});

test('failure badges are red and busy buttons have a spinner in both themes', async ({ page, request }) => {
  const response = await request.post('/api/studio/wakewords', { data: { phrase: 'Overall statuses', language: 'en', model_id: 'overall_statuses' } });
  expect(response.ok()).toBeTruthy();
  const word = await response.json();
  const job = { id: 'visual-failure', word_id: word.id, kind: 'train', resource: 'gpu', payload: {}, result: {}, status: 'failed', created_at: '2026-10-21T10:00:00Z', started_at: null, finished_at: '2026-10-21T10:01:00Z' };
  await page.route('**/training/runs*', route => route.fulfill({ json: { items: [job], total: 1, offset: 0, limit: 50 } }));
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(`/#/train?word=${word.id}`);
    const badge = page.locator('[data-run-id="visual-failure"] .studio-status');
    await expect(badge).toHaveCSS('color', theme === 'light' ? 'rgb(159, 28, 38)' : 'rgb(255, 181, 188)');
    await expect(badge).toHaveCSS('background-color', theme === 'light' ? 'rgb(253, 226, 229)' : 'rgb(87, 31, 43)');
    // A collection job uses the real queue API, with workers deliberately idle in this harness.
    await page.goto(`/#/classify?word=${word.id}`);
    const collect = page.locator('[data-action="collect-now"]');
    if (theme === 'light') await collect.click();
    await expect(collect).toBeDisabled();
    await expect(collect).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('[data-action="close-job-queue"]')).toHaveCount(0);
    const style = await collect.evaluate(element => {
      const spinner = getComputedStyle(element, '::before');
      return { content: spinner.content, animation: spinner.animationName, color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor };
    });
    expect(style.content).toBe('""');
    expect(style.animation).toBe('studio-spin');
    expect(style.background).toBe(theme === 'light' ? 'rgb(237, 243, 248)' : 'rgb(44, 64, 82)');
  }
  // Don't leave the queued collection job for later tests to drain.
  expect((await (await request.post('/__test/drain-collection')).json()).ran).toBe(true);
});
