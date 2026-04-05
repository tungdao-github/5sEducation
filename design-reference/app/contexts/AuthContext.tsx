import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate: string;
  phone?: string;
  bio?: string;
}

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const mockUsers = [
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
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      setShowAuthModal(false);
      return { success: true, message: 'Đăng nhập thành công!' };
    }
    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  };

  const register = async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const exists = mockUsers.find(u => u.email === email);
    if (exists) return { success: false, message: 'Email đã tồn tại' };
    const newUser: User = {
      id: `u${Date.now()}`, name, email, role: 'user',
      points: 100, level: 'Bronze', joinDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setShowAuthModal(false);
    return { success: true, message: 'Đăng ký thành công! Nhận 100 điểm thưởng!' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
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

  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      login, register, logout, updateUser,
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
