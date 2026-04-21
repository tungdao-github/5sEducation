import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  courseCount: number;
  color: string;
  active: boolean;
}

const initialCategories: Category[] = [
  { id: 'c1', name: 'Thiết kế UX/UI', slug: 'thiet-ke-ux-ui', description: 'Khóa học thiết kế giao diện người dùng', courseCount: 4, color: '#3B82F6', active: true },
  { id: 'c2', name: 'Nghiên cứu UX', slug: 'nghien-cuu-ux', description: 'Phương pháp nghiên cứu người dùng', courseCount: 1, color: '#10B981', active: true },
  { id: 'c3', name: 'Viết nội dung UX', slug: 'viet-noi-dung-ux', description: 'Kỹ năng viết UX Writing', courseCount: 1, color: '#F59E0B', active: true },
  { id: 'c4', name: 'Quản lý UX', slug: 'quan-ly-ux', description: 'Kỹ năng quản lý dự án UX', courseCount: 1, color: '#8B5CF6', active: true },
  { id: 'c5', name: 'Phân tích UX', slug: 'phan-tich-ux', description: 'Analytics và dữ liệu người dùng', courseCount: 1, color: '#EF4444', active: true },
];

const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#84CC16'];

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#3B82F6', active: true });

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', color: '#3B82F6', active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Tên danh mục không được để trống'); return; }
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
      toast.success('Đã cập nhật danh mục!');
    } else {
      const newCat: Category = {
        id: `c${Date.now()}`,
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        courseCount: 0,
      };
      setCategories(prev => [...prev, newCat]);
      toast.success('Đã thêm danh mục mới!');
    }
    resetForm();
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, color: cat.color, active: cat.active });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Đã xóa danh mục!');
  };

  const handleToggleActive = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap">
          <Plus className="size-4" /> Thêm danh mục
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="size-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Thiết kế UX/UI"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="thiet-ke-ux-ui"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về danh mục"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                    className={`size-7 rounded-full border-2 transition ${form.color === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${form.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {form.active ? 'Hoạt động' : 'Ẩn'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <Check className="size-4" /> {editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khóa học</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                      <Tag className="size-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{cat.slug}</code>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-900">{cat.courseCount} khóa học</span>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => handleToggleActive(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${cat.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {cat.active ? '● Hoạt động' : '○ Ẩn'}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                      <Edit className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
