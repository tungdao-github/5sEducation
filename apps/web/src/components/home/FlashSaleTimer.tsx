"use client";

type Props = {
  values: { label: string; value: string }[];
};

export default function FlashSaleTimer({ values }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {values.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-1.5">
          <div className="min-w-[50px] rounded-lg bg-white/20 px-3 py-2 text-center backdrop-blur">
            <div className="font-mono text-xl font-bold leading-none text-white">{unit.value}</div>
            <div className="mt-0.5 text-[9px] text-red-100">{unit.label}</div>
          </div>
          {index < values.length - 1 && <span className="text-lg font-bold text-white">:</span>}
        </div>
      ))}
    </div>
  );
}
