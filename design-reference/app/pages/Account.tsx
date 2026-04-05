import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  User, ShoppingBag, Heart, Lock, Star, Edit3, Save, X,
  CheckCircle, Clock, AlertCircle, XCircle, BookOpen, LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { mockOrders, statusConfig } from '../data/orders';
import { toast } from 'sonner';

type Tab = 'profile' | 'orders' | 'wishlist' | 'password';

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  Gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Platinum: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

const statusIcons = {
  pending: <Clock className="size-4 text-yellow-500" />,
  processing: <AlertCircle className="size-4 text-blue-500" />,
  completed: <CheckCircle className="size-4 text-green-500" />,
  cancelled: <XCircle className="size-4 text-red-500" />,
};

export default function Account() {
  const { user, isAuthenticated, updateUser, logout, openAuthModal } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [searchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as Tab) || 'profile';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="size-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-gray-500 mb-5 text-sm">Vui lòng đăng nhập để xem tài khoản của bạn.</p>
          <button onClick={() => openAuthModal('login')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const userOrders = mockOrders.filter(o => o.userId === user.id);
  const lc = levelColors[user.level] || levelColors.Bronze;

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) { toast.error('Tên không được để trống'); return; }
    updateUser({ name: editForm.name, phone: editForm.phone, bio: editForm.bio });
    setIsEditing(false);
    toast.success('Hồ sơ đã được cập nhật!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPwd !== passwords.confirm) { toast.error('Mật khẩu mới không khớp'); return; }
    if (passwords.newPwd.length < 6) { toast.error('Mật khẩu phải ít nhất 6 ký tự'); return; }
    toast.success('Đổi mật khẩu thành công!');
    setPasswords({ current: '', newPwd: '', confirm: '' });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User className="size-4" /> },
    { id: 'orders', label: 'Đơn hàng', icon: <ShoppingBag className="size-4" />, badge: userOrders.length },
    { id: 'wishlist', label: 'Yêu thích', icon: <Heart className="size-4" />, badge: wishlistItems.length },
    { id: 'password', label: 'Đổi mật khẩu', icon: <Lock className="size-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-5">
            <div className="size-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{user.name}</h1>
              <p className="text-blue-100 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${lc.bg} ${lc.text} ${lc.border} border`}>
                  ⭐ {user.level}
                </span>
                <span className="text-xs text-blue-200 flex items-center gap-1">
                  <Star className="size-3 fill-yellow-300 text-yellow-300" />
                  {user.points.toLocaleString()} điểm thưởng
                </span>
              </div>
            </div>
            <button onClick={() => { logout(); toast.success('Đã đăng xuất!'); }}
              className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}>
                  <div className="flex items-center gap-3">{tab.icon}{tab.label}</div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Hồ sơ cá nhân</h2>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit3 className="size-4" />Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                          <X className="size-4" />Hủy
                        </button>
                        <button onClick={handleSaveProfile}
                          className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                          <Save className="size-4" />Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Họ và tên</label>
                      {isEditing ? (
                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{user.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900 text-sm">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
                      {isEditing ? (
                        <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <p className="text-gray-900 text-sm">{user.phone || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Thành viên từ</label>
                      <p className="text-gray-900 text-sm">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Giới thiệu</label>
                      {isEditing ? (
                        <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      ) : (
                        <p className="text-gray-700 text-sm">{user.bio || '—'}</p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Điểm thưởng của bạn</p>
                        <p className="text-xs text-blue-600 mt-0.5">Tích điểm để nhận ưu đãi đặc biệt</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-blue-500">điểm</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((user.points / 2000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-1">{Math.max(0, 2000 - user.points)} điểm nữa để đạt Gold</p>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Đơn hàng của tôi</h2>
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="size-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
                      <Link to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Khám phá khóa học</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map(order => {
                        const sc = statusConfig[order.status];
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 gap-3">
                              <div>
                                <p className="font-mono font-semibold text-gray-900 text-sm">{order.id}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusIcons[order.status]}
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <img src={item.image} alt={item.title} className="w-12 h-9 object-cover rounded" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.instructor}</p>
                                  </div>
                                  <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                                    {(item.price * 1000).toLocaleString('vi-VN')}đ
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                {order.couponCode && <span className="text-green-600 font-medium">Mã: {order.couponCode} · </span>}
                                Thanh toán qua {order.paymentMethod}
                              </div>
                              <div className="font-bold text-gray-900 text-sm">
                                Tổng: <span className="text-blue-600">{(order.total * 1000).toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>
                            {/* Tracking steps */}
                            <div className="px-4 pb-4">
                              <div className="flex items-center gap-1">
                                {order.trackingSteps.map((step, i) => (
                                  <div key={i} className="flex items-center flex-1">
                                    <div className={`size-2.5 rounded-full flex-shrink-0 ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    {i < order.trackingSteps.length - 1 && (
                                      <div className={`h-0.5 flex-1 mx-0.5 ${step.done && order.trackingSteps[i + 1].done ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1.5">
                                {order.trackingSteps.filter(s => s.done).pop()?.label} · {order.trackingSteps.filter(s => s.done).pop()?.date}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Khóa học yêu thích</h2>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="size-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có khóa học yêu thích</p>
                      <Link to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Khám phá ngay</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlistItems.map(course => (
                        <div key={course.id} className="flex gap-4 items-center p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                          <Link to={`/course/${course.id}`} className="flex-shrink-0">
                            <img src={course.image} alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/course/${course.id}`}>
                              <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                            <p className="text-sm font-bold text-blue-600 mt-1">{(course.price * 1000).toLocaleString('vi-VN')}đ</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link to={`/course/${course.id}`}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-center">
                              <BookOpen className="size-3.5 inline mr-1" />Xem
                            </Link>
                            <button onClick={() => { removeFromWishlist(course.id); toast('Đã xóa khỏi yêu thích', { icon: '💔' }); }}
                              className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Đổi mật khẩu</h2>
                  <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
                    {[
                      { id: 'current', label: 'Mật khẩu hiện tại', key: 'current' },
                      { id: 'newPwd', label: 'Mật khẩu mới', key: 'newPwd' },
                      { id: 'confirm', label: 'Xác nhận mật khẩu mới', key: 'confirm' },
                    ].map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="password"
                          value={passwords[field.key as keyof typeof passwords]}
                          onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                      </div>
                    ))}
                    <button type="submit"
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
                      Cập nhật mật khẩu
                    </button>
                    <p className="text-xs text-gray-400">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
