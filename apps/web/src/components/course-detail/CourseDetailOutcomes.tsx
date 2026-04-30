"use client";

import { Check } from "lucide-react";

type Props = {
  outcomes: string[];
};

export default function CourseDetailOutcomes({ outcomes }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <h2 className="mb-4 text-2xl font-semibold text-slate-950">Bạn sẽ học được gì</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {outcomes.map((outcome, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="mt-0.5 size-5 flex-shrink-0 text-green-600" />
            <span className="text-slate-700">{outcome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
