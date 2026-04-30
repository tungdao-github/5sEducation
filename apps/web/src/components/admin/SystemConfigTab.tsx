"use client";

import { RefreshCw, Save } from "lucide-react";
import { useI18n } from "@/app/providers";
import SystemConfigGeneralSection from "@/components/admin/system-config/SystemConfigGeneralSection";
import SystemConfigContactSection from "@/components/admin/system-config/SystemConfigContactSection";
import SystemConfigPaymentSection from "@/components/admin/system-config/SystemConfigPaymentSection";
import SystemConfigLoyaltySection from "@/components/admin/system-config/SystemConfigLoyaltySection";
import { useSystemConfigTab } from "@/components/admin/useSystemConfigTab";

export default function SystemConfigTab() {
  const { tx } = useI18n();
  const { config, set, clearing, saving, handleSave, handleClearCache } = useSystemConfigTab();

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{tx("System settings", "Cấu hình hệ thống")}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{tx("Manage website info, payments and system features", "Quản lý thông tin website, thanh toán và các tính năng hệ thống")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="flex items-center gap-2 rounded-lg border border-orange-400 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${clearing ? "animate-spin" : ""}`} />
            {clearing ? tx("Clearing...", "Đang xóa...") : tx("Clear cache", "Xóa Cache")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="size-4" /> {saving ? tx("Saving...", "Đang lưu...") : tx("Save all", "Lưu tất cả")}
          </button>
        </div>
      </div>

      {config.maintenanceMode ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <div>
            <p className="font-semibold text-red-700">{tx("Maintenance mode is enabled", "Chế độ bảo trì đang bật")}</p>
            <p className="text-sm text-red-600">{tx("Users will see a maintenance page when visiting the website", "Người dùng sẽ thấy trang bảo trì khi truy cập website")}</p>
          </div>
          <button onClick={() => set("maintenanceMode", false)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
            {tx("Disable now", "Tắt ngay")}
          </button>
        </div>
      ) : null}

      <SystemConfigGeneralSection config={config} set={set} />
      <SystemConfigContactSection config={config} set={set} />
      <SystemConfigPaymentSection config={config} set={set} />
      <SystemConfigLoyaltySection config={config} set={set} />
    </div>
  );
}
