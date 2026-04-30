import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

type PageIntroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  backLink?: {
    href: string;
    label: ReactNode;
  };
  children?: ReactNode;
  className?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  align = "left",
  backLink,
  children,
  className,
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        align === "center" && "text-center",
        className
      )}
    >
      {backLink ? (
        <Link
          href={backLink.href}
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700",
            align === "center" && "inline-block"
          )}
        >
          {backLink.label}
        </Link>
      ) : null}
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="section-title text-4xl font-semibold text-emerald-950">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-emerald-800/70">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
