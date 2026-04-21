import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Tag, Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  description: string;
}

const initialCoupons: Coupon[] = [
  { id: 'cp1', code: 'SALE50', type: 'fixed', value: 50, minOrder: 200, maxUses: 100, usedCount: 34, expiresAt: '2026-06-30', active: true, description: 'Giảm 50K cho đơn từ 200K' },
  { id: 'cp2', code: 'NEWUSER', type: 'fixed', value: 100, minOrder: 0, maxUses: 500, usedCount: 112, expiresAt: '2026-12-31', active: true, description: 'Chào mừng người dùng mới' },
  { id: 'cp3', code: 'UXDESIGN20', type: 'fixed', value: 20, minOrder: 100, maxUses: 200, usedCount: 67, expiresAt: '2026-05-31', active: true, description: 'Flash sale đặc biệt' },
  { id: 'cp4', code: 'SUMMER30', type: 'fixed', value: 30, minOrder: 150, maxUses: 300, usedCount: 89, expiresAt: '2026-08-31', active: true, description: 'Ưu đãi mùa hè' },
  { id: 'cp5', code: 'FLASH10', type: 'fixed', value: 10, minOrder: 50, maxUses: 1000, usedCount: 234, expiresAt: '2026-04-30', active: false, description: 'Flash sale 24h' },
  { id: 'cp6', code: 'VIP30PCT', type: 'percent', value: 30, minOrder: 500, maxUses: 50, usedCount: 12, expiresAt: '2026-12-31', active: true, description: 'Dành cho VIP member' },
];

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Coupon, 'id' | 'usedCount'>>({
    code: '', type: 'fixed', value: 50, minOrder: 0, maxUses: 100, expiresAt: '2026-12-31', active: true, description: ''
  });

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ code: '', type: 'fixed', value: 50, minOrder: 0, maxUses: 100, expiresAt: '2026-12-31', active: true, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.code.trim()) { toast.error('Mã coupon không được để trống'); return; }
    if (editingId) {
      setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
      toast.success('Đã cập nhật coupon!');
    } else {
      const exists = coupons.find(c => c.code.toUpperCase() === form.code.toUpperCase());
      if (exists) { toast.error('Mã coupon đã tồn tại'); return; }
      setCoupons(prev => [...prev, { id: `cp${Date.now()}`, ...form, code: form.code.toUpperCase(), usedCount: 0 }]);
      toast.success('Đã thêm coupon mới!');
    }
    resetForm();
  };

  const handleEdit = (c: Coupon) => {
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxUses: c.maxUses, expiresAt: c.expiresAt, active: c.active, description: c.description });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success('Đã xóa coupon!');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã "${code}"`);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã giảm giá..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap">
          <Plus className="size-4" /> Tạo mã giảm giá
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{coupons.filter(c => c.active).length}</p>
          <p className="text-xs text-green-600 mt-0.5">Đang hoạt động</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{coupons.reduce((s, c) => s + c.usedCount, 0)}</p>
          <p className="text-xs text-blue-600 mt-0.5">Lượt sử dụng</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">{coupons.filter(c => isExpired(c.expiresAt)).length}</p>
          <p className="text-xs text-orange-600 mt-0.5">Đã hết hạn</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
            <button onClick={resetForm}><X className="size-5 text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã coupon *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="VD: SALE50"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'fixed' | 'percent' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="fixed">Giảm theo số tiền (K₫)</option>
                <option value="percent">Giảm theo phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'fixed' ? 'Số tiền giảm (K₫)' : 'Phần trăm giảm (%)'}
              </label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                min={0} max={form.type === 'percent' ? 100 : 9999}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (K₫)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: +e.target.value }))}
                min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng tối đa</label>
              <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: +e.target.value }))}
                min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về coupon"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <Check className="size-4" /> {editingId ? 'Cập nhật' : 'Tạo mã'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="space-y-3">
        {filtered.map(coupon => {
          const expired = isExpired(coupon.expiresAt);
          const usagePercent = Math.min((coupon.usedCount / coupon.maxUses) * 100, 100);
          return (
            <div key={coupon.id} className={`border rounded-xl p-4 ${expired ? 'border-gray-200 bg-gray-50 opacity-75' : coupon.active ? 'border-green-200 bg-white' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-blue-500" />
                      <code className="font-bold text-lg text-gray-900">{coupon.code}</code>
                    </div>
                    <button onClick={() => handleCopy(coupon.code)} className="p-1 text-gray-400 hover:text-blue-600 transition">
                      <Copy className="size-3.5" />
                    </button>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${expired ? 'bg-red-100 text-red-600' : coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {expired ? 'Hết hạn' : coupon.active ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Giảm: <strong className="text-green-600">{coupon.type === 'fixed' ? `${coupon.value}K₫` : `${coupon.value}%`}</strong></span>
                    <span>Đơn tối thiểu: <strong>{coupon.minOrder}K₫</strong></span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" />HH: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Đã sử dụng: {coupon.usedCount}/{coupon.maxUses}</span>
                      <span>{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                    <Edit className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
