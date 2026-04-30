"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import { fetchSiteSettings } from "@/services/api";

export function SiteFooter() {
  const { tx } = useI18n();
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSiteSettings([
          "siteName",
          "footerTagline",
          "footerNote",
          "contactEmail",
          "contactPhone",
          "contactAddress",
          "socialFacebook",
          "socialLinkedIn",
          "socialYoutube",
        ]);
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

  const siteName = settings.siteName || "EduCourse";
  const footerTagline =
    settings.footerTagline ||
    tx(
      "Expert-led online courses for UX and product teams.",
      "Khoa hoc truc tuyen cho doi ngu UX va san pham."
    );
  const contactEmail = settings.contactEmail || "hello@educourse.vn";
  const contactPhone = settings.contactPhone || "+84 123 456 789";
  const contactAddress = settings.contactAddress || "Ho Chi Minh City, Vietnam";
  const socialLinks = [
    { key: "Facebook", url: settings.socialFacebook },
    { key: "LinkedIn", url: settings.socialLinkedIn },
    { key: "YouTube", url: settings.socialYoutube },
  ].filter((item) => item.url);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{siteName}</h3>
            <p className="text-sm mb-4">{footerTagline}</p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {item.key}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{tx("Quick links", "Lien ket")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {tx("Home", "Trang chu")}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  {tx("Courses", "Khoa hoc")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  {tx("Blog", "Blog")}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  {tx("Wishlist", "Yeu thich")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  {tx("Cart", "Gio hang")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{tx("Categories", "Danh muc")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white transition-colors">UX/UI Design</li>
              <li className="hover:text-white transition-colors">UX Research</li>
              <li className="hover:text-white transition-colors">UX Writing</li>
              <li className="hover:text-white transition-colors">Product Design</li>
              <li className="hover:text-white transition-colors">Data & Analytics</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{tx("Contact", "Lien he")}</h3>
            <ul className="space-y-3 text-sm">
              <li>{contactAddress}</li>
              <li>
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {year} {siteName}. {tx("All rights reserved.", "Bao luu moi quyen.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
