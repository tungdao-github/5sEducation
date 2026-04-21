import { useAuth } from '../contexts/AuthContext';
import { mockOrders } from '../data/orders';
import { Link } from 'react-router';
import { BookOpen, Clock, Award, PlayCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CourseProgress {
  courseId: string;
  progress: number; // 0-100
  lastAccessed: string;
  completedLessons: number;
  totalLessons: number;
}

export default function MyLearning() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  
  // Mock progress data - trong thực tế sẽ lưu trong database hoặc localStorage
  const [courseProgress] = useState<CourseProgress[]>([
    { courseId: '1', progress: 65, lastAccessed: '2026-04-05', completedLessons: 27, totalLessons: 42 },
    { courseId: '3', progress: 100, lastAccessed: '2026-04-01', completedLessons: 22, totalLessons: 22 },
    { courseId: '5', progress: 30, lastAccessed: '2026-03-30', completedLessons: 16, totalLessons: 52 },
  ]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="size-20 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để xem khóa học của bạn</h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để truy cập vào các khóa học đã mua và theo dõi tiến độ học tập.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // Lấy danh sách khóa học đã mua từ orders đã hoàn thành
  const purchasedCourses = mockOrders
    .filter(order => order.userId === user?.id && order.status === 'completed')
    .flatMap(order => order.items)
    .filter((course, index, self) => 
      index === self.findIndex(c => c.id === course.id)
    );

  const getProgressInfo = (courseId: string) => {
    return courseProgress.find(p => p.courseId === courseId);
  };

  const inProgressCourses = purchasedCourses.filter(course => {
    const progress = getProgressInfo(course.id);
    return progress && progress.progress > 0 && progress.progress < 100;
  });

  const completedCourses = purchasedCourses.filter(course => {
    const progress = getProgressInfo(course.id);
    return progress && progress.progress === 100;
  });

  const notStartedCourses = purchasedCourses.filter(course => {
    const progress = getProgressInfo(course.id);
    return !progress || progress.progress === 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Khóa học của tôi</h1>
          <p className="text-xl text-blue-100">
            Tiếp tục hành trình học tập của bạn
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="size-8" />
                <div>
                  <p className="text-2xl font-bold">{purchasedCourses.length}</p>
                  <p className="text-sm text-blue-100">Tổng khóa học</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-8" />
                <div>
                  <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                  <p className="text-sm text-blue-100">Đang học</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-8" />
                <div>
                  <p className="text-2xl font-bold">{completedCourses.length}</p>
                  <p className="text-sm text-blue-100">Hoàn thành</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {purchasedCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="size-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có khóa học nào</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa mua khóa học nào. Khám phá các khóa học chất lượng của chúng tôi!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Đang học */}
            {inProgressCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="size-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Đang học ({inProgressCourses.length})</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map(course => {
                    const progress = getProgressInfo(course.id);
                    return (
                      <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>{progress?.progress}% hoàn thành</span>
                              <span>{progress?.completedLessons}/{progress?.totalLessons} bài</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress?.progress}%` }}
                              />
                            </div>
                          </div>

                          <Link
                            to={`/learn/${course.id}`}
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                          >
                            <PlayCircle className="size-5" />
                            Tiếp tục học
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Hoàn thành */}
            {completedCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="size-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Đã hoàn thành ({completedCourses.length})</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition">
                      <div className="relative">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="size-4" />
                          Hoàn thành
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor}</p>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/learn/${course.id}`}
                            className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition"
                          >
                            Xem lại
                          </Link>
                          <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            <Award className="size-5" />
                            Chứng chỉ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chưa bắt đầu */}
            {notStartedCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="size-6 text-gray-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Chưa bắt đầu ({notStartedCourses.length})</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor}</p>
                        
                        <Link
                          to={`/learn/${course.id}`}
                          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                        >
                          <PlayCircle className="size-5" />
                          Bắt đầu học
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}