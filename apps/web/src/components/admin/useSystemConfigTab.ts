"use client";

import { useEffect, useState } from "react";
import { clearAdminCache, fetchAdminSettings, updateAdminSetting, type SystemSettingDto } from "@/services/api";
import { toast } from "@/lib/notify";
import type { SystemConfig } from "@/components/admin/system-config/systemConfigTypes";

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
  const pointsPerUnitRaw = dict.get("loyalty:pointsPerUnit");
  const pointsPerUnit = pointsPerUnitRaw ? Number(pointsPerUnitRaw) : undefined;

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
    pointsPerUnit: Number.isFinite(pointsPerUnit) ? pointsPerUnit : undefined,
  };
}

export function useSystemConfigTab() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [clearing, setClearing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminSettings()
      .then((settings) => {
        if (active) setConfig((prev) => ({ ...prev, ...mapSettings(settings) }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

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

  return { config, set, clearing, saving, handleSave, handleClearCache };
}
