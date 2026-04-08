import { fetchJson, fetchJsonWithAuth, resolveApiAsset } from "@/lib/api";
import type { Course } from "../contexts/CartContext";

export type CategoryDto = {
  id: number;
  title: string;
  slug: string;
};

export type CourseListDto = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  price: number;
  effectivePrice: number;
  originalPrice: number | null;
  isFlashSaleActive: boolean;
  flashSalePrice: number | null;
  flashSaleStartsAt: string | null;
  flashSaleEndsAt: string | null;
  thumbnailUrl: string;
  language: string;
  level: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  category?: CategoryDto | null;
  instructorName?: string | null;
  instructorAvatarUrl?: string | null;
  totalLessons?: number | null;
  totalDurationMinutes?: number | null;
};

export type LessonDto = {
  id: number;
  courseId: number;
  title: string;
  contentType: string;
  durationMinutes: number;
  sortOrder: number;
};

export type CourseDetailDto = CourseListDto & {
  description: string;
  outcome: string;
  requirements: string;
  previewVideoUrl: string;
  lessons: LessonDto[];
};

export type CourseCompareDto = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  price: number;
  effectivePrice: number;
  originalPrice: number | null;
  isFlashSaleActive: boolean;
  flashSalePrice: number | null;
  flashSaleStartsAt: string | null;
  flashSaleEndsAt: string | null;
  thumbnailUrl: string;
  language: string;
  level: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  category?: CategoryDto | null;
  instructorName?: string | null;
  instructorAvatarUrl?: string | null;
  totalLessons?: number | null;
  totalDurationMinutes?: number | null;
};

export type CartItemDto = {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  price: number;
  quantity: number;
};

export type WishlistItemDto = {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  price: number;
  level: string;
  language: string;
  instructorName?: string | null;
  instructorAvatarUrl?: string | null;
};

export type BlogPostListDto = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string;
  authorName: string;
  tags: string[];
  locale: string;
  createdAt: string;
  publishedAt?: string | null;
};

export type BlogPostDetailDto = BlogPostListDto & {
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  image: string;
  locale: string;
  readTime: number;
  views: number;
  category: string;
};

