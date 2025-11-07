import { test, expect } from '@playwright/test';
import { programmaticLogin } from './authHelper';

test.describe('SINH_VIEN core flows', () => {
  test.beforeEach(async ({ page }) => {
    await programmaticLogin(page, 'SINH_VIEN');
  });

  test('Sees student activities page', async ({ page }) => {
    await page.goto('/student/activities');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/student/);
  });

  test('Can select semester and list activities', async ({ page }) => {
    await page.goto('/student/activities');
    const selects = page.locator('select');
    if (await selects.count()) {
      const first = selects.first();
      await first.waitFor();
      const options = await first.locator('option').allTextContents();
      if (options.length) {
        await first.selectOption({ index: Math.min(1, options.length - 1) });
      }
      // Expect network activity or any change; smoke only
      await expect(page).toHaveURL(/student/);
    } else {
      test.skip(true, 'No semester dropdown');
    }
  });
});
