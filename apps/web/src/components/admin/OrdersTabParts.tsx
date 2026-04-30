"use client";

import { Calendar, ChevronDown, ChevronUp, Download, Mail, Package, Search } from "lucide-react";
import { useI18n } from "@/app/providers";
import { formatPrice, type AdminOrderDto } from "@/services/api";
import { buildOrderStatusConfig, formatOrderStatus } from "@/components/admin/adminDashboardUtils";
import { toIntlLocale } from "@/components/admin/adminLocale";

export function OrdersToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onExport,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onExport: () => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={tx("Search orders (ID, name, email)...", "Tìm đơn hàng (mã, tên, email)...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{tx("All statuses", "Tất cả trạng thái")}</option>
        <option value="pending">{tx("Pending", "Chờ xử lý")}</option>
        <option value="processing">{tx("Processing", "Đang xử lý")}</option>
        <option value="completed">{tx("Completed", "Hoàn thành")}</option>
        <option value="cancelled">{tx("Cancelled", "Đã hủy")}</option>
      </select>
      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
      >
        <Download className="size-4" /> {tx("Export CSV", "Export CSV")}
      </button>
    </div>
  );
}

export function OrdersStatusCards({
  orders,
  statusFilter,
  setStatusFilter,
}: {
  orders: AdminOrderDto[];
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  const { tx } = useI18n();
  const statusConfig = buildOrderStatusConfig(tx);
  const statusOptions = ["pending", "processing", "completed", "cancelled"];
  return (
    <div className="mb-5 grid grid-cols-4 gap-3">
      {statusOptions.map((status) => {
        const config = statusConfig[status as keyof typeof statusConfig] ?? formatOrderStatus(status, tx);
        return (
          <div
            key={status}
            className={`cursor-pointer rounded-lg border-2 p-3 text-center transition ${
              statusFilter === status ? "border-blue-400" : "border-transparent"
            } ${config.className}`}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
          >
            <p className="font-bold">{orders.filter((order) => order.status === status).length}</p>
            <p className="mt-0.5 text-xs">{config.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function OrdersItem({
  order,
  expanded,
  onToggle,
  onChangeStatus,
}: {
  order: AdminOrderDto;
  expanded: boolean;
  onToggle: () => void;
  onChangeStatus: (id: number, status: string) => Promise<void>;
}) {
  const { tx, locale } = useI18n();
  const status = formatOrderStatus(order.status, tx);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex cursor-pointer items-center gap-4 p-4 transition hover:bg-gray-50" onClick={onToggle}>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-bold text-gray-900">#{order.id}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Mail className="size-3" />
              {order.userEmail}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(order.createdAt).toLocaleDateString(toIntlLocale(locale))}
            </span>
            <span className="font-semibold text-blue-600">{formatPrice(order.total)}</span>
            <span>{order.items.length} {tx("courses", "khóa học")}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
      </div>

      {expanded ? (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="mb-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{item.courseTitle}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-blue-600">{formatPrice(item.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 text-sm text-gray-600">
              <p>{tx("Online payment", "💳 Thanh toán online")} {order.couponCode && `· ${tx("Code", "Mã")}: ${order.couponCode}`}</p>
              {order.discountTotal > 0 ? <p className="text-green-600">-{formatPrice(order.discountTotal)} {tx("discount", "giảm giá")}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <select
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={order.status}
                onChange={(event) => void onChangeStatus(order.id, event.target.value)}
              >
                <option value="pending">{tx("Pending", "Chờ xử lý")}</option>
                <option value="processing">{tx("Processing", "Đang xử lý")}</option>
                <option value="completed">{tx("Completed", "Hoàn thành")}</option>
                <option value="cancelled">{tx("Cancelled", "Đã hủy")}</option>
              </select>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OrdersList({
  orders,
  expandedOrder,
  setExpandedOrder,
  onChangeStatus,
}: {
  orders: AdminOrderDto[];
  expandedOrder: number | null;
  setExpandedOrder: (value: number | null) => void;
  onChangeStatus: (id: number, status: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrdersItem
          key={order.id}
          order={order}
          expanded={expandedOrder === order.id}
          onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </div>
  );
}

export function OrdersEmptyState() {
  const { tx } = useI18n();
  return (
    <div className="py-12 text-center text-gray-400">
      <Package className="mx-auto mb-3 size-12 opacity-30" />
      <p>{tx("No orders found.", "Không tìm thấy đơn hàng nào")}</p>
    </div>
  );
}
