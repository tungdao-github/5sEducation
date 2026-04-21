import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Eye, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { blogPosts } from '../../data/blog';
import type { BlogPost } from '../../data/blog';

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', author: '', category: 'Thiết kế UX/UI',
    tags: '', readTime: 5, image: ''
  });

  const categories = ['Thiết kế UX/UI', 'Viết nội dung UX', 'Nghiên cứu UX', 'Phân tích UX'];

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ title: '', excerpt: '', content: '', author: '', category: 'Thiết kế UX/UI', tags: '', readTime: 5, image: '' });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post: BlogPost) => {
    setForm({
      title: post.title, excerpt: post.excerpt, content: post.content,
      author: post.author, category: post.category,
      tags: post.tags.join(', '), readTime: post.readTime, image: post.image
    });
    setEditingPost(post);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Đã xóa bài viết!');
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.author.trim()) {
      toast.error('Tiêu đề và tác giả không được để trống');
      return;
    }
    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? {
        ...p, title: form.title, excerpt: form.excerpt, content: form.content,
        author: form.author, category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: form.readTime, image: form.image
      } : p));
      toast.success('Đã cập nhật bài viết!');
    } else {
      const newPost: BlogPost = {
        id: `b${Date.now()}`, title: form.title, titleEn: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: form.excerpt, excerptEn: form.excerpt,
        content: form.content, contentEn: form.content,
        author: form.author, authorAvatar: '',
        date: new Date().toISOString().split('T')[0],
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: form.readTime, views: 0,
        image: form.image || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      };
      setPosts(prev => [newPost, ...prev]);
      toast.success('Đã thêm bài viết mới!');
    }
    resetForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => { setShowForm(true); setEditingPost(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap">
          <Plus className="size-4" /> Viết bài mới
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingPost ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
            <button onClick={resetForm}><X className="size-5 text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Tiêu đề bài viết"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Tên tác giả"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
              <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2} placeholder="Mô tả tóm tắt bài viết..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={5} placeholder="<p>Nội dung bài viết...</p>"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thẻ (phân cách bằng dấu phẩy)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="UX, Design, UI"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đọc (phút)</label>
              <input type="number" value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: +e.target.value }))}
                min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL ảnh đại diện</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <Check className="size-4" /> {editingPost ? 'Cập nhật' : 'Đăng bài'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition bg-white">
            <div className="flex gap-4">
              <img src={post.image} alt={post.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(post)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                      <Edit className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{post.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{post.readTime} phút</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" />{post.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
