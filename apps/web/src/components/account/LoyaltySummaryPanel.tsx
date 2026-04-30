"use client";

import { Award } from "lucide-react";
import { useI18n } from "@/app/providers";
import { translateMembershipLevel } from "@/components/account/accountLoyaltyUtils";

export default function LoyaltySummaryPanel({
  points,
  level,
  progress,
  nextLevelLabel,
  remainingPoints,
}: {
  points: number;
  level: string;
  progress: number;
  nextLevelLabel?: string;
  remainingPoints?: number;
}) {
  const { tx, locale } = useI18n();

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-100">{tx("Current points", "Điểm hiện tại")}</p>
          <p className="text-4xl font-bold">{points.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/20">
            <Award className="size-8" />
          </div>
          <p className="mt-1 text-sm text-blue-100">⭐ {translateMembershipLevel(level, tx, locale)}</p>
        </div>
      </div>
      {nextLevelLabel ? (
        <>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-blue-100">
            {tx("Need", "Còn")} {remainingPoints?.toLocaleString()} {tx("more points to reach", "điểm nữa để đạt")} {translateMembershipLevel(nextLevelLabel, tx, locale)}
          </p>
        </>
      ) : null}
    </div>
  );
}
