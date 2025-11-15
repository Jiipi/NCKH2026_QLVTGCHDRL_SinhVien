import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import http from '../../../shared/services/api/client';
import './AuthModern.css';

export default function ForgotPasswordModern() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Vui lòng nhập email đã đăng ký');
      return;
    }
    try {
      setIsLoading(true);
      await http.post('/auth/forgot', { email: email.trim() });
      setSuccess('Mã xác minh đã được gửi đến email (nếu email đã đăng ký). Vui lòng kiểm tra hộp thư của bạn. Lưu ý: Nếu email chưa đăng ký, bạn sẽ không nhận được mã.');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Mã OTP gồm 6 chữ số');
      return;
    }
    try {
      setIsLoading(true);
      const res = await http.post('/auth/forgot/verify', { email: email.trim(), code: code.trim() });
      if (res.data?.success) {
        setSuccess('Xác minh thành công. Vui lòng đặt lại mật khẩu.');
        setStep(3);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Mã không đúng hoặc đã hết hạn.';
      // Thêm gợi ý nếu mã không hợp lệ (có thể do email không tồn tại)
      if (errMsg.includes('không hợp lệ')) {
        setError('Mã không hợp lệ hoặc đã hết hạn. Nếu bạn không nhận được email, có thể địa chỉ email chưa được đăng ký trong hệ thống.');
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const [pw1, setPw1] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  async function handleResetPassword(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!pw1 || pw1.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    if (pw1 !== pw2) return setError('Mật khẩu xác nhận không khớp');
    try {
      setIsLoading(true);
      await http.post('/auth/reset', { email: email.trim(), code: code.trim(), password: pw1, confirmPassword: pw2 });
      setSuccess('Đặt lại mật khẩu thành công.');
      setTimeout(() => navigate('/login'), 600);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (countdown > 0) return;
    try {
      await http.post('/auth/forgot', { email: email.trim() });
      setCountdown(60);
    } catch (_) {}
  }

  return (
    <div
      className="auth-container auth-container-forgot"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL || ''}/images/VNUR.jpg)`
      }}
    >
      <div className="auth-heading">
        <span className="line1">HỆ THỐNG QUẢN LÝ</span>
        <span className="line2">HOẠT ĐỘNG RÈN LUYỆN CỦA SINH VIÊN</span>
      </div>
      <div className="auth-group2">
        <div className="box box-auth">
          <div className="flip-card-inner">
            <div className="box-login">
            <ul>
              <form onSubmit={handleSubmit}>
                <h1 className="auth-form-title">QUÊN MẬT KHẨU</h1>
                
                {step === 1 && (
                  <div className="email-login">
                    <input 
                      className="inpt" 
                      type="email" 
                      name="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email đã đăng ký" 
                      required 
                    />
                    <i className='fa fa-envelope'></i>
                  </div>
                )}
                {step === 2 && (
                  <div className="email-login">
                    <input 
                      className="inpt" 
                      type="text" 
                      name="otp" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                      placeholder="Nhập mã xác minh 6 số" 
                      required 
                    />
                    <ShieldCheck className='icon-inline' />
                  </div>
                )}
                {step === 3 && (
                  <>
                  <div className="email-login">
                    <input 
                      className="inpt" 
                      type="password" 
                      name="password" 
                      value={pw1}
                      onChange={(e) => setPw1(e.target.value)}
                      placeholder="Mật khẩu mới" 
                      required 
                    />
                    <i className='fa fa-lock'></i>
                  </div>
                  <div className="email-login">
                    <input 
                      className="inpt" 
                      type="password" 
                      name="confirmPassword" 
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới" 
                      required 
                    />
                    <i className='fa fa-lock'></i>
                  </div>
                  </>
                )}
                {error && <div className="error-message">{error}</div>}
                {success && (<div className="success-message">{success}</div>)}

                {step === 1 && (
                  <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? 'Đang gửi...' : 'GỬI MÃ XÁC MINH'}
                  </button>
                )}
                {step === 2 && (
                  <>
                    <button onClick={handleVerifyCode} className="btn" disabled={isLoading}>
                      {isLoading ? 'Đang kiểm tra...' : 'XÁC MINH MÃ'}
                    </button>
                    <div className="register-link" style={{ marginTop: 8 }}>
                      <p>Mã chưa tới? <a href="#" onClick={(e)=>{e.preventDefault(); resendCode();}}>{countdown>0?`Gửi lại sau ${countdown}s`:'Gửi lại mã'}</a></p>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <button onClick={handleResetPassword} className="btn" disabled={isLoading}>
                    {isLoading ? 'Đang đặt lại...' : 'ĐẶT LẠI MẬT KHẨU'}
                  </button>
                )}
              </form>
              <div className="register-link">
                <p>Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
              </div>
            </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
