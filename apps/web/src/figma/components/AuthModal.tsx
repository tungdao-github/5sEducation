"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/figma/compat/sonner";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import {
  getFacebookAppId,
  initializeFacebookSdk,
  loadFacebookSdkScript,
} from "@/lib/facebook-auth";
import { cn } from "@/lib/utils";

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
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", otp: "" });

  useEffect(() => {
    if (!showAuthModal || authMode === "forgot") return;

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
    return () => { cancelled = true; };
  }, [authMode, showAuthModal]);

  // Reset form when modal closes or mode changes
  useEffect(() => {
    if (!showAuthModal) {
      setForm({ name: "", email: "", password: "", confirm: "", otp: "" });
      setOtpSent(false);
    }
  }, [showAuthModal, authMode]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (authMode === "login") {
        const result = await login(form.email, form.password);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else if (authMode === "register") {
        if (form.password !== form.confirm) {
          toast.error("Mat khau khong khop");
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
          toast.success("Ma OTP da duoc gui ve email cua ban!");
        } else {
          toast.success("Mat khau da duoc dat lai thanh cong!");
          openAuthModal("login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    const appId = getFacebookAppId();
    if (!appId) {
      toast.error("Facebook sign-in is not configured yet.");
      return;
    }

    if (!facebookReady || typeof window === "undefined" || !window.FB?.login) {
      toast.error("Facebook sign-in is still loading. Please try again.");
      return;
    }

    setFacebookLoading(true);
    try {
      const response = await new Promise<{ authResponse?: { accessToken?: string } | null } | null>((resolve) => {
        window.FB?.login(
          (loginResponse) => resolve(loginResponse ?? null),
          { scope: "email,public_profile", return_scopes: true, auth_type: "rerequest" }
        );
      });

      const accessToken = response?.authResponse?.accessToken;
      if (!accessToken) {
        toast.info("Dang nhap Facebook da bi huy.");
        return;
      }

      const result = await loginWithFacebookAccessToken(accessToken);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dang nhap Facebook that bai.");
    } finally {
      setFacebookLoading(false);
    }
  };

  const titles = {
    login: { title: "Dang nhap", subtitle: "Chao mung ban tro lai EduCourse" },
    register: { title: "Tao tai khoan", subtitle: "Tham gia cong dong hoc tap" },
    forgot: { title: "Quen mat khau", subtitle: "Dat lai mat khau cua ban" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={closeAuthModal} 
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-primary px-6 py-10 text-primary-foreground text-center relative">
          <button 
            onClick={closeAuthModal} 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
          
          <div className="size-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="size-8 text-accent-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{titles[authMode].title}</h2>
          <p className="text-primary-foreground/70">{titles[authMode].subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Social Login */}
          {authMode !== "forgot" && (
            <>
              <div className="space-y-3 mb-6">
                <GoogleSignInButton 
                  nextPath="/" 
                  mode={authMode === "register" ? "signup" : "signin"} 
                />
                <button
                  onClick={handleFacebookLogin}
                  disabled={facebookLoading || !facebookReady}
                  className="btn w-full bg-[#1877F2] text-white hover:bg-[#166FE5] disabled:opacity-60"
                >
                  <svg className="size-5" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  {authMode === "register" ? "Dang ky bang Facebook" : "Dang nhap bang Facebook"}
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-border" />
                <span className="text-sm text-muted-foreground">Hoac</span>
                <div className="flex-1 border-t border-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Register only) */}
            {authMode === "register" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ho va ten"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input pl-11"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input pl-11"
              />
            </div>

            {/* Password (Not for forgot) */}
            {authMode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mat khau"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            )}

            {/* Confirm Password (Register only) */}
            {authMode === "register" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Xac nhan mat khau"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="input pl-11"
                />
              </div>
            )}

            {/* OTP (Forgot password after sent) */}
            {authMode === "forgot" && otpSent && (
              <input
                type="text"
                placeholder="Nhap ma OTP (6 chu so)"
                value={form.otp}
                onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
                className="input text-center tracking-widest"
                maxLength={6}
              />
            )}

            {/* Forgot Password Link */}
            {authMode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openAuthModal("forgot")}
                  className="text-sm text-accent hover:underline"
                >
                  Quen mat khau?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent w-full h-12"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {authMode === "login"
                ? "Dang nhap"
                : authMode === "register"
                ? "Tao tai khoan"
                : otpSent
                ? "Dat lai mat khau"
                : "Gui ma OTP"}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {authMode === "login" ? (
              <>
                Chua co tai khoan?{" "}
                <button onClick={() => openAuthModal("register")} className="text-accent font-semibold hover:underline">
                  Dang ky ngay
                </button>
              </>
            ) : authMode === "register" ? (
              <>
                Da co tai khoan?{" "}
                <button onClick={() => openAuthModal("login")} className="text-accent font-semibold hover:underline">
                  Dang nhap
                </button>
              </>
            ) : (
              <button onClick={() => openAuthModal("login")} className="text-accent font-semibold hover:underline">
                Quay lai dang nhap
              </button>
            )}
          </div>

          {/* Demo Credentials */}
          {authMode === "login" && (
            <div className="mt-4 p-4 bg-accent/10 rounded-xl text-sm text-accent">
              <strong>Demo:</strong> user@test.com / 123456 (hoac admin@educourse.vn / admin123)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
