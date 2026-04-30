"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { pickLocaleText, type AppLocale } from "@/lib/i18n";

export interface InstructorCourse {
  id: string;
  numericId: number;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  previewVideoUrl?: string;
  duration: string;
  lessons: number;
  status: "draft" | "pending" | "published" | "rejected";
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  students: number;
  rating: number;
  revenue: number;
  learningOutcomes: string[];
  requirements: string[];
  curriculum: CurriculumSection[];
  rejectionReason?: string;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
  duration: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document" | "quiz";
  free?: boolean;
}

export interface InstructorStats {
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalRevenue: number;
  avgRating: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
}

interface InstructorContextType {
  courses: InstructorCourse[];
  stats: InstructorStats;
  createCourse: (
    course: Omit<InstructorCourse, "id" | "numericId" | "createdAt" | "students" | "rating" | "revenue">
  ) => Promise<{ success: boolean; message: string; courseId?: string }>;
  updateCourse: (courseId: string, updates: Partial<InstructorCourse>) => Promise<{ success: boolean; message: string }>;
  deleteCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  submitForReview: (courseId: string) => Promise<{ success: boolean; message: string }>;
  refreshStats: () => void;
}

const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

const tr = (locale: AppLocale, en: string, vi: string, es?: string, fr?: string) =>
  pickLocaleText(locale, en, vi, es, fr);

function buildMockInstructorCourses(locale: AppLocale): InstructorCourse[] {
  return [
    {
      id: "ic1",
      numericId: 101,
      title: tr(locale, "Mastering Figma: From Basics to Advanced", "Mastering Figma: Từ cơ bản đến nâng cao"),
      description: tr(locale, "A complete Figma course for designers.", "Khóa học toàn diện về Figma cho designer."),
      category: tr(locale, "UX/UI Design", "Thiết kế UX/UI"),
      level: tr(locale, "Intermediate", "Trung cấp"),
      price: 299000,
      originalPrice: 399000,
      thumbnail: "https://images.unsplash.com/photo-1618788372246-79faff0c3742",
      previewVideoUrl: "",
      duration: tr(locale, "8 hours", "8 giờ"),
      lessons: 45,
      status: "published",
      createdAt: "2024-02-01",
      publishedAt: "2024-02-15",
      students: 234,
      rating: 4.7,
      revenue: 69966000,
      learningOutcomes: [
        tr(locale, "Master Figma from basics to advanced", "Thành thạo Figma từ cơ bản đến nâng cao"),
        tr(locale, "Create professional design systems", "Tạo design system chuyên nghiệp"),
        tr(locale, "Work efficiently with teams", "Làm việc hiệu quả với team"),
        tr(locale, "Build interactive prototypes", "Prototype tương tác"),
      ],
      requirements: [
        tr(locale, "Basic knowledge of design", "Có kiến thức cơ bản về thiết kế"),
        tr(locale, "A computer with internet access", "Máy tính có kết nối Internet"),
      ],
      curriculum: [
        {
          id: "s1",
          title: tr(locale, "Introduction to Figma", "Giới thiệu Figma"),
          duration: tr(locale, "45 minutes", "45 phút"),
          lessons: [
            { id: "l1", title: tr(locale, "Install and set up", "Cài đặt và thiết lập"), duration: tr(locale, "15 minutes", "15 phút"), type: "video" },
            { id: "l2", title: tr(locale, "Figma interface", "Giao diện Figma"), duration: tr(locale, "20 minutes", "20 phút"), type: "video" },
            { id: "l3", title: tr(locale, "Hands-on exercise", "Bài tập thực hành"), duration: tr(locale, "10 minutes", "10 phút"), type: "quiz" },
          ],
        },
      ],
    },
    {
      id: "ic2",
      numericId: 102,
      title: tr(locale, "User Research Methods Complete Guide", "Hướng dẫn đầy đủ về phương pháp nghiên cứu người dùng"),
      description: tr(locale, "A detailed guide to user research methods.", "Hướng dẫn chi tiết về các phương pháp nghiên cứu người dùng."),
      category: tr(locale, "UX Research", "Nghiên cứu UX"),
      level: tr(locale, "Advanced", "Nâng cao"),
      price: 399000,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      previewVideoUrl: "",
      duration: tr(locale, "10 hours", "10 giờ"),
      lessons: 52,
      status: "pending",
      createdAt: "2024-03-10",
      students: 0,
      rating: 0,
      revenue: 0,
      learningOutcomes: [
        tr(locale, "Plan user research activities", "Lập kế hoạch nghiên cứu người dùng"),
        tr(locale, "Conduct interviews and surveys", "Thực hiện phỏng vấn và khảo sát"),
        tr(locale, "Analyze and synthesize insights", "Phân tích và tổng hợp insights"),
      ],
      requirements: [tr(locale, "Experience with UX/UI design", "Kinh nghiệm thiết kế UX/UI")],
      curriculum: [],
    },
    {
      id: "ic3",
      numericId: 103,
      title: tr(locale, "Design Thinking Workshop", "Workshop tư duy thiết kế"),
      description: tr(locale, "A practical Design Thinking workshop.", "Workshop thực hành Design Thinking."),
      category: tr(locale, "UX/UI Design", "Thiết kế UX/UI"),
      level: tr(locale, "Beginner", "Cơ bản"),
      price: 199000,
      originalPrice: 299000,
      duration: tr(locale, "5 hours", "5 giờ"),
      lessons: 20,
      status: "draft",
      createdAt: "2024-04-01",
      students: 0,
      rating: 0,
      revenue: 0,
      learningOutcomes: [],
      requirements: [],
      curriculum: [],
    },
  ];
}

