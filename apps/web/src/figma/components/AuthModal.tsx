"use client";

import { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/figma/compat/sonner';

export default function AuthModal() {
  const { showAuthModal, authMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', otp: '' });

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        const result = await login(form.email, form.password);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else if (authMode === 'register') {
        if (form.password !== form.confirm) { toast.error('Mật khẩu không khớp'); setLoading(false); return; }
        const result = await register(form.name, form.email, form.password);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else {
        if (!otpSent) {
          await new Promise(r => setTimeout(r, 800));
          setOtpSent(true);
          toast.success('Mã OTP đã được gửi về email của bạn!');
        } else {
          toast.success('Mật khẩu đã được đặt lại thành công!');
          openAuthModal('login');
        }
      }
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = () => { toast.info('Tính năng đang được phát triển'); };
  const handleFacebookLogin = () => { toast.info('Tính năng đang được phát triển'); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white text-center">
          <button onClick={closeAuthModal} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="size-5" />
          </button>
          <div className="size-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="size-8" />
          </div>
          <h2 className="text-2xl font-bold">
            {authMode === 'login' ? 'Đăng nhập' : authMode === 'register' ? 'Tạo tài khoản' : 'Quên mật khẩu'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {authMode === 'login' ? 'Chào mừng bạn trở lại EduCourse' :
             authMode === 'register' ? 'Tham gia cộng đồng học tập' : 'Đặt lại mật khẩu của bạn'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Social Login */}
          {authMode !== 'forgot' && (
            <>
              <div className="space-y-3 mb-4">
                <button onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
                  <svg className="size-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-sm text-gray-700">Đăng nhập bằng Google</span>
                </button>
                <button onClick={handleFacebookLogin}
                  className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-lg py-2.5 hover:bg-[#166FE5] transition-colors">
                  <svg className="size-5" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input type="text" placeholder="Họ và tên" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input type="email" placeholder="Email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            {authMode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            )}
            {authMode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input type="password" placeholder="Xác nhận mật khẩu" required value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            )}
            {authMode === 'forgot' && otpSent && (
              <div className="relative">
                <input type="text" placeholder="Nhập mã OTP (6 chữ số)" value={form.otp}
                  onChange={e => setForm(f => ({ ...f, otp: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center tracking-widest" maxLength={6} />
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => openAuthModal('forgot')}
                  className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {authMode === 'login' ? 'Đăng nhập' :
               authMode === 'register' ? 'Tạo tài khoản' :
               otpSent ? 'Đặt lại mật khẩu' : 'Gửi mã OTP'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <>Chưa có tài khoản? <button onClick={() => openAuthModal('register')} className="text-blue-600 font-semibold hover:underline">Đăng ký ngay</button></>
            ) : authMode === 'register' ? (
              <>Đã có tài khoản? <button onClick={() => openAuthModal('login')} className="text-blue-600 font-semibold hover:underline">Đăng nhập</button></>
            ) : (
              <button onClick={() => openAuthModal('login')} className="text-blue-600 font-semibold hover:underline">← Quay lại đăng nhập</button>
            )}
          </div>

          {authMode === 'login' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <strong>Demo:</strong> user@test.com / 123456 (hoặc admin@educourse.vn / admin123)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
