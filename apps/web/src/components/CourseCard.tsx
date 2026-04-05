import Link from "next/link";
import { resolveApiAsset } from "@/lib/api";
import { pickLocaleText, type AppLocale } from "@/lib/i18n";
import { CompareToggle } from "@/components/CompareToggle";

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  price: number;
  effectivePrice?: number;
  originalPrice?: number | null;
  isFlashSaleActive?: boolean;
  flashSaleEndsAt?: string | null;
  thumbnailUrl: string;
  language: string;
  level: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  category?: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

function formatPrice(price: number, locale: AppLocale) {
  if (price <= 0) {
    return pickLocaleText(locale, "Free", "Mien phi");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function CourseCard({ course, locale = "en" }: { course: CourseSummary; locale?: AppLocale }) {
  const imageUrl = resolveApiAsset(course.thumbnailUrl) || "/images/learning.jpg";
  const rating = course.averageRating ?? 0;
  const reviewCount = course.reviewCount ?? 0;
  const roundedRating = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, index) => (index < roundedRating ? "★" : "☆")).join("");
  const effectivePrice = course.effectivePrice ?? course.price;
  const originalPrice = course.originalPrice;
  const isFlashSale = Boolean(course.isFlashSaleActive && originalPrice);

  return (
    <article className="surface-card flex h-full flex-col gap-4 p-4">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={course.title}
          className="h-44 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <span className="badge absolute left-3 top-3 bg-white/90">
          {course.level || "Beginner"}
        </span>
        {isFlashSale && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-emerald-950">
            {pickLocaleText(locale, "Flash sale", "Giam gia nhanh")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {course.category?.title && (
          <p className="section-eyebrow">
            {course.category.title}
          </p>
        )}
        <Link href={`/courses/${course.slug}`} className="text-lg font-semibold text-emerald-950">
          {course.title}
        </Link>
        <p className="text-sm text-emerald-800/70">{course.shortDescription}</p>
        <div className="flex items-center justify-between text-xs text-emerald-800/70">
          <span>{course.language || pickLocaleText(locale, "English", "Tieng Anh")}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
            {formatPrice(effectivePrice, locale)}
            {isFlashSale && originalPrice ? (
              <span className="text-xs font-semibold text-emerald-700/60 line-through">
                {formatPrice(originalPrice, locale)}
              </span>
            ) : null}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-800/70">
          <span className="text-amber-500">{stars}</span>
          <span>{rating.toFixed(1)}</span>
          <span>({reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-700/70">
            {course.studentCount} {pickLocaleText(locale, "students", "hoc vien")}
          </span>
          <CompareToggle courseId={course.id} />
        </div>
      </div>
    </article>
  );
}
