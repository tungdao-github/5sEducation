"use client";

type Props = {
  tx: (en: string, vi: string) => string;
  price: string;
  setPrice: (value: string) => void;
  flashSalePrice: string;
  setFlashSalePrice: (value: string) => void;
  flashSaleStartsAt: string;
  setFlashSaleStartsAt: (value: string) => void;
  flashSaleEndsAt: string;
  setFlashSaleEndsAt: (value: string) => void;
};

export default function StudioCoursePricingFields({ tx, price, setPrice, flashSalePrice, setFlashSalePrice, flashSaleStartsAt, setFlashSaleStartsAt, flashSaleEndsAt, setFlashSaleEndsAt }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Price", "Gia")}</label>
        <input type="number" min="9.99" step="0.01" value={price} onChange={(e) => setPrice(e.currentTarget.value)} required className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Flash sale price", "Gia giam nhanh")}</label>
        <input type="number" min="0" step="0.01" value={flashSalePrice} onChange={(e) => setFlashSalePrice(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Flash sale start", "Bat dau giam gia")}</label>
        <input type="datetime-local" value={flashSaleStartsAt} onChange={(e) => setFlashSaleStartsAt(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{tx("Flash sale end", "Ket thuc giam gia")}</label>
        <input type="datetime-local" value={flashSaleEndsAt} onChange={(e) => setFlashSaleEndsAt(e.currentTarget.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm" />
      </div>
    </div>
  );
}
