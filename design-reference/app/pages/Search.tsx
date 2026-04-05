import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Mic, MicOff, SlidersHorizontal, X, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { courses, categories } from '../data/courses';
import { useLanguage } from '../contexts/LanguageContext';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => { setQuery(searchParams.get('q') || ''); }, [searchParams]);

  const levels = ['Tất cả', 'Sơ cấp đến trung cấp', 'Trung cấp', 'Trung cấp đến nâng cao', 'Nâng cao', 'Phù hợp mọi trình độ'];

  const filteredCourses = courses.filter(c => {
    const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.instructor.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
    const matchCat = selectedCategory === 'Tất cả' || c.category === selectedCategory;
    const matchLevel = selectedLevel === 'Tất cả' || c.level === selectedLevel;
    const matchPrice = c.price >= priceRange[0] && c.price <= priceRange[1];
    const matchRating = c.rating >= minRating;
    return matchQ && matchCat && matchLevel && matchPrice && matchRating;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return parseInt(b.id) - parseInt(a.id);
    return b.students - a.students;
  });

  const handleVoiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Trình duyệt không hỗ trợ'); return; }
    const r = new SR(); r.lang = 'vi-VN';
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setQuery(t); setSearchParams({ q: t }); };
    r.start();
  };

  const clearFilters = () => { setSelectedCategory('Tất cả'); setSelectedLevel('Tất cả'); setPriceRange([0, 500]); setMinRating(0); setSortBy('popular'); };

  const hasFilters = selectedCategory !== 'Tất cả' || selectedLevel !== 'Tất cả' || priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="flex-1 relative flex bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input type="text" value={query} onChange={e => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
                placeholder={t('home','searchPlaceholder')}
                className="flex-1 pl-11 pr-4 py-3 focus:outline-none text-gray-900" />
              {query && <button onClick={() => { setQuery(''); setSearchParams({}); }} className="px-3 text-gray-400 hover:text-gray-600"><X className="size-4" /></button>}
            </div>
            <button onClick={handleVoiceSearch}
              className={`px-4 rounded-xl border transition-colors ${isListening ? 'bg-red-50 border-red-300 text-red-500' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}>
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`hidden sm:flex items-center gap-2 px-4 rounded-xl border transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'}`}>
              <SlidersHorizontal className="size-5" />
              <span className="hidden sm:inline text-sm font-medium">Lọc</span>
              {hasFilters && <span className="size-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="hidden sm:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">Bộ lọc nâng cao</h3>
                  {hasFilters && <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Xóa tất cả</button>}
                </div>

                {/* Category */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="text-blue-600" />
                        <span className="text-sm text-gray-600">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Trình độ</h4>
                  <div className="space-y-2">
                    {levels.map(lv => (
                      <label key={lv} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="level" checked={selectedLevel === lv} onChange={() => setSelectedLevel(lv)} className="text-blue-600" />
                        <span className="text-sm text-gray-600">{lv}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Giá (nghìn đồng)</h4>
                  <div className="space-y-2">
                    <input type="range" min={0} max={500} value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-blue-600" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0đ</span><span>{(priceRange[1] * 1000).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Đánh giá tối thiểu</h4>
                  <div className="space-y-2">
                    {[0, 4, 4.5, 4.8].map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="text-blue-600" />
                        <span className="text-sm text-gray-600">{r === 0 ? 'Tất cả' : `${r}★ trở lên`}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600 text-sm">
                {query && <span className="font-medium">"{query}" · </span>}
                Tìm thấy <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học
              </p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
              </select>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-500 mb-4">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
                {hasFilters && <button onClick={clearFilters} className="text-blue-600 hover:underline text-sm">Xóa tất cả bộ lọc</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
