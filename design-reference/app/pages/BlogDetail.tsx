import { useParams, Link } from 'react-router';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blog';
import { useLanguage } from '../contexts/LanguageContext';

export default function BlogDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();

  const post = blogPosts.find(p => p.id === id);
  const related = blogPosts.filter(p => p.id !== id && p.category === post?.category).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="size-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài viết</h2>
          <Link to="/blog" className="text-blue-600 hover:underline text-sm">← Quay lại Blog</Link>
        </div>
      </div>
    );
  }

  const title = language === 'en' ? post.titleEn : post.title;
  const content = language === 'en' ? post.contentEn : post.content;
  const excerpt = language === 'en' ? post.excerptEn : post.excerpt;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="size-4" />
            {t('blog', 'backToBlog')}
          </Link>
          <div className="inline-block bg-blue-500/30 text-blue-200 text-xs font-medium px-3 py-1 rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">{title}</h1>
          <p className="text-gray-300 text-lg mb-6">{excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {post.author.charAt(0)}
              </div>
              <span className="text-white font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(post.date)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readTime} {t('blog', 'minRead')}
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="size-4" />
              {post.views.toLocaleString()} lượt xem
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
              <img src={post.image} alt={title} className="w-full aspect-video object-cover" />
            </div>

            {/* Content */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900
                prose-ul:space-y-2 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="size-4 text-gray-400" />
                {post.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-6 p-5 bg-blue-50 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Chia sẻ bài viết này</p>
                <p className="text-xs text-gray-500">Giúp cộng đồng UX/UI cùng học hỏi</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Đã sao chép link!'))}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Share2 className="size-4" />
                Chia sẻ
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Author card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Về tác giả</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                  <p className="text-xs text-gray-500">UX Writer & Researcher</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Chuyên gia về thiết kế trải nghiệm người dùng với hơn 5 năm kinh nghiệm trong ngành công nghệ.
              </p>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">{t('blog', 'relatedPosts')}</h3>
                <div className="space-y-4">
                  {related.map(rp => (
                    <Link key={rp.id} to={`/blog/${rp.id}`} className="group block">
                      <div className="flex gap-3">
                        <img src={rp.image} alt={rp.title}
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {language === 'en' ? rp.titleEn : rp.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="size-3" />{rp.readTime} phút
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to blog */}
            <Link to="/blog"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white">
              <ArrowLeft className="size-4" />
              Xem tất cả bài viết
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
