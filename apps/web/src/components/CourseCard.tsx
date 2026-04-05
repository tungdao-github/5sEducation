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
  const stars = Array.from({ length: 5 }, (_, index) => (index < roundedRating ? "?" : "?")).join("");
  const effectivePrice = course.effectivePrice ?? course.price;
  const originalPrice = course.originalPrice;
  const discount = originalPrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 flex flex-col">
      <div className="relative overflow-hidden aspect-video flex-shrink-0">
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
            -{discount}%
          </div>
        )}
        <span className="absolute top-3 right-3">
          <CompareToggle courseId={course.id} />
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {course.category?.title && (
          <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1.5">
            {course.category.title}
          </div>
        )}

        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1"
        >
          {course.title}
        </Link>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.shortDescription}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">{stars}</span>
            <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{course.level || pickLocaleText(locale, "Beginner", "Co ban")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(effectivePrice, locale)}
            </span>
            {originalPrice ? (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice, locale)}
              </span>
            ) : null}
          </div>
          <span className="text-xs text-gray-500">
            {course.studentCount} {pickLocaleText(locale, "students", "hoc vien")}
          </span>
        </div>
      </div>
    </article>
  );
}
