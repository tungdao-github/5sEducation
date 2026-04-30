"use client";

import { Bell } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "@/lib/notify";
import type { BlogPost } from "@/services/api";
import { useI18n } from "@/app/providers";
import { Link } from "@/lib/router";

type Props = {
  related: BlogPost[];
};

function NewsletterBox() {
  const { tx } = useI18n();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(tx("Newsletter subscription successful!", "Đăng ký nhận bản tin thành công!"));
    setEmail("");
  };

  return (
    <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#4f46e5_100%)] p-5 text-white shadow-[0_18px_50px_rgba(37,99,235,0.22)]">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="size-5" />
        <h3 className="text-sm font-semibold">{tx("Get new articles", "Nhận bài viết mới")}</h3>
      </div>
      <p className="mb-4 text-xs text-blue-100">{tx("Subscribe to receive useful UX/UI articles every week", "Đăng ký để nhận các bài viết UX/UI hữu ích mỗi tuần")}</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tx("Your email", "Email của bạn")}
          className="w-full rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button type="submit" className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
          {tx("Subscribe free", "Đăng ký miễn phí")}
        </button>
      </form>
    </div>
  );
}

export default function BlogDetailSidebar({ related }: Props) {
  const { tx } = useI18n();

  return (
    <aside className="space-y-6">
      <NewsletterBox />
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">{tx("Related articles", "Bài viết liên quan")}</h3>
        <div className="space-y-4">
          {related.map((item) => (
            <Link key={item.id} to={`/blog/${item.slug}`} className="group block">
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                <img src={item.image} alt={item.title} className="h-16 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs font-medium text-blue-600">{item.category}</div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.readTime} {tx("min read", "phút đọc")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
