"use client";

import { Palette } from "lucide-react";
import { useI18n } from "@/app/providers";
import SystemConfigSectionCard from "@/components/admin/system-config/SystemConfigSectionCard";
import type { SystemConfig } from "@/components/admin/system-config/systemConfigTypes";

type Props = {
  config: SystemConfig;
  set: <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => void;
};

export default function SystemConfigLoyaltySection({ config, set }: Props) {
  const { tx } = useI18n();
  return (
    <SystemConfigSectionCard title={tx("Loyalty", "Loyalty")} icon={<Palette className="size-5" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Reward points / unit", "Điểm thưởng / đơn vị")}</label>
          <input
            type="number"
            value={Number.isFinite(config.pointsPerUnit) ? config.pointsPerUnit : ""}
            onChange={(e) => {
              const nextValue = e.target.value;
              set("pointsPerUnit", nextValue === "" ? 0 : Number(nextValue));
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </SystemConfigSectionCard>
  );
}
