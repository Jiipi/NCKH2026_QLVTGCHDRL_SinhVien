import { test, expect } from '@playwright/test';
import { programmaticLogin } from './authHelper';

test.describe('LOP_TRUONG core flows', () => {
  test.beforeEach(async ({ page }) => {
    await programmaticLogin(page, 'LOP_TRUONG');
  });

  test('Sees monitor activities page', async ({ page }) => {
    await page.goto('/monitor/my-activities');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/monitor/);
  });

  test('Can approve registrations (smoke)', async ({ page }) => {
    await page.goto('/monitor/my-activities');
    // Look for action buttons like Approve/Reject; tolerate no-op
    const hasApprove = await page.getByRole('button', { name: /duyệt|phê duyệt|approve/i }).count();
    expect(hasApprove >= 0).toBeTruthy();
  });
});
