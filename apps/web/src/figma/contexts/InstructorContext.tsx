"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface InstructorCourse {
  id: string;
  numericId: number;
  title: string;
  description: string;
  category: string;
  level: 'CÆ¡ báº£n' | 'Trung cáº¥p' | 'NÃ¢ng cao';
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  duration: string;
  lessons: number;
  status: 'draft' | 'pending' | 'published' | 'rejected';
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
  type: 'video' | 'document' | 'quiz';
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
  createCourse: (course: Omit<InstructorCourse, 'id' | 'numericId' | 'createdAt' | 'students' | 'rating' | 'revenue'>) => Promise<{ success: boolean; message: string; courseId?: string }>;
  updateCourse: (courseId: string, updates: Partial<InstructorCourse>) => Promise<{ success: boolean; message: string }>;
  deleteCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  submitForReview: (courseId: string) => Promise<{ success: boolean; message: string }>;
  refreshStats: () => void;
}

const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

// Mock data for instructor courses
const mockInstructorCourses: InstructorCourse[] = [
  {
    id: 'ic1',
    numericId: 101,
    title: 'Mastering Figma: From Basics to Advanced',
    description: 'KhÃ³a há»c toÃ n diá»‡n vá» Figma cho designer',
    category: 'Thiáº¿t káº¿ UX/UI',
    level: 'Trung cáº¥p',
    price: 299000,
    originalPrice: 399000,
    thumbnail: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742',
    duration: '8 giá»',
    lessons: 45,
    status: 'published',
    createdAt: '2024-02-01',
    publishedAt: '2024-02-15',
    students: 234,
    rating: 4.7,
    revenue: 69966000,
    learningOutcomes: [
      'ThÃ nh tháº¡o Figma tá»« cÆ¡ báº£n Ä‘áº¿n nÃ¢ng cao',
      'Táº¡o design system chuyÃªn nghiá»‡p',
      'LÃ m viá»‡c hiá»‡u quáº£ vá»›i team',
      'Prototype interactive designs'
    ],
    requirements: ['CÃ³ kiáº¿n thá»©c cÆ¡ báº£n vá» thiáº¿t káº¿', 'MÃ¡y tÃ­nh cÃ³ káº¿t ná»‘i Internet'],
    curriculum: [
      {
        id: 's1',
        title: 'Giá»›i thiá»‡u Figma',
        duration: '45 phÃºt',
        lessons: [
          { id: 'l1', title: 'CÃ i Ä‘áº·t vÃ  thiáº¿t láº­p', duration: '15 phÃºt', type: 'video' },
          { id: 'l2', title: 'Giao diá»‡n Figma', duration: '20 phÃºt', type: 'video' },
          { id: 'l3', title: 'BÃ i táº­p thá»±c hÃ nh', duration: '10 phÃºt', type: 'quiz' }
        ]
      }
    ]
  },
  {
    id: 'ic2',
    numericId: 102,
    title: 'User Research Methods Complete Guide',
    description: 'HÆ°á»›ng dáº«n chi tiáº¿t vá» cÃ¡c phÆ°Æ¡ng phÃ¡p nghiÃªn cá»©u ngÆ°á»i dÃ¹ng',
    category: 'NghiÃªn cá»©u UX',
    level: 'NÃ¢ng cao',
    price: 399000,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    duration: '10 giá»',
    lessons: 52,
    status: 'pending',
    createdAt: '2024-03-10',
    students: 0,
    rating: 0,
    revenue: 0,
    learningOutcomes: [
      'Láº­p káº¿ hoáº¡ch nghiÃªn cá»©u ngÆ°á»i dÃ¹ng',
      'Thá»±c hiá»‡n interviews vÃ  surveys',
      'PhÃ¢n tÃ­ch vÃ  tá»•ng há»£p insights'
    ],
    requirements: ['Kinh nghiá»‡m thiáº¿t káº¿ UX/UI'],
    curriculum: []
  },
  {
    id: 'ic3',
    numericId: 103,
    title: 'Design Thinking Workshop',
    description: 'Workshop thá»±c hÃ nh Design Thinking',
    category: 'Thiáº¿t káº¿ UX/UI',
    level: 'CÆ¡ báº£n',
    price: 199000,
    originalPrice: 299000,
    duration: '5 giá»',
    lessons: 20,
    status: 'draft',
    createdAt: '2024-04-01',
    students: 0,
    rating: 0,
    revenue: 0,
    learningOutcomes: [],
    requirements: [],
    curriculum: []
  }
];

function normalizeInstructorCourse(course: InstructorCourse): InstructorCourse {
  return {
    ...course,
    numericId: Number.isFinite(course.numericId) && course.numericId > 0 ? course.numericId : Number(course.id.replace(/\D/g, "")) || Date.now(),
  };
}

