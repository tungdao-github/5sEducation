import Link from "next/link";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocaleText } from "@/lib/i18n";

const faqGroups = [
  {
    title: {
      en: "Learning & access",
      vi: "Học tập & truy cập",
    },
    items: [
      {
        en: {
          q: "How do I access my courses after checkout?",
          a: "Your courses appear immediately in My Learning once the payment completes.",
        },
        vi: {
          q: "Sau khi thanh toán tôi xem khóa học ở đâu?",
          a: "Khóa học sẽ xuất hiện ngay trong trang Học tập sau khi thanh toán thành công.",
        },
      },
      {
        en: {
          q: "Can I learn at my own pace?",
          a: "Yes. All self-paced courses are available anytime with progress tracking.",
        },
        vi: {
          q: "Tôi có thể học theo tiến độ riêng không?",
          a: "Có. Bạn học bất kỳ lúc nào và hệ thống sẽ lưu tiến độ.",
        },
      },
      {
        en: {
          q: "Where can I find course materials?",
          a: "Materials are available in the course player under the Resources tab.",
        },
        vi: {
          q: "Tôi tìm tài liệu học ở đâu?",
          a: "Tài liệu nằm trong trình phát bài học ở tab Tài nguyên.",
        },
      },
    ],
  },
  {
    title: {
      en: "Account & security",
      vi: "Tài khoản & bảo mật",
    },
    items: [
      {
        en: {
          q: "Can I switch between Vietnamese and English?",
          a: "Yes. Use the language switcher on the header to change the site language.",
        },
        vi: {
          q: "Có đổi ngôn ngữ được không?",
          a: "Có. Bạn có thể đổi ngôn ngữ ở phần header.",
        },
      },
      {
        en: {
          q: "I forgot my password. What should I do?",
          a: "Use the Forgot Password page to receive a reset link via email.",
        },
        vi: {
          q: "Tôi quên mật khẩu thì làm sao?",
          a: "Vào trang Quên mật khẩu để nhận link đặt lại qua email.",
        },
      },
      {
        en: {
          q: "Can I log in with Google?",
          a: "Yes. Use the Google button on the login page for one-click sign-in.",
        },
        vi: {
          q: "Tôi có thể đăng nhập bằng Google không?",
          a: "Có. Chọn nút Google ở trang đăng nhập để đăng nhập nhanh.",
        },
      },
    ],
  },
  {
    title: {
      en: "Payments & support",
      vi: "Thanh toán & hỗ trợ",
    },
    items: [
      {
        en: {
          q: "What payment methods are supported?",
          a: "You can pay by card; VNPay and ZaloPay will be added in later phases.",
        },
        vi: {
          q: "Hỗ trợ những phương thức thanh toán nào?",
          a: "Hiện hỗ trợ thẻ; VNPay và ZaloPay sẽ bổ sung ở phase sau.",
        },
      },
      {
        en: {
          q: "Where can I request support?",
          a: "Use the Support page or chat widget for help with billing, access, or content.",
        },
        vi: {
          q: "Liên hệ hỗ trợ ở đâu?",
          a: "Bạn có thể vào trang Hỗ trợ hoặc mở chat widget để được hỗ trợ.",
        },
      },
      {
        en: {
          q: "How long does it take to get a reply?",
          a: "Most tickets receive a response within 24 hours on business days.",
        },
        vi: {
          q: "Bao lâu sẽ được phản hồi?",
          a: "Phần lớn yêu cầu sẽ được phản hồi trong 24 giờ làm việc.",
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
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {t("Help center", "Trung tam ho tro")}
        </p>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {t("Frequently asked questions", "Cac cau hoi thuong gap")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {t("Quick answers to the most common questions.", "Tong hop nhanh cac cau hoi ban thuong gap.")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {faqGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="surface-card space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {t(group.title.en, group.title.vi)}
                </p>
              </div>
              <div className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <details
                    key={`faq-${groupIndex}-${itemIndex}`}
                    className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 px-4 py-3"
                    open={groupIndex === 0 && itemIndex === 0}
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-emerald-950">
                      {t(item.en.q, item.vi.q)}
                    </summary>
                    <p className="mt-2 text-sm text-emerald-800/70">
                      {t(item.en.a, item.vi.a)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="surface-card space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("Need more help?", "Can ho tro them?")}
            </p>
            <p className="text-sm text-emerald-800/70">
              {t(
                "Send a request or chat with our team for faster answers.",
                "Gui yeu cau hoac chat voi doi ngu ho tro de nhan phan hoi nhanh hon."
              )}
            </p>
            <Link
              href="/support"
              className="inline-flex rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
            >
              {t("Open support", "Mo ho tro")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