export type EnrollmentDto = {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  createdAt: string;
  lastLessonId?: number | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

export type OrderDto = {
  id: number;
  status: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  couponCode?: string | null;
  createdAt: string;
  items: OrderItemDto[];
};

export type OrderItemDto = {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type AddressDto = {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressCreateRequest = {
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export type AddressUpdateRequest = AddressCreateRequest;

export type AdminStatsOverviewDto = {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  openSupportTickets: number;
  activeStudents30d: number;
  totalRevenue: number;
  averageRating: number;
  enrollmentsLast7Days: { date: string; count: number }[];
  revenueLast30Days: { date: string; value: number }[];
  ordersByStatus: { status: string; count: number }[];
  topCoursesByRevenue: { courseId: number; courseTitle: string; revenue: number; orders: number }[];
};

export type AdminOrderDto = {
  id: number;
  status: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  couponCode?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItemDto[];
};

export type AdminUserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isAdmin: boolean;
  emailConfirmed: boolean;
  roles: string[];
  loyaltyPoints: number;
  loyaltyTier: string;
  courseCount: number;
  status: string;
  createdAt: string;
};

export type AdminAuditLogDto = {
  id: number;
  userId: string;
  userEmail: string;
  action: string;
  method: string;
  path: string;
  queryString: string;
  statusCode: number;
  ipAddress: string;
  userAgent: string;
  durationMs: number;
  createdAt: string;
};

export type CategoryAdminDto = {
  id: number;
  title: string;
  slug: string;
  courseCount: number;
};

export type BlogPostAdminDto = BlogPostListDto & {
  isPublished?: boolean;
};

export type SystemSettingDto = {
  key: string;
  value: string;
  group: string;
  description?: string | null;
  updatedAt: string;
};

export type SystemSettingUpdateRequest = {
  value: string;
  group?: string;
  description?: string | null;
};

export type CouponDto = {
  id: number;
  code: string;
  type: "fixed" | "percent" | string;
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CouponCreateRequest = {
  code: string;
  description?: string;
  type: "fixed" | "percent" | string;
  value: number;
  minOrder: number;
  maxUses: number;
  expiresAt?: string | null;
  isActive: boolean;
};

export type CouponValidateResponse = {
  isValid: boolean;
  message?: string;
  discount: number;
  newTotal: number;
  coupon?: CouponDto | null;
};

export type BlogComment = {
  id: number;
  blogPostId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  likeCount: number;
  isLikedByUser: boolean;
  createdAt: string;
};

export type BlogCommentLikeResponse = {
  commentId: number;
  likeCount: number;
  isLiked: boolean;
};

const levelLabels: Record<string, string> = {
  Beginner: "Sơ cấp",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  "All Levels": "Phù hợp mọi trình độ",
  "All levels": "Phù hợp mọi trình độ",
};

const languageLabels: Record<string, string> = {
  English: "Tiếng Anh",
  Vietnamese: "Tiếng Việt",
};

export function formatLevel(level: string, locale: "vi" | "en" = "vi") {
  if (locale === "en") return level;
  return levelLabels[level] ?? level;
}

export function formatLanguage(language: string, locale: "vi" | "en" = "vi") {
  if (locale === "en") return language;
  return languageLabels[language] ?? language;
}

export function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export function normalizeCurrency(amount: number) {
  if (!Number.isFinite(amount)) return 0;
  return amount >= 1000 ? amount : amount * 1000;
}

export function formatPrice(amount: number, locale: string = "vi-VN") {
  const normalized = normalizeCurrency(amount);
  return `${normalized.toLocaleString(locale)}đ`;
}

export function formatPriceCompact(amount: number, locale: string = "vi-VN") {
  const normalized = normalizeCurrency(amount);
  if (normalized >= 1000) {
    return `${Math.round(normalized / 1000).toLocaleString(locale)}K₫`;
  }
  return `${normalized.toLocaleString(locale)}đ`;
}

function splitLines(value?: string | null) {
  if (!value) return [] as string[];
  const parts = value
    .split(/\r?\n|;|\u2022|\-|\*/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [value.trim()];
}

function readTimeFromText(text: string) {
  const words = text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildCurriculumFromLessons(lessons: LessonDto[]) {
  if (!lessons || lessons.length === 0) return [] as Course["curriculum"];
  const sorted = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const chunkSize = 6;
  const sections: Course["curriculum"] = [];
  for (let i = 0; i < sorted.length; i += chunkSize) {
    const chunk = sorted.slice(i, i + chunkSize);
    const duration = chunk.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    sections.push({
      title: `Phần ${Math.floor(i / chunkSize) + 1}`,
      lessons: chunk.length,
      duration: formatDuration(duration),
      items: chunk.map((lesson) => ({
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
      })),
    });
  }
  return sections;
}

function mapCommonCourse(dto: CourseListDto, locale: "vi" | "en" = "vi") {
  const totalDuration = dto.totalDurationMinutes ?? 0;
  return {
    id: String(dto.id),
    slug: dto.slug,
    title: dto.title,
    price: Number(dto.effectivePrice ?? dto.price),
    originalPrice: dto.originalPrice ?? undefined,
    image: resolveApiAsset(dto.thumbnailUrl),
    instructor: dto.instructorName?.trim() || "Đang cập nhật",
    instructorAvatar: dto.instructorAvatarUrl ?? undefined,
    duration: formatDuration(totalDuration),
    level: formatLevel(dto.level, locale),
    lessons: dto.totalLessons ?? 0,
    students: dto.studentCount ?? 0,
    rating: Number(dto.averageRating?.toFixed?.(1) ?? dto.averageRating ?? 0),
    category: dto.category?.title ?? "Khác",
    categorySlug: dto.category?.slug ?? "",
    description: dto.shortDescription ?? "",
    learningOutcomes: [],
    curriculum: [],
    language: formatLanguage(dto.language ?? "", locale),
  } as Course;
}

export function mapCourseList(dto: CourseListDto, locale: "vi" | "en" = "vi") {
  return mapCommonCourse(dto, locale);
}

export function mapCourseDetail(dto: CourseDetailDto, locale: "vi" | "en" = "vi") {
  const base = mapCommonCourse(dto, locale);
  const lessons = dto.lessons ?? [];
  const totalDuration = dto.totalDurationMinutes ?? lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  return {
    ...base,
    description: dto.description ?? base.description,
    learningOutcomes: splitLines(dto.outcome),
    requirements: splitLines(dto.requirements),
    previewVideoUrl: dto.previewVideoUrl,
    lessons: dto.totalLessons ?? lessons.length,
    duration: formatDuration(totalDuration),
    curriculum: buildCurriculumFromLessons(lessons),
  } as Course;
}

export function mapCourseCompare(dto: CourseCompareDto, locale: "vi" | "en" = "vi") {
  return {
    ...mapCommonCourse(dto, locale),
    description: dto.description ?? "",
    learningOutcomes: splitLines(dto.outcome),
    requirements: splitLines(dto.requirements),
  } as Course;
}

export async function fetchCategories() {
  const cats = await fetchJson<CategoryDto[]>("/api/categories");
  return cats;
}

export async function fetchCourses(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      search.set(key, String(value));
    });
  }
  const qs = search.toString();
  return fetchJson<CourseListDto[]>(`/api/courses${qs ? `?${qs}` : ""}`);
}

export async function fetchCourseBySlug(slug: string) {
  return fetchJson<CourseDetailDto>(`/api/courses/${slug}`);
}

export async function fetchCoursesByIds(ids: number[]) {
  if (!ids.length) return [] as CourseCompareDto[];
  const qs = ids.join(",");
  return fetchJson<CourseCompareDto[]>(`/api/courses/compare?ids=${qs}`);
}

export async function fetchCartItems() {
  return fetchJsonWithAuth<CartItemDto[]>("/api/cart");
}

export async function fetchWishlistItems() {
  return fetchJsonWithAuth<WishlistItemDto[]>("/api/wishlist");
}

export async function fetchBlogPosts(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      search.set(key, String(value));
    });
  }
  const qs = search.toString();
  return fetchJson<BlogPostListDto[]>(`/api/blog/posts${qs ? `?${qs}` : ""}`);
}

