import { Link, useNavigate } from 'react-router';
import {
  ShoppingCart, Search, Menu, BookOpen, Heart, X,
  User, LogOut, Settings, BookMarked, ChevronDown, Globe, GraduationCap,
  TrendingUp, Package, Video, Bell, Building2, Briefcase, Users2, Landmark
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export default function Header() {
  const { cartItems } = useCart();
  const { user, isAuthenticated, isInstructor, logout, openAuthModal } = useAuth();
  const { wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    toast.success('Đã đăng xuất thành công!');
    navigate('/');
  };

  const levelColors: Record<string, string> = {
    Bronze: 'text-amber-600',
    Silver: 'text-gray-400',
    Gold: 'text-yellow-500',
    Platinum: 'text-sky-400',
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Row */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <BookOpen className="size-7 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">EduCourse</span>
            </Link>

            {/* Center Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Desktop Links */}
              <Link to="/" className="hidden lg:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
              {isInstructor && (
                <Link to="/instructor" className="hidden lg:flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                  <Video className="size-4" />
                  Giảng viên
                </Link>
              )}
              <Link to="/my-learning" className="hidden lg:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Khóa học của tôi
              </Link>

              {/* Language */}
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="hidden sm:flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              >
                <Globe className="size-5" />
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Thông báo"
              >
                <Bell className="size-5" />
                <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="size-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-semibold ${levelColors[user.level]}`}>
                            ⭐ {user.level}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-blue-600 font-medium">{user.points} điểm</span>
                        </div>
                      </div>

                      <Link to="/my-learning" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <GraduationCap className="size-4" />
                        Khóa học của tôi
                      </Link>
                      <Link to="/account" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <User className="size-4" />
                        Tài khoản
                      </Link>
                      <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Heart className="size-4" />
                        Yêu thích
                      </Link>
                      <Link to="/cart" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <ShoppingCart className="size-4" />
                        Giỏ hàng {cartItems.length > 0 && `(${cartItems.length})`}
                      </Link>

                      <hr className="my-2 border-gray-100" />

                      {isInstructor ? (
                        <Link to="/instructor" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors">
                          <Video className="size-4" />
                          Dashboard Giảng viên
                        </Link>
                      ) : user?.instructorStatus === 'pending' ? (
                        <Link to="/become-instructor" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors">
                          <Video className="size-4" />
                          Đơn đang chờ duyệt
                        </Link>
                      ) : (
                        <Link to="/become-instructor" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors">
                          <Video className="size-4" />
                          Trở thành Giảng viên
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors">
                          <Settings className="size-4" />
                          Quản trị Admin
                        </Link>
                      )}

                      <hr className="my-2 border-gray-100" />

                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="size-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Row */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-8 h-12">
            <Link to="/?category=students" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <Users2 className="size-4" />
              Dành cho Học sinh
            </Link>
            <Link to="/?category=personal" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <User className="size-4" />
              Dành cho Cá nhân
            </Link>
            <Link to="/?category=business" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <Briefcase className="size-4" />
              Dành cho Doanh nghiệp
            </Link>
            <Link to="/?category=government" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <Landmark className="size-4" />
              Dành cho Chính phủ
            </Link>
            <span className="flex-1"></span>
            <Link to="/compare" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <TrendingUp className="size-4" />
              So sánh khóa học
            </Link>
            <Link to="/blog" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Blog
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-4 py-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            <nav className="space-y-1">
              <Link to="/" onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                Trang chủ
              </Link>
              <Link to="/my-learning" onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                Khóa học của tôi
              </Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                Blog
              </Link>
              <Link to="/compare" onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                So sánh khóa học
              </Link>

              <hr className="my-2 border-gray-200" />

              {isInstructor ? (
                <Link to="/instructor" onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-green-600 hover:bg-green-50 font-medium transition-colors">
                  Dashboard Giảng viên
                </Link>
              ) : user?.instructorStatus === 'pending' ? (
                <Link to="/become-instructor" onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50 font-medium transition-colors">
                  Đơn đang chờ duyệt
                </Link>
              ) : (
                <Link to="/become-instructor" onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 font-medium transition-colors">
                  Trở thành Giảng viên
                </Link>
              )}

              {!isAuthenticated && (
                <>
                  <hr className="my-2 border-gray-200" />
                  <div className="flex gap-2">
                    <button onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }}
                      className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                      Đăng nhập
                    </button>
                    <button onClick={() => { openAuthModal('register'); setIsMenuOpen(false); }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Đăng ký
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}