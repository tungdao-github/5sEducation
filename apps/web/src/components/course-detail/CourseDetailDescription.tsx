"use client";

type Props = {
  description: string;
};

export default function CourseDetailDescription({ description }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <h2 className="mb-4 text-2xl font-semibold text-slate-950">Mô tả khóa học</h2>
      <p className="leading-relaxed text-slate-700">{description}</p>
    </div>
  );
}