function normalizeInstructorCourse(course: InstructorCourse): InstructorCourse {
  return {
    ...course,
    numericId:
      Number.isFinite(course.numericId) && course.numericId > 0
        ? course.numericId
        : Number(course.id.replace(/\D/g, "")) || Date.now(),
  };
}

export function InstructorProvider({ children }: { children: ReactNode }) {
  const { user, isInstructor } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<InstructorCourse[]>(() =>
    buildMockInstructorCourses(language).map(normalizeInstructorCourse)
  );
  const [isHydrated, setHydrated] = useState(false);
  const [hasStoredCourses, setHasStoredCourses] = useState(false);
  const [stats, setStats] = useState<InstructorStats>({
    totalCourses: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    revenueGrowth: 0,
  });

  useEffect(() => {
    if (!isInstructor || !user) {
      return;
    }

    const userCourses = courses.filter(() => true);
    const publishedCourses = userCourses.filter((course) => course.status === "published");
    const totalStudents = publishedCourses.reduce((sum, course) => sum + course.students, 0);
    const totalRevenue = publishedCourses.reduce((sum, course) => sum + course.revenue, 0);
    const avgRating =
      publishedCourses.length > 0
        ? publishedCourses.reduce((sum, course) => sum + course.rating, 0) / publishedCourses.length
        : 0;

    const thisMonthRevenue = totalRevenue * 0.3;
    const lastMonthRevenue = totalRevenue * 0.25;
    const revenueGrowth =
      lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    setStats({
      totalCourses: userCourses.length,
      publishedCourses: publishedCourses.length,
      pendingCourses: userCourses.filter((course) => course.status === "pending").length,
      draftCourses: userCourses.filter((course) => course.status === "draft").length,
      totalStudents,
      totalRevenue,
      avgRating,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
    });
  }, [courses, isInstructor, user]);

  useEffect(() => {
    if (hasStoredCourses) {
      return;
    }

    setCourses(buildMockInstructorCourses(language).map(normalizeInstructorCourse));
  }, [hasStoredCourses, language]);

  useEffect(() => {
    setHydrated(true);

    try {
      const stored = window.localStorage.getItem("instructor_courses");
      if (stored) {
        const parsed = JSON.parse(stored) as InstructorCourse[];
        setCourses(parsed.map(normalizeInstructorCourse));
        setHasStoredCourses(true);
      } else {
        setCourses(buildMockInstructorCourses(language).map(normalizeInstructorCourse));
      }
    } catch {
      // Keep in-memory mock data if storage fails.
    }
  }, [language]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem("instructor_courses", JSON.stringify(courses));
    } catch {
      // Ignore storage failures in private mode / restricted environments.
    }
  }, [courses, isHydrated]);

  const createCourse = async (
    courseData: Omit<InstructorCourse, "id" | "numericId" | "createdAt" | "students" | "rating" | "revenue">
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!isInstructor) {
      return { success: false, message: tr(language, "Only instructors can create courses.", "Chỉ giảng viên mới có thể tạo khóa học.") };
    }

    const newCourse: InstructorCourse = {
      ...courseData,
      id: `ic${Date.now()}`,
      numericId: Date.now(),
      createdAt: new Date().toISOString(),
      students: 0,
      rating: 0,
      revenue: 0,
    };

    setCourses((prev) => [...prev, newCourse]);
    return { success: true, message: tr(language, "Course created successfully!", "Tạo khóa học thành công!"), courseId: newCourse.id };
  };

  const updateCourse = async (courseId: string, updates: Partial<InstructorCourse>) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, ...updates, updatedAt: new Date().toISOString() } : course
      )
    );

    return { success: true, message: tr(language, "Course updated successfully!", "Cập nhật khóa học thành công!") };
  };

  const deleteCourse = async (courseId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const course = courses.find((item) => item.id === courseId);
    if (course?.status === "published") {
      return {
        success: false,
        message: tr(language, "Cannot delete an approved course.", "Không thể xóa khóa học đã được phê duyệt."),
      };
    }

    setCourses((prev) => prev.filter((item) => item.id !== courseId));
    return { success: true, message: tr(language, "Course deleted successfully!", "Xóa khóa học thành công!") };
  };

  const submitForReview = async (courseId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const course = courses.find((item) => item.id === courseId);
    if (!course) {
      return { success: false, message: tr(language, "Course not found.", "Không tìm thấy khóa học.") };
    }

    if (course.status !== "draft") {
      return {
        success: false,
        message: tr(language, "Only draft courses can be submitted.", "Chỉ có thể gửi khóa học ở trạng thái nháp."),
      };
    }

    if (!course.title || !course.description) {
      return {
        success: false,
        message: tr(language, "Please complete all course information.", "Vui lòng điền đầy đủ thông tin khóa học."),
      };
    }

    if (course.learningOutcomes.length === 0) {
      return { success: false, message: tr(language, "Please add learning outcomes.", "Vui lòng thêm mục tiêu học tập.") };
    }

    if (course.curriculum.length === 0) {
      return { success: false, message: tr(language, "Please add curriculum content.", "Vui lòng thêm nội dung chương trình học.") };
    }

    setCourses((prev) =>
      prev.map((item) =>
        item.id === courseId ? { ...item, status: "pending", updatedAt: new Date().toISOString() } : item
      )
    );

    return {
      success: true,
      message: tr(
        language,
        "Course submitted for review. We will respond within 3-5 business days.",
        "Đã gửi khóa học để xem xét. Chúng tôi sẽ phản hồi trong vòng 3-5 ngày làm việc."
      ),
    };
  };

  const refreshStats = () => {
    setCourses((prev) => [...prev]);
  };

  return (
    <InstructorContext.Provider
      value={{
        courses,
        stats,
        createCourse,
        updateCourse,
        deleteCourse,
        submitForReview,
        refreshStats,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error("useInstructor must be used within InstructorProvider");
  }
  return context;
}
