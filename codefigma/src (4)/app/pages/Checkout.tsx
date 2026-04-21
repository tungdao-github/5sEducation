import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { CreditCard, Lock, CheckCircle, Tag, X, Smartphone, Wallet, Download, Mail, QrCode } from 'lucide-react';
import { coupons } from '../data/orders';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'momo' | 'vnpay' | 'zalopay';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const finalPrice = appliedCoupon
    ? Math.max(0, totalPrice - appliedCoupon.discount)
    : totalPrice;

  if (cartItems.length === 0 && !isComplete) {
    navigate('/cart');
    return null;
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (coupons[code]) {
      setAppliedCoupon({ code, discount: coupons[code] });
      toast.success(`Áp dụng mã "${code}" - Giảm ${(coupons[code] * 1000).toLocaleString('vi-VN')}đ!`);
      setCouponInput('');
    } else {
      toast.error('Mã giảm giá không hợp lệ');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast('Đã xóa mã giảm giá');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For MoMo/VNPay/ZaloPay, show QR code first
    if (paymentMethod === 'momo' || paymentMethod === 'vnpay' || paymentMethod === 'zalopay') {
      setShowQRCode(true);
      return;
    }

    // For card payment, process directly
    setIsProcessing(true);
    const newOrderId = `EDU${Date.now()}`;
    setOrderId(newOrderId);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      clearCart();
      // Mock send email
      console.log('Email confirmation sent to:', formData.email);
      console.log('Invoice PDF generated for order:', newOrderId);
      toast.success('Email xác nhận đã được gửi!');
    }, 2000);
  };

  const handleQRPaymentComplete = () => {
    setIsProcessing(true);
    setShowQRCode(false);
    const newOrderId = `EDU${Date.now()}`;
    setOrderId(newOrderId);

    // Simulate payment callback from MoMo/VNPay
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      clearCart();
      // Mock IPN callback
      console.log('Payment callback received from', paymentMethod);
      console.log('Order ID:', newOrderId);
      console.log('Email confirmation sent to:', formData.email);
      toast.success('Thanh toán thành công!');
    }, 3000);
  };

  const handleDownloadInvoice = () => {
    // Mock PDF download
    toast.success('Đang tải hóa đơn PDF...');
    setTimeout(() => {
      console.log('Invoice PDF downloaded for order:', orderId);
      toast.success('Hóa đơn đã được tải xuống!');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // QR Code Payment Modal
  if (showQRCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="size-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quét mã QR để thanh toán
            </h2>
            <p className="text-gray-600 mb-6">
              Mở ứng dụng {paymentMethod === 'momo' ? 'MoMo' : paymentMethod === 'vnpay' ? 'VNPay' : 'ZaloPay'} và quét mã QR
            </p>

            {/* Mock QR Code */}
            <div className="bg-white p-6 border-2 border-gray-200 rounded-xl mb-6 inline-block">
              <div className="size-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="size-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">QR Code thanh toán</p>
                  <p className="text-xs text-gray-400 mt-1">{orderId || 'EDU...'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-3">
                <p className="font-medium">Số tiền: {(finalPrice * 1000).toLocaleString('vi-VN')}đ</p>
              </div>
              <p className="text-xs text-gray-500">
                Demo: Click nút "Xác nhận đã thanh toán" để mô phỏng callback
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleQRPaymentComplete}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã mua khóa học. Thông tin truy cập đã được gửi đến email của bạn.
            </p>

            {orderId && (
              <div className="bg-gray-50 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-gray-500">Mã đơn hàng</p>
                <p className="text-sm font-mono font-bold text-gray-900">{orderId}</p>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 text-xs">
                <Mail className="size-4 text-blue-600 mx-auto mb-1" />
                <p className="text-blue-700 font-medium">Email đã gửi</p>
              </div>
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-2 text-xs transition-colors group"
              >
                <Download className="size-4 text-green-600 mx-auto mb-1 group-hover:translate-y-0.5 transition-transform" />
                <p className="text-green-700 font-medium">Tải hóa đơn</p>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
              Kiểm tra email để nhận hướng dẫn truy cập khóa học nhé!
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/account?tab=orders')}
                className="flex-1 border border-blue-600 text-blue-600 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => navigate('/my-learning')}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Bắt đầu học
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: <CreditCard className="size-5" />, desc: 'Visa, Mastercard, JCB' },
    { id: 'momo', label: 'Ví MoMo', icon: <Wallet className="size-5 text-pink-500" />, desc: 'Quét mã QR hoặc thanh toán qua app' },
    { id: 'vnpay', label: 'VNPay', icon: <Smartphone className="size-5 text-blue-500" />, desc: 'Thanh toán qua ví VNPay' },
    { id: 'zalopay', label: 'ZaloPay', icon: <Wallet className="size-5 text-sky-500" />, desc: 'Thanh toán qua ví ZaloPay' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" id="email" name="email" required value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input type="text" id="fullName" name="fullName" required value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Nguyễn Văn A" />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mã giảm giá</h2>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <Tag className="size-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-mono font-bold text-green-700">{appliedCoupon.code}</span>
                    <span className="text-sm text-green-600 ml-2">
                      — Giảm {(appliedCoupon.discount * 1000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-500 hover:text-green-700 p-1">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Nhập mã giảm giá (VD: SALE50)"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Thử: SALE50 · NEWUSER · UXDESIGN20 · SUMMER30</p>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === opt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="sr-only"
                    />
                    <div className={`size-9 rounded-lg flex items-center justify-center ${
                      paymentMethod === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </div>
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === opt.id ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === opt.id && <div className="size-2.5 bg-blue-500 rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>

              {/* Card details */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Số thẻ</label>
                    <input type="text" id="cardNumber" name="cardNumber" required value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                      <input type="text" id="expiryDate" name="expiryDate" required value={formData.expiryDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input type="text" id="cvv" name="cvv" required value={formData.cvv}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="123" maxLength={3} />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Lock className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">Thông tin thanh toán được mã hóa SSL 256-bit. Chúng tôi không lưu thẻ của bạn.</p>
                  </div>
                  <button type="submit" disabled={isProcessing || !formData.email || !formData.fullName}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <><div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                    ) : (
                      <><Lock className="size-4" /> Thanh toán {(finalPrice * 1000).toLocaleString('vi-VN')}đ</>
                    )}
                  </button>
                </form>
              )}

              {/* MoMo / VNPay / ZaloPay */}
              {(paymentMethod === 'momo' || paymentMethod === 'vnpay' || paymentMethod === 'zalopay') && (
                <div className="mt-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <QrCode className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">
                          Thanh toán bằng mã QR
                        </p>
                        <p className="text-xs text-blue-600">
                          Sau khi nhấn nút, bạn sẽ nhận được mã QR để quét bằng ứng dụng{' '}
                          {paymentMethod === 'momo' ? 'MoMo' : paymentMethod === 'vnpay' ? 'VNPay' : 'ZaloPay'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleSubmit(e as any)}
                    disabled={isProcessing || !formData.email || !formData.fullName}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang tạo mã QR...
                      </>
                    ) : (
                      <>
                        <QrCode className="size-4" />
                        Thanh toán {(finalPrice * 1000).toLocaleString('vi-VN')}đ
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng của bạn</h2>

              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((course) => (
                  <div key={course.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <img src={course.image} alt={course.title}
                      className="w-16 h-11 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {(course.price * 1000).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tổng phụ:</span>
                  <span>{(totalPrice * 1000).toLocaleString('vi-VN')}đ</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Giảm giá ({appliedCoupon.code}):</span>
                    <span>-{(appliedCoupon.discount * 1000).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Thuế:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{(finalPrice * 1000).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-3">Quyền lợi của bạn:</p>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {['Truy cập trọn đời', 'Chứng chỉ hoàn thành', 'Cập nhật miễn phí', 'Hoàn tiền 30 ngày'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="size-4 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
