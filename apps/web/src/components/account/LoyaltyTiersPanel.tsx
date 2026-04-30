"use client";

import { useI18n } from "@/app/providers";
import { translateMembershipLevel } from "@/components/account/accountLoyaltyUtils";

export default function LoyaltyTiersPanel({
  levels,
  userLevel,
  userPoints,
}: {
  levels: [string, number][];
  userLevel: string;
  userPoints: number;
}) {
  const { tx, locale } = useI18n();

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{tx("Membership tiers", "Hạng thành viên")}</h3>
      <div className="flex items-center justify-between">
        {levels.map(([level, points], i) => (
          <div key={level} className="relative flex flex-1 flex-col items-center">
            <div
              className={`mb-2 flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                userLevel === level
                  ? "border-blue-500 bg-blue-100 text-blue-700"
                  : userPoints >= points
                    ? "border-green-500 bg-green-100 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              {level === "Bronze" ? "🥉" : level === "Silver" ? "🥈" : level === "Gold" ? "🥇" : "💎"}
            </div>
            <p className={`text-xs font-medium ${userLevel === level ? "text-blue-600" : "text-gray-500"}`}>{translateMembershipLevel(level, tx, locale)}</p>
            <p className="text-xs text-gray-400">{points.toLocaleString()}đ</p>
            {i < levels.length - 1 ? <div className="absolute left-1/2 top-5 h-0.5 w-full bg-gray-100" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
