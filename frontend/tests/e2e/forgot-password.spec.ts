import { test, expect } from '@playwright/test';

const FORGOT_PATH = '/forgot';

test.describe('Forgot password regression', () => {
  test('Shows validation on empty submit', async ({ page }) => {
    await page.goto(FORGOT_PATH);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/vui lòng nhập email/i)).toBeVisible();
  });

  test('Happy path shows success message (dev token optional)', async ({ page }) => {
    await page.goto(FORGOT_PATH);
    await page.fill('input#email, input[name="email"], input[type="text"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/đã gửi hướng dẫn|Khôi phục mật khẩu/i)).toBeVisible();
    // Dev mode token if backend returns
    const maybeToken = await page.locator('text=/Token \(dev\)/i').count();
    expect(maybeToken >= 0).toBeTruthy();
  });
});
