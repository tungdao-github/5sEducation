"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useI18n } from "@/app/providers";
import { toast } from "@/lib/notify";
import TwoFactorStatusBadge from "@/components/account/twofactor/TwoFactorStatusBadge";
import TwoFactorIntroCard from "@/components/account/twofactor/TwoFactorIntroCard";
import TwoFactorSetupPanel from "@/components/account/twofactor/TwoFactorSetupPanel";
import TwoFactorEnabledPanel from "@/components/account/twofactor/TwoFactorEnabledPanel";
import TwoFactorInfoPanel from "@/components/account/twofactor/TwoFactorInfoPanel";

export default function AccountTwoFactorSettings() {
  const { tx } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [step, setStep] = useState<"idle" | "setup">("idle");
  const [secret, setSecret] = useState("EDUCOURSE-2FA-SECRET");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    try {
      setSecret(`EDUCOURSE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setStep("setup");
      toast.info(tx("Scan the QR code with your authenticator app.", "Quét mã QR bằng ứng dụng xác thực của bạn"));
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerifyAndEnable = () => {
    if (verifyCode === "123456") {
      setEnabled(true);
      setStep("idle");
      setVerifyCode("");
      toast.success(tx("Two-factor authentication is now enabled!", "Đã bật xác thực hai yếu tố!"));
    } else {
      toast.error(tx("Invalid verification code.", "Mã xác thực không đúng"));
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode) {
      toast.error(tx("Please enter the verification code.", "Vui lòng nhập mã xác thực"));
      return;
    }
    setIsDisabling(true);
    try {
      if (disableCode !== "123456") {
        toast.error(tx("Invalid verification code.", "Mã xác thực không đúng"));
        return;
      }
      setEnabled(false);
      setDisableCode("");
      toast.success(tx("Two-factor authentication is now disabled!", "Đã tắt xác thực hai yếu tố!"));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success(tx("Secret key copied!", "Đã sao chép mã bí mật!"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="size-5 text-blue-600" />
            {tx("Two-factor authentication (2FA)", "Xác thực hai yếu tố (2FA)")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{tx("Increase account security.", "Tăng cường bảo mật cho tài khoản của bạn")}</p>
        </div>
        <TwoFactorStatusBadge enabled={enabled} />
      </div>

      {!enabled && step === "idle" ? (
        <div className="max-w-sm">
          <TwoFactorIntroCard />
          <button
            onClick={handleEnable2FA}
            disabled={isEnabling}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isEnabling ? <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Shield className="size-4" />}
            {tx("Enable 2FA", "Bật xác thực hai yếu tố")}
          </button>
        </div>
      ) : null}

      {step === "setup" && !enabled ? (
        <div className="max-w-md">
          <TwoFactorSetupPanel
            secret={secret}
            copied={copied}
            verifyCode={verifyCode}
            setVerifyCode={setVerifyCode}
            onCopySecret={handleCopySecret}
            onCancel={() => {
              setStep("idle");
              setVerifyCode("");
            }}
            onVerify={handleVerifyAndEnable}
          />
          <TwoFactorInfoPanel />
        </div>
      ) : null}

      {enabled && step === "idle" ? (
        <TwoFactorEnabledPanel disableCode={disableCode} setDisableCode={setDisableCode} onDisable={handleDisable2FA} isDisabling={isDisabling} />
      ) : null}
    </div>
  );
}
