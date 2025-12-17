/**
 * Auth Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 */

/**
 * Map login response từ API sang UI format
 */
export function mapLoginResponse(apiData) {
  return {
    token: apiData.token || apiData.data?.token,
    user: apiData.user || apiData.data?.user || null
  };
}

/**
 * Map register response từ API sang UI format
 */
export function mapRegisterResponse(apiData) {
  return {
    success: apiData.success !== false,
    message: apiData.message || 'Đăng ký thành công',
    data: apiData.data || apiData
  };
}

/**
 * Map forgot password response từ API sang UI format
 */
export function mapForgotPasswordResponse(apiData) {
  return {
    success: apiData.success !== false,
    message: apiData.message || 'Mã xác minh đã được gửi',
    data: apiData.data || apiData
  };
}

/**
 * Map reset password response từ API sang UI format
 */
export function mapResetPasswordResponse(apiData) {
  return {
    success: apiData.success !== false,
    message: apiData.message || 'Đặt lại mật khẩu thành công',
    data: apiData.data || apiData
  };
}

/**
 * Map classes data từ API sang UI format
 */
export function mapClassesToUI(apiData) {
  if (!Array.isArray(apiData)) return [];
  return apiData.map((c) => ({
    id: c.value || c.id,
    ten_lop: c.label || c.ten_lop,
    khoa: c.khoa
  }));
}

/**
 * Map faculties data từ API sang UI format
 */
export function mapFacultiesToUI(apiData) {
  if (!Array.isArray(apiData)) return [];
  return apiData
    .map(x => typeof x === 'string' ? x : (x?.khoa || x?.label || x?.value))
    .filter(Boolean);
}

