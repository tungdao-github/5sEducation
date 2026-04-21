"use client";

import { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/figma/compat/sonner';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import {
  getFacebookAppId,
  initializeFacebookSdk,
  loadFacebookSdkScript,
} from '@/lib/facebook-auth';

export default function AuthModal() {
  const {
    showAuthModal,
    authMode,
    closeAuthModal,
    login,
    register,
    openAuthModal,
    loginWithFacebookAccessToken,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', otp: '' });

  useEffect(() => {
    if (!showAuthModal || authMode === 'forgot') {
      return;
    }

    const appId = getFacebookAppId();
    if (!appId) {
      setFacebookReady(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadFacebookSdkScript();
        if (cancelled) return;
        initializeFacebookSdk(appId);
        if (!cancelled) setFacebookReady(true);
      } catch {
        if (!cancelled) setFacebookReady(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [authMode, showAuthModal]);

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
        if (form.password !== form.confirm) {
          toast.error('Mật khẩu không khớp');
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else {
        if (!otpSent) {
          await new Promise((r) => setTimeout(r, 800));
          setOtpSent(true);
          toast.success('Mã OTP đã được gửi về email của bạn!');
        } else {
          toast.success('Mật khẩu đã được đặt lại thành công!');
          openAuthModal('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    const appId = getFacebookAppId();
    if (!appId) {
      toast.error('Facebook sign-in is not configured yet.');
      return;
    }

    if (!facebookReady || typeof window === 'undefined' || !window.FB?.login) {
      toast.error('Facebook sign-in is still loading. Please try again.');
      return;
    }

    setFacebookLoading(true);
    try {
      const response = await new Promise<{ authResponse?: { accessToken?: string } | null } | null>((resolve) => {
        window.FB?.login(
          (loginResponse) => {
            resolve(loginResponse ?? null);
          },
          {
            scope: 'email,public_profile',
            return_scopes: true,
            auth_type: 'rerequest',
          }
        );
      });

      const accessToken = response?.authResponse?.accessToken;
      if (!accessToken) {
        toast.info('Đăng nhập Facebook đã bị hủy.');
        return;
      }

      const result = await loginWithFacebookAccessToken(accessToken);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập Facebook thất bại.');
    } finally {
      setFacebookLoading(false);
    }
  };

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
            {authMode === 'login'
              ? 'Chào mừng bạn trở lại EduCourse'
              : authMode === 'register'
                ? 'Tham gia cộng đồng học tập'
                : 'Đặt lại mật khẩu của bạn'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Social Login */}
          {authMode !== 'forgot' && (
            <>
              <div className="space-y-3 mb-4">
                <GoogleSignInButton nextPath="/" mode={authMode === 'register' ? 'signup' : 'signin'} />
                <button
                  onClick={handleFacebookLogin}
                  disabled={facebookLoading || !facebookReady}
                  className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-lg py-2.5 hover:bg-[#166FE5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="size-5" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm">{authMode === 'register' ? 'Đăng ký bằng Facebook' : 'Đăng nhập bằng Facebook'}</span>
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
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            )}
            {authMode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
            {authMode === 'forgot' && otpSent && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã OTP (6 chữ số)"
                  value={form.otp}
                  onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center tracking-widest"
                  maxLength={6}
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openAuthModal('forgot')}
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
              {authMode === 'login'
                ? 'Đăng nhập'
                : authMode === 'register'
                  ? 'Tạo tài khoản'
                  : otpSent
                    ? 'Đặt lại mật khẩu'
                    : 'Gửi mã OTP'}
            </button>
          </form>

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
            ) : (
              <button onClick={() => openAuthModal('login')} className="text-blue-600 font-semibold hover:underline">
                ← Quay lại đăng nhập
              </button>
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
