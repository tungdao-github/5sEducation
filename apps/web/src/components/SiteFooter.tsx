"use client";

import Link from "next/link";
import { useI18n } from "@/app/providers";

export function SiteFooter() {
  const { tx } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-emerald-950">5S Education</p>
            <p className="text-sm text-emerald-800/70">
              {tx(
                "Curated learning paths, expert-led classes, and hands-on projects to get you job-ready.",
                "Lo trinh hoc duoc chon loc, lop hoc voi chuyen gia, va du an thuc hanh de ban san sang di lam."
              )}
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-900">
              <span className="badge">{tx("New cohorts", "Lop moi")}</span>
              <span className="badge">{tx("Live mentoring", "Mentor truc tiep")}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Platform", "Nen tang")}
            </p>
            <Link href="/courses" className="block underline-hover">
              {tx("All courses", "Tat ca khoa hoc")}
            </Link>
            <Link href="/dashboard" className="block underline-hover">
              {tx("My learning", "Hoc tap")}
            </Link>
            <Link href="/studio" className="block underline-hover">
              Studio
            </Link>
            <Link href="/admin" className="block underline-hover">
              Admin
            </Link>
            <Link href="/blog" className="block underline-hover">
              {tx("Blog", "Tin tuc")}
            </Link>
            <Link href="/compare" className="block underline-hover">
              {tx("Compare", "So sanh")}
            </Link>
            <Link href="/wishlist" className="block underline-hover">
              {tx("Wishlist", "Yeu thich")}
            </Link>
            <Link href="/cart" className="block underline-hover">
              {tx("Cart", "Gio hang")}
            </Link>
            <Link href="/register" className="block underline-hover">
              {tx("Become a learner", "Tro thanh hoc vien")}
            </Link>
          </div>

          <div className="space-y-3 text-sm text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Popular tracks", "Lo trinh pho bien")}
            </p>
            <p>{tx("Product design", "Thiet ke san pham")}</p>
            <p>{tx("Data analytics", "Phan tich du lieu")}</p>
            <p>{tx("Frontend engineering", "Ky su Frontend")}</p>
            <p>{tx("Business strategy", "Chien luoc kinh doanh")}</p>
          </div>

          <div className="space-y-3 text-sm text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Contact", "Lien he")}
            </p>
            <p>hello@lumen.academy</p>
            <p>+1 (415) 555-0199</p>
            <p>San Francisco, CA</p>
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-100/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-emerald-800/70 md:flex-row">
          <span>
            © {year} 5S Education. {tx("All rights reserved.", "Bao luu moi quyen.")}
          </span>
          <span>{tx("Designed for skill-first teams.", "Thiet ke cho doi ngu uu tien ky nang.")}</span>
        </div>
      </div>
    </footer>
  );
}
