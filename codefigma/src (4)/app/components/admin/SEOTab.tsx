import { useState } from 'react';
import { Search, Globe, FileText, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SEOPage {
  id: string;
  page: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  score: number;
  issues: string[];
}

const initialPages: SEOPage[] = [
  {
    id: 's1', page: 'Trang chủ', url: '/',
    title: 'EduCourse - Học UX/UI Design Online | Khóa học hàng đầu Việt Nam',
    description: 'Nền tảng học UX/UI Design hàng đầu Việt Nam. Hơn 500 khóa học từ các chuyên gia, giá ưu đãi, học mọi lúc mọi nơi.',
    keywords: 'học UX, học UI, thiết kế UX, khóa học UX/UI, design online',
    ogTitle: 'EduCourse - Học UX/UI Design Online',
    ogDescription: 'Nền tảng học UX/UI Design hàng đầu Việt Nam',
    ogImage: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=1200',
    score: 92, issues: [],
  },
  {
    id: 's2', page: 'Trang Blog', url: '/blog',
    title: 'Blog UX/UI Design - Tin tức và kiến thức về thiết kế | EduCourse',
    description: 'Cập nhật tin tức, xu hướng và kiến thức UX/UI Design mới nhất. Bài viết từ các chuyên gia hàng đầu.',
    keywords: 'blog UX, UX design tips, UI design, thiết kế giao diện',
    ogTitle: 'Blog UX/UI Design - EduCourse',
    ogDescription: 'Cập nhật tin tức và kiến thức UX/UI Design mới nhất',
    ogImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
    score: 85, issues: ['Thiếu schema markup', 'Cần thêm canonical URL'],
  },
  {
    id: 's3', page: 'Trang Khóa học', url: '/course/:id',
    title: '[Tên khóa học] | EduCourse',
    description: '[Mô tả khóa học ngắn gọn từ 150-160 ký tự]',
    keywords: 'khóa học UX, học design, UX course',
    ogTitle: '[Tên khóa học] - EduCourse',
    ogDescription: '[Mô tả khóa học]',
    ogImage: '[Ảnh khóa học]',
    score: 78, issues: ['Cần thêm structured data cho Course', 'Meta description quá ngắn'],
  },
  {
    id: 's4', page: 'Trang Tìm kiếm', url: '/search',
    title: 'Tìm kiếm khóa học UX/UI Design | EduCourse',
    description: 'Tìm kiếm hơn 500 khóa học UX/UI Design theo danh mục, cấp độ, giá và đánh giá.',
    keywords: 'tìm kiếm khóa học, lọc khóa học design',
    ogTitle: 'Tìm kiếm khóa học - EduCourse',
    ogDescription: 'Tìm kiếm và lọc khóa học theo nhu cầu',
    ogImage: '',
    score: 65, issues: ['Thiếu OG Image', 'Noindex nên được bật cho trang search', 'Thiếu hreflang'],
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-green-600 bg-green-50' : score >= 70 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
  return <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${color}`}>{score}/100</span>;
}

export default function SEOTab() {
  const [pages, setPages] = useState<SEOPage[]>(initialPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SEOPage>>({});
  const [analyzing, setAnalyzing] = useState(false);

  const handleEdit = (page: SEOPage) => {
    setEditingId(page.id);
    setForm({ ...page });
  };

  const handleSave = () => {
    if (!form.title || !form.description) { toast.error('Tiêu đề và mô tả không được để trống'); return; }
    const titleLen = form.title.length;
    const descLen = form.description.length;
    const issues: string[] = [];
    if (titleLen < 50 || titleLen > 65) issues.push(`Tiêu đề ${titleLen} ký tự (nên 50-65)`);
    if (descLen < 150 || descLen > 160) issues.push(`Mô tả ${descLen} ký tự (nên 150-160)`);
    if (!form.ogImage) issues.push('Thiếu OG Image');
    const score = Math.max(50, 100 - issues.length * 12 + (form.keywords?.split(',').length || 0));
    setPages(prev => prev.map(p => p.id === editingId ? { ...p, ...form, score: Math.min(score, 100), issues } : p));
    setEditingId(null);
    toast.success('Đã cập nhật cài đặt SEO!');
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast.success('Phân tích SEO hoàn tất! Sitemap và meta tags đã được kiểm tra.');
    }, 2000);
  };

  const editingPage = pages.find(p => p.id === editingId);

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Cấu hình SEO nâng cao</h3>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý meta tags, OG tags và sitemap cho từng trang</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAnalyze} disabled={analyzing}
            className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-medium disabled:opacity-50">
            <RefreshCw className={`size-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Đang phân tích...' : 'Kiểm tra SEO'}
          </button>
          <button onClick={() => toast.success('Đã tạo sitemap.xml mới!')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
            <Globe className="size-4" />
            Tạo Sitemap
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Điểm SEO tổng thể</p>
            <p className="text-sm text-gray-500 mt-0.5">Dựa trên {pages.length} trang chính</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)}
            </div>
            <div className="text-xs text-gray-500">/100</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: '✅ Tốt (≥90)', count: pages.filter(p => p.score >= 90).length },
            { label: '⚠️ Cần cải thiện', count: pages.filter(p => p.score >= 70 && p.score < 90).length },
            { label: '❌ Cần sửa', count: pages.filter(p => p.score < 70).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      {editingId && editingPage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Chỉnh sửa SEO: {editingPage.page}</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title ({form.title?.length || 0}/65)
                {(form.title?.length || 0) > 65 && <span className="text-red-500 ml-2">Quá dài!</span>}
              </label>
              <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description ({form.description?.length || 0}/160)
                {(form.description?.length || 0) > 160 && <span className="text-red-500 ml-2">Quá dài!</span>}
              </label>
              <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (phân cách dấu phẩy)</label>
              <input value={form.keywords || ''} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input value={form.ogTitle || ''} onChange={e => setForm(f => ({ ...f, ogTitle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input value={form.ogImage || ''} onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">Lưu</button>
              <button onClick={() => setEditingId(null)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Pages SEO List */}
      <div className="space-y-3">
        {pages.map(page => (
          <div key={page.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="size-4 text-blue-500 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-900">{page.page}</h4>
                  <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{page.url}</code>
                  <ScoreBadge score={page.score} />
                </div>
                <p className="text-sm font-medium text-gray-800 mb-0.5 truncate">{page.title}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{page.description}</p>
                {page.issues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {page.issues.map((issue, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                        <AlertCircle className="size-3" />{issue}
                      </span>
                    ))}
                  </div>
                )}
                {page.issues.length === 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="size-3" />Không có vấn đề
                  </div>
                )}
              </div>
              <button onClick={() => handleEdit(page)} className="flex-shrink-0 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sitemap & Robots */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Sitemap.xml</h4>
          <p className="text-xs text-gray-500 mb-3">Tự động tạo sitemap cho toàn bộ trang</p>
          <div className="space-y-1.5 text-xs text-gray-500 mb-3">
            <p>✅ Trang chủ, danh sách khóa học</p>
            <p>✅ Chi tiết từng khóa học (8 trang)</p>
            <p>✅ Blog ({6} bài viết)</p>
          </div>
          <button onClick={() => toast.success('Sitemap.xml đã được cập nhật!')}
            className="text-sm text-blue-600 hover:underline">Cập nhật sitemap →</button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Robots.txt</h4>
          <p className="text-xs text-gray-500 mb-3">Cấu hình quyền truy cập bot</p>
          <pre className="text-xs bg-gray-900 text-green-400 rounded p-2 mb-3">{`User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Sitemap: /sitemap.xml`}</pre>
          <button onClick={() => toast.success('Robots.txt đã được lưu!')}
            className="text-sm text-blue-600 hover:underline">Chỉnh sửa →</button>
        </div>
      </div>
    </div>
  );
}
