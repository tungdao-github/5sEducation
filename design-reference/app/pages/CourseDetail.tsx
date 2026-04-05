import { useParams, Link } from 'react-router';
import { courses } from '../data/courses';
import { Clock, BarChart3, Users, Star, ShoppingCart, Check, PlayCircle, Award, BookOpen, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function CourseDetail() {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const inCart = isInCart(course.id);

  const handleAddToCart = () => {
    if (!inCart) {
      addToCart(course);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const totalLessons = course.curriculum.reduce((sum, section) => sum + section.lessons, 0);
  const totalDuration = course.curriculum.reduce((sum, section) => {
    const minutes = parseInt(section.duration);
    return sum + minutes;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                {course.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-400">({course.students} học viên)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-5" />
                  <span>{totalLessons} bài học</span>
                </div>
              </div>

              <p className="text-gray-300">
                Được giảng dạy bởi: <span className="font-semibold text-white">{course.instructor}</span>
              </p>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl sticky top-20">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {course.originalPrice && (
                      <span className="text-gray-400 line-through">${course.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-blue-600">${course.price}</span>
                    {course.originalPrice && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                        Giảm {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mb-3 ${
                      inCart
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="size-5" />
                        Đã thêm vào giỏ hàng
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-5" />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>

                  {inCart && (
                    <Link
                      to="/cart"
                      className="block w-full py-3 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Xem giỏ hàng
                    </Link>
                  )}

                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Award className="size-5 text-blue-600" />
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-blue-600" />
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-blue-600" />
                      <span>Tài liệu học tập</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Chương trình giảng dạy</h2>
                  <div className="text-sm text-gray-600">
                    {course.curriculum.length} phần • {totalLessons} bài học
                  </div>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(index)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`size-5 text-gray-600 transition-transform ${
                              expandedSections.includes(index) ? 'rotate-180' : ''
                            }`}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{section.title}</div>
                            <div className="text-sm text-gray-600">
                              {section.lessons} bài học • {section.duration}
                            </div>
                          </div>
                        </div>
                      </button>

                      {expandedSections.includes(index) && (
                        <div className="px-4 pb-4 bg-gray-50">
                          <div className="space-y-2 pt-2">
                            {Array.from({ length: section.lessons }).map((_, lessonIndex) => (
                              <div
                                key={lessonIndex}
                                className="flex items-center gap-2 text-sm text-gray-600 py-2"
                              >
                                <PlayCircle className="size-4" />
                                <span>Bài {lessonIndex + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            </div>

            {/* Sidebar - Empty for desktop layout consistency */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
