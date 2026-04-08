"use client";

import { Link } from '@/figma/compat/router';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">EduCourse</h3>
            <p className="text-sm mb-4">
              Nền tảng học trực tuyến hàng đầu về UX/UI Design và Thương mại điện tử với các khóa học chất lượng cao.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog & Tin tức
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Yêu thích
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Tài khoản
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Giỏ hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Thiết kế UX/UI
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Nghiên cứu UX
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Viết nội dung UX
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quản lý UX
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Phân tích UX
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="size-5 flex-shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP.HCM, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-5 flex-shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-5 flex-shrink-0" />
                <span>info@educourse.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 EduCourse. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}