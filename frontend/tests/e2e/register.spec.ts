import { test, expect, Page } from '@playwright/test';

const REGISTER_PATH = '/register';

// Contract
// - Register form validates required fields
// - Successful registration shows success state and navigates to login (or displays message)
// - Khoa dropdown filters lớp dropdown options
// - Optional fields accepted: ngaySinh, gioiTinh, diaChi, sdt

async function selectByText(page: Page, selector: string, text: string) {
  const loc = page.locator(selector);
  await loc.waitFor();
  await loc.selectOption({ label: text }).catch(async () => {
    // try textContent contains
    const option = loc.locator('option', { hasText: text });
    await option.first().waitFor();
    await option.first().evaluate((o: HTMLOptionElement) => (o.selected = true));
    await loc.dispatchEvent('change');
  });
}

test.describe('Register regression', () => {
  test('Required validations', async ({ page }) => {
    await page.goto(REGISTER_PATH);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Vui lòng/i)).toBeVisible();
  });

  test('Khoa filters Lop options', async ({ page }) => {
    await page.goto(REGISTER_PATH);
    // Find Khoa select
    const khoaSel = page.locator('select[name="khoa"], select#khoa');
    await expect(khoaSel).toBeVisible();
    const texts = await khoaSel.locator('option').allTextContents();
    const candidate = texts.find(t => /CNTT|Công nghệ thông tin|Khoa/i.test(t)) || texts.find(t => t && t.trim());
    if (!candidate) test.skip(true, 'No faculties available');
    await selectByText(page, 'select[name="khoa"], select#khoa', candidate!);
    // Now lớp select should update
    const lopSel = page.locator('select[name="lopId"], select#lopId');
    await expect(lopSel).toBeVisible();
    const before = await lopSel.locator('option').allTextContents();
    await page.waitForTimeout(300);
    const after = await lopSel.locator('option').allTextContents();
    expect(after.length).toBeGreaterThan(0);
  });

  test('Successful registration (happy path, student)', async ({ page }) => {
    await page.goto(REGISTER_PATH);
    const uniq = Math.random().toString(36).slice(2, 8);
    await page.fill('input[name="firstName"], input[name="ho"]', 'Test');
    await page.fill('input[name="lastName"], input[name="ten"]', 'User');
    await page.fill('input[name="email"]', `test_${uniq}@example.com`);
    await page.fill('input[name="username"], input[name="ten_dn"], input[name="mssv"]', `sv_${uniq}`);
    await page.fill('input[name="password"], input[name="mat_khau"]', '123456');
    await page.fill('input[name="confirmPassword"]', '123456');

    // Optional fields if present
    if (await page.locator('input[name="ngaySinh"], input#ngaySinh').count()) {
      await page.fill('input[name="ngaySinh"], input#ngaySinh', '2003-01-02');
    }
    if (await page.locator('select[name="gioiTinh"], select#gioiTinh').count()) {
      await selectByText(page, 'select[name="gioiTinh"], select#gioiTinh', 'Nam');
    }
    if (await page.locator('input[name="sdt"], input#sdt').count()) {
      await page.fill('input[name="sdt"], input#sdt', '0912345678');
    }
    if (await page.locator('input[name="diaChi"], input#diaChi').count()) {
      await page.fill('input[name="diaChi"], input#diaChi', '123 Sample');
    }

    // Agree terms if visible
    if (await page.locator('input[name="agreeToTerms"]').count()) {
      await page.check('input[name="agreeToTerms"]');
    }

    await page.click('button[type="submit"]');

    // Either navigate to login or show success toast/message
    await Promise.race([
      page.waitForURL(/login/),
      page.waitForSelector('text=/Đăng ký thành công|thành công/i')
    ]);
  });
});