export function InstructorProvider({ children }: { children: ReactNode }) {
  const { user, isInstructor } = useAuth();
  const [courses, setCourses] = useState<InstructorCourse[]>(
    () => mockInstructorCourses.map(normalizeInstructorCourse),
  );
  const [isHydrated, setHydrated] = useState(false);

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
    revenueGrowth: 0
  });

  // Calculate stats whenever courses change
  useEffect(() => {
    if (!isInstructor || !user) return;

    const userCourses = courses.filter(c => true); // In real app, filter by instructorId

    const publishedCourses = userCourses.filter(c => c.status === 'published');
    const totalStudents = publishedCourses.reduce((sum, c) => sum + c.students, 0);
    const totalRevenue = publishedCourses.reduce((sum, c) => sum + c.revenue, 0);
    const avgRating = publishedCourses.length > 0
      ? publishedCourses.reduce((sum, c) => sum + c.rating, 0) / publishedCourses.length
      : 0;

    // Mock monthly revenue
    const thisMonthRevenue = totalRevenue * 0.3;
    const lastMonthRevenue = totalRevenue * 0.25;
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    setStats({
      totalCourses: userCourses.length,
      publishedCourses: publishedCourses.length,
      pendingCourses: userCourses.filter(c => c.status === 'pending').length,
      draftCourses: userCourses.filter(c => c.status === 'draft').length,
      totalStudents,
      totalRevenue,
      avgRating,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth
    });
  }, [courses, isInstructor, user]);

  // Hydrate from localStorage only on the client.
  useEffect(() => {
    setHydrated(true);

    try {
      const stored = window.localStorage.getItem('instructor_courses');
      if (stored) {
        const parsed = JSON.parse(stored) as InstructorCourse[];
        setCourses(parsed.map(normalizeInstructorCourse));
      }
    } catch {
      // Fall back to the in-memory mock data if storage is unavailable or corrupt.
    }
  }, []);

  // Save courses to localStorage whenever they change.
  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem('instructor_courses', JSON.stringify(courses));
    } catch {
      // Ignore storage failures in private mode / SSR-like environments.
    }
  }, [courses, isHydrated]);

  const createCourse = async (courseData: Omit<InstructorCourse, 'id' | 'numericId' | 'createdAt' | 'students' | 'rating' | 'revenue'>) => {
    await new Promise(r => setTimeout(r, 800));

    if (!isInstructor) {
      return { success: false, message: 'Chá»‰ giáº£ng viÃªn má»›i cÃ³ thá»ƒ táº¡o khÃ³a há»c' };
    }

    const newCourse: InstructorCourse = {
      ...courseData,
      id: `ic${Date.now()}`,
      numericId: Date.now(),
      createdAt: new Date().toISOString(),
      students: 0,
      rating: 0,
      revenue: 0
    };

    setCourses(prev => [...prev, newCourse]);
    return { success: true, message: 'Táº¡o khÃ³a há»c thÃ nh cÃ´ng!', courseId: newCourse.id };
  };

  const updateCourse = async (courseId: string, updates: Partial<InstructorCourse>) => {
    await new Promise(r => setTimeout(r, 600));

    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, ...updates, updatedAt: new Date().toISOString() }
        : course
    ));

    return { success: true, message: 'Cáº­p nháº­t khÃ³a há»c thÃ nh cÃ´ng!' };
  };

  const deleteCourse = async (courseId: string) => {
    await new Promise(r => setTimeout(r, 600));

    const course = courses.find(c => c.id === courseId);
    if (course?.status === 'published') {
      return { success: false, message: 'KhÃ´ng thá»ƒ xÃ³a khÃ³a há»c Ä‘Ã£ Ä‘Æ°á»£c phÃª duyá»‡t' };
    }

    setCourses(prev => prev.filter(c => c.id !== courseId));
    return { success: true, message: 'XÃ³a khÃ³a há»c thÃ nh cÃ´ng!' };
  };

  const submitForReview = async (courseId: string) => {
    await new Promise(r => setTimeout(r, 800));

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return { success: false, message: 'KhÃ´ng tÃ¬m tháº¥y khÃ³a há»c' };
    }

    if (course.status !== 'draft') {
      return { success: false, message: 'Chá»‰ cÃ³ thá»ƒ gá»­i khÃ³a há»c á»Ÿ tráº¡ng thÃ¡i nhÃ¡p' };
    }

    // Validation
    if (!course.title || !course.description) {
      return { success: false, message: 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin khÃ³a há»c' };
    }

    if (course.learningOutcomes.length === 0) {
      return { success: false, message: 'Vui lÃ²ng thÃªm má»¥c tiÃªu há»c táº­p' };
    }

    if (course.curriculum.length === 0) {
      return { success: false, message: 'Vui lÃ²ng thÃªm ná»™i dung chÆ°Æ¡ng trÃ¬nh há»c' };
    }

    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, status: 'pending', updatedAt: new Date().toISOString() }
        : c
    ));

    return { success: true, message: 'ÄÃ£ gá»­i khÃ³a há»c Ä‘á»ƒ xem xÃ©t! ChÃºng tÃ´i sáº½ pháº£n há»“i trong vÃ²ng 3-5 ngÃ y lÃ m viá»‡c.' };
  };

  const refreshStats = () => {
    // Force recalculation
    setCourses(prev => [...prev]);
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
        refreshStats
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructor must be used within InstructorProvider');
  }
  return context;
}
