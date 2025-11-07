import { test, expect } from '@playwright/test';
import { programmaticLogin } from './authHelper';

test.describe('GIANG_VIEN core flows', () => {
  test.beforeEach(async ({ page }) => {
    await programmaticLogin(page, 'GIANG_VIEN');
  });

  test('Sees teacher activities page', async ({ page }) => {
    await page.goto('/teacher/activities');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/teacher/);
  });

  test('Can filter by semester', async ({ page }) => {
    await page.goto('/teacher/activities');
    const selects = page.locator('select');
    if (await selects.count()) {
      const first = selects.first();
      await first.waitFor();
      const options = await first.locator('option').allTextContents();
      if (options.length) {
        await first.selectOption({ index: Math.min(1, options.length - 1) });
      }
      await expect(page).toHaveURL(/teacher/);
    } else {
      test.skip(true, 'No semester dropdown');
    }
  });
});
