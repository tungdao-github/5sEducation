"use client";

import { useI18n } from "@/app/providers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/notify";
import LoyaltyRewardsGrid, { type LoyaltyReward } from "@/components/account/LoyaltyRewardsGrid";
import LoyaltySummaryPanel from "@/components/account/LoyaltySummaryPanel";
import LoyaltyTiersPanel from "@/components/account/LoyaltyTiersPanel";
import LoyaltyWaysToEarn from "@/components/account/LoyaltyWaysToEarn";
import { translateMembershipLevel } from "@/components/account/accountLoyaltyUtils";

export default function AccountLoyaltyTab() {
  const { tx, locale } = useI18n();
  const { user, updateUser } = useAuth();
  if (!user) return null;

  const rewards: LoyaltyReward[] = [
    { id: 1, name: tx("50K discount", "Giảm 50K₫"), code: "LOYALTY50", description: tx("Use for orders from 200K₫", "Áp dụng cho đơn từ 200K₫"), points: 500, color: "border-blue-200 bg-blue-50" },
    { id: 2, name: tx("100K discount", "Giảm 100K₫"), code: "LOYALTY100", description: tx("Use for orders from 400K₫", "Áp dụng cho đơn từ 400K₫"), points: 1000, color: "border-purple-200 bg-purple-50" },
    { id: 3, name: tx("20% off", "Giảm 20%"), code: "VIP20", description: tx("Get 20% off without limits", "Giảm 20% không giới hạn"), points: 2000, color: "border-green-200 bg-green-50" },
    { id: 4, name: tx("Free course", "Khóa học miễn phí"), code: "FREECOURSE", description: tx("Redeem a course under 199K₫", "Nhận 1 khóa học dưới 199K₫"), points: 5000, color: "border-yellow-200 bg-yellow-50" },
  ];
  const levelThresholds: Record<string, number> = { Bronze: 0, Silver: 1000, Gold: 3000, Platinum: 8000 };
  const levels = Object.entries(levelThresholds) as [string, number][];

  const handleClaimReward = (reward: LoyaltyReward) => {
    if (user.points < reward.points) {
      toast.error(tx(`Need ${reward.points - user.points} more points`, `Cần thêm ${(reward.points - user.points).toLocaleString()} điểm`));
      return;
    }
    updateUser({ points: user.points - reward.points });
    toast.success(tx(`Reward "${reward.name}" claimed. Code: ${reward.code}`, `🎉 Đã nhận phần thưởng "${reward.name}"! Mã: ${reward.code}`), { duration: 5000 });
  };

  const nextLevel = levels.find(([, value]) => value > user.points);
  const currentLevelPoints = levelThresholds[user.level] || 0;
  const nextLevelPoints = nextLevel ? nextLevel[1] : Infinity;
  const progress = nextLevel ? ((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100 : 100;
  const nextLevelLabel = nextLevel ? translateMembershipLevel(nextLevel[0], tx, locale) : undefined;

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{tx("Rewards & perks", "Điểm thưởng & Ưu đãi")}</h2>

      <LoyaltySummaryPanel
        points={user.points}
        level={user.level}
        progress={progress}
        nextLevelLabel={nextLevelLabel}
        remainingPoints={nextLevel ? nextLevelPoints - user.points : undefined}
      />

      <LoyaltyTiersPanel levels={levels} userLevel={user.level} userPoints={user.points} />

      <h3 className="mb-4 font-semibold text-gray-900">{tx("Redeem rewards", "Đổi điểm lấy ưu đãi")}</h3>
      <LoyaltyRewardsGrid rewards={rewards} userPoints={user.points} onClaim={handleClaimReward} />

      <LoyaltyWaysToEarn />
    </div>
  );
}
