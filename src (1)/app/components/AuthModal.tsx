import { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthModal() {
  const {
    showAuthModal, authMode, closeAuthModal, openAuthModal,
    login, loginWithGoogle, loginWithFacebook, register,
    sendVerificationEmail, verifyEmail,
    sendPasswordResetEmail, resetPassword,
    verify2FA
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', otp: '', twoFactorCode: ''
  });

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        const result = await login(form.email, form.password);
        if (result.success) {
          if (!result.requires2FA) {
            toast.success(result.message);
          } else {
            toast.info(result.message);
          }
        } else {
          toast.error(result.message);
        }
      } else if (authMode === 'register') {
        if (form.password.length < 8) {
          toast.error('Mật khẩu phải có ít nhất 8 ký tự');
          setLoading(false);
          return;
        }
        if (form.password !== form.confirm) {
          toast.error('Mật khẩu không khớp');
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else if (authMode === 'forgot') {
        if (!otpSent) {
          const result = await sendPasswordResetEmail(form.email);
          if (result.success) {
            setOtpSent(true);
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else {
          if (!form.password) {
            toast.error('Vui lòng nhập mật khẩu mới');
            setLoading(false);
            return;
          }
          const result = await resetPassword(form.email, form.otp, form.password);
          if (result.success) {
            toast.success(result.message);
            openAuthModal('login');
            setOtpSent(false);
          } else {
            toast.error(result.message);
          }
        }
      } else if (authMode === 'verify-email') {
        const result = await verifyEmail(form.otp);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else if (authMode === '2fa') {
        const result = await verify2FA(form.twoFactorCode);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithFacebook();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const result = await sendVerificationEmail();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderContent = () => {
    switch (authMode) {
      case 'login':
        return { title: 'Đăng nhập', subtitle: 'Chào mừng bạn trở lại EduCourse', icon: User };
      case 'register':
        return { title: 'Tạo tài khoản', subtitle: 'Tham gia cộng đồng học tập', icon: User };
      case 'forgot':
        return { title: 'Quên mật khẩu', subtitle: 'Đặt lại mật khẩu của bạn', icon: Lock };
      case 'verify-email':
        return { title: 'Xác thực Email', subtitle: 'Vui lòng nhập mã xác thực', icon: Mail };
      case '2fa':
        return { title: 'Xác thực 2FA', subtitle: 'Nhập mã từ ứng dụng xác thực', icon: Shield };
      default:
        return { title: '', subtitle: '', icon: User };
    }
  };

  const header = getHeaderContent();
  const HeaderIcon = header.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white text-center">
          <button onClick={closeAuthModal} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
          <div className="size-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <HeaderIcon className="size-8" />
          </div>
          <h2 className="text-2xl font-bold">{header.title}</h2>
          <p className="text-blue-100 text-sm mt-1">{header.subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Email Verification */}
          {authMode === 'verify-email' && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Xác thực email để kích hoạt tài khoản</p>
                    <p className="text-xs">Chúng tôi đã gửi mã xác thực 6 chữ số về email của bạn. Vui lòng kiểm tra hộp thư.</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nhập mã xác thực (6 chữ số)"
                    value={form.otp}
                    onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Demo code: 123456</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || form.otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  <Check className="size-4" />
                  Xác thực Email
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Gửi lại mã xác thực
                </button>
              </form>
            </>
          )}

          {/* 2FA Verification */}
          {authMode === '2fa' && (
            <>
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <Shield className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">Xác thực bảo mật hai yếu tố</p>
                    <p className="text-xs">Vui lòng nhập mã 6 chữ số từ ứng dụng xác thực của bạn.</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nhập mã 2FA (6 chữ số)"
                    value={form.twoFactorCode}
                    onChange={e => setForm(f => ({ ...f, twoFactorCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Demo code: 123456</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || form.twoFactorCode.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  <Shield className="size-4" />
                  Xác thực 2FA
                </button>
              </form>
            </>
          )}

          {/* Social Login */}
          {(authMode === 'login' || authMode === 'register') && (
            <>
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm text-gray-700">Đăng nhập bằng Google</span>
                </button>
                <button
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-lg py-2.5 hover:bg-[#166FE5] transition-colors disabled:opacity-60"
                >
                  <svg className="size-5" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm">Đăng nhập bằng Facebook</span>
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <hr className="flex-1 border-gray-200" />
                <span className="text-sm text-gray-400">Hoặc</span>
                <hr className="flex-1 border-gray-200" />
              </div>
            </>
          )}

          {/* Login/Register/Forgot Password Form */}
          {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {authMode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              )}
              {authMode === 'register' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      required
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className={form.password.length >= 8 ? 'text-green-600' : ''}>
                      {form.password.length >= 8 ? '✓' : '○'} Tối thiểu 8 ký tự
                    </p>
                  </div>
                </>
              )}
              {authMode === 'forgot' && otpSent && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập mã OTP (6 chữ số)"
                      value={form.otp}
                      onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu mới"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </>
              )}

              {authMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { openAuthModal('forgot'); setOtpSent(false); }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {authMode === 'login' ? 'Đăng nhập' :
                 authMode === 'register' ? 'Tạo tài khoản' :
                 otpSent ? 'Đặt lại mật khẩu' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button onClick={() => openAuthModal('register')} className="text-blue-600 font-semibold hover:underline">
                  Đăng ký ngay
                </button>
              </>
            ) : authMode === 'register' ? (
              <>
                Đã có tài khoản?{' '}
                <button onClick={() => openAuthModal('login')} className="text-blue-600 font-semibold hover:underline">
                  Đăng nhập
                </button>
              </>
            ) : authMode === 'forgot' ? (
              <button onClick={() => { openAuthModal('login'); setOtpSent(false); }} className="text-blue-600 font-semibold hover:underline">
                ← Quay lại đăng nhập
              </button>
            ) : null}
          </div>

          {authMode === 'login' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <strong>Demo:</strong> user@test.com / 123456 (hoặc admin@educourse.vn / admin123)
              <br />
              <span className="text-[10px]">OTP/2FA code: 123456</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
