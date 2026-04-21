/**
 * Comprehensive 404 Not Found Page
 */

import { useNavigate } from 'react-router';
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';

export default function NotFound() {
  const navigate = useNavigate();

  const popularCourses = [
    { id: 'gestalt-principles', title: 'Gestalt Principles', icon: '🎨' },
    { id: 'input-controls', title: 'Input Controls', icon: '🎮' },
    { id: 'microcopy', title: 'Microcopy Writing', icon: '✍️' },
  ];

  return (
    <>
      <SEO
        title="404 - Trang không tìm thấy"
        description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        noindex
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Trang không tìm thấy
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc tạm thời không khả dụng.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <ArrowLeft className="size-5" />
              Quay lại
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Home className="size-5" />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <Search className="size-5" />
              Tìm khóa học
            </button>
          </motion.div>

          {/* Popular Courses */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="size-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Có thể bạn quan tâm
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="group p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <div className="text-4xl mb-2">{course.icon}</div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h4>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-gray-500"
          >
            Nếu bạn cần trợ giúp, vui lòng liên hệ{' '}
            <a href="mailto:support@educourse.vn" className="text-indigo-600 hover:underline">
              support@educourse.vn
            </a>
          </motion.p>
        </div>
      </div>
    </>
  );
}