export async function fetchBlogPostDetail(slug: string) {
  return fetchJson<BlogPostDetailDto>(`/api/blog/posts/${slug}`);
}

export function mapBlogPostList(dto: BlogPostListDto): BlogPost {
  const dateValue = dto.publishedAt ?? dto.createdAt;
  const category = dto.tags?.[0] ?? "Tin tức";
  return {
    id: String(dto.id),
    title: dto.title,
    slug: dto.slug,
    excerpt: dto.summary,
    content: "",
    author: dto.authorName,
    date: dateValue,
    tags: dto.tags ?? [],
    image: resolveApiAsset(dto.coverImageUrl),
    locale: dto.locale,
    readTime: readTimeFromText(dto.summary ?? ""),
    views: 0,
    category,
  };
}

export function mapBlogPostDetail(dto: BlogPostDetailDto): BlogPost {
  const dateValue = dto.publishedAt ?? dto.createdAt;
  const category = dto.tags?.[0] ?? "Tin tức";
  return {
    id: String(dto.id),
    title: dto.title,
    slug: dto.slug,
    excerpt: dto.summary,
    content: dto.content,
    author: dto.authorName,
    date: dateValue,
    tags: dto.tags ?? [],
    image: resolveApiAsset(dto.coverImageUrl),
    locale: dto.locale,
    readTime: readTimeFromText(dto.content ?? dto.summary ?? ""),
    views: 0,
    category,
  };
}

export async function fetchEnrollments() {
  return fetchJsonWithAuth<EnrollmentDto[]>("/api/enrollments/my");
}

export async function fetchOrders() {
  return fetchJsonWithAuth<OrderDto[]>("/api/orders/my");
}

export async function fetchAddresses() {
  return fetchJsonWithAuth<AddressDto[]>("/api/addresses");
}

