"use client";

import { useI18n } from "@/app/providers";

type Props = {
  active: number;
  used: number;
  expired: number;
};

export default function CouponStatsCards({ active, used, expired }: Props) {
  const { tx } = useI18n();
  return (
    <div className="grid flex-1 grid-cols-3 gap-3">
      <div className="rounded-lg bg-green-50 p-3 text-center">
        <p className="text-2xl font-bold text-green-700">{active}</p>
        <p className="text-xs text-gray-500">{tx("Active", "Đang hoạt động")}</p>
      </div>
      <div className="rounded-lg bg-blue-50 p-3 text-center">
        <p className="text-2xl font-bold text-blue-700">{used}</p>
        <p className="text-xs text-gray-500">{tx("Uses", "Lượt sử dụng")}</p>
      </div>
      <div className="rounded-lg bg-orange-50 p-3 text-center">
        <p className="text-2xl font-bold text-orange-700">{expired}</p>
        <p className="text-xs text-gray-500">{tx("Expired", "Hết hạn")}</p>
      </div>
    </div>
  );
}
