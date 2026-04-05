import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Clock, Eye, ChevronRight } from 'lucide-react';
import { blogPosts, blogCategories } from '../data/blog';
import { useLanguage } from '../contexts/LanguageContext';

export default function Blog() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');

  const filtered = blogPosts.filter(p => {
    const matchCat = category === 'Tất cả' || p.category === category;
    const title = language === 'en' ? p.titleEn : p.title;
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('blog','title')}</h1>
          <p className="text-gray-300 mb-8">Kiến thức UX/UI Design, xu hướng thiết kế và nghiên cứu người dùng</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {!search && category === 'Tất cả' && (
          <Link to={`/blog/${featured.id}`} className="block mb-12 group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-4 w-fit">
                    ⭐ Bài viết nổi bật
                  </span>
                  <div className="text-xs text-blue-600 font-medium mb-2">{featured.category}</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {language === 'en' ? featured.titleEn : featured.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {language === 'en' ? featured.excerptEn : featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{featured.author}</span>
                    <div className="flex items-center gap-1"><Clock className="size-4" />{featured.readTime} phút đọc</div>
                    <div className="flex items-center gap-1"><Eye className="size-4" />{featured.views.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-medium mt-4 group-hover:gap-2 transition-all">
                    {t('blog','readMore')} <ChevronRight className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {blogCategories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="aspect-video overflow-hidden">
                    <img src={post.image} alt={language === 'en' ? post.titleEn : post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-blue-600 font-medium mb-2">{post.category}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {language === 'en' ? post.titleEn : post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {language === 'en' ? post.excerptEn : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="size-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                          {post.author.charAt(0)}
                        </div>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><Clock className="size-3" />{post.readTime} phút</div>
                        <div className="flex items-center gap-1"><Eye className="size-3" />{post.views.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy bài viết phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
