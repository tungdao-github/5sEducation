import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  title: "Dieu khoan dich vu",
  description: "Dieu khoan su dung va quyen truy cap khoa hoc tren EduCourse.",
  path: "/policy/terms",
  type: "website",
  keywords: ["terms", "dieu khoan", "EduCourse"],
});

export default async function TermsPage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Policy", "Chinh sach")}
        </p>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("Terms of service", "Dieu khoan dich vu")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t("Last updated: April 3, 2026", "Cap nhat: 03/04/2026")}
        </p>
      </div>

      <div className="surface-card space-y-6 p-6 text-sm text-emerald-800/80">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("1. Account responsibilities", "1. Trach nhiem tai khoan")}
          </h2>
          <p>
            {t(
              "Keep your login credentials safe and notify us if you suspect unauthorized access.",
              "Bao mat thong tin dang nhap va thong bao neu ban nghi ngo co truy cap trai phep."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("2. Course access", "2. Quyen truy cap khoa hoc")}
          </h2>
          <p>
            {t(
              "Course access is granted after payment and remains active while your account is in good standing.",
              "Quyen truy cap khoa hoc duoc kich hoat sau thanh toan va duoc duy tri khi tai khoan hop le."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("3. Refunds", "3. Hoan tien")}
          </h2>
          <p>
            {t(
              "Refunds follow the policy stated on each course checkout page.",
              "Chinh sach hoan tien ap dung theo thong tin tren trang thanh toan."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("4. Acceptable use", "4. Su dung hop le")}
          </h2>
          <p>
            {t(
              "Do not share paid content publicly or attempt to access unauthorized data.",
              "Khong chia se noi dung co phi cong khai hoac co gang truy cap du lieu khong duoc phep."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}