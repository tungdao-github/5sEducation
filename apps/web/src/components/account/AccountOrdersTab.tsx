"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, ShoppingBag, XCircle } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";
import { toast } from "@/lib/notify";
import { fetchCoursesByIds, fetchOrders, mapCourseCompare } from "@/services/api";
import AccountOrderCard, { type OrderView } from "@/components/account/AccountOrderCard";
import AccountRefundModal from "@/components/account/AccountRefundModal";

const statusIcons = {
  pending: <Clock className="size-4 text-yellow-500" />,
  processing: <AlertCircle className="size-4 text-blue-500" />,
  completed: <CheckCircle className="size-4 text-green-500" />,
  cancelled: <XCircle className="size-4 text-red-500" />,
};

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

function buildStatusConfig(tx: Translate) {
  return {
    pending: { label: tx("Pending", "Chờ xử lý"), color: "bg-yellow-100 text-yellow-700" },
    processing: { label: tx("Processing", "Đang xử lý"), color: "bg-blue-100 text-blue-700" },
    completed: { label: tx("Completed", "Hoàn thành"), color: "bg-green-100 text-green-700" },
    cancelled: { label: tx("Cancelled", "Đã hủy"), color: "bg-red-100 text-red-700" },
  } as const;
}

function toIntlLocale(locale: string) {
  if (locale === "vi") return "vi-VN";
  if (locale === "fr") return "fr-FR";
  if (locale === "es") return "es-ES";
  return "en-US";
}

function buildTrackingSteps(status: string, createdAt: string | undefined, tx: Translate, locale: string) {
  const localeDate = createdAt ? new Date(createdAt).toLocaleDateString(toIntlLocale(locale)) : "";
  return [
    { label: tx("Placed", "Đặt hàng"), done: true, date: localeDate },
    { label: tx("Confirmed", "Xác nhận"), done: status !== "pending", date: "" },
    { label: tx("Processing", "Xử lý"), done: status === "processing" || status === "completed", date: "" },
    { label: tx("Completed", "Hoàn thành"), done: status === "completed", date: "" },
  ];
}

export default function AccountOrdersTab() {
  const { locale, tx } = useI18n();
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(false);
  const [refundModal, setRefundModal] = useState<{ show: boolean; orderId: number | null }>({ show: false, orderId: null });
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const rawOrders = await fetchOrders();
        if (!active) return;
        const courseIds = Array.from(new Set(rawOrders.flatMap((order) => order.items.map((item) => item.courseId))));
        const courseDtos = courseIds.length ? await fetchCoursesByIds(courseIds) : [];
        if (!active) return;
        const courseMap = new Map(courseDtos.map((dto) => [dto.id, mapCourseCompare(dto, locale)]));

        const mapped: OrderView[] = rawOrders.map((order) => {
          const itemsView = order.items.map((item) => {
            const course = courseMap.get(item.courseId);
            return {
              id: item.id,
              title: item.courseTitle,
              instructor: course?.instructor ?? tx("Updating", "Đang cập nhật"),
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
            trackingSteps: buildTrackingSteps(order.status, order.createdAt, tx, locale),
          };
        });

        setOrders(mapped);
      } catch {
        if (active) setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [locale, tx]);

  const handleRefundRequest = () => {
    if (!refundReason.trim()) {
      toast.error(tx("Please enter a refund reason.", "Vui lòng nhập lý do hoàn tiền"));
      return;
    }
    toast.success(
      tx(
        `Refund request for order ${refundModal.orderId} has been submitted. We will review it in 3-5 business days.`,
        `Yêu cầu hoàn tiền cho đơn hàng ${refundModal.orderId} đã được gửi! Chúng tôi sẽ xem xét trong 3-5 ngày làm việc.`
      )
    );
    setRefundModal({ show: false, orderId: null });
    setRefundReason("");
  };

  const loadingState = useMemo(
    () => <div className="py-12 text-center text-gray-500">{tx("Loading orders...", "Đang tải đơn hàng...")}</div>,
    [tx]
  );

  const statusConfig = buildStatusConfig(tx);

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{tx("My orders", "Đơn hàng của tôi")}</h2>
      {loading ? (
        loadingState
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="mx-auto mb-3 size-12 text-gray-200" />
          <p className="text-sm text-gray-500">{tx("No orders yet", "Chưa có đơn hàng nào")}</p>
          <Link to="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            {tx("Browse courses", "Khám phá khóa học")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = statusConfig[order.status as keyof typeof statusConfig] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
            return (
              <AccountOrderCard
                key={order.id}
                order={order}
                statusLabel={sc.label}
                statusColor={sc.color}
                statusIcon={statusIcons[order.status as keyof typeof statusIcons]}
                onRequestRefund={(orderId) => setRefundModal({ show: true, orderId })}
              />
            );
          })}
        </div>
      )}

      {refundModal.show ? (
        <AccountRefundModal
          orderId={refundModal.orderId}
          reason={refundReason}
          onReasonChange={setRefundReason}
          onClose={() => {
            setRefundModal({ show: false, orderId: null });
            setRefundReason("");
          }}
          onSubmit={handleRefundRequest}
        />
      ) : null}
    </div>
  );
}
