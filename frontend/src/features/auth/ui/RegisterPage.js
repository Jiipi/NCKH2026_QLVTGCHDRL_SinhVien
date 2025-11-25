/**
 * Register Page (Tầng 1: UI)
 * Chỉ render UI, không chứa business logic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useRegister from '../model/hooks/useRegister';
import './AuthModern.css';
import AuthLayout from './components/AuthLayout';

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
                  <div className="input-group">
                    <input
                      className="inpt"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Họ và tên *"
                    />
                    <i className="fa fa-user field-icon"></i>
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>

                  <div className="input-group">
                    <input
                      className="inpt"
                      type="text"
                      name="maso"
                      value={formData.maso}
                      onChange={handleInputChange}
                      placeholder="Mã số sinh viên (7 chữ số) *"
                    />
                    <i className="fa fa-id-card field-icon"></i>
                    {errors.maso && <div className="error-message">{errors.maso}</div>}
                  </div>

                  <div className="input-group">
                    <input
                      className="inpt"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email *"
                      required
                    />
                    <i className='fa fa-envelope field-icon'></i>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>

                  <div className="input-group">
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
                  </div>

                  <div className="input-group">
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
                  </div>
                </div>

                <div className="form-column">
                  <div className="input-group">
                    <input
                      className="inpt"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mật khẩu *"
                      required
                    />
                    <i
                      className={showPassword ? "fa fa-eye field-icon clickable" : "fa fa-eye-slash field-icon clickable"}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                  </div>

                  <div className="input-group">
                    <input
                      className="inpt"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Xác nhận mật khẩu *"
                      required
                    />
                    <i
                      className={showConfirmPassword ? "fa fa-eye field-icon clickable" : "fa fa-eye-slash field-icon clickable"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    ></i>
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                  </div>

                  <div className="input-group">
                    <input
                      className="inpt"
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      placeholder="Ngày sinh *"
                      required
                    />
                    <i className="fa fa-calendar field-icon"></i>
                    {errors.ngaySinh && <div className="error-message">{errors.ngaySinh}</div>}
                  </div>

                  <div className="input-group">
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
                  </div>

                  <div className="input-group">
                    <input
                      className="inpt"
                      type="text"
                      name="sdt"
                      value={formData.sdt}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại (tuỳ chọn)"
                    />
                    <i className="fa fa-phone field-icon"></i>
                    {errors.sdt && <div className="error-message">{errors.sdt}</div>}
                  </div>
                </div>
              </div>

              <div className="input-group input-full">
                <input
                  className="inpt"
                  type="text"
                  name="diaChi"
                  value={formData.diaChi}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ (tuỳ chọn)"
                />
                <i className="fa fa-map-marker field-icon"></i>
              </div>

              {errors.submit && <div className="error-message error-full">{errors.submit}</div>}

              <button type="submit" className="btn btn-register" disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
              </button>

              <div className="register-link">
                <p>Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
