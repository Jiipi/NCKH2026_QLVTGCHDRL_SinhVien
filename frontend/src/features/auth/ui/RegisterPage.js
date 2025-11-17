import React from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../../shared/api/http';
import { useAppStore } from '../../../store/useAppStore';
import { useNotification } from '../../../contexts/NotificationContext';
import './AuthModern.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore(s => s.setAuth);
  const { showSuccess, showError, showWarning } = useNotification();
  const [formData, setFormData] = React.useState({
    name: '',
    maso: '',
    email: '',
    password: '',
    confirmPassword: '',
    lopId: '',
    khoa: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChi: '',
    sdt: ''
  });
  const [allClasses, setAllClasses] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const [faculties, setFaculties] = React.useState([]);
  const [facultiesLoading, setFacultiesLoading] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await http.get('/auth/classes');
        const raw = res.data?.data || res.data || [];
        const normalized = Array.isArray(raw)
          ? raw.map((c) => ({ id: c.value || c.id, ten_lop: c.label || c.ten_lop, khoa: c.khoa }))
          : [];
        setAllClasses(normalized);
        setClasses(normalized);
        const uniqueFaculties = [...new Set(normalized.map(c => c.khoa))].filter(Boolean);
        try {
          const fres = await http.get('/auth/faculties');
          const fdata = fres.data?.data || fres.data;
          const list = Array.isArray(fdata)
            ? fdata
                .map(x => typeof x === 'string' ? x : (x?.khoa || x?.label || x?.value))
                .filter(Boolean)
            : uniqueFaculties;
          setFaculties((list.length ? list : uniqueFaculties).filter(Boolean));
        } catch (_) {
          setFaculties(uniqueFaculties);
        } finally {
          setFacultiesLoading(false);
        }
      } catch (err) {
        console.error('Error loading classes:', err);
        setAllClasses([]);
        setClasses([]);
        try {
          const fres = await http.get('/auth/faculties');
          const fdata = fres.data?.data || fres.data;
          const list = Array.isArray(fdata)
            ? fdata
                .map(x => typeof x === 'string' ? x : (x?.khoa || x?.label || x?.value))
                .filter(Boolean)
            : [];
          setFaculties(list);
        } catch (_) {
          setFaculties([]);
        } finally {
          setFacultiesLoading(false);
        }
      }
    };
    loadClasses();
  }, []);

  React.useEffect(() => {
    if (formData.khoa) {
      const filtered = allClasses.filter(c => c.khoa === formData.khoa);
      setClasses(filtered);
      if (!filtered.some(c => c.id === formData.lopId)) {
        setFormData(prev => ({ ...prev, lopId: '' }));
      }
    } else {
      setClasses(allClasses);
      if (formData.lopId) setFormData(prev => ({ ...prev, lopId: '' }));
    }
  }, [formData.khoa, allClasses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.maso) newErrors.maso = 'Vui lòng nhập mã số sinh viên';
    else if (!/^\d{7}$/.test(formData.maso)) {
      newErrors.maso = 'Mã số sinh viên phải có đúng 7 chữ số';
    }
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.khoa) newErrors.khoa = 'Vui lòng chọn khoa';
    if (!formData.ngaySinh) newErrors.ngaySinh = 'Vui lòng chọn ngày sinh';
    else {
      const birthDate = new Date(formData.ngaySinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 15 || age > 100) {
        newErrors.ngaySinh = 'Ngày sinh không hợp lệ (tuổi phải từ 15-100)';
      }
    }
    if (formData.sdt && !/^\d{9,10}$/.test(formData.sdt)) newErrors.sdt = 'Số điện thoại không hợp lệ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        maso: formData.maso,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        lopId: formData.lopId || undefined,
        khoa: formData.khoa,
        ngaySinh: formData.ngaySinh, // Required field - always send
        gioiTinh: formData.gioiTinh || undefined,
        diaChi: formData.diaChi || undefined,
        sdt: formData.sdt || undefined
      };

      const res = await http.post('/auth/register', payload);
      const data = res.data?.data || res.data;
      if (data || res.data?.success) {
        showSuccess(
          'Tài khoản của bạn đã được tạo thành công! Vui lòng đăng nhập để tiếp tục.',
          'Đăng ký thành công',
          5000
        );
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      const backendMsg = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length) {
        const mapped = {};
        let errorMessages = [];
        for (const e of validationErrors) {
          const field = (e?.field || e?.path || '').toString();
          const msg = e?.message || 'Dữ liệu không hợp lệ';
          const keyMap = {
            name: 'name',
            maso: 'maso',
            email: 'email',
            password: 'password',
            confirmPassword: 'confirmPassword',
            lopId: 'lopId',
            khoa: 'khoa',
            ngaySinh: 'ngaySinh',
            gioiTinh: 'gioiTinh',
            diaChi: 'diaChi',
            sdt: 'sdt'
          };
          const key = keyMap[field] || 'submit';
          if (!mapped[key]) {
            mapped[key] = msg;
            errorMessages.push(msg);
          }
        }
        if (!mapped.submit) {
          mapped.submit = backendMsg || 'Vui lòng kiểm tra lại các trường bị đánh dấu.';
        }
        setErrors(mapped);
        showError(
          errorMessages.length > 0 
            ? errorMessages.join(', ') 
            : 'Vui lòng kiểm tra lại thông tin đăng ký',
          'Đăng ký thất bại',
          6000
        );
      } else {
        const message = backendMsg || 'Đăng ký thất bại';
        setErrors({ submit: message });
        showError(message, 'Đăng ký thất bại', 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="auth-container auth-container-register"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL || ''}/images/VNUR.jpg)`
      }}
    >
      <div className="auth-heading">
        <span className="line1">HỆ THỐNG QUẢN LÝ</span>
        <span className="line2">HOẠT ĐỘNG RÈN LUYỆN CỦA SINH VIÊN</span>
      </div>
      <div className="box box-register">
        <div className="flip-card-inner">
          <div className="box-signup">
            <form onSubmit={handleSubmit} className="register-form-grid">
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
    </div>
  );
}
