"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

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

const iconClass = "h-4 w-4 stroke-current";
const iconProps = {
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5v10h14v-10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M4 5.5h11a3 3 0 0 1 3 3v10.5" />
      <path d="M4 5.5v12a3 3 0 0 0 3 3h11" />
      <path d="M4 8h11" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M5 5h9a4 4 0 0 1 4 4v9H9a4 4 0 0 1-4-4V5z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M4 13h6v7H4z" />
      <path d="M14 4h6v16h-6z" />
      <path d="M4 4h6v6H4z" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M8 4v16" />
      <path d="M16 20V4" />
      <path d="M4 8h8" />
      <path d="M12 16h8" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M12 20s-6-4.4-8.2-8.3a4.5 4.5 0 0 1 7.7-4.7L12 7.6l.5-.6a4.5 4.5 0 0 1 7.7 4.7C18 15.6 12 20 12 20z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M7 3h10l1 2v16l-3-2-3 2-3-2-3 2V5l1-2z" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h1.5a2.5 2.5 0 1 0 5 0H16" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} {...iconProps}>
      <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      {children}
    </p>
  );
}

export function SideNav() {
  const { tx } = useI18n();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setCategories([]);
          return;
        }
        const data = (await res.json()) as Category[];
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
          { href: "/dashboard", label: tx("My learning", "Viec hoc cua toi"), icon: <DashboardIcon /> },
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
    { href: "/studio", label: "Studio", icon: <SparkIcon /> },
    { href: "/admin", label: "Admin", icon: <ShieldIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200/70 bg-white/90 px-4 pb-8 pt-6 lg:flex lg:flex-col">
      <div className="sticky top-24 flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pr-2">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <SectionTitle>{section.title}</SectionTitle>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className={active ? "text-white" : "text-slate-500"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="space-y-3">
          <SectionTitle>{tx("Categories", "Danh muc")}</SectionTitle>
          <div className="flex flex-wrap gap-2 px-1">
            {categories.length === 0 ? (
              <span className="text-xs text-slate-400">{tx("No categories yet.", "Chua co danh muc.")}</span>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700"
                >
                  {category.title}
                </Link>
              ))
            )}
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-3 text-xs font-semibold text-blue-700"
          >
            {tx("Browse all courses", "Xem tat ca khoa hoc")}
          </Link>
        </div>

        <div className="space-y-3">
          <SectionTitle>{tx("Support", "Ho tro")}</SectionTitle>
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
