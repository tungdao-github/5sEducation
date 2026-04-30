"use client";

import { useI18n } from "@/app/providers";

export default function LoyaltyWaysToEarn() {
  const { tx } = useI18n();
  const items = [
    { action: tx("Buy a course", "Mua khóa học"), points: tx("+10 points / 1000đ", "+10 điểm / 1000đ") },
    { action: tx("Write a course review", "Viết đánh giá khóa học"), points: tx("+50 points", "+50 điểm") },
    { action: tx("Complete a course", "Hoàn thành khóa học"), points: tx("+200 points", "+200 điểm") },
    { action: tx("Refer a friend", "Giới thiệu bạn bè"), points: tx("+500 points / user", "+500 điểm / người") },
  ];

  return (
    <div className="mt-6 rounded-xl bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-900">{tx("How to earn points", "Cách tích điểm")}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.action} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">• {item.action}</span>
            <span className="font-medium text-green-600">{item.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
