import { test, expect } from '@playwright/test';
import { programmaticLogin } from './authHelper';

test.describe('Student Dashboard parity smoke', () => {
  test('Loads header, semester filter, lists, and modal', async ({ page }) => {
    await programmaticLogin(page, 'SINH_VIEN');
    await page.goto('http://localhost:3000/student');
    await page.waitForLoadState('domcontentloaded');

    // Header greeting
    await expect(page.getByText(/Xin chào/i)).toBeVisible({ timeout: 5000 });

    // Semester filter should be visible (native select)
    const select = page.locator('select');
    await expect(select.first()).toBeVisible();

    // Try changing semester if options exist
    const optionsCount = await select.first().evaluate((el: HTMLSelectElement) => el.options?.length || 0);
    if (optionsCount > 0) {
      const firstValue = await select.first().evaluate((el: HTMLSelectElement) => el.options[0]?.value || '');
      if (firstValue) {
        await select.first().selectOption(firstValue);
      }
    }

    // Upcoming section should render either list or empty state
    const upcomingHeader = page.getByText('Hoạt động sắp tới');
    await expect(upcomingHeader).toBeVisible();

    // Recent activities section visible
    await expect(page.getByText('Hoạt động gần đây')).toBeVisible();

    // If any card exists, open summary modal and close it
    const anyCard = page.locator('.group\\/item').first();
    if (await anyCard.count()) {
      await anyCard.click();
      await expect(page.getByText('Tóm tắt hoạt động')).toBeVisible({ timeout: 5000 });
      const closeBtn = page.getByRole('button', { name: 'Đóng' });
      if (await closeBtn.count()) {
        await closeBtn.click();
      } else {
        // Fallback: click overlay
        await page.mouse.click(5, 5);
      }
    }
  });
});
