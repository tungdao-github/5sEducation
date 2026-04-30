"use client";

import { Zap } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
};

export default function FlashSaleHeader({ title, subtitle }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
        <Zap className="size-6 fill-white text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-red-100">{subtitle}</p>
      </div>
    </div>
  );
}
