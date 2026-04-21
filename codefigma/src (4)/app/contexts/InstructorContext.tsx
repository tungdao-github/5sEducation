import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
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
  createCourse: (course: Omit<InstructorCourse, 'id' | 'createdAt' | 'students' | 'rating' | 'revenue'>) => Promise<{ success: boolean; message: string; courseId?: string }>;
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
    title: 'Mastering Figma: From Basics to Advanced',
    description: 'Khóa học toàn diện về Figma cho designer',
    category: 'Thiết kế UX/UI',
    level: 'Trung cấp',
    price: 299000,
    originalPrice: 399000,
    thumbnail: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742',
    duration: '8 giờ',
    lessons: 45,
    status: 'published',
    createdAt: '2024-02-01',
    publishedAt: '2024-02-15',
    students: 234,
    rating: 4.7,
    revenue: 69966000,
    learningOutcomes: [
      'Thành thạo Figma từ cơ bản đến nâng cao',
      'Tạo design system chuyên nghiệp',
      'Làm việc hiệu quả với team',
      'Prototype interactive designs'
    ],
    requirements: ['Có kiến thức cơ bản về thiết kế', 'Máy tính có kết nối Internet'],
    curriculum: [
      {
        id: 's1',
        title: 'Giới thiệu Figma',
        duration: '45 phút',
        lessons: [
          { id: 'l1', title: 'Cài đặt và thiết lập', duration: '15 phút', type: 'video' },
          { id: 'l2', title: 'Giao diện Figma', duration: '20 phút', type: 'video' },
          { id: 'l3', title: 'Bài tập thực hành', duration: '10 phút', type: 'quiz' }
        ]
      }
    ]
  },
  {
    id: 'ic2',
    title: 'User Research Methods Complete Guide',
    description: 'Hướng dẫn chi tiết về các phương pháp nghiên cứu người dùng',
    category: 'Nghiên cứu UX',
    level: 'Nâng cao',
    price: 399000,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    duration: '10 giờ',
    lessons: 52,
    status: 'pending',
    createdAt: '2024-03-10',
    students: 0,
    rating: 0,
    revenue: 0,
    learningOutcomes: [
      'Lập kế hoạch nghiên cứu người dùng',
      'Thực hiện interviews và surveys',
      'Phân tích và tổng hợp insights'
    ],
    requirements: ['Kinh nghiệm thiết kế UX/UI'],
    curriculum: []
  },
  {
    id: 'ic3',
    title: 'Design Thinking Workshop',
    description: 'Workshop thực hành Design Thinking',
    category: 'Thiết kế UX/UI',
    level: 'Cơ bản',
    price: 199000,
    originalPrice: 299000,
    duration: '5 giờ',
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

export function InstructorProvider({ children }: { children: ReactNode }) {
  const { user, isInstructor } = useAuth();
  const [courses, setCourses] = useState<InstructorCourse[]>(() => {
    // Load from localStorage or use mock data
    const stored = localStorage.getItem('instructor_courses');
    return stored ? JSON.parse(stored) : mockInstructorCourses;
  });

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

  // Save courses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('instructor_courses', JSON.stringify(courses));
  }, [courses]);

  const createCourse = async (courseData: Omit<InstructorCourse, 'id' | 'createdAt' | 'students' | 'rating' | 'revenue'>) => {
    await new Promise(r => setTimeout(r, 800));

    if (!isInstructor) {
      return { success: false, message: 'Chỉ giảng viên mới có thể tạo khóa học' };
    }

    const newCourse: InstructorCourse = {
      ...courseData,
      id: `ic${Date.now()}`,
      createdAt: new Date().toISOString(),
      students: 0,
      rating: 0,
      revenue: 0
    };

    setCourses(prev => [...prev, newCourse]);
    return { success: true, message: 'Tạo khóa học thành công!', courseId: newCourse.id };
  };

  const updateCourse = async (courseId: string, updates: Partial<InstructorCourse>) => {
    await new Promise(r => setTimeout(r, 600));

    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, ...updates, updatedAt: new Date().toISOString() }
        : course
    ));

    return { success: true, message: 'Cập nhật khóa học thành công!' };
  };

  const deleteCourse = async (courseId: string) => {
    await new Promise(r => setTimeout(r, 600));

    const course = courses.find(c => c.id === courseId);
    if (course?.status === 'published') {
      return { success: false, message: 'Không thể xóa khóa học đã được phê duyệt' };
    }

    setCourses(prev => prev.filter(c => c.id !== courseId));
    return { success: true, message: 'Xóa khóa học thành công!' };
  };

  const submitForReview = async (courseId: string) => {
    await new Promise(r => setTimeout(r, 800));

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return { success: false, message: 'Không tìm thấy khóa học' };
    }

    if (course.status !== 'draft') {
      return { success: false, message: 'Chỉ có thể gửi khóa học ở trạng thái nháp' };
    }

    // Validation
    if (!course.title || !course.description) {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin khóa học' };
    }

    if (course.learningOutcomes.length === 0) {
      return { success: false, message: 'Vui lòng thêm mục tiêu học tập' };
    }

    if (course.curriculum.length === 0) {
      return { success: false, message: 'Vui lòng thêm nội dung chương trình học' };
    }

    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, status: 'pending', updatedAt: new Date().toISOString() }
        : c
    ));

    return { success: true, message: 'Đã gửi khóa học để xem xét! Chúng tôi sẽ phản hồi trong vòng 3-5 ngày làm việc.' };
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
