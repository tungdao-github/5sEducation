"use client";

import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  title: string;
  items: NavItem[];
  activeHref: (href: string) => boolean;
};

export default function SideNavSection({ title, items, activeHref }: Props) {
  return (
    <div className="space-y-3">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">{title}</p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = activeHref(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-emerald-700 text-white shadow-sm" : "text-[color:var(--muted)] hover:bg-slate-100/80"
              }`}
            >
              <span className={active ? "text-white" : "text-slate-500"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
