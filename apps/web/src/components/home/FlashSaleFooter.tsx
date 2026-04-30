"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";

type Props = {
  href: string;
  label: string;
};

export default function FlashSaleFooter({ href, label }: Props) {
  return (
    <div className="mt-6 text-center">
      <Link to={href} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
        {label} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
