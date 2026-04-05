"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import { API_URL } from "@/lib/api";

export function SiteFooter() {
  const { tx } = useI18n();
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/settings?keys=siteName,footerTagline,footerNote,contactEmail,contactPhone,contactAddress,socialFacebook,socialLinkedIn,socialYoutube`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { key: string; value: string }[];
        const map: Record<string, string> = {};
        data.forEach((item) => {
          map[item.key] = item.value;
        });
        setSettings(map);
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  const siteName = settings.siteName || "5S Education";
  const footerTagline =
    settings.footerTagline ||
    tx(
      "Curated learning paths, expert-led classes, and hands-on projects to get you job-ready.",
      "Lo trinh hoc duoc chon loc, lop hoc voi chuyen gia, va du an thuc hanh de ban san sang di lam."
    );
  const footerNote =
    settings.footerNote || tx("Designed for skill-first teams.", "Thiet ke cho doi ngu uu tien ky nang.");
  const contactEmail = settings.contactEmail || "hello@lumen.academy";
  const contactPhone = settings.contactPhone || "+1 (415) 555-0199";
  const contactAddress = settings.contactAddress || "San Francisco, CA";
  const socialLinks = [
    { key: "Facebook", url: settings.socialFacebook },
    { key: "LinkedIn", url: settings.socialLinkedIn },
    { key: "YouTube", url: settings.socialYoutube },
  ].filter((item) => item.url);

  return (
    <footer className="footer">
      <div className="section-shell py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-emerald-950">{siteName}</p>
            <p className="text-sm text-emerald-800/70">{footerTagline}</p>
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
            <Link href="/faq" className="block underline-hover">
              {tx("FAQ", "Hoi dap")}
            </Link>
            <Link href="/policy/privacy" className="block underline-hover">
              {tx("Privacy", "Bao mat")}
            </Link>
            <Link href="/policy/terms" className="block underline-hover">
              {tx("Terms", "Dieu khoan")}
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
            <a href={`mailto:${contactEmail}`} className="block underline-hover">
              {contactEmail}
            </a>
            <a href={`tel:${contactPhone}`} className="block underline-hover">
              {contactPhone}
            </a>
            <p>{contactAddress}</p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-emerald-900">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-hover"
                  >
                    {item.key}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--stroke)]">
        <div className="section-shell flex flex-col items-center justify-between gap-2 py-4 text-xs text-emerald-800/70 md:flex-row">
          <span>
            (c) {year} {siteName}. {tx("All rights reserved.", "Bao luu moi quyen.")}
          </span>
          <span>{footerNote}</span>
        </div>
      </div>
    </footer>
  );
}