export async function createAddress(request: AddressCreateRequest) {
  return fetchJsonWithAuth<AddressDto>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateAddress(id: number, request: AddressUpdateRequest) {
  return fetchJsonWithAuth<void>(`/api/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteAddress(id: number) {
  return fetchJsonWithAuth<void>(`/api/addresses/${id}`, { method: "DELETE" });
}

export async function fetchAdminStatsOverview() {
  return fetchJsonWithAuth<AdminStatsOverviewDto>("/api/admin/stats/overview");
}

export async function fetchAdminOrders(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchJsonWithAuth<AdminOrderDto[]>(`/api/admin/orders${qs}`);
}

export async function updateAdminOrderStatus(id: number, status: string) {
  return fetchJsonWithAuth<void>(`/api/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminUsers() {
  return fetchJsonWithAuth<AdminUserDto[]>("/api/admin/users");
}

export async function updateAdminUserRoles(id: string, roles: string[]) {
  return fetchJsonWithAuth<void>(`/api/admin/users/${id}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roles }),
  });
}

export async function updateAdminUserStatus(id: string, isLocked: boolean) {
  return fetchJsonWithAuth<void>(`/api/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ isLocked }),
  });
}

export async function fetchAdminCategories() {
  return fetchJsonWithAuth<CategoryAdminDto[]>("/api/admin/categories");
}

export async function createAdminCategory(title: string) {
  return fetchJsonWithAuth<CategoryAdminDto>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateAdminCategory(id: number, title: string) {
  return fetchJsonWithAuth<void>(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function deleteAdminCategory(id: number) {
  return fetchJsonWithAuth<void>(`/api/admin/categories/${id}`, { method: "DELETE" });
}

export async function fetchAdminAuditLogs(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      search.set(key, String(value));
    });
  }
  const qs = search.toString();
  return fetchJsonWithAuth<AdminAuditLogDto[]>(`/api/admin/audit-logs${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminBlogPosts(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      search.set(key, String(value));
    });
  }
  const qs = search.toString();
  return fetchJsonWithAuth<BlogPostAdminDto[]>(`/api/admin/blog/posts${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminBlogPostDetail(slug: string) {
  return fetchJsonWithAuth<BlogPostDetailDto>(`/api/blog/posts/${slug}`);
}

export async function createAdminBlogPost(payload: {
  title: string;
  summary: string;
  content: string;
  authorName: string;
  locale: string;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImageUrl?: string | null;
  slug?: string | null;
}) {
  return fetchJsonWithAuth<BlogPostDetailDto>("/api/admin/blog/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlogPost(id: number, payload: {
  title: string;
  summary: string;
  content: string;
  authorName: string;
  locale: string;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImageUrl?: string | null;
  slug?: string | null;
}) {
  return fetchJsonWithAuth<void>(`/api/admin/blog/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlogPost(id: number) {
  return fetchJsonWithAuth<void>(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
}

export async function fetchAdminSettings() {
  return fetchJsonWithAuth<SystemSettingDto[]>("/api/admin/settings");
}

export async function updateAdminSetting(key: string, request: SystemSettingUpdateRequest) {
  return fetchJsonWithAuth<SystemSettingDto>(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function clearAdminCache() {
  return fetchJsonWithAuth<{ message: string; version: string }>("/api/admin/cache/clear", { method: "POST" });
}

export async function fetchAdminCoupons(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJsonWithAuth<CouponDto[]>(`/api/admin/coupons${qs}`);
}

export async function createAdminCoupon(request: CouponCreateRequest) {
  return fetchJsonWithAuth<CouponDto>("/api/admin/coupons", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateAdminCoupon(id: number, request: CouponCreateRequest) {
  return fetchJsonWithAuth<void>(`/api/admin/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteAdminCoupon(id: number) {
  return fetchJsonWithAuth<void>(`/api/admin/coupons/${id}`, { method: "DELETE" });
}

export async function validateCoupon(code: string, subtotal: number) {
  const qs = new URLSearchParams({ code, subtotal: String(subtotal) });
  return fetchJson<CouponValidateResponse>(`/api/coupons/validate?${qs.toString()}`);
}

export async function fetchBlogComments(slug: string) {
  return fetchJson<BlogComment[]>(`/api/blog/posts/${slug}/comments`);
}

export async function createBlogComment(slug: string, content: string) {
  return fetchJsonWithAuth<BlogComment>(`/api/blog/posts/${slug}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function toggleBlogCommentLike(commentId: number) {
  return fetchJsonWithAuth<BlogCommentLikeResponse>(`/api/blog/comments/${commentId}/like`, {
    method: "POST",
  });
}




