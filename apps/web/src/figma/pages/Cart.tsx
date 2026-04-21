"use client";

import { Link } from '@/figma/compat/router';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../data/api';

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function Cart() {
  const { cartItems, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <ShoppingBag className="mx-auto mb-4 size-16 text-slate-300" />
          <h2 className="mb-2 text-2xl font-semibold text-slate-950">Giỏ hàng trống</h2>
          <p className="mb-6 text-slate-600">Bạn chưa thêm khóa học nào vào giỏ hàng. Hãy khám phá các khóa học tuyệt vời của chúng tôi!</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700">
            Khám phá khóa học <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Giỏ hàng của bạn</h1>
            <p className="text-sm text-slate-500">{cartItems.length} khóa học sẵn sàng để thanh toán</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cartItems.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <Link to={`/course/${course.slug ?? course.id}`} className="shrink-0">
                    <img src={safeImage(course.image)} alt={course.title} className="h-32 w-full rounded-2xl object-cover sm:w-48" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/course/${course.slug ?? course.id}`}>
                      <h3 className="mb-2 text-lg font-semibold text-slate-950 transition-colors hover:text-blue-600">{course.title}</h3>
                    </Link>
                    <p className="mb-2 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
                    <div className="mb-3 flex items-center gap-3 text-sm text-slate-500">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {course.originalPrice && <span className="text-sm text-slate-400 line-through">{formatPrice(course.originalPrice)}</span>}
                      <span className="text-2xl font-black text-blue-600">{formatPrice(course.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start">
                    <button onClick={() => removeFromCart(course.id)} className="rounded-2xl border border-rose-200 p-2 text-rose-600 transition-colors hover:bg-rose-50">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="mb-6 text-xl font-bold text-slate-950">Tổng quan đơn hàng</h2>
              <div className="space-y-3 mb-6 text-slate-700">
                <div className="flex justify-between"><span>Tổng phụ:</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span>Thuế:</span><span>{formatPrice(0)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950"><span>Tổng cộng:</span><span className="text-blue-600">{formatPrice(totalPrice)}</span></div>
              </div>
              <Link to="/checkout" className="mb-3 block rounded-2xl bg-slate-900 py-3 text-center font-semibold text-white transition hover:bg-slate-700">Tiến hành thanh toán</Link>
              <Link to="/" className="block rounded-2xl bg-slate-100 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-200">Tiếp tục mua sắm</Link>
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="size-4 text-emerald-600" />Quyền lợi của bạn</div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['Truy cập trọn đời', 'Chứng chỉ hoàn thành', 'Cập nhật miễn phí', 'Hoàn tiền trong 30 ngày'].map((item) => (
                    <li key={item} className="flex items-start gap-2"><span className="mt-0.5 text-emerald-600">✓</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
