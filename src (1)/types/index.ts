/**
 * Global TypeScript Type Definitions
 * Comprehensive type safety for the entire application
 */

// ─────────────────────────────────────────────────────────────────────────────
// Common Types
// ─────────────────────────────────────────────────────────────────────────────

export type ID = string;
export type Timestamp = string; // ISO 8601 format
export type URL = string;
export type Email = string;
export type PhoneNumber = string;

export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Currency = 'VND' | 'USD' | 'EUR';
export type Language = 'vi' | 'en';

// ─────────────────────────────────────────────────────────────────────────────
// User & Auth Types
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: ID;
  name: string;
  email: Email;
  avatar?: URL;
  role: UserRole;
  points: number;
  level: UserLevel;
  joinDate: Timestamp;
  phone?: PhoneNumber;
  bio?: string;
  status?: Status;
  emailVerified?: boolean;
  lastLogin?: Timestamp;
  preferences?: UserPreferences;
}

export type UserRole = 'user' | 'admin' | 'instructor' | 'moderator';
export type UserLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface UserPreferences {
  language: Language;
  currency: Currency;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Session {
  user: User;
  tokens: AuthTokens;
  expiresAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Course {
  id: ID;
  title: string;
  description: string;
  instructor: string;
  instructorId?: ID;
  category: string;
  categoryId?: ID;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  currency: Currency;
  thumbnail: URL;
  images?: URL[];
  rating: number;
  reviewCount: number;
  students: number;
  duration: string;
  lessons: number;
  language: string;
  certificate: boolean;
  tags?: string[];
  requirements?: string[];
  whatYouLearn?: string[];
  curriculum?: CourseCurriculum[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;
  status: Status;
  featured?: boolean;
  bestseller?: boolean;
}

export type CourseLevel = 'Cơ bản' | 'Trung cấp' | 'Nâng cao';

export interface CourseCurriculum {
  id: ID;
  title: string;
  lessons: CourseLesson[];
  duration: string;
}

export interface CourseLesson {
  id: ID;
  title: string;
  duration: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  free?: boolean;
  completed?: boolean;
}

export interface CourseCategory {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  courseCount?: number;
  order?: number;
  parent?: ID;
}

export interface CourseReview {
  id: ID;
  courseId: ID;
  userId: ID;
  userName: string;
  userAvatar?: URL;
  rating: number;
  title?: string;
  comment: string;
  helpful: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  verified?: boolean;
}

export interface CourseProgress {
  courseId: ID;
  userId: ID;
  progress: number; // 0-100
  completedLessons: ID[];
  lastAccessedLesson?: ID;
  lastAccessedAt?: Timestamp;
  completedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order & Payment Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Order {
  id: ID;
  userId: ID;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  customerInfo: CustomerInfo;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  paidAt?: Timestamp;
  completedAt?: Timestamp;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'vnpay' | 'zalopay' | 'cod' | 'banking' | 'credit_card';

export interface OrderItem {
  id: ID;
  courseId: ID;
  courseName: string;
  courseImage: URL;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: Email;
  phone: PhoneNumber;
  address?: string;
  city?: string;
  country?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartItem {
  courseId: ID;
  course: Course;
  addedAt: Timestamp;
}

export interface Coupon {
  id: ID;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: Timestamp;
  endDate: Timestamp;
  usageLimit?: number;
  usageCount: number;
  status: Status;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: ID;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: URL;
  category: string;
  categoryId?: ID;
  author: string;
  authorId?: ID;
  authorAvatar?: URL;
  tags: string[];
  views: number;
  likes: number;
  commentCount: number;
  readTime: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status: Status;
  featured?: boolean;
  seo?: SEOMetadata;
}

export interface BlogCategory {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogComment {
  id: ID;
  postId: ID;
  userId: ID;
  userName: string;
  userAvatar?: URL;
  content: string;
  parentId?: ID;
  likes: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Analytics {
  overview: AnalyticsOverview;
  revenue: RevenueAnalytics;
  courses: CourseAnalytics;
  users: UserAnalytics;
  traffic: TrafficAnalytics;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalCourses: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  courseGrowth: number;
}

export interface RevenueAnalytics {
  daily: DataPoint[];
  weekly: DataPoint[];
  monthly: DataPoint[];
  yearly: DataPoint[];
  topCourses: { course: Course; revenue: number }[];
}

export interface CourseAnalytics {
  topRated: Course[];
  mostEnrolled: Course[];
  trending: Course[];
  recentlyAdded: Course[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retention: number;
  demographics: Demographic[];
}

export interface TrafficAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  sources: TrafficSource[];
  topPages: PageView[];
}

export interface DataPoint {
  date: Timestamp;
  value: number;
}

export interface Demographic {
  label: string;
  value: number;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface PageView {
  path: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: URL;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: URL;
  canonical?: URL;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  image?: URL;
  link?: string;
  read: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

export type NotificationType =
  | 'order'
  | 'course'
  | 'review'
  | 'comment'
  | 'system'
  | 'promotion'
  | 'achievement';

// ─────────────────────────────────────────────────────────────────────────────
// Activity Log Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: ID;
  userId?: ID;
  userName?: string;
  action: string;
  entity: string;
  entityId?: ID;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// System Config Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemConfig {
  id: ID;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  updatedAt: Timestamp;
  updatedBy?: ID;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Awaited<T> = T extends Promise<infer U> ? U : T;
