import type { AppLocale } from "@/lib/i18n";

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

export function translateMembershipLevel(level: string, tx: Translate, _locale?: AppLocale) {
  switch (level) {
    case "Bronze":
      return tx("Bronze", "Đồng");
    case "Silver":
      return tx("Silver", "Bạc");
    case "Gold":
      return tx("Gold", "Vàng");
    case "Platinum":
      return tx("Platinum", "Bạch kim");
    default:
      return level;
  }
}
