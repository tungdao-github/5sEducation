"use client";

import { useMemo, useState } from "react";
import type { AdminOrderDto } from "@/services/api";
import {
  OrdersEmptyState,
  OrdersList,
  OrdersStatusCards,
  OrdersToolbar,
} from "@/components/admin/OrdersTabParts";

type OrdersTabProps = {
  orders: AdminOrderDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onExport: () => void;
  onChangeStatus: (id: number, status: string) => Promise<void>;
};

export default function OrdersTab({ orders, searchQuery, setSearchQuery, onExport, onChangeStatus }: OrdersTabProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const visible = useMemo(() => {
    return orders
      .filter((order) => `${order.id} ${order.userEmail} ${order.userName}`.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((order) => (statusFilter === "all" ? true : order.status === statusFilter));
  }, [orders, searchQuery, statusFilter]);

  return (
    <div>
      <OrdersToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExport={onExport}
      />
      <OrdersStatusCards orders={orders} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {visible.length > 0 ? (
        <OrdersList
          orders={visible}
          expandedOrder={expandedOrder}
          setExpandedOrder={setExpandedOrder}
          onChangeStatus={onChangeStatus}
        />
      ) : (
        <OrdersEmptyState />
      )}
    </div>
  );
}
