import { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Package, Truck, BookOpen, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router';
import { mockOrders, statusConfig } from '../data/orders';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function OrderTracking() {
  const { user, isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const userOrders = isAuthenticated && user
    ? mockOrders.filter(o => o.userId === user.id)
    : [];

  const handleTrack = () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return;
    const found = mockOrders.find(o => o.id.toUpperCase() === q || o.id.toUpperCase().includes(q));
    if (found) { setTrackedOrder(found); setNotFound(false); }
    else { setTrackedOrder(null); setNotFound(true); }
  };

  const handleDownloadInvoice = (order: typeof mockOrders[0]) => {
    // Simulate PDF invoice download
    const content = `
HÓA ĐƠN ĐIỆN TỬ
=====================================
EduCourse - Học UX/UI Design Online
Email: support@educourse.vn | Tel: 1800-1234
=====================================
Mã đơn hàng: ${order.id}
Ngày tạo: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}
Khách hàng: ${order.fullName}
Email: ${order.email}
-------------------------------------
SẢN PHẨM:
${order.items.map(item => `  - ${item.title}\n    Giảng viên: ${item.instructor}\n    Giá: ${item.price.toLocaleString()}K₫`).join('\n')}
-------------------------------------
Tổng phụ: ${(order.total + order.discount).toLocaleString()}K₫
Giảm giá: -${order.discount.toLocaleString()}K₫
TỔNG CỘNG: ${order.total.toLocaleString()}K₫
Thanh toán: ${order.paymentMethod}
${order.couponCode ? `Mã giảm giá: ${order.couponCode}` : ''}
=====================================
Cảm ơn bạn đã tin tưởng EduCourse!
    `.trim();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoa-don-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Hóa đơn đã được tải xuống!');
  };

  const stepIcons = [
    <Package className="size-4" />,
    <AlertCircle className="size-4" />,
    <Truck className="size-4" />,
    <CheckCircle className="size-4" />,
  ];

  const OrderCard = ({ order }: { order: typeof mockOrders[0] }) => {
    const sc = statusConfig[order.status];
    const doneSteps = order.trackingSteps.filter(s => s.done).length;
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
        {/* Order Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="font-mono font-bold text-gray-900">{order.id}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
              </div>
              <p className="text-sm text-gray-500">Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleDownloadInvoice(order)}
                className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                <Download className="size-4" />Hóa đơn
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Tracking Timeline */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Tiến trình đơn hàng</p>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((doneSteps - 1) / (order.trackingSteps.length - 1)) * 100}%` }} />
              </div>
              <div className="flex justify-between relative">
                {order.trackingSteps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ flex: '1' }}>
                    <div className={`size-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                      step.done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {step.done ? <CheckCircle className="size-5" /> : stepIcons[i] || <Clock className="size-4" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${step.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{step.label}</p>
                    {step.date && <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img src={item.image} alt={item.title} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.instructor}</p>
                </div>
                <p className="font-semibold text-blue-600 text-sm flex-shrink-0">{item.price.toLocaleString()}K₫</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-500">
              <span>💳 {order.paymentMethod}</span>
              {order.couponCode && <span className="ml-3 text-green-600">🏷️ {order.couponCode} (-{order.discount.toLocaleString()}K₫)</span>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Tổng cộng</p>
              <p className="text-lg font-bold text-gray-900">{order.total.toLocaleString()}K₫</p>
            </div>
          </div>

          {/* Access Course Button */}
          {order.status === 'completed' && (
            <Link to="/my-learning" className="mt-4 flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition text-sm">
              <BookOpen className="size-4" />Vào học ngay
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="size-4" />Về trang chủ
          </Link>
          <div className="size-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="size-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Theo dõi đơn hàng</h1>
          <p className="text-blue-100 mb-8">Nhập mã đơn hàng để xem trạng thái chi tiết</p>

          {/* Search */}
          <div className="max-w-xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="Nhập mã đơn hàng (VD: ORD-2026-001)"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>
            <button onClick={handleTrack} className="bg-white text-blue-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition whitespace-nowrap text-sm">
              Tra cứu
            </button>
          </div>
          <p className="text-xs text-blue-200 mt-3">Thử: ORD-2026-001 hoặc ORD-2026-002</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Not Found */}
        {notFound && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 mb-8">
            <XCircle className="size-12 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-500 text-sm">Kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ: support@educourse.vn</p>
          </div>
        )}

        {/* Tracked Order */}
        {trackedOrder && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Kết quả tra cứu</h2>
            <OrderCard order={trackedOrder} />
          </div>
        )}

        {/* User's Orders */}
        {isAuthenticated && userOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Đơn hàng của tôi ({userOrders.length})</h2>
            <div className="space-y-5">
              {userOrders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>
        )}

        {/* Not logged in */}
        {!isAuthenticated && !trackedOrder && !notFound && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="size-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Tra cứu đơn hàng</h3>
            <p className="text-gray-500 text-sm mb-4">Nhập mã đơn hàng ở trên, hoặc đăng nhập để xem tất cả đơn hàng</p>
            <Link to="/account?tab=orders" className="text-blue-600 hover:underline text-sm font-medium">
              Đăng nhập để xem đơn hàng →
            </Link>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Quy trình xử lý đơn hàng</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: <Package className="size-6 text-blue-500" />, title: 'Đặt hàng', desc: 'Đơn hàng được ghi nhận ngay sau khi thanh toán' },
              { icon: <AlertCircle className="size-6 text-yellow-500" />, title: 'Xác nhận', desc: 'Hệ thống xác nhận thanh toán trong 5 phút' },
              { icon: <Truck className="size-6 text-purple-500" />, title: 'Xử lý', desc: 'Kích hoạt quyền truy cập khóa học cho bạn' },
              { icon: <CheckCircle className="size-6 text-green-500" />, title: 'Hoàn thành', desc: 'Bạn có thể học ngay lập tức, mọi lúc mọi nơi' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="size-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">{step.icon}</div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
