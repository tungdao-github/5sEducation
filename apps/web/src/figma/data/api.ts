import { fetchJson, fetchJsonWithAuth, resolveApiAsset } from "@/lib/api";
import type { AppLocale } from "@/lib/i18n";
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
  videoUrl?: string;
  sortOrder: number;
  hasExercise?: boolean;
  exercise?: LessonExerciseDto | null;
};

export type LessonExerciseQuestionDto = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
};

export type LessonExerciseDto = {
  passingPercent: number;
  timeLimitSeconds: number;
  maxTabSwitches: number;
  questions: LessonExerciseQuestionDto[];
};

export type LessonExerciseAnswerSubmissionDto = {
  questionId: number;
  selectedOption: number;
};

export type LessonExerciseQuestionResultDto = {
  questionId: number;
  question: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
};

export type LessonExerciseStatusDto = {
  lessonId: number;
  passed: boolean;
  attemptCount: number;
  bestScorePercent: number;
  lastScorePercent?: number | null;
  lastCorrectAnswers?: number | null;
  lastTotalQuestions?: number | null;
  lastPassed?: boolean | null;
  lastTimedOut?: boolean | null;
  lastTabViolation?: boolean | null;
  lastTabSwitchCount?: number | null;
  passingPercent: number;
  timeLimitSeconds: number;
  maxTabSwitches: number;
  lastAttemptedAt?: string | null;
};

export type LessonExerciseResultDto = {
  isCorrect: boolean;
  passed: boolean;
  attemptCount: number;
  scorePercent: number;
  passingPercent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  allowedTimeSeconds: number;
  timedOut: boolean;
  tabSwitchCount: number;
  allowedTabSwitches: number;
  tabViolation: boolean;
  messageCode: string;
  message: string;
  questionResults: LessonExerciseQuestionResultDto[];
};

