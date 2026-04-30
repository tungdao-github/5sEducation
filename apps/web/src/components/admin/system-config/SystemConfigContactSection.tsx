"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/app/providers";
import SystemConfigSectionCard from "@/components/admin/system-config/SystemConfigSectionCard";
import type { SystemConfig } from "@/components/admin/system-config/systemConfigTypes";

type Props = {
  config: SystemConfig;
  set: <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => void;
};

export default function SystemConfigContactSection({ config, set }: Props) {
  const { tx } = useI18n();
  return (
    <SystemConfigSectionCard title={tx("Contact information", "Thông tin liên hệ")} icon={<Mail className="size-5" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Support email", "Email hỗ trợ")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input value={config.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Phone number", "Số điện thoại")}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input value={config.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Address", "Địa chỉ")}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input value={config.contactAddress} onChange={(e) => set("contactAddress", e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Facebook URL", "URL Facebook")}</label>
          <input value={config.socialFacebook} onChange={(e) => set("socialFacebook", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("LinkedIn URL", "URL LinkedIn")}</label>
          <input value={config.socialLinkedIn} onChange={(e) => set("socialLinkedIn", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("YouTube URL", "URL YouTube")}</label>
          <input value={config.socialYoutube} onChange={(e) => set("socialYoutube", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </SystemConfigSectionCard>
  );
}
