import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import CourseCard from '../components/CourseCard';
import { courses, categories } from '../data/courses';
import { Search, Filter, Zap, Star, Users, BookOpen, Award, ArrowRight, Play, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

// ─── Flash Sale Countdown ─────────────────────────────────────────────────────
function FlashSaleCountdown() {
  const endTime = useRef(Date.now() + 8 * 3600 * 1000 + 23 * 60 * 1000 + 45 * 1000);
  const [timeLeft, setTimeLeft] = useState({ h: 8, m: 23, s: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, endTime.current - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const flashCourses = courses
    .filter(c => c.originalPrice > c.price)
    .slice(0, 4)
    .map(c => ({ ...c, flashPrice: Math.round(c.price * 0.7) }));

  return (
    <section className="py-10 bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="size-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Flash Sale</h2>
              <p className="text-red-100 text-sm">Ưu đãi đặc biệt - Giảm đến 30%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5">
              {[{ label: 'GIỜ', value: pad(timeLeft.h) }, { label: 'PHÚT', value: pad(timeLeft.m) }, { label: 'GIÂY', value: pad(timeLeft.s) }].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-1.5">
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-center min-w-[50px]">
                    <div className="text-white font-mono text-xl font-bold leading-none">{unit.value}</div>
                    <div className="text-red-100 text-[9px] mt-0.5">{unit.label}</div>
                  </div>
                  {i < 2 && <span className="text-white font-bold text-lg">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {flashCourses.map(course => (
            <Link key={course.id} to={`/course/${course.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    -{Math.round((1 - course.flashPrice / course.price) * 100)}%
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-xs line-clamp-2 mb-2">{course.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 text-sm">{course.flashPrice.toLocaleString()}K₫</span>
                    <span className="text-gray-400 text-xs line-through">{course.price.toLocaleString()}K₫</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-yellow-500">★{course.rating}</span>
                    <span>·</span>
                    <span>{course.students.toLocaleString()} học viên</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/search" className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-50 transition text-sm">
            Xem tất cả Flash Sale <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Nguyễn Thị Mai', role: 'UX Designer tại FPT Software', avatar: 'M', rating: 5, text: 'Khóa học Gestalt Principles đã thay đổi cách tôi tiếp cận thiết kế. Tôi áp dụng ngay vào dự án và nhận được phản hồi rất tích cực từ khách hàng!' },
  { name: 'Trần Văn Hùng', role: 'Product Designer tại VNG', avatar: 'H', rating: 5, text: 'Nội dung chất lượng cao, giảng viên có kinh nghiệm thực tế. Sau 3 tháng học, tôi đã đạt được vị trí Senior UX Designer mà không cần bằng cấp.' },
  { name: 'Lê Thị Hoa', role: 'Freelance UX Writer', avatar: 'H', rating: 5, text: 'Khóa Microcopy là một game-changer! Tôi đã tăng được tỷ lệ chuyển đổi của khách hàng lên 40% chỉ bằng cách viết lại button và form labels.' },
  { name: 'Phạm Minh Đức', role: 'UI Designer tại Grab Vietnam', avatar: 'Đ', rating: 5, text: 'EduCourse là nền tảng học UX/UI tốt nhất tôi từng dùng. Nội dung cập nhật liên tục, cộng đồng học viên rất supportive và nhiệt tình.' },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="py-14 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Học viên nói gì về chúng tôi</h2>
          <p className="text-gray-500">Hơn 50,000 học viên đã tin tưởng EduCourse</p>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="size-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
              "{testimonials[current].text}"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="size-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {testimonials[current].avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{testimonials[current].name}</p>
                <p className="text-sm text-gray-500">{testimonials[current].role}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 size-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 size-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition">
            <ChevronRight className="size-5" />
          </button>
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Instructors ──────────────────────────────────────────────────────────────
const instructors = [
  { name: 'Tanner Kohler', title: 'UX Design Specialist', courses: 3, students: 8500, rating: 4.9, avatar: 'T', color: 'from-blue-500 to-indigo-500' },
  { name: 'Kate Moran', title: 'UX Writer & Researcher', courses: 2, students: 6200, rating: 4.9, avatar: 'K', color: 'from-purple-500 to-pink-500' },
  { name: 'Jakob Nielsen', title: 'Usability Expert', courses: 1, students: 5432, rating: 4.9, avatar: 'J', color: 'from-green-500 to-teal-500' },
  { name: 'Sarah Gibbons', title: 'UX Strategy Lead', courses: 1, students: 2234, rating: 4.8, avatar: 'S', color: 'from-orange-500 to-red-500' },
];

function Instructors() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Giảng viên hàng đầu</h2>
          <p className="text-gray-500">Học từ những chuyên gia UX/UI Design với kinh nghiệm thực chiến</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map(inst => (
            <div key={inst.name} className="text-center group cursor-pointer">
              <div className={`size-20 bg-gradient-to-br ${inst.color} rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 group-hover:scale-105 transition-transform shadow-lg`}>
                {inst.avatar}
              </div>
              <h3 className="font-bold text-gray-900 mb-0.5">{inst.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{inst.title}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1"><BookOpen className="size-3" />{inst.courses} KH</span>
                <span className="flex items-center gap-1"><Users className="size-3" />{inst.students.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star className="size-3 text-yellow-400 fill-yellow-400" />{inst.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Learning Paths ───────────────────────────────────────────────────────────
const learningPaths = [
  {
    title: 'UX Designer từ Zero',
    icon: '🎨',
    duration: '6 tháng',
    courses: 4,
    level: 'Sơ cấp → Trung cấp',
    desc: 'Lộ trình toàn diện từ cơ bản đến thành thạo UX Design',
    color: 'border-blue-200 bg-blue-50',
    badge: 'Phổ biến nhất'
  },
  {
    title: 'UX Writer Chuyên nghiệp',
    icon: '✍️',
    duration: '3 tháng',
    courses: 2,
    level: 'Trung cấp',
    desc: 'Viết microcopy và nội dung UX hiệu quả cho sản phẩm số',
    color: 'border-purple-200 bg-purple-50',
    badge: 'Mới'
  },
  {
    title: 'UX Research Master',
    icon: '🔬',
    duration: '4 tháng',
    courses: 3,
    level: 'Trung cấp → Nâng cao',
    desc: 'Thành thạo nghiên cứu người dùng và phân tích dữ liệu',
    color: 'border-green-200 bg-green-50',
    badge: ''
  },
];

function LearningPaths() {
  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lộ trình học tập</h2>
            <p className="text-gray-500">Học theo lộ trình để đạt mục tiêu nhanh nhất</p>
          </div>
          <Link to="/search" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {learningPaths.map(path => (
            <div key={path.title} className={`border-2 ${path.color} rounded-2xl p-6 hover:shadow-md transition cursor-pointer`}>
              {path.badge && (
                <span className="inline-block text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full mb-3">{path.badge}</span>
              )}
              <div className="text-4xl mb-4">{path.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{path.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{path.desc}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1"><BookOpen className="size-4" />{path.courses} khóa học</span>
                <span className="flex items-center gap-1"><TrendingUp className="size-4" />{path.level}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">⏱ Hoàn thành trong ~{path.duration}</p>
              <Link to="/search" className="block w-full text-center bg-white border border-current text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 hover:text-white transition">
                Bắt đầu lộ trình →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
function WhyChooseUs() {
  const features = [
    { icon: '🎯', title: 'Học thực chiến', desc: 'Nội dung được thiết kế từ dự án thực tế, áp dụng ngay vào công việc' },
    { icon: '♾️', title: 'Trọn đời', desc: 'Mua một lần, học mãi mãi. Cập nhật nội dung mới miễn phí' },
    { icon: '🏆', title: 'Chứng chỉ có giá trị', desc: 'Chứng chỉ được công nhận bởi hơn 200 công ty trong ngành' },
    { icon: '💬', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn' },
    { icon: '🔄', title: 'Hoàn tiền 30 ngày', desc: 'Không hài lòng? Hoàn lại 100% học phí trong vòng 30 ngày' },
    { icon: '📱', title: 'Học mọi thiết bị', desc: 'Xem trên laptop, tablet hay điện thoại theo lịch của bạn' },
  ];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Tại sao chọn EduCourse?</h2>
          <p className="text-gray-500">Chúng tôi cam kết mang lại trải nghiệm học tốt nhất</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 transition">
              <div className="text-3xl flex-shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Home ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'Tất cả' || course.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const featuredCourses = courses.slice(0, 3);
  const topRatedCourses = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm mb-6">
                <Zap className="size-4 text-yellow-300 fill-yellow-300" />
                <span className="text-blue-100">Hơn 50,000 học viên đang học</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Làm chủ UX/UI Design <span className="text-yellow-300">từ hôm nay</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Học từ những chuyên gia hàng đầu thế giới. Nội dung thực chiến, chứng chỉ có giá trị, học mọi lúc mọi nơi.
              </p>
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, giảng viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-6 py-4 rounded-xl transition whitespace-nowrap">
                  Tìm ngay
                </button>
              </form>
              <div className="flex items-center gap-6 text-sm text-blue-200">
                <span>🔥 Gestalt Principles</span>
                <span>✍️ Microcopy</span>
                <span>📊 UX Analytics</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 space-y-4">
                  {featuredCourses.map(course => (
                    <Link key={course.id} to={`/course/${course.id}`} className="flex items-center gap-3 hover:bg-white/10 rounded-xl p-2 transition">
                      <img src={course.image} alt={course.title} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-blue-300">{course.instructor}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-yellow-300">{course.price.toLocaleString()}K₫</p>
                        <p className="text-xs text-blue-300">★{course.rating}</p>
                      </div>
                    </Link>
                  ))}
                  <Link to="/search" className="flex items-center justify-center gap-2 text-blue-200 hover:text-white text-sm py-2 transition">
                    Xem tất cả {courses.length} khóa học <ArrowRight className="size-4" />
                  </Link>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Award className="size-5" />
                    <div>
                      <p className="font-bold text-sm">4.8★ Đánh giá</p>
                      <p className="text-xs">Từ 1,284 học viên</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <BookOpen className="size-6 text-blue-600" />, value: '500+', label: 'Khóa học' },
              { icon: <Users className="size-6 text-green-600" />, value: '50K+', label: 'Học viên' },
              { icon: <Star className="size-6 text-yellow-500 fill-yellow-500" />, value: '4.8★', label: 'Đánh giá TB' },
              { icon: <Award className="size-6 text-purple-600" />, value: '100+', label: 'Giảng viên' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="size-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSaleCountdown />

      {/* Courses Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Khóa học phổ biến</h2>
              <p className="text-gray-500">Được học viên yêu thích và đánh giá cao nhất</p>
            </div>
            <Link to="/search" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Categories Filter */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học
          </p>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="size-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy khóa học nào phù hợp</p>
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths */}
      <LearningPaths />

      {/* Top Rated */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Đánh giá cao nhất</h2>
              <p className="text-gray-500">Các khóa học được yêu thích nhất từ học viên</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <Instructors />

      {/* Testimonials */}
      <Testimonials />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Compare CTA */}
      <section className="py-10 bg-blue-50 border-y border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa biết chọn khóa học nào?</h3>
          <p className="text-gray-600 mb-5">Sử dụng tính năng so sánh để tìm khóa học phù hợp nhất với bạn</p>
          <Link to="/compare" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            <TrendingUp className="size-5" />So sánh khóa học
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="size-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Play className="size-8 fill-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bắt đầu hành trình học tập ngay hôm nay
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng 50,000+ học viên đang phát triển sự nghiệp UX/UI Design
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/search" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition text-sm">
              Khám phá khóa học
            </Link>
            <Link to="/compare" className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition text-sm">
              So sánh khóa học
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
