"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchCategories } from "@/services/api";
import { useI18n } from "@/app/providers";
import SideNavSection from "@/components/SideNavSection";
import SideNavCategoryList from "@/components/SideNavCategoryList";
import {
  BlogIcon,
  BookIcon,
  CartIcon,
  CompareIcon,
  DashboardIcon,
  HeartIcon,
  HomeIcon,
  PathIcon,
  ReceiptIcon,
  ShieldIcon,
  SparkIcon,
  SupportIcon,
} from "@/components/SideNavIcons";

type Category = {
  id: number;
  title: string;
  slug: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function SideNav() {
  const { tx } = useI18n();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const data = (await fetchCategories()) as Category[];
        if (!cancelled) {
          setCategories(data.slice(0, 6));
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(
    () => [
      {
        title: tx("Main", "Chinh"),
        items: [
          { href: "/", label: tx("Home", "Trang chu"), icon: <HomeIcon /> },
          { href: "/courses", label: tx("Courses", "Khoa hoc"), icon: <BookIcon /> },
          { href: "/paths", label: tx("Paths", "Lo trinh"), icon: <PathIcon /> },
          { href: "/blog", label: tx("Blog", "Tin tuc"), icon: <BlogIcon /> },
        ],
      },
      {
        title: tx("Learning", "Hoc tap"),
        items: [
          { href: "/my-learning", label: tx("My learning", "Viec hoc cua toi"), icon: <DashboardIcon /> },
          { href: "/orders", label: tx("Orders", "Don hang"), icon: <ReceiptIcon /> },
        ],
      },
      {
        title: tx("Tools", "Cong cu"),
        items: [
          { href: "/compare", label: tx("Compare", "So sanh"), icon: <CompareIcon /> },
          { href: "/wishlist", label: tx("Wishlist", "Yeu thich"), icon: <HeartIcon /> },
          { href: "/cart", label: tx("Cart", "Gio hang"), icon: <CartIcon /> },
        ],
      },
    ],
    [tx]
  );

  const supportItems: NavItem[] = [
    { href: "/support", label: tx("Support", "Ho tro"), icon: <SupportIcon /> },
    { href: "/instructor", label: tx("Studio", "Studio"), icon: <SparkIcon /> },
    { href: "/admin", label: tx("Admin", "Admin"), icon: <ShieldIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[color:var(--stroke)] bg-white/90 px-4 pb-8 pt-6 lg:flex lg:flex-col">
      <div className="sticky top-24 flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pr-2">
        {sections.map((section) => (
          <SideNavSection key={section.title} title={section.title} items={section.items} activeHref={isActive} />
        ))}

        <div className="space-y-3">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">{tx("Categories", "Danh muc")}</p>
          <SideNavCategoryList
            categories={categories}
            noCategoriesLabel={tx("No categories yet.", "Chua co danh muc.")}
            browseAllLabel={tx("Browse all courses", "Xem tat ca khoa hoc")}
          />
        </div>

        <div className="space-y-3">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">{tx("Support", "Ho tro")}</p>
          <div className="space-y-1">
            {supportItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100/80"
                  }`}
                >
                  <span className={active ? "text-white" : "text-slate-500"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
