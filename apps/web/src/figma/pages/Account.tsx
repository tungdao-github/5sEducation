
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "@/figma/compat/router";
import {
  User, ShoppingBag, Heart, Lock, Star, Edit3, Save, X,
  CheckCircle, Clock, AlertCircle, XCircle, BookOpen, LogOut,
  MapPin, Plus, Trash2, Gift, Award, Zap, RotateCcw, Shield,
  Copy, Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "@/figma/compat/sonner";
import {
  fetchOrders,
  fetchCoursesByIds,
  mapCourseCompare,
  formatPrice,
  fetchAddresses,
  createAddress,
  deleteAddress,
  type AddressDto,
} from "../data/api";
import { useLanguage } from "../contexts/LanguageContext";
import type { Course } from "../contexts/CartContext";
import { fetchJsonWithAuth } from "@/lib/api";

type Tab = "profile" | "orders" | "wishlist" | "password" | "addresses" | "loyalty";

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Silver: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  Gold: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  Platinum: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
};

const statusIcons = {
  pending: <Clock className="size-4 text-yellow-500" />,
  processing: <AlertCircle className="size-4 text-blue-500" />,
  completed: <CheckCircle className="size-4 text-green-500" />,
  cancelled: <XCircle className="size-4 text-red-500" />,
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

function buildTrackingSteps(status: string, createdAt?: string) {
  const baseDate = createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "";
  return [
    { label: "Đặt hàng", done: true, date: baseDate },
    { label: "Xác nhận", done: status !== "pending", date: "" },
    { label: "Xử lý", done: status === "processing" || status === "completed", date: "" },
    { label: "Hoàn thành", done: status === "completed", date: "" },
  ];
}

type OrderItemView = {
  id: number;
  title: string;
  instructor: string;
  image: string;
  price: number;
};

type OrderView = {
  id: number;
  status: string;
  createdAt: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  couponCode?: string | null;
  itemsView: OrderItemView[];
  trackingSteps: { label: string; done: boolean; date: string }[];
};

export default function Account() {
  const { user, isAuthenticated, updateUser, logout, openAuthModal } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();

  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "" });
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [refundModal, setRefundModal] = useState<{ show: boolean; orderId: number | null }>({ show: false, orderId: null });
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    if (!user) return;
    setEditForm({ name: user.name || "", phone: user.phone || "", bio: user.bio || "" });
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setOrders([]);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      setOrdersLoading(true);
      try {
        const rawOrders = await fetchOrders();
        if (!active) return;
        const courseIds = Array.from(new Set(rawOrders.flatMap((o) => o.items.map((i) => i.courseId))));
        const courseDtos = courseIds.length ? await fetchCoursesByIds(courseIds) : [];
        if (!active) return;
        const courseMap = new Map(courseDtos.map((dto) => [dto.id, mapCourseCompare(dto, language)]));

        const mapped: OrderView[] = rawOrders.map((order) => {
          const itemsView = order.items.map((item) => {
            const course = courseMap.get(item.courseId);
            return {
              id: item.id,
              title: item.courseTitle,
              instructor: course?.instructor ?? "Đang cập nhật",
              image: course?.image ?? "",
              price: item.unitPrice,
            };
          });
          return {
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            total: order.total,
            subtotal: order.subtotal,
            discountTotal: order.discountTotal,
            couponCode: order.couponCode ?? null,
            itemsView,
            trackingSteps: buildTrackingSteps(order.status, order.createdAt),
          };
        });

        setOrders(mapped);
      } catch {
        if (!active) return;
        setOrders([]);
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, language]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="size-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-gray-500 mb-5 text-sm">Vui lòng đăng nhập để xem tài khoản của bạn.</p>
          <button
            onClick={() => openAuthModal("login")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const userOrders = orders;
  const lc = levelColors[user.level] || levelColors.Bronze;

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      toast.error("Tên không được để trống");
      return;
    }
    updateUser({ name: editForm.name, phone: editForm.phone, bio: editForm.bio });
    setIsEditing(false);
    toast.success("Hồ sơ đã được cập nhật!");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPwd !== passwords.confirm) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    if (passwords.newPwd.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    try {
      await fetchJsonWithAuth("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPwd }),
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswords({ current: "", newPwd: "", confirm: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu");
    }
  };

  const handleRefundRequest = () => {
    if (!refundReason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }
    toast.success(
      `Yêu cầu hoàn tiền cho đơn hàng ${refundModal.orderId} đã được gửi! Chúng tôi sẽ xem xét trong 3-5 ngày làm việc.`
    );
    setRefundModal({ show: false, orderId: null });
    setRefundReason("");
  };

  const canRefund = (order: OrderView) => {
    if (order.status !== "completed") return false;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "profile", label: "Hồ sơ cá nhân", icon: <User className="size-4" /> },
    { id: "orders", label: "Đơn hàng", icon: <ShoppingBag className="size-4" />, badge: userOrders.length },
    { id: "wishlist", label: "Yêu thích", icon: <Heart className="size-4" />, badge: wishlistItems.length },
    { id: "addresses", label: "Địa chỉ", icon: <MapPin className="size-4" /> },
    { id: "loyalty", label: "Điểm thưởng", icon: <Award className="size-4" /> },
    { id: "password", label: "Đổi mật khẩu", icon: <Lock className="size-4" /> },
  ];

  return (
    <>
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
            <button
              onClick={() => {
                logout();
                toast.success("Đã đăng xuất!");
              }}
              className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
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
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Hồ sơ cá nhân</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit3 className="size-4" />Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          <X className="size-4" />Hủy
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          <Save className="size-4" />Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Họ và tên</label>
                      {isEditing ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                        <input
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 text-sm">{user.phone || "—"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Thành viên từ</label>
                      <p className="text-gray-900 text-sm">{new Date(user.joinDate).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Giới thiệu</label>
                      {isEditing ? (
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <p className="text-gray-700 text-sm">{user.bio || "—"}</p>
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
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Đơn hàng của tôi</h2>
                  {ordersLoading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải đơn hàng...</div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="size-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
                      <Link to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Khám phá khóa học</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => {
                        const sc = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 gap-3">
                              <div>
                                <p className="font-mono font-semibold text-gray-900 text-sm">{order.id}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusIcons[order.status as keyof typeof statusIcons]}
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              {order.itemsView.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-12 h-9 object-cover rounded" />
                                  ) : (
                                    <div className="w-12 h-9 bg-gray-200 rounded" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.instructor}</p>
                                  </div>
                                  <span className="text-sm font-bold text-blue-600 flex-shrink-0">{formatPrice(item.price)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-500">Thanh toán qua VND</div>
                                {order.couponCode && order.discountTotal > 0 ? (
                                  <div className="text-xs text-green-600">Mã giảm giá: {order.couponCode}</div>
                                ) : null}
                              </div>
                              <div className="text-right text-sm">
                                {order.discountTotal > 0 ? (
                                  <div className="text-xs text-gray-400 line-through">
                                    {formatPrice(order.subtotal)}
                                  </div>
                                ) : null}
                                <div className="font-bold text-gray-900">
                                  Tổng: <span className="text-blue-600">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Tracking steps */}
                            <div className="px-4 pb-4">
                              <div className="flex items-center gap-1">
                                {order.trackingSteps.map((step, i) => (
                                  <div key={i} className="flex items-center flex-1">
                                    <div className={`size-2.5 rounded-full flex-shrink-0 ${step.done ? "bg-green-500" : "bg-gray-200"}`} />
                                    {i < order.trackingSteps.length - 1 && (
                                      <div className={`h-0.5 flex-1 mx-0.5 ${step.done && order.trackingSteps[i + 1].done ? "bg-green-500" : "bg-gray-200"}`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <p className="text-xs text-gray-500">
                                  {order.trackingSteps.filter((s) => s.done).pop()?.label || "—"}{" "}
                                  {order.trackingSteps.filter((s) => s.done).pop()?.date
                                    ? `· ${order.trackingSteps.filter((s) => s.done).pop()?.date}`
                                    : ""}
                                </p>
                                {canRefund(order) && (
                                  <button
                                    onClick={() => setRefundModal({ show: true, orderId: order.id })}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                  >
                                    <RotateCcw className="size-3" />
                                    Yêu cầu hoàn tiền
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
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
                      {wishlistItems.map((course) => (
                        <div key={course.id} className="flex gap-4 items-center p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                          <Link to={`/course/${course.slug ?? course.id}`} className="flex-shrink-0">
                            <img src={course.image} alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/course/${course.slug ?? course.id}`}>
                              <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                            <p className="text-sm font-bold text-blue-600 mt-1">{formatPrice(course.price)}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link
                              to={`/course/${course.slug ?? course.id}`}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-center"
                            >
                              <BookOpen className="size-3.5 inline mr-1" />Xem
                            </Link>
                            <button
                              onClick={() => {
                                removeFromWishlist(course.id);
                                toast("Đã xóa khỏi yêu thích", { icon: "💔" });
                              }}
                              className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && <AddressesTab />}

              {/* Loyalty Tab */}
              {activeTab === "loyalty" && <LoyaltyTab user={user} />}

              {/* Password Tab */}
              {activeTab === "password" && (
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Đổi mật khẩu</h2>
                  <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
                    {[
                      { id: "current", label: "Mật khẩu hiện tại", key: "current" },
                      { id: "newPwd", label: "Mật khẩu mới", key: "newPwd" },
                      { id: "confirm", label: "Xác nhận mật khẩu mới", key: "confirm" },
                    ].map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="password"
                          value={passwords[field.key as keyof typeof passwords]}
                          onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      Cập nhật mật khẩu
                    </button>
                    <p className="text-xs text-gray-400">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </form>
                  <div className="border-t border-gray-200 pt-8">
                    <TwoFactorSettings />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>

      {refundModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-6 text-white">
              <button
                onClick={() => {
                  setRefundModal({ show: false, orderId: null });
                  setRefundReason("");
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="size-5" />
              </button>
              <div className="size-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="size-7" />
              </div>
              <h2 className="text-xl font-bold text-center">Yêu cầu hoàn tiền</h2>
              <p className="text-red-100 text-sm mt-1 text-center">Đơn hàng: {refundModal.orderId}</p>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Chính sách hoàn tiền</p>
                      <ul className="text-xs text-amber-700 space-y-1">
                        <li>• Áp dụng trong vòng 30 ngày kể từ ngày mua</li>
                        <li>• Chưa hoàn thành quá 30% khóa học</li>
                        <li>• Xét duyệt trong 3-5 ngày làm việc</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do yêu cầu hoàn tiền *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={4}
                  placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hoàn tiền..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRefundModal({ show: false, orderId: null });
                    setRefundReason("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRefundRequest}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Addresses Tab Component
function AddressesTab() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "", city: "" });

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      await createAddress({
        recipientName: newAddress.name,
        phone: newAddress.phone,
        line1: newAddress.address,
        city: newAddress.city,
        country: "Vietnam",
        isDefault: addresses.length === 0,
      });
      setNewAddress({ name: "", phone: "", address: "", city: "" });
      setIsAdding(false);
      await loadAddresses();
      toast.success("Địa chỉ mới đã được thêm!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm địa chỉ");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      await loadAddresses();
      toast.success("Địa chỉ đã được xóa!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa địa chỉ");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Địa chỉ của tôi</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải địa chỉ...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="size-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chưa có địa chỉ nào</p>
          <button onClick={() => setIsAdding(true)} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Thêm địa chỉ mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3 gap-3">
                <div>
                  <p className="font-mono font-semibold text-gray-900 text-sm">{addr.recipientName}</p>
                  <p className="text-xs text-gray-500">{addr.phone}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-600 text-sm">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-800 truncate">{addr.line1}, {addr.city}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setIsAdding(true)} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Thêm địa chỉ mới
          </button>
        </div>
      )}
      {isAdding && (
        <div className="mt-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Thêm địa chỉ mới</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Họ và tên</label>
              <input
                value={newAddress.name}
                onChange={(e) => setNewAddress((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
              <input
                value={newAddress.phone}
                onChange={(e) => setNewAddress((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ</label>
              <textarea
                value={newAddress.address}
                onChange={(e) => setNewAddress((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Thành phố</label>
              <input
                value={newAddress.city}
                onChange={(e) => setNewAddress((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddAddress}
            className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Thêm địa chỉ
          </button>
        </div>
      )}
    </div>
  );
}

// Loyalty Tab Component
function LoyaltyTab({ user }: { user: any }) {
  const { updateUser } = useAuth();
  const rewards = [
    { id: 1, name: "Giảm 50K₫", code: "LOYALTY50", description: "Áp dụng cho đơn từ 200K₫", points: 500, color: "border-blue-200 bg-blue-50" },
    { id: 2, name: "Giảm 100K₫", code: "LOYALTY100", description: "Áp dụng cho đơn từ 400K₫", points: 1000, color: "border-purple-200 bg-purple-50" },
    { id: 3, name: "Giảm 20%", code: "VIP20", description: "Giảm 20% không giới hạn", points: 2000, color: "border-green-200 bg-green-50" },
    { id: 4, name: "Khóa học miễn phí", code: "FREECOURSE", description: "Nhận 1 khóa học dưới 199K₫", points: 5000, color: "border-yellow-200 bg-yellow-50" },
  ];

  const levelThresholds: Record<string, number> = { Bronze: 0, Silver: 1000, Gold: 3000, Platinum: 8000 };
  const levels = Object.entries(levelThresholds);

  const handleClaimReward = (reward: typeof rewards[0]) => {
    if (user.points < reward.points) {
      toast.error(`Cần thêm ${(reward.points - user.points).toLocaleString()} điểm`);
      return;
    }
    updateUser({ points: user.points - reward.points });
    toast.success(`🎉 Đã nhận phần thưởng "${reward.name}"! Mã: ${reward.code}`, { duration: 5000 });
  };

  const nextLevel = levels.find(([, v]) => v > user.points);
  const currentLevelPoints = levelThresholds[user.level] || 0;
  const nextLevelPoints = nextLevel ? nextLevel[1] : Infinity;
  const progress = nextLevel
    ? ((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    : 100;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Điểm thưởng & Ưu đãi</h2>

      {/* Points Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Điểm hiện tại</p>
            <p className="text-4xl font-bold">{user.points.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="size-14 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="size-8" />
            </div>
            <p className="text-sm mt-1 text-blue-100">⭐ {user.level}</p>
          </div>
        </div>
        {nextLevel && (
          <>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-blue-100">
              Còn {(nextLevelPoints - user.points).toLocaleString()} điểm để đạt {nextLevel[0]}
            </p>
          </>
        )}
      </div>

      {/* Level Progression */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Hạng thành viên</h3>
        <div className="flex items-center justify-between">
          {levels.map(([level, points], i) => (
            <div key={level} className="flex-1 flex flex-col items-center">
              <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 border-2 ${
                user.level === level ? "border-blue-500 bg-blue-100 text-blue-700" :
                user.points >= points ? "border-green-500 bg-green-100 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"
              }`}>
                {level === "Bronze" ? "🥉" : level === "Silver" ? "🥈" : level === "Gold" ? "🥇" : "💎"}
              </div>
              <p className={`text-xs font-medium ${user.level === level ? "text-blue-600" : "text-gray-500"}`}>{level}</p>
              <p className="text-xs text-gray-400">{points.toLocaleString()}đ</p>
              {i < levels.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-100" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <h3 className="font-semibold text-gray-900 mb-4">Đổi điểm lấy ưu đãi</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const canRedeem = user.points >= reward.points;
          return (
            <div key={reward.id} className={`border-2 ${reward.color} rounded-xl p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="size-4 text-blue-600" />
                    <p className="font-bold text-gray-900">{reward.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{reward.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                  <Zap className="size-4" />
                  {reward.points.toLocaleString()} điểm
                </div>
                <button
                  onClick={() => handleClaimReward(reward)}
                  disabled={!canRedeem}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    canRedeem
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canRedeem ? "Đổi ngay" : "Chưa đủ điểm"}
                </button>
              </div>
              {!canRedeem && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min((user.points / reward.points) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{user.points.toLocaleString()}/{reward.points.toLocaleString()}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How to earn points */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Cách tích điểm</h4>
        <div className="space-y-2">
          {[
            { action: "Mua khóa học", points: "+10 điểm / 1000₫" },
            { action: "Viết đánh giá khóa học", points: "+50 điểm" },
            { action: "Hoàn thành khóa học", points: "+200 điểm" },
            { action: "Giới thiệu bạn bè", points: "+500 điểm / người" },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">• {item.action}</span>
              <span className="font-medium text-green-600">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Two Factor Authentication Component
function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [step, setStep] = useState<"idle" | "setup">("idle");
  const [secret, setSecret] = useState("EDUCOURSE-2FA-SECRET");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    try {
      setSecret(`EDUCOURSE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setStep("setup");
      toast.info("Quét mã QR bằng ứng dụng xác thực của bạn");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerifyAndEnable = () => {
    if (verifyCode === "123456") {
      setEnabled(true);
      setStep("idle");
      setVerifyCode("");
      toast.success("Đã bật xác thực hai yếu tố!");
    } else {
      toast.error("Mã xác thực không đúng");
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    setIsDisabling(true);
    try {
      if (disableCode !== "123456") {
        toast.error("Mã xác thực không đúng");
        return;
      }
      setEnabled(false);
      setDisableCode("");
      toast.success("Đã tắt xác thực hai yếu tố!");
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Đã sao chép mã bí mật!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            Xác thực hai yếu tố (2FA)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Tăng cường bảo mật cho tài khoản của bạn</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          enabled
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}>
          {enabled ? "Đã bật" : "Chưa bật"}
        </div>
      </div>

      {!enabled && step === "idle" && (
        <div className="max-w-sm">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">Tại sao nên bật 2FA?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Bảo vệ tài khoản khỏi truy cập trái phép</li>
              <li>• Thêm lớp bảo mật ngoài mật khẩu</li>
              <li>• An toàn hơn với mã xác thực động</li>
            </ul>
          </div>
          <button
            onClick={handleEnable2FA}
            disabled={isEnabling}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isEnabling ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang thiết lập...
              </>
            ) : (
              <>
                <Shield className="size-4" />
                Bật xác thực hai yếu tố
              </>
            )}
          </button>
        </div>
      )}

      {step === "setup" && !enabled && (
        <div className="max-w-md">
          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Bước 1: Quét mã QR</h3>
            <div className="bg-white p-4 border border-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-center">
                <div className="size-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-xs text-gray-400 text-center px-4">
                    QR Code
                    <br />
                    <span className="text-[10px]">otpauth://totp/EduCourse:...</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Quét mã này bằng ứng dụng như Google Authenticator, Authy</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Hoặc nhập mã thủ công:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded text-xs font-mono">
                  {secret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sao chép"
                >
                  {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Bước 2: Xác thực mã</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Demo code: 123456</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep("idle");
                    setVerifyCode("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={verifyCode.length !== 6}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">Lưu ý quan trọng</p>
                <p className="mt-1">Hãy lưu mã bí mật ở nơi an toàn. Bạn sẽ cần nó nếu muốn khôi phục 2FA trên thiết bị mới.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {enabled && step === "idle" && (
        <div className="max-w-sm">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 text-sm mb-1">2FA đã được kích hoạt</h3>
                <p className="text-xs text-green-700">Tài khoản của bạn được bảo vệ bởi xác thực hai yếu tố</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập mã xác thực để tắt 2FA
              </label>
              <input
                type="text"
                placeholder="Mã 6 chữ số"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-[0.5em] font-mono"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Demo code: 123456</p>
            </div>
            <button
              onClick={handleDisable2FA}
              disabled={isDisabling || disableCode.length !== 6}
              className="w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isDisabling ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="size-4" />
                  Tắt xác thực hai yếu tố
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

