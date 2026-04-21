"use client";

import { Link, useNavigate } from '@/figma/compat/router';
import {
  ShoppingCart, Search, Menu, BookOpen, Heart, X,
  User, LogOut, Settings, BookMarked, ChevronDown, Globe, GraduationCap,
  TrendingUp, Package,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/figma/compat/sonner';

export default function Header() {
  const { cartItems } = useCart();
  const { user, isAuthenticated, isLoading, logout, openAuthModal } = useAuth();
  const { wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-max mx-auto px-1 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <BookOpen className="size-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduCourse</span>
          </Link>

         

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm khóa học..."
                  className="min-w-90 sm:w-52 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="text-gray-500 hover:text-gray-800 p-1">
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Tìm kiếm"
              >
                <Search className="size-5" />
              </button>
            )}

             <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('Trường Học', 'Trường Học')}
            </Link>
            {/* <Link to="/compare" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium flex items-center gap-1">
              <TrendingUp className="size-3.5" />So sánh
            </Link> */}
            <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('Trường Học', 'Giảng viên')}
            </Link>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('Việc học của tôi', 'Việc học của tôi')}
            </a>
          </nav>

             {/* Desktop Navigation */}
          {/* <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('nav', 'courses')}
            </Link>
            <Link to="/compare" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium flex items-center gap-1">
              <TrendingUp className="size-3.5" />So sánh
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('nav', 'blog')}
            </Link>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">
              {t('nav', 'about')}
            </a>
          </nav> */}

            {/* Language switcher */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="ml-8 hidden sm:flex items-center gap-1 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
              title="Chuyển ngôn ngữ"
            >
              <p><Globe className="size-4" /></p>
             <div style={{display:'flex', flexDirection: 'column'}}>
                  <span>{language === 'vi' ? 'EN' : 'VI'}</span>
                  <span>Tiếng trung</span>
                  <span>Tiếng tây ban nha</span>
             </div>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Thông báo"
            >
                Thông báo
              {/* <Heart className="size-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full size-4 flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )} */}
            </Link>

            {/* Cart */}
            {/* <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Giỏ hàng"
            >
              <ShoppingCart className="size-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] rounded-full size-4 flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link> */}

            {/* Auth */}
            {isLoading ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="size-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {/* <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name.split(' ')[0]}</span> */}
                  {/* <ChevronDown className={`size-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} /> */}
                </button>

                {/* Mobile user button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="size-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-semibold ${levelColors[user.level] || 'text-gray-500'}`}>
                          ⭐ {user.level}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
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
                      Tài khoản của tôi
                    </Link>
                    <Link to="/order-tracking" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Package className="size-4" />
                      Theo dõi đơn hàng
                    </Link>
                    <Link to="/account?tab=orders" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <BookMarked className="size-4" />
                      Đơn hàng của tôi
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Heart className="size-4" />
                      Khóa học yêu thích
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors">
                        <Settings className="size-4" />
                        Quản trị Admin
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
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
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t('nav', 'login')}
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('nav', 'register')}
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 space-y-1">
            <Link to="/" onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
              Khóa học
            </Link>
            <Link to="/compare" onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
              So sánh khóa học
            </Link>
            <Link to="/order-tracking" onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
              Theo dõi đơn hàng
            </Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
              Blog
            </Link>
            <a href="#" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
              Về chúng tôi
            </a>
            <hr className="border-gray-200 my-2" />
            <button
              onClick={() => { setLanguage(language === 'vi' ? 'en' : 'vi'); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
            >
              <Globe className="size-4" />
              Chuyển sang {language === 'vi' ? 'English' : 'Tiếng Việt'}
            </button>
            {!isLoading && !isAuthenticated && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }}
                  className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                  Đăng nhập
                </button>
                <button onClick={() => { openAuthModal('register'); setIsMenuOpen(false); }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Đăng ký
                </button>
              </div>
            )}
          </nav>
        )}
      </div>

      <div className='' style={{display: 'flex', justifyContent:'flex-start', paddingLeft:'100px', gap: '20px'}}>
        <h5 >Dành cho học sinh</h5>
        <h5 >Dành cho cá nhân</h5>
        <h5 >Dàng cho trường đại học</h5>
        <h5 >Dàng cho Chính phủ</h5>
      </div>
    </header>
  );
}
