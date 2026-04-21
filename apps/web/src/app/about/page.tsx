import type { Metadata } from "next";
import { Award, BookOpen, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

const values = [
  {
    title: "Hoc thuc chien",
    description: "Noi dung duoc thiet ke de nguoi hoc ap dung ngay vao cong viec va du an thuc te.",
    icon: BookOpen,
  },
  {
    title: "Chat luong noi dung",
    description: "Chung toi uu tien do ro rang, tinh nhat quan va kha nang cap nhat lien tuc.",
    icon: Sparkles,
  },
  {
    title: "Ho tro tin cay",
    description: "Nguoi hoc luon co kenh ho tro ro rang cho thanh toan, tai khoan va truy cap khoa hoc.",
    icon: ShieldCheck,
  },
  {
    title: "Mo rong toan cau",
    description: "Giao dien da ngon ngu va trai nghiem phu hop cho ca hoc vien ca nhan lan doanh nghiep.",
    icon: Globe,
  },
];

const stats = [
  { label: "Khoa hoc", value: "500+" },
  { label: "Hoc vien", value: "50K+" },
  { label: "Giang vien", value: "100+" },
  { label: "Danh gia TB", value: "4.8" },
];

export const metadata: Metadata = buildMetadata({
  title: "Ve EduCourse",
  description:
    "EduCourse tap trung vao khoa hoc thuc chien, lo trinh hoc tap co cau truc va trai nghiem giao dien nhat quan.",
  path: "/about",
  type: "website",
  keywords: ["ve EduCourse", "gioi thieu", "UX/UI Design"],
});

export default function AboutPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-blue-50 backdrop-blur">
              <Award className="size-4" />
              Ve chung toi
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Xay dung trai nghiem hoc tap ro rang, hien dai va hieu qua.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              EduCourse tap trung vao cac khoa hoc thuc chien, lo trinh hoc tap co cau truc, va trai nghiem giao dien nhat quan cho ca hoc vien lan giang vien.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-50 px-5 py-6 text-center">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Su menh</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Giup nguoi hoc di nhanh hon, ro hon, va tu tin hon.</h2>
            <p className="mt-5 text-slate-600 leading-8">
              Chung toi xay dung mot nen tang co cau truc, noi dung, video, bai hoc, thanh toan, danh gia va theo doi tien do deu nam tren cung mot luong trai nghiem.
              Muc tieu la giam ma sat khi hoc va tang kha nang hoan thanh khoa hoc.
            </p>
          </div>
          <div className="space-y-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{value.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}