"use client";

import { Gift, Zap } from "lucide-react";
import { useI18n } from "@/app/providers";

export type LoyaltyReward = {
  id: number;
  name: string;
  code: string;
  description: string;
  points: number;
  color: string;
};

export default function LoyaltyRewardsGrid({
  rewards,
  userPoints,
  onClaim,
}: {
  rewards: LoyaltyReward[];
  userPoints: number;
  onClaim: (reward: LoyaltyReward) => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rewards.map((reward) => {
        const canRedeem = userPoints >= reward.points;
        return (
          <div key={reward.id} className={`rounded-xl border-2 p-4 ${reward.color}`}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Gift className="size-4 text-blue-600" />
                  <p className="font-bold text-gray-900">{reward.name}</p>
                </div>
                <p className="text-xs text-gray-500">{reward.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                <Zap className="size-4" />
                {reward.points.toLocaleString()} {tx("points", "điểm")}
              </div>
              <button
                onClick={() => onClaim(reward)}
                disabled={!canRedeem}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  canRedeem ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-100 text-gray-400"
                }`}
              >
                {canRedeem ? tx("Redeem now", "Đổi ngay") : tx("Not enough points", "Chưa đủ điểm")}
              </button>
            </div>
            {!canRedeem ? (
              <div className="mt-2">
                <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min((userPoints / reward.points) * 100, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {userPoints.toLocaleString()}/{reward.points.toLocaleString()}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
