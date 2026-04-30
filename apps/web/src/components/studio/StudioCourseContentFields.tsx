"use client";

type Props = {
  tx: (en: string, vi: string) => string;
  shortDescription: string;
  setShortDescription: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
};

export default function StudioCourseContentFields({ tx, shortDescription, setShortDescription, description, setDescription, outcome, setOutcome, requirements, setRequirements, language, setLanguage }: Props) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Short description", "Mo ta ngan")}</label>
        <input value={shortDescription} onChange={(e) => setShortDescription(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Description", "Mo ta")}</label>
        <textarea value={description} onChange={(e) => setDescription(e.currentTarget.value)} required rows={4} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Outcome", "Ket qua")}</label>
          <input value={outcome} onChange={(e) => setOutcome(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Requirements", "Yeu cau")}</label>
          <input value={requirements} onChange={(e) => setRequirements(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Language", "Ngôn ngữ")}</label>
          <input value={language} onChange={(e) => setLanguage(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
        </div>
      </div>
    </>
  );
}
