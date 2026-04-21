import { Link } from 'react-router';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Heart className="size-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có khóa học yêu thích</h2>
          <p className="text-gray-500 mb-6">Hãy thêm những khóa học bạn thích để dễ dàng tìm lại sau!</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Khám phá khóa học <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="size-6 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Khóa học yêu thích</h1>
          <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">{wishlistItems.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {wishlistItems.map(course => {
            const inCart = isInCart(course.id);
            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex gap-4 p-4">
                  <Link to={`/course/${course.id}`} className="flex-shrink-0">
                    <img src={course.image} alt={course.title} className="w-28 h-20 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/course/${course.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">{course.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-blue-600">{(course.price * 1000).toLocaleString('vi-VN')}đ</span>
                      {course.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{(course.originalPrice * 1000).toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { if (!inCart) { addToCart(course); toast.success('Đã thêm vào giỏ hàng!'); } }}
                        disabled={inCart}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${inCart ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <ShoppingCart className="size-3.5" />
                        {inCart ? 'Đã trong giỏ' : 'Thêm vào giỏ'}
                      </button>
                      <button onClick={() => { removeFromWishlist(course.id); toast('Đã xóa khỏi yêu thích', { icon: '💔' }); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition-colors">
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
