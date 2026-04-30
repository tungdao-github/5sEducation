"use client";

import { ArrowLeft, Package, Search } from "lucide-react";
import { Link } from "@/lib/router";
import { useI18n } from "@/app/providers";

type Props = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onTrack: () => void;
};

export default function OrderTrackingHero({ searchInput, onSearchInputChange, onTrack }: Props) {
  const { tx } = useI18n();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-200 transition hover:text-white">
          <ArrowLeft className="size-4" />
          {tx("Back to home", "Về trang chủ")}
        </Link>
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
          <Package className="size-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">{tx("Track your order", "Theo dõi đơn hàng")}</h1>
        <p className="mb-8 text-blue-100">{tx("Enter your order code to see detailed status", "Nhập mã đơn hàng để xem trạng thái chi tiết")}</p>

        <div className="mx-auto flex max-w-xl gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onTrack()}
              placeholder={tx("Enter order code (e.g. 123)", "Nhập mã đơn hàng (VD: 123)")}
              className="w-full rounded-xl py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button onClick={onTrack} className="whitespace-nowrap rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
            {tx("Track", "Tra cứu")}
          </button>
        </div>
      </div>
    </div>
  );
}
