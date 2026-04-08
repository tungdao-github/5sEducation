"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Globe, Mail, Phone, MapPin, CreditCard, Palette } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import { clearAdminCache, fetchAdminSettings, updateAdminSetting, type SystemSettingDto } from "../../data/api";

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerTagline: string;
  footerNote: string;
  socialFacebook: string;
  socialLinkedIn: string;
  socialYoutube: string;
  primaryColor: string;
  enableVNPay: boolean;
  enableZaloPay: boolean;
  enableCard: boolean;
  maintenanceMode: boolean;
  pointsPerUnit: number;
}

const defaultConfig: SystemConfig = {
  siteName: "EduCourse",
  siteDescription: "Nền tảng học UX/UI Design hàng đầu Việt Nam",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "support@educourse.vn",
  contactPhone: "1800-1234",
  contactAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
  footerTagline: "Học từ chuyên gia hàng đầu",
  footerNote: "EduCourse là nền tảng học UX/UI Design hàng đầu Việt Nam.",
  socialFacebook: "",
  socialLinkedIn: "",
  socialYoutube: "",
  primaryColor: "#3B82F6",
  enableVNPay: true,
  enableZaloPay: true,
  enableCard: true,
  maintenanceMode: false,
  pointsPerUnit: 1,
};

function mapSettings(settings: SystemSettingDto[]): Partial<SystemConfig> {
  const dict = new Map(settings.map((s) => [s.key, s.value]));
  return {
    siteName: dict.get("siteName") || undefined,
    siteDescription: dict.get("siteDescription") || undefined,
    logoUrl: dict.get("logoUrl") || undefined,
    faviconUrl: dict.get("faviconUrl") || undefined,
    contactEmail: dict.get("contactEmail") || undefined,
    contactPhone: dict.get("contactPhone") || undefined,
    contactAddress: dict.get("contactAddress") || undefined,
    footerTagline: dict.get("footerTagline") || undefined,
    footerNote: dict.get("footerNote") || undefined,
    socialFacebook: dict.get("socialFacebook") || undefined,
    socialLinkedIn: dict.get("socialLinkedIn") || undefined,
    socialYoutube: dict.get("socialYoutube") || undefined,
    primaryColor: dict.get("primaryColor") || undefined,
    enableVNPay: dict.get("payment:vnPay") === "true",
    enableZaloPay: dict.get("payment:zaloPay") === "true",
    enableCard: dict.get("payment:card") === "true",
    maintenanceMode: dict.get("system:maintenance") === "true",
    pointsPerUnit: dict.get("loyalty:pointsPerUnit") ? Number(dict.get("loyalty:pointsPerUnit")) : undefined,
  };
}

function ConfigSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="size-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SystemConfigTab() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [clearing, setClearing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminSettings()
      .then((settings) => {
        if (!active) return;
        setConfig((prev) => ({ ...prev, ...mapSettings(settings) }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof SystemConfig>(key: K, val: SystemConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const updates: Array<Promise<SystemSettingDto>> = [];
    const push = (key: string, value: string, group = "site", description = "") => {
      updates.push(updateAdminSetting(key, { value, group, description }));
    };

    push("siteName", config.siteName, "site", "Tên website");
    push("siteDescription", config.siteDescription, "site", "Mô tả website");
    push("logoUrl", config.logoUrl, "site", "Logo");
    push("faviconUrl", config.faviconUrl, "site", "Favicon");
    push("contactEmail", config.contactEmail, "contact", "Email hỗ trợ");
    push("contactPhone", config.contactPhone, "contact", "Số điện thoại");
    push("contactAddress", config.contactAddress, "contact", "Địa chỉ");
    push("footerTagline", config.footerTagline, "site", "Footer tagline");
    push("footerNote", config.footerNote, "site", "Footer note");
    push("socialFacebook", config.socialFacebook, "social", "Facebook");
    push("socialLinkedIn", config.socialLinkedIn, "social", "LinkedIn");
    push("socialYoutube", config.socialYoutube, "social", "YouTube");
    push("primaryColor", config.primaryColor, "theme", "Primary color");
    push("payment:vnPay", String(config.enableVNPay), "payment", "VNPay enabled");
    push("payment:zaloPay", String(config.enableZaloPay), "payment", "ZaloPay enabled");
    push("payment:card", String(config.enableCard), "payment", "Card enabled");
    push("system:maintenance", String(config.maintenanceMode), "system", "Maintenance mode");
    push("loyalty:pointsPerUnit", String(config.pointsPerUnit), "loyalty", "Points per unit");

    try {
      await Promise.all(updates);
      toast.success("Cấu hình hệ thống đã được lưu!");
    } catch {
      toast.error("Không thể lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await clearAdminCache();
      toast.success("Cache hệ thống đã được xóa thành công!");
    } catch {
      toast.error("Không thể xóa cache.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Cấu hình hệ thống</h3>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin website, thanh toán và các tính năng hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="flex items-center gap-2 border border-orange-400 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${clearing ? "animate-spin" : ""}`} />
            {clearing ? "Đang xóa..." : "Xóa Cache"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
          >
            <Save className="size-4" /> {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
      </div>

      {config.maintenanceMode && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-700">Chế độ bảo trì đang bật</p>
            <p className="text-sm text-red-600">Người dùng sẽ thấy trang bảo trì khi truy cập website</p>
          </div>
          <button onClick={() => set("maintenanceMode", false)} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
            Tắt ngay
          </button>
        </div>
      )}

      <ConfigSection title="Thông tin chung" icon={<Globe className="size-5" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
            <input value={config.siteName} onChange={(e) => set("siteName", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="size-9 rounded cursor-pointer border border-gray-200" />
              <input value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <input value={config.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input value={config.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
            <input value={config.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer tagline</label>
            <input value={config.footerTagline} onChange={(e) => set("footerTagline", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer note</label>
            <textarea value={config.footerNote} onChange={(e) => set("footerNote", e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Thông tin liên hệ" icon={<Mail className="size-5" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email hỗ trợ</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.contactAddress} onChange={(e) => set("contactAddress", e.target.value)} className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input value={config.socialFacebook} onChange={(e) => set("socialFacebook", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input value={config.socialLinkedIn} onChange={(e) => set("socialLinkedIn", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input value={config.socialYoutube} onChange={(e) => set("socialYoutube", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Cổng thanh toán" icon={<CreditCard className="size-5" />}>
        <div className="space-y-4">
          {[
            { key: "enableVNPay", label: "VNPay", desc: "Thanh toán qua ví VNPay và thẻ ngân hàng" },
            { key: "enableZaloPay", label: "ZaloPay", desc: "Thanh toán qua ví ZaloPay" },
            { key: "enableCard", label: "Thẻ tín dụng/Ghi nợ", desc: "Visa, Mastercard, JCB" },
          ].map((pg) => (
            <div key={pg.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{pg.label}</p>
                <p className="text-xs text-gray-500">{pg.desc}</p>
              </div>
              <button
                onClick={() => set(pg.key as keyof SystemConfig, !config[pg.key as keyof SystemConfig] as boolean)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${config[pg.key as keyof SystemConfig] ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {config[pg.key as keyof SystemConfig] ? "Bật" : "Tắt"}
              </button>
            </div>
          ))}
        </div>
      </ConfigSection>

      <ConfigSection title="Loyalty" icon={<Palette className="size-5" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm thưởng / đơn vị</label>
            <input
              type="number"
              value={config.pointsPerUnit}
              onChange={(e) => set("pointsPerUnit", Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}
