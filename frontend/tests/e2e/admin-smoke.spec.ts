import { test, expect } from '@playwright/test';

// Requires environment variables ADMIN_USER, ADMIN_PASS
// Falls back to skip if not present to avoid false failures.

async function login(page) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) {
    test.skip(true, 'ADMIN_USER / ADMIN_PASS not set');
    return;
  }
  await page.goto('/login');
  await page.getByPlaceholder('Tên đăng nhập').fill(user);
  await page.getByPlaceholder('Mật khẩu').fill(pass);
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/admin/);
}

test.describe('Admin migrated pages smoke', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Dashboard loads stats header', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText(/thống kê|dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  test('Users page shows search or table', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('table')).toBeVisible();
  });

  test('Activities page shows filter controls', async ({ page }) => {
    await page.goto('/admin/activities');
    await expect(page.getByText(/hoạt động/i)).toBeVisible();
  });

  test('Approvals page shows registrations list', async ({ page }) => {
    await page.goto('/admin/approvals');
    await expect(page.getByText(/đăng ký|phê duyệt/i)).toBeVisible();
  });

  test('Reports page shows export buttons', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.getByRole('button', { name: /xuất hoạt động/i })).toBeVisible();
  });

  test('Settings page shows tab list', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.getByText(/cài đặt hệ thống/i)).toBeVisible();
  });

  test('Profile page shows avatar or name', async ({ page }) => {
    await page.goto('/admin/profile');
    await expect(page.getByText(/Thông tin cá nhân Admin/i)).toBeVisible();
  });

  test('Semesters page shows activation controls', async ({ page }) => {
    await page.goto('/admin/semesters');
    await expect(page.getByText(/Quản lý học kỳ/i)).toBeVisible();
  });
});
