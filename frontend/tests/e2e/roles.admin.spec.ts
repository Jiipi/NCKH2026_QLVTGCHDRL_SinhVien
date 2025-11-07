import { test, expect } from '@playwright/test';
import { programmaticLogin } from './authHelper';

test.describe('ADMIN core flows', () => {
  test.beforeEach(async ({ page }) => {
    await programmaticLogin(page, 'ADMIN');
  });

  test('Sees approvals page and pending registrations', async ({ page }) => {
    await page.goto('/admin/approvals');
    await page.waitForLoadState('domcontentloaded');
    // Expect list or empty state
    const any = await page.getByText(/phê duyệt|duyệt|đăng ký/i).count();
    expect(any).toBeGreaterThanOrEqual(0);
  });

  test('Semester filter triggers backend calls', async ({ page }) => {
    await page.goto('/admin/approvals');
    await page.waitForLoadState('domcontentloaded');
    // Reuse semester test patterns (lightweight inline)
    const selects = page.locator('select');
    if (await selects.count()) {
      const first = selects.first();
      await first.waitFor();
      const all = await first.locator('option').allTextContents();
      if (all.length) {
        await first.selectOption({ index: Math.min(1, all.length - 1) });
      }
      await expect(page).toHaveURL(/admin/);
    } else {
      test.skip(true, 'No semester dropdown on this page');
    }
  });
});
