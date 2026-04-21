"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@/figma/compat/router";
import {
  Search,
  Menu,
  X,
  ShoppingCart,
  Heart,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Globe,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "@/figma/compat/sonner";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/courses", label: "Khoa hoc" },
  { href: "/paths", label: "Lo trinh" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Ve chung toi" },
];

const targetAudiences = [
  { label: "Danh cho hoc sinh", href: "/for-students" },
  { label: "Danh cho ca nhan", href: "/for-individuals" },
  { label: "Danh cho doanh nghiep", href: "/for-business" },
  { label: "Danh cho truong hoc", href: "/for-schools" },
];

export default function Header() {
  const { cartItems } = useCart();
  const { user, isAuthenticated, isLoading, logout, openAuthModal } = useAuth();
  const { wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    toast.success("Da dang xuat thanh cong!");
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-background border-b border-transparent"
      )}
    >
      {/* Top Bar - Target Audiences */}
      <div className="hidden lg:block bg-muted border-b border-border">
        <div className="container-main">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6">
              {targetAudiences.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="size-4" />
              <span>{language === "vi" ? "Tieng Viet" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              EduCourse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tim kiem khoa hoc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 pr-4 h-10 bg-secondary border-0 focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label="Tim kiem"
            >
              <Search className="size-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label="Yeu thich"
            >
              <Heart className="size-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label="Gio hang"
            >
              <ShoppingCart className="size-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </span>
              )}
            </Link>

            {/* Notifications - Only for authenticated users */}
            {isAuthenticated && (
              <button
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                aria-label="Thong bao"
              >
                <Bell className="size-5" />
                <span className="absolute top-1.5 right-1.5 size-2 bg-accent rounded-full" />
              </button>
            )}

            {/* Auth Section */}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-10 w-24 animate-pulse bg-muted rounded-lg" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-1.5 pr-3 rounded-full hover:bg-secondary transition-colors"
                >
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform hidden sm:block",
                      isUserMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-2 animate-scale-in origin-top-right">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {user.level && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge badge-accent text-xs">
                            {user.level}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.points} diem
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/my-learning"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <BookOpen className="size-4 text-muted-foreground" />
                        Khoa hoc cua toi
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <User className="size-4 text-muted-foreground" />
                        Tai khoan
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="size-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Settings className="size-4" />
                          Quan tri Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="size-4" />
                        Dang xuat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="btn btn-ghost btn-sm"
                >
                  Dang nhap
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="btn btn-primary btn-sm"
                >
                  Dang ky
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tim kiem khoa hoc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 pr-12"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-foreground hover:bg-secondary rounded-lg font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="my-4 border-t border-border" />

            {/* Target Audiences - Mobile */}
            <div className="space-y-1 mb-4">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Danh cho
              </p>
              {targetAudiences.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="my-4 border-t border-border" />

            {/* Language - Mobile */}
            <button
              onClick={() => {
                setLanguage(language === "vi" ? "en" : "vi");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Globe className="size-4" />
              <span>
                Chuyen sang {language === "vi" ? "English" : "Tieng Viet"}
              </span>
            </button>

            {/* Auth - Mobile */}
            {!isLoading && !isAuthenticated && (
              <div className="flex gap-2 mt-4 px-4">
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setIsMenuOpen(false);
                  }}
                  className="btn btn-outline btn-md flex-1"
                >
                  Dang nhap
                </button>
                <button
                  onClick={() => {
                    openAuthModal("register");
                    setIsMenuOpen(false);
                  }}
                  className="btn btn-primary btn-md flex-1"
                >
                  Dang ky
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
