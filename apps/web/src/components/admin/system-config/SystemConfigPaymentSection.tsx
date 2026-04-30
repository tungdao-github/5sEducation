"use client";

import { CreditCard } from "lucide-react";
import { useI18n } from "@/app/providers";
import SystemConfigSectionCard from "@/components/admin/system-config/SystemConfigSectionCard";
import type { SystemConfig } from "@/components/admin/system-config/systemConfigTypes";

type Props = {
  config: SystemConfig;
  set: <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => void;
};

export default function SystemConfigPaymentSection({ config, set }: Props) {
  const { tx } = useI18n();
  const gateways = [
    { key: "enableVNPay", label: "VNPay", desc: tx("Pay with VNPay wallet and bank card", "Thanh toán qua ví VNPay và thẻ ngân hàng") },
    { key: "enableZaloPay", label: "ZaloPay", desc: tx("Pay with ZaloPay wallet", "Thanh toán qua ví ZaloPay") },
    { key: "enableCard", label: tx("Credit/Debit card", "Thẻ tín dụng/Ghi nợ"), desc: "Visa, Mastercard, JCB" },
  ] as const;

  return (
    <SystemConfigSectionCard title={tx("Payment gateways", "Cổng thanh toán")} icon={<CreditCard className="size-5" />}>
      <div className="space-y-4">
        {gateways.map((gateway) => {
          const enabled = config[gateway.key];
          return (
            <div key={gateway.key} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-900">{gateway.label}</p>
                <p className="text-xs text-gray-500">{gateway.desc}</p>
              </div>
              <button
                onClick={() => set(gateway.key, !enabled as never)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {enabled ? tx("On", "Bật") : tx("Off", "Tắt")}
              </button>
            </div>
          );
        })}
      </div>
    </SystemConfigSectionCard>
  );
}
