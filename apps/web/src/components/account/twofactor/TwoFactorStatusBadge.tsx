"use client";

import { useI18n } from "@/app/providers";

type Props = {
  enabled: boolean;
};

export default function TwoFactorStatusBadge({ enabled }: Props) {
  const { tx } = useI18n();

  return (
    <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${enabled ? "border-green-200 bg-green-100 text-green-700" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
      {enabled ? tx("Enabled", "Đã bật") : tx("Disabled", "Chưa bật")}
    </div>
  );
}
