import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  userLevel?: string;
}

interface ReviewContextType {
  reviews: Review[];
  getReviewsByCourse: (courseId: string) => Review[];
  addReview: (courseId: string, rating: number, comment: string) => void;
  hasUserReviewed: (courseId: string) => boolean;
  getCourseAverageRating: (courseId: string) => { avg: number; count: number };
  markHelpful: (reviewId: string) => void;
}

const mockReviews: Review[] = [
  {
    id: 'r1', courseId: '1', userId: 'u1', userName: 'Nguyễn Văn An',
    rating: 5, comment: 'Khóa học rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng các nguyên tắc Gestalt và cách áp dụng vào thực tế.',
    createdAt: '2026-02-15', helpful: 12, userLevel: 'Silver',
  },
  {
    id: 'r2', courseId: '1', userId: 'u2', userName: 'Trần Thị Bình',
    rating: 4, comment: 'Nội dung hay nhưng video hơi dài. Mong có thêm bài tập thực hành.',
    createdAt: '2026-02-20', helpful: 5, userLevel: 'Bronze',
  },
  {
    id: 'r3', courseId: '3', userId: 'u1', userName: 'Nguyễn Văn An',
    rating: 5, comment: 'Khóa học tuyệt vời về microcopy! Đã áp dụng được nhiều kỹ thuật vào dự án của mình.',
    createdAt: '2026-03-05', helpful: 8, userLevel: 'Silver',
  },
  {
    id: 'r4', courseId: '5', userId: 'u3', userName: 'Lê Văn Cường',
    rating: 5, comment: '10 nguyên tắc của Nielsen là nền tảng quan trọng cho UX designer. Khóa học giải thích rất tốt.',
    createdAt: '2026-03-10', helpful: 15, userLevel: 'Gold',
  },
  {
    id: 'r5', courseId: '5', userId: 'u4', userName: 'Phạm Thị Dung',
    rating: 4, comment: 'Nội dung chất lượng, nhiều ví dụ thực tế. Chỉ mong video có phụ đề tiếng Việt.',
    createdAt: '2026-03-12', helpful: 3, userLevel: 'Bronze',
  },
  {
    id: 'r6', courseId: '2', userId: 'u5', userName: 'Hoàng Văn Em',
    rating: 4, comment: 'Rất hữu ích cho việc thiết kế form. Giảng viên kinh nghiệm.',
    createdAt: '2026-02-25', helpful: 7, userLevel: 'Silver',
  },
];

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('course_reviews');
    return stored ? JSON.parse(stored) : mockReviews;
  });

  useEffect(() => {
    localStorage.setItem('course_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const getReviewsByCourse = (courseId: string) => {
    return reviews.filter(r => r.courseId === courseId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const addReview = (courseId: string, rating: number, comment: string) => {
    if (!user) return;
    
    const newReview: Review = {
      id: `r${Date.now()}`,
      courseId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString().split('T')[0],
      helpful: 0,
      userLevel: user.level,
    };

    setReviews(prev => [newReview, ...prev]);
  };

  const hasUserReviewed = (courseId: string) => {
    if (!user) return false;
    return reviews.some(r => r.courseId === courseId && r.userId === user.id);
  };

  const getCourseAverageRating = (courseId: string) => {
    const courseReviews = reviews.filter(r => r.courseId === courseId);
    if (courseReviews.length === 0) return { avg: 0, count: 0 };
    
    const sum = courseReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: parseFloat((sum / courseReviews.length).toFixed(1)),
      count: courseReviews.length,
    };
  };

  const markHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      getReviewsByCourse,
      addReview,
      hasUserReviewed,
      getCourseAverageRating,
      markHelpful,
    }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviews must be used within ReviewProvider');
  return context;
}
