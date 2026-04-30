"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/app/providers";
import SystemConfigSectionCard from "@/components/admin/system-config/SystemConfigSectionCard";
import type { SystemConfig } from "@/components/admin/system-config/systemConfigTypes";

type Props = {
  config: SystemConfig;
  set: <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => void;
};

export default function SystemConfigGeneralSection({ config, set }: Props) {
  const { tx } = useI18n();
  return (
    <SystemConfigSectionCard title={tx("General information", "Thông tin chung")} icon={<Globe className="size-5" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Website name", "Tên website")}</label>
          <input value={config.siteName} onChange={(e) => set("siteName", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Primary color", "Màu chủ đạo")}</label>
          <div className="flex items-center gap-3">
            <input type="color" value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="size-9 cursor-pointer rounded border border-gray-200" />
            <input value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Short description", "Mô tả ngắn")}</label>
          <input value={config.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Logo URL", "URL logo")}</label>
          <input value={config.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Favicon URL", "URL favicon")}</label>
          <input value={config.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Footer tagline", "Khẩu hiệu chân trang")}</label>
          <input value={config.footerTagline} onChange={(e) => set("footerTagline", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Footer note", "Ghi chú chân trang")}</label>
          <textarea value={config.footerNote} onChange={(e) => set("footerNote", e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <button onClick={() => set("maintenanceMode", !config.maintenanceMode)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${config.maintenanceMode ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
            {config.maintenanceMode ? tx("Disable maintenance", "Tắt bảo trì") : tx("Enable maintenance", "Bật bảo trì")}
          </button>
        </div>
      </div>
    </SystemConfigSectionCard>
  );
}
