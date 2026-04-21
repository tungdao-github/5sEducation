"use client";

import { Link } from '@/figma/compat/router';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { toast } from '@/figma/compat/sonner';
import { formatPrice } from '../data/api';

const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse</text>
  </svg>`
)}`;

function safeImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : IMAGE_FALLBACK;
}

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <Heart className="mx-auto mb-4 size-16 fill-rose-500 text-rose-500" />
          <h2 className="mb-2 text-2xl font-semibold text-slate-950">Chưa có khóa học yêu thích</h2>
          <p className="mb-6 text-slate-500">Hãy thêm những khóa học bạn thích để dễ dàng tìm lại sau!</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700">
            Khám phá khóa học <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="size-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Khóa học yêu thích</h1>
            <p className="text-sm text-slate-500">{wishlistItems.length} khóa học đã lưu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {wishlistItems.map(course => {
            const inCart = isInCart(course.id);
            return (
              <div key={course.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <div className="flex gap-4 p-4">
                  <Link to={`/course/${course.slug ?? course.id}`} className="shrink-0">
                    <img src={safeImage(course.image)} alt={course.title} className="h-24 w-32 rounded-2xl object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/course/${course.slug ?? course.id}`}>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 transition-colors hover:text-blue-600">{course.title}</h3>
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{course.instructor}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold text-slate-950">{formatPrice(course.price)}</span>
                      {course.originalPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(course.originalPrice)}</span>}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { if (!inCart) { addToCart(course); toast.success('Đã thêm vào giỏ hàng!'); } }}
                        disabled={inCart}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-medium transition-colors ${inCart ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                        <ShoppingCart className="size-3.5" />
                        {inCart ? 'Đã trong giỏ' : 'Thêm vào giỏ'}
                      </button>
                      <button onClick={() => { removeFromWishlist(course.id); toast('Đã xóa khỏi yêu thích', { icon: '💔' }); }}
                        className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition-colors hover:text-rose-500">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
