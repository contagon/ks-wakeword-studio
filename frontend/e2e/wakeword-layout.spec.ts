import { expect, test } from '@playwright/test';

test('wakeword selectors fill their grid columns on desktop and mobile', async ({ page, request }) => {
  const response = await request.post('/api/studio/wakewords', {
    data: { phrase: 'Layout test', language: 'en', model_id: 'browser_layout' },
  });
  expect(response.ok()).toBeTruthy();
  await page.goto('/#/wakewords');
  const card = page.locator('.studio-word-card').filter({ hasText: 'Layout test' });
  await expect(card).toBeVisible();

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const { actual, expected } = await card.evaluate(element => {
      const grid = element.parentElement!;
      const columns = getComputedStyle(grid).gridTemplateColumns.split(' ');
      return {
        actual: element.getBoundingClientRect().width,
        expected: parseFloat(columns[0]!),
      };
    });
    expect(Math.abs(actual - expected)).toBeLessThan(1);
  }
});
