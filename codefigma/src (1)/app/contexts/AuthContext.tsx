import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'instructor';
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate: string;
  phone?: string;
  bio?: string;
  instructorStatus?: 'pending' | 'approved' | 'rejected';
  expertise?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  provider?: 'email' | 'google' | 'facebook';
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify-email' | '2fa';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  applyAsInstructor: (data: { expertise: string[]; bio: string; socialLinks: User['socialLinks'] }) => Promise<{ success: boolean; message: string }>;
  approveInstructor: (userId: string) => Promise<{ success: boolean; message: string }>;
  rejectInstructor: (userId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  getPendingInstructors: () => User[];
  sendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  verifyEmail: (code: string) => Promise<{ success: boolean; message: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  enable2FA: () => Promise<{ success: boolean; secret: string; qrCode: string }>;
  disable2FA: (code: string) => Promise<{ success: boolean; message: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; message: string }>;
  refreshAccessToken: () => Promise<boolean>;
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const initialMockUsers = [
  {
    id: 'u1', name: 'Nguyễn Văn An', email: 'user@test.com', password: '123456',
    role: 'user' as const, points: 1250, level: 'Silver' as const,
    joinDate: '2024-01-15', phone: '0901234567', avatar: '',
    bio: 'Học viên đam mê UX/UI Design',
  },
  {
    id: 'admin1', name: 'Admin EduCourse', email: 'admin@educourse.vn', password: 'admin123',
    role: 'admin' as const, points: 9999, level: 'Platinum' as const,
    joinDate: '2023-06-01', phone: '0909999999', avatar: '',
    bio: 'Quản trị viên hệ thống',
  },
  {
    id: 'instructor1', name: 'Trần Minh Khang', email: 'instructor@educourse.vn', password: 'instructor123',
    role: 'instructor' as const, points: 5500, level: 'Gold' as const,
    joinDate: '2023-09-10', phone: '0905555555', avatar: '',
    bio: 'Senior UX/UI Designer với 8 năm kinh nghiệm trong thiết kế sản phẩm số',
    instructorStatus: 'approved' as const,
    expertise: ['UX Design', 'UI Design', 'Figma', 'User Research'],
    socialLinks: {
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/example'
    }
  },
  {
    id: 'pending1', name: 'Lê Thị Hương', email: 'huong@test.com', password: '123456',
    role: 'user' as const, points: 450, level: 'Bronze' as const,
    joinDate: '2024-03-20', phone: '0912345678', avatar: '',
    bio: 'Frontend Developer với 5 năm kinh nghiệm, chuyên về React và TypeScript. Đam mê chia sẻ kiến thức về web development hiện đại.',
    instructorStatus: 'pending' as const,
    expertise: ['React', 'TypeScript', 'Next.js', 'Frontend Development'],
    socialLinks: {
      website: 'https://huongle.dev',
      github: 'https://github.com/huongle',
      linkedin: 'https://linkedin.com/in/huongle'
    }
  },
  {
    id: 'pending2', name: 'Phạm Văn Đức', email: 'duc@test.com', password: '123456',
    role: 'user' as const, points: 320, level: 'Bronze' as const,
    joinDate: '2024-04-01', phone: '0923456789', avatar: '',
    bio: 'Product Designer và UX Researcher. Làm việc tại các startup công nghệ 7 năm. Muốn chia sẻ phương pháp thiết kế sản phẩm hiệu quả.',
    instructorStatus: 'pending' as const,
    expertise: ['Product Design', 'UX Research', 'Design Thinking', 'Figma'],
    socialLinks: {
      website: 'https://ducpham.design',
      linkedin: 'https://linkedin.com/in/ducpham'
    }
  },
  {
    id: 'pending3', name: 'Ngô Minh Tuấn', email: 'tuan@test.com', password: '123456',
    role: 'user' as const, points: 280, level: 'Bronze' as const,
    joinDate: '2024-04-10', phone: '0934567890', avatar: '',
    bio: 'DevOps Engineer, chuyên về Docker, Kubernetes và CI/CD. Có kinh nghiệm triển khai hệ thống cho doanh nghiệp lớn.',
    instructorStatus: 'pending' as const,
    expertise: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    socialLinks: {
      github: 'https://github.com/tuanngo',
      linkedin: 'https://linkedin.com/in/tuanngo'
    }
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mockUsers, setMockUsers] = useState(() => {
    const stored = localStorage.getItem('mock_users');
    return stored ? JSON.parse(stored) : initialMockUsers;
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('access_token')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem('refresh_token')
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [pending2FA, setPending2FA] = useState<User | null>(null);

  // Sync mockUsers to localStorage
  useEffect(() => {
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  }, [mockUsers]);

  // Auto refresh token every 14 minutes (access token expires in 15 min)
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const generateTokens = (userId: string) => {
    const access = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId, exp: Date.now() + 15 * 60 * 1000 }))}`;
    const refresh = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))}`;
    return { access, refresh };
  };

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPassword } = found;

      // Check if 2FA is enabled
      if (userWithoutPassword.twoFactorEnabled) {
        setPending2FA(userWithoutPassword);
        setAuthMode('2fa');
        return { success: true, message: 'Vui lòng nhập mã xác thực 2FA', requires2FA: true };
      }

      const tokens = generateTokens(userWithoutPassword.id);
      setUser(userWithoutPassword);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setShowAuthModal(false);
      return { success: true, message: 'Đăng nhập thành công!' };
    }
    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  };

  const loginWithGoogle = async () => {
    await new Promise(r => setTimeout(r, 1000));
    // Simulate Google OAuth
    const mockGoogleUser: User = {
      id: `google_${Date.now()}`,
      name: 'Google User',
      email: `user${Date.now()}@gmail.com`,
      role: 'user',
      points: 150,
      level: 'Bronze',
      joinDate: new Date().toISOString().split('T')[0],
      emailVerified: true,
      provider: 'google',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };
    const tokens = generateTokens(mockGoogleUser.id);
    setUser(mockGoogleUser);
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    localStorage.setItem('auth_user', JSON.stringify(mockGoogleUser));
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setShowAuthModal(false);
    return { success: true, message: 'Đăng nhập Google thành công! Nhận 150 điểm thưởng!' };
  };

  const loginWithFacebook = async () => {
    await new Promise(r => setTimeout(r, 1000));
    // Simulate Facebook OAuth
    const mockFacebookUser: User = {
      id: `facebook_${Date.now()}`,
      name: 'Facebook User',
      email: `user${Date.now()}@facebook.com`,
      role: 'user',
      points: 150,
      level: 'Bronze',
      joinDate: new Date().toISOString().split('T')[0],
      emailVerified: true,
      provider: 'facebook',
      avatar: 'https://graph.facebook.com/v12.0/me/picture'
    };
    const tokens = generateTokens(mockFacebookUser.id);
    setUser(mockFacebookUser);
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    localStorage.setItem('auth_user', JSON.stringify(mockFacebookUser));
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setShowAuthModal(false);
    return { success: true, message: 'Đăng nhập Facebook thành công! Nhận 150 điểm thưởng!' };
  };

  const register = async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const exists = mockUsers.find(u => u.email === email);
    if (exists) return { success: false, message: 'Email đã tồn tại' };
    const newUser: User = {
      id: `u${Date.now()}`, name, email, role: 'user',
      points: 100, level: 'Bronze', joinDate: new Date().toISOString().split('T')[0],
      emailVerified: false, provider: 'email'
    };
    const tokens = generateTokens(newUser.id);
    setUser(newUser);
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setShowAuthModal(false);
    setAuthMode('verify-email');
    setShowAuthModal(true);
    return { success: true, message: 'Đăng ký thành công! Vui lòng xác thực email để kích hoạt tài khoản.' };
  };

  const sendVerificationEmail = async () => {
    await new Promise(r => setTimeout(r, 800));
    if (!user) return { success: false, message: 'Vui lòng đăng nhập trước' };
    if (user.emailVerified) return { success: false, message: 'Email đã được xác thực' };
    // Mock sending email with verification code
    console.log('Verification code sent to:', user.email, 'Code: 123456');
    return { success: true, message: 'Mã xác thực đã được gửi về email của bạn!' };
  };

  const verifyEmail = async (code: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (!user) return { success: false, message: 'Vui lòng đăng nhập trước' };
    // Mock verification (accept "123456" as valid code)
    if (code === '123456') {
      const updated = { ...user, emailVerified: true };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
      setShowAuthModal(false);
      return { success: true, message: 'Xác thực email thành công!' };
    }
    return { success: false, message: 'Mã xác thực không đúng' };
  };

  const sendPasswordResetEmail = async (email: string) => {
    await new Promise(r => setTimeout(r, 800));
    const exists = mockUsers.find(u => u.email === email);
    if (!exists) return { success: false, message: 'Email không tồn tại trong hệ thống' };
    // Mock sending OTP
    console.log('Password reset OTP sent to:', email, 'OTP: 123456');
    return { success: true, message: 'Mã OTP đã được gửi về email của bạn!' };
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await new Promise(r => setTimeout(r, 800));
    // Mock password reset (accept "123456" as valid OTP)
    if (otp === '123456') {
      console.log('Password reset for:', email, 'New password:', newPassword);
      return { success: true, message: 'Mật khẩu đã được đặt lại thành công!' };
    }
    return { success: false, message: 'Mã OTP không đúng' };
  };

  const enable2FA = async () => {
    await new Promise(r => setTimeout(r, 800));
    if (!user) return { success: false, secret: '', qrCode: '' };
    // Mock 2FA setup
    const secret = 'JBSWY3DPEHPK3PXP';
    const qrCode = `otpauth://totp/EduCourse:${user.email}?secret=${secret}&issuer=EduCourse`;
    return { success: true, secret, qrCode };
  };

  const disable2FA = async (code: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (!user) return { success: false, message: 'Vui lòng đăng nhập trước' };
    // Mock 2FA disable (accept "123456" as valid code)
    if (code === '123456') {
      const updated = { ...user, twoFactorEnabled: false };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return { success: true, message: 'Đã tắt xác thực hai yếu tố' };
    }
    return { success: false, message: 'Mã xác thực không đúng' };
  };

  const verify2FA = async (code: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (!pending2FA) return { success: false, message: 'Không có phiên đăng nhập nào đang chờ xác thực' };
    // Mock 2FA verification (accept "123456" as valid code)
    if (code === '123456') {
      const tokens = generateTokens(pending2FA.id);
      setUser(pending2FA);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      localStorage.setItem('auth_user', JSON.stringify(pending2FA));
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setPending2FA(null);
      setShowAuthModal(false);
      return { success: true, message: 'Xác thực 2FA thành công!' };
    }
    return { success: false, message: 'Mã xác thực không đúng' };
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return false;
    await new Promise(r => setTimeout(r, 500));
    try {
      // Mock refresh token validation
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      if (payload.exp < Date.now()) {
        // Refresh token expired, logout
        logout();
        return false;
      }
      const newTokens = generateTokens(payload.userId);
      setAccessToken(newTokens.access);
      setRefreshToken(newTokens.refresh);
      localStorage.setItem('access_token', newTokens.access);
      localStorage.setItem('refresh_token', newTokens.refresh);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setPending2FA(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  };

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPending2FA(null);
  };

  const applyAsInstructor = async (data: { expertise: string[]; bio: string; socialLinks: User['socialLinks'] }) => {
    await new Promise(r => setTimeout(r, 800));
    if (!user) return { success: false, message: 'Vui lòng đăng nhập trước' };
    if (user.role === 'instructor') return { success: false, message: 'Bạn đã là giảng viên' };

    const updated = {
      ...user,
      instructorStatus: 'pending' as const,
      expertise: data.expertise,
      bio: data.bio,
      socialLinks: data.socialLinks
    };

    // Update mockUsers
    setMockUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updated } : u));
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
    return { success: true, message: 'Đơn đăng ký giảng viên đã được gửi! Chúng tôi sẽ xem xét trong vòng 24-48 giờ.' };
  };

  const approveInstructor = async (userId: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
    }

    const targetUser = mockUsers.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    if (targetUser.instructorStatus !== 'pending') {
      return { success: false, message: 'Đơn đăng ký không ở trạng thái chờ duyệt' };
    }

    const updatedUser = {
      ...targetUser,
      role: 'instructor' as const,
      instructorStatus: 'approved' as const,
    };

    setMockUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));

    return {
      success: true,
      message: `Đã phê duyệt ${targetUser.name} trở thành giảng viên!`
    };
  };

  const rejectInstructor = async (userId: string, reason?: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
    }

    const targetUser = mockUsers.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    if (targetUser.instructorStatus !== 'pending') {
      return { success: false, message: 'Đơn đăng ký không ở trạng thái chờ duyệt' };
    }

    const updatedUser = {
      ...targetUser,
      instructorStatus: 'rejected' as const,
    };

    setMockUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));

    return {
      success: true,
      message: `Đã từ chối đơn đăng ký của ${targetUser.name}${reason ? ': ' + reason : ''}`
    };
  };

  const getPendingInstructors = () => {
    return mockUsers.filter(u => u.instructorStatus === 'pending');
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isInstructor: user?.role === 'instructor' && user?.instructorStatus === 'approved',
      accessToken, refreshToken,
      login, loginWithGoogle, loginWithFacebook, register, logout, updateUser,
      applyAsInstructor, approveInstructor, rejectInstructor, getPendingInstructors,
      sendVerificationEmail, verifyEmail,
      sendPasswordResetEmail, resetPassword,
      enable2FA, disable2FA, verify2FA,
      refreshAccessToken,
      showAuthModal, authMode, openAuthModal, closeAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
