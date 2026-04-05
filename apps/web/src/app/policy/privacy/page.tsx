import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Policy", "Chinh sach")}
        </p>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("Privacy policy", "Chinh sach bao mat")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t("Last updated: April 3, 2026", "Cap nhat: 03/04/2026")}
        </p>
      </div>

      <div className="surface-card space-y-6 p-6 text-sm text-emerald-800/80">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("1. Data we collect", "1. Du lieu thu thap")}
          </h2>
          <p>
            {t(
              "We collect account information, course activity, and support messages to deliver the service.",
              "Chung toi thu thap thong tin tai khoan, hoat dong hoc tap va yeu cau ho tro de cung cap dich vu."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("2. How we use data", "2. Muc dich su dung du lieu")}
          </h2>
          <p>
            {t(
              "Data is used for account access, personalized learning, and improving product quality.",
              "Du lieu duoc su dung de truy cap tai khoan, ca nhan hoa hoc tap va cai thien san pham."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("3. Data sharing", "3. Chia se du lieu")}
          </h2>
          <p>
            {t(
              "We only share data with trusted vendors required to operate the service.",
              "Chung toi chi chia se du lieu voi cac doi tac can thiet de van hanh dich vu."
            )}
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-950">
            {t("4. Your rights", "4. Quyen cua ban")}
          </h2>
          <p>
            {t(
              "You can request data access or deletion by contacting our support team.",
              "Ban co the yeu cau truy cap hoac xoa du lieu thong qua doi ngu ho tro."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
