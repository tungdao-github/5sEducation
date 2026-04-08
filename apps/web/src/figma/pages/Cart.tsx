"use client";

import { Link } from '@/figma/compat/router';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../data/api';

export default function Cart() {
  const { cartItems, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="size-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa thêm khóa học nào vào giỏ hàng. Hãy khám phá các khóa học tuyệt vời của chúng tôi!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Khám phá khóa học
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Image */}
                  <Link to={`/course/${course.slug ?? course.id}`} className="flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full sm:w-48 aspect-video object-cover rounded-lg"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/course/${course.slug ?? course.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">Giảng viên: {course.instructor}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {course.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
                      )}
                      <span className="text-xl font-bold text-blue-600">{formatPrice(course.price)}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                    <button
                      onClick={() => removeFromCart(course.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-2"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng quan đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng phụ:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Thuế:</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Tiến hành thanh toán
              </Link>

              <Link
                to="/"
                className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quyền lợi của bạn:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Truy cập trọn đời</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Chứng chỉ hoàn thành</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Cập nhật miễn phí</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Hoàn tiền trong 30 ngày</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
