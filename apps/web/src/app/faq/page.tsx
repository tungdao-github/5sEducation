import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description: "Cac cau hoi thuong gap ve EduCourse, thanh toan, truy cap khoa hoc va tai khoan.",
  path: "/faq",
  type: "website",
  keywords: ["faq", "ho tro", "EduCourse"],
});

const faqGroups = [
  {
    title: {
      en: "Learning & access",
      vi: "Hoc tap & truy cap",
    },
    items: [
      {
        en: {
          q: "How do I access my courses after checkout?",
          a: "Your courses appear immediately in My Learning once the payment completes.",
        },
        vi: {
          q: "Sau khi thanh toan toi xem khoa hoc o dau?",
          a: "Khoa hoc se xuat hien ngay trong trang Hoc tap sau khi thanh toan thanh cong.",
        },
      },
      {
        en: {
          q: "Can I learn at my own pace?",
          a: "Yes. All self-paced courses are available anytime with progress tracking.",
        },
        vi: {
          q: "Toi co the hoc theo tien do rieng khong?",
          a: "Co. Ban hoc bat ky luc nao va he thong se luu tien do.",
        },
      },
      {
        en: {
          q: "Where can I find course materials?",
          a: "Materials are available in the course player under the Resources tab.",
        },
        vi: {
          q: "Toi tim tai lieu hoc o dau?",
          a: "Tai lieu nam trong trinh phat bai hoc o tab Tai nguyen.",
        },
      },
    ],
  },
  {
    title: {
      en: "Account & security",
      vi: "Tai khoan & bao mat",
    },
    items: [
      {
        en: {
          q: "Can I switch between Vietnamese and English?",
          a: "Yes. Use the language switcher on the header to change the site language.",
        },
        vi: {
          q: "Co doi ngon ngu duoc khong?",
          a: "Co. Ban co the doi ngon ngu o phan header.",
        },
      },
      {
        en: {
          q: "I forgot my password. What should I do?",
          a: "Use the Forgot Password page to receive a reset link via email.",
        },
        vi: {
          q: "Toi quen mat khau thi lam sao?",
          a: "Vao trang Quen mat khau de nhan link dat lai qua email.",
        },
      },
      {
        en: {
          q: "Can I log in with Google?",
          a: "Yes. Use the Google button on the login page for one-click sign-in.",
        },
        vi: {
          q: "Toi co the dang nhap bang Google khong?",
          a: "Co. Chon nut Google o trang dang nhap de dang nhap nhanh.",
        },
      },
    ],
  },
];

export default async function FaqPage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("Help center", "Trung tam tro giup")}</p>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">{t("Frequently asked questions", "Cau hoi thuong gap")}</h1>
      </div>
      <div className="space-y-8">
        {faqGroups.map((group) => (
          <section key={group.title.en} className="surface-card space-y-5 rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-emerald-950">{pickLocaleText(locale, group.title.en, group.title.vi)}</h2>
            <div className="space-y-4">
              {group.items.map((item) => {
                const data = locale.startsWith("vi") ? item.vi : item.en;
                return (
                  <article key={data.q} className="rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4">
                    <h3 className="text-sm font-semibold text-emerald-950">{data.q}</h3>
                    <p className="mt-2 text-sm text-emerald-800/70">{data.a}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="text-center text-sm text-emerald-800/70">
        <Link href="/support" className="font-semibold text-emerald-900 underline underline-offset-4">{t("Contact support", "Lien he ho tro")}</Link>
      </div>
    </div>
  );
}