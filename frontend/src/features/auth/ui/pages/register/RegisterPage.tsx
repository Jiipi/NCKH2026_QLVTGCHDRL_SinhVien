/**
 * Register Page (3-Tier Architecture)
 * 
 * Tier 1: Services - authApi
 * Tier 2: Model - useRegister hook
 * Tier 3: UI - Shared components from shared/
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useRegister from '../../../model/hooks/useRegister';
import '../../shared/AuthModern.css';
import {
  AuthLayout,
  AuthInput,
  AuthPasswordInput,
  AuthButton,
  AuthErrorMessage,
  AuthFormGroup,
  AuthLink
} from '../../shared';

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    isLoading,
    classes,
    faculties,
    facultiesLoading,
    handleInputChange,
    setShowPassword,
    setShowConfirmPassword,
    handleRegister
  } = useRegister();

  return (
    <AuthLayout variant="register">
      <div className="box box-register">
        <div className="flip-card-inner">
          <div className="box-signup">
            <form onSubmit={handleRegister} className="register-form-grid">
              <h1 className="register-title">ĐĂNG KÝ</h1>
              
              <div className="form-row">
                <div className="form-column">
                  <AuthFormGroup>
                    <AuthInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Họ và tên *"
                      icon="fa fa-user field-icon"
                      containerClassName=""
                      className="inpt"
                      error={errors.name}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <AuthInput
                      type="text"
                      name="maso"
                      value={formData.maso}
                      onChange={handleInputChange}
                      placeholder="Mã số sinh viên (7 chữ số) *"
                      icon="fa fa-id-card field-icon"
                      containerClassName=""
                      className="inpt"
                      error={errors.maso}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <AuthInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email *"
                      icon="fa fa-envelope field-icon"
                      containerClassName=""
                      className="inpt"
                      required
                      error={errors.email}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <select
                      className="inpt"
                      name="khoa"
                      value={formData.khoa}
                      onChange={handleInputChange}
                      disabled={facultiesLoading || faculties.length === 0}
                      style={{ opacity: facultiesLoading || faculties.length === 0 ? 0.6 : 1 }}
                    >
                      <option value="">
                        {facultiesLoading ? 'Đang tải danh sách khoa...' : (faculties.length ? 'Chọn khoa *' : 'Chưa có dữ liệu khoa trong hệ thống')}
                      </option>
                      {faculties.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <i className="fa fa-graduation-cap field-icon"></i>
                    {errors.khoa && <div className="error-message">{errors.khoa}</div>}
                    {!facultiesLoading && faculties.length === 0 && (
                      <div className="error-message" style={{ marginTop: 6 }}>
                        Danh sách khoa trống. Vui lòng thêm Khoa/Lớp trong cơ sở dữ liệu (Prisma) hoặc liên hệ quản trị viên.
                      </div>
                    )}
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <select
                      className="inpt"
                      name="lopId"
                      value={formData.lopId}
                      onChange={handleInputChange}
                      disabled={!formData.khoa}
                      style={{ opacity: formData.khoa ? 1 : 0.6 }}
                    >
                      <option value="">{formData.khoa ? 'Chọn lớp (tuỳ chọn)' : 'Vui lòng chọn khoa trước'}</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.ten_lop}</option>
                      ))}
                    </select>
                    <i className="fa fa-building field-icon"></i>
                    {errors.lopId && <div className="error-message">{errors.lopId}</div>}
                  </AuthFormGroup>
                </div>

                <div className="form-column">
                  <AuthFormGroup>
                    <AuthPasswordInput
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mật khẩu *"
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      containerClassName=""
                      className="inpt"
                      required
                      error={errors.password}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <AuthPasswordInput
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Xác nhận mật khẩu *"
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      containerClassName=""
                      className="inpt"
                      required
                      error={errors.confirmPassword}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <AuthInput
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      placeholder="Ngày sinh *"
                      icon="fa fa-calendar field-icon"
                      containerClassName=""
                      className="inpt"
                      required
                      error={errors.ngaySinh}
                    />
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <select
                      className="inpt"
                      name="gioiTinh"
                      value={formData.gioiTinh}
                      onChange={handleInputChange}
                    >
                      <option value="">Giới tính (tuỳ chọn)</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                    <i className="fa fa-venus-mars field-icon"></i>
                  </AuthFormGroup>

                  <AuthFormGroup>
                    <AuthInput
                      type="text"
                      name="sdt"
                      value={formData.sdt}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại (tuỳ chọn)"
                      icon="fa fa-phone field-icon"
                      containerClassName=""
                      className="inpt"
                      error={errors.sdt}
                    />
                  </AuthFormGroup>
                </div>
              </div>

              <AuthFormGroup className="input-group input-full">
                <AuthInput
                  type="text"
                  name="diaChi"
                  value={formData.diaChi}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ (tuỳ chọn)"
                  icon="fa fa-map-marker field-icon"
                  containerClassName=""
                  className="inpt"
                />
              </AuthFormGroup>

              <AuthErrorMessage message={errors.submit} className="error-message error-full" />

              <AuthButton
                type="submit"
                className="btn btn-register"
                isLoading={isLoading}
                loadingText="Đang đăng ký..."
              >
                ĐĂNG KÝ
              </AuthButton>

              <AuthLink to="/login">
                Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
              </AuthLink>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
