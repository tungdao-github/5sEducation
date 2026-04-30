"use client";

import { AlertCircle } from "lucide-react";
import { useI18n } from "@/app/providers";

export default function TwoFactorInfoPanel() {
  const { tx } = useI18n();

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 size-4 flex-shrink-0 text-amber-600" />
        <div className="text-xs text-amber-700">
          <p className="font-medium">{tx("Important note", "Lưu ý quan trọng")}</p>
          <p className="mt-1">
            {tx(
              "Keep your secret key in a safe place. You will need it if you want to restore 2FA on a new device.",
              "Hãy lưu mã bí mật ở nơi an toàn. Bạn sẽ cần nó nếu muốn khôi phục 2FA trên thiết bị mới."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
