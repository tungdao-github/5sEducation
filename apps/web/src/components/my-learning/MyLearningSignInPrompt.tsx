"use client";

import { BookOpen } from "lucide-react";
import { useI18n } from "@/app/providers";

type Props = {
  onSignIn: () => void;
};

export default function MyLearningSignInPrompt({ onSignIn }: Props) {
  const { tx } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
        <BookOpen className="mx-auto mb-4 size-20 text-slate-300" />
        <h1 className="mb-2 text-2xl font-semibold text-slate-950">{tx("Sign in to view your courses", "Đăng nhập để xem khóa học của bạn")}</h1>
        <p className="mb-6 text-slate-600">{tx("You need to sign in to access your purchased courses and track progress.", "Bạn cần đăng nhập để truy cập vào các khóa học đã mua và theo dõi tiến độ học tập.")}</p>
        <button onClick={onSignIn} className="rounded-2xl bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700">
          {tx("Sign in now", "Đăng nhập ngay")}
        </button>
      </div>
    </div>
  );
}