export type ProgressSnapshotDto = {
  courseId: number;
  lastLessonId?: number | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  completedLessonIds: number[];
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

export type LearningPathListDto = {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  thumbnailUrl?: string | null;
  estimatedHours?: number | null;
  courseCount: number;
  isPublished: boolean;
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

export type ReviewDto = {
  id: number;
  courseId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userId?: string;
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

export type CourseModel = Course;

export type LearningLesson = {
  id: string;
  numericId: number;
  courseId: number;
  sectionId: string;
  title: string;
  type: "video" | "quiz";
  duration: string;
  durationMinutes: number;
  videoUrl: string;
  isPreview: boolean;
  description: string;
  resources: Array<{
    id: string;
    title: string;
    url: string;
    type: "pdf" | "link" | "zip" | "file";
    size?: string;
  }>;
  exercise?: {
    id: string;
    title: string;
    description: string;
    passingScore: number;
    timeLimit: number;
    maxTabSwitches: number;
    questions: Array<{
      id: string;
      numericId: number;
      question: string;
      options: string[];
    }>;
  };
};

export type LearningSection = {
  id: string;
  title: string;
  lessons: LearningLesson[];
  duration: string;
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

export type PublicStatsDto = {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  averageRating: number;
  totalReviews: number;
};

export type CourseManageDto = {
  id: number;
  title: string;
  slug: string;
  price: number;
  flashSalePrice?: number | null;
  flashSaleStartsAt?: string | null;
  flashSaleEndsAt?: string | null;
  thumbnailUrl: string;
  level: string;
  language: string;
  isPublished: boolean;
  studentCount: number;
  averageRating: number;
  reviewCount: number;
  revenue: number;
  totalLessons: number;
  updatedAt?: string | null;
  category?: CategoryDto | null;
  instructorName?: string | null;
  instructorAvatarUrl?: string | null;
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
  Beginner: "So c?p",
  Intermediate: "Trung c?p",
  Advanced: "Nâng cao",
  "All Levels": "Phù h?p m?i trình d?",
  "All levels": "Phù h?p m?i trình d?",
};

const languageLabels: Record<string, string> = {
  English: "Ti?ng Anh",
  Vietnamese: "Ti?ng Vi?t",
};

export function formatLevel(level: string, locale: AppLocale = "vi") {
  if (locale !== "vi") return level;
  return levelLabels[level] ?? level;
}

export function formatLanguage(language: string, locale: AppLocale = "vi") {
  if (locale !== "vi") return language;
  return languageLabels[language] ?? language;
}

export function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} phút`;
  if (m === 0) return `${h} gi?`;
  return `${h} gi? ${m} phút`;
}

export function normalizeCurrency(amount: number) {
  if (!Number.isFinite(amount)) return 0;
  return amount >= 1000 ? amount : amount * 1000;
}

export function formatPrice(amount: number, locale: string = "vi-VN") {
  const normalized = normalizeCurrency(amount);
  return `${normalized.toLocaleString(locale)}d`;
}

export function formatPriceCompact(amount: number, locale: string = "vi-VN") {
  const normalized = normalizeCurrency(amount);
  if (normalized >= 1000) {
    return `${Math.round(normalized / 1000).toLocaleString(locale)}K?`;
  }
  return `${normalized.toLocaleString(locale)}d`;
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
      title: `Ph?n ${Math.floor(i / chunkSize) + 1}`,
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

export function buildLearningSections(lessons: LessonDto[]): LearningSection[] {
  if (!lessons.length) return [] as LearningSection[];

  const chunkSize = 8;
  const sorted = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);

  return Array.from({ length: Math.ceil(sorted.length / chunkSize) }).map((_, index) => {
    const chunk = sorted.slice(index * chunkSize, index * chunkSize + chunkSize);
    const minutes = chunk.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);
    const sectionId = `section-${index + 1}`;

    return {
      id: sectionId,
      title: `Ph?n ${index + 1}`,
      duration: formatDuration(minutes),
      lessons: chunk.map((lesson) => ({
        id: String(lesson.id),
        numericId: lesson.id,
        courseId: lesson.courseId,
        sectionId,
        title: lesson.title,
        type: lesson.contentType === "exercise" ? "quiz" : "video",
        duration: formatDuration(lesson.durationMinutes),
        durationMinutes: lesson.durationMinutes,
        videoUrl: lesson.videoUrl || "",
        isPreview: false,
        description:
          lesson.contentType === "exercise" ? "Bài ki?m tra cu?i bài h?c." : "Video bài gi?ng.",
        resources: [] as LearningLesson["resources"],
        exercise: lesson.exercise
          ? {
              id: `exercise-${lesson.id}`,
              title: lesson.title,
              description: "Hoàn thành bài ki?m tra d? m? khóa ti?n d? h?c t?p.",
              passingScore: lesson.exercise.passingPercent,
              timeLimit: Math.round((lesson.exercise.timeLimitSeconds || 0) / 60),
              maxTabSwitches: lesson.exercise.maxTabSwitches,
              questions: lesson.exercise.questions.map((question) => ({
                id: String(question.id),
                numericId: question.id,
                question: question.question,
                options: [question.optionA, question.optionB, question.optionC, question.optionD],
              })),
            }
          : undefined,
      })),
    };
  });
}

function mapCommonCourse(dto: CourseListDto, locale: AppLocale = "vi") {
  const totalDuration = dto.totalDurationMinutes ?? 0;
  return {
    id: String(dto.id),
    slug: dto.slug,
    title: dto.title,
    price: Number(dto.effectivePrice ?? dto.price),
    originalPrice: dto.originalPrice ?? undefined,
    image: resolveApiAsset(dto.thumbnailUrl),
    instructor: dto.instructorName?.trim() || "Ðang c?p nh?t",
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

export function mapCourseList(dto: CourseListDto, locale: AppLocale = "vi") {
  return mapCommonCourse(dto, locale);
}

export function mapCourseDetail(dto: CourseDetailDto, locale: AppLocale = "vi") {
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

export function mapCourseCompare(dto: CourseCompareDto, locale: AppLocale = "vi") {
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

export async function fetchLearningPaths() {
  return fetchJson<LearningPathListDto[]>("/api/learning-paths");
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

export async function fetchCourseById(id: number | string) {
  return fetchJson<CourseDetailDto>(`/api/courses/by-id/${id}`);
}

export async function fetchCoursesByIds(ids: number[]) {
  if (!ids.length) return [] as CourseCompareDto[];
  const qs = ids.join(",");
  return fetchJson<CourseCompareDto[]>(`/api/courses/compare?ids=${qs}`);
}

export async function fetchCourseCompare(ids: Array<number | string>) {
  const normalized = ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
  if (!normalized.length) return [] as CourseCompareDto[];
  return fetchJson<CourseCompareDto[]>(`/api/courses/compare?ids=${normalized.join(",")}`);
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

export async function fetchCourseReviews(courseId: number | string) {
  return fetchJson<ReviewDto[]>(`/api/reviews?courseId=${courseId}`);
}

export async function upsertCourseReview(courseId: number | string, rating: number, comment: string) {
  return fetchJsonWithAuth<void>("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ courseId: Number(courseId), rating, comment }),
  });
}

export async function deleteCourseReview(courseId: number | string) {
  return fetchJsonWithAuth<void>(`/api/reviews/${courseId}`, { method: "DELETE" });
}

export function mapBlogPostList(dto: BlogPostListDto): BlogPost {
  const dateValue = dto.publishedAt ?? dto.createdAt;
  const category = dto.tags?.[0] ?? "Tin t?c";
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
  const category = dto.tags?.[0] ?? "Tin t?c";
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

export async function fetchStatsSummary() {
  return fetchJson<PublicStatsDto>("/api/stats/summary");
}

export async function fetchInstructorCourses() {
  return fetchJsonWithAuth<CourseManageDto[]>("/api/instructor/courses");
}

export async function fetchInstructorCourseById(id: number | string) {
  return fetchJsonWithAuth<CourseDetailDto>(`/api/instructor/courses/${id}`);
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

export type CourseMutationInput = {
  title: string;
  categoryId?: number | null;
  shortDescription: string;
  description: string;
  outcome: string;
  requirements: string;
  language: string;
  price: number;
  flashSalePrice?: number | null;
  flashSaleStartsAt?: string | null;
  flashSaleEndsAt?: string | null;
  level: string;
  previewVideoUrl?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  thumbnailFile?: File | null;
};

function buildCourseFormData(input: CourseMutationInput) {
  const formData = new FormData();
  formData.append("Title", input.title);
  if (input.categoryId) formData.append("CategoryId", String(input.categoryId));
  formData.append("ShortDescription", input.shortDescription);
  formData.append("Description", input.description);
  formData.append("Outcome", input.outcome);
  formData.append("Requirements", input.requirements);
  formData.append("Language", input.language);
  formData.append("Price", String(input.price));
  if (input.flashSalePrice !== undefined && input.flashSalePrice !== null) {
    formData.append("FlashSalePrice", String(input.flashSalePrice));
  }
  if (input.flashSaleStartsAt) formData.append("FlashSaleStartsAt", input.flashSaleStartsAt);
  if (input.flashSaleEndsAt) formData.append("FlashSaleEndsAt", input.flashSaleEndsAt);
  formData.append("Level", input.level);
  formData.append("PreviewVideoUrl", input.previewVideoUrl ?? "");
  formData.append("ThumbnailUrl", input.thumbnailUrl ?? "");
  formData.append("IsPublished", String(input.isPublished));
  if (input.thumbnailFile) formData.append("Thumbnail", input.thumbnailFile);
  return formData;
}

export async function createCourse(input: CourseMutationInput) {
  return fetchJsonWithAuth<CourseDetailDto>("/api/courses", {
    method: "POST",
    body: buildCourseFormData(input),
  });
}

export async function updateCourse(id: number | string, input: CourseMutationInput) {
  return fetchJsonWithAuth<void>(`/api/courses/${id}`, {
    method: "PUT",
    body: buildCourseFormData(input),
  });
}

export async function deleteCourse(id: number | string) {
  return fetchJsonWithAuth<void>(`/api/courses/${id}`, { method: "DELETE" });
}

export type LessonMutationInput = {
  courseId: number;
  title: string;
  contentType: "video" | "exercise";
  durationMinutes: number;
  videoUrl?: string;
  exerciseQuestion?: string;
  exerciseOptionA?: string;
  exerciseOptionB?: string;
  exerciseOptionC?: string;
  exerciseOptionD?: string;
  exerciseCorrectOption?: number;
  exerciseExplanation?: string;
  exercisePassingPercent?: number;
  exerciseTimeLimitMinutes?: number;
  exerciseMaxTabSwitches?: number;
  exerciseQuestions?: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: number;
    explanation?: string;
    sortOrder?: number;
  }>;
  sortOrder?: number;
};

export async function fetchLessons(courseId: number | string) {
  return fetchJsonWithAuth<LessonDto[]>(`/api/lessons?courseId=${courseId}`);
}

export async function createLesson(input: LessonMutationInput) {
  return fetchJsonWithAuth<void>("/api/lessons", {
    method: "POST",
    body: JSON.stringify({
      courseId: input.courseId,
      title: input.title,
      contentType: input.contentType,
      durationMinutes: input.durationMinutes,
      videoUrl: input.videoUrl ?? "",
      exerciseQuestion: input.exerciseQuestion ?? "",
      exerciseOptionA: input.exerciseOptionA ?? "",
      exerciseOptionB: input.exerciseOptionB ?? "",
      exerciseOptionC: input.exerciseOptionC ?? "",
      exerciseOptionD: input.exerciseOptionD ?? "",
      exerciseCorrectOption: input.exerciseCorrectOption,
      exerciseExplanation: input.exerciseExplanation ?? "",
      exercisePassingPercent: input.exercisePassingPercent ?? 80,
      exerciseTimeLimitMinutes: input.exerciseTimeLimitMinutes ?? 0,
      exerciseMaxTabSwitches: input.exerciseMaxTabSwitches ?? 2,
      exerciseQuestions: input.exerciseQuestions ?? [],
      sortOrder: input.sortOrder ?? 0,
    }),
  });
}

export async function fetchProgress(courseId: number | string) {
  return fetchJsonWithAuth<ProgressSnapshotDto>(`/api/progress/${courseId}`);
}

export async function updateCourseProgress(payload: {
  courseId: number;
  lessonId: number;
  isCompleted?: boolean;
  setAsLast?: boolean;
}) {
  return fetchJsonWithAuth<ProgressSnapshotDto>("/api/progress", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLessonExerciseStatus(lessonId: number | string) {
  return fetchJsonWithAuth<LessonExerciseStatusDto>(`/api/lessons/${lessonId}/exercise/status`);
}

export async function submitLessonExercise(
  lessonId: number | string,
  payload: {
    selectedOption?: number;
    answers?: LessonExerciseAnswerSubmissionDto[];
    startedAtUtc?: string;
    tabSwitchCount?: number;
  },
) {
  return fetchJsonWithAuth<LessonExerciseResultDto>(`/api/lessons/${lessonId}/exercise/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
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









