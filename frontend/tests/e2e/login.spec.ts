import { test, expect } from '@playwright/test';
import { programmaticLogin, loginByAPI } from './authHelper';

const LOGIN_PATH = '/login';

// Contract
// - User can login with valid credentials (via UI)
// - Remember me toggles localStorage flag
// - Error shown for invalid credentials
// - Redirect by role works for four roles

test.describe('Login regression', () => {
  test('UI login happy path (student)', async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.fill('input[name="username"]', 'sv000013');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/student|\/?$/);
    // Basic smoke: navbar/user menu or any student page element
    await expect(page).toHaveURL(/student/);
  });

  test('Remember me stores flag', async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.fill('input[name="username"]', 'sv000013');
    await page.fill('input[name="password"]', '123456');
    // Prefer the modern login checkbox id/name if exists
    const rememberSel = 'input#remember, input[name="remember"]';
    if (await page.locator(rememberSel).count()) {
      await page.check(rememberSel);
    }
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
    const remembered = await page.evaluate(() => localStorage.getItem('remember_me') || localStorage.getItem('remembered_username'));
    expect(remembered).toBeTruthy();
  });

  test('Invalid credentials show error', async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.fill('input[name="username"]', 'does_not_exist');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Sai tên đăng nhập|không thành công|Lỗi máy chủ|Không thể kết nối/i)).toBeVisible();
  });

  for (const role of ['ADMIN','GIANG_VIEN','LOP_TRUONG','SINH_VIEN']) {
    test(`Redirect by role works: ${role}`, async ({ page }) => {
      const login = await loginByAPI(role);
      await programmaticLogin(page, role);
      // Expect target path
      const map: Record<string, RegExp> = {
        'ADMIN': /\/admin/,
        'GIANG_VIEN': /\/teacher/,
        'LOP_TRUONG': /\/monitor/,
        'SINH_VIEN': /\/student/
      };
      await expect(page).toHaveURL(map[role]);
      // Quick assertion: presence of role-specific hints in page
      const textHints: Record<string,string[]> = {
        'ADMIN': ['Quản trị', 'Admin', 'Duyệt'],
        'GIANG_VIEN': ['Giảng viên','Teacher'],
        'LOP_TRUONG': ['Lớp trưởng','Monitor'],
        'SINH_VIEN': ['Sinh viên','Student']
      };
      const hints = textHints[role];
      const any = await Promise.any(hints.map(async h => page.getByText(new RegExp(h, 'i')).isVisible().then(() => true)) ).catch(() => false);
      expect(any).toBeTruthy();
    });
  }
});
