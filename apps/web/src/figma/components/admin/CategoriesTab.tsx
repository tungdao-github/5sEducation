"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, X, Check, Tag } from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type CategoryAdminDto,
} from "../../data/api";

const colorPalette = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#F97316", "#84CC16"];

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % colorPalette.length;
  return colorPalette[idx];
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryAdminDto[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminCategories()
      .then((data) => {
        if (!active) return;
        setCategories(data);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên danh mục không được để trống");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminCategory(editingId, name.trim());
        const refreshed = await fetchAdminCategories();
        setCategories(refreshed);
        toast.success("Đã cập nhật danh mục!");
      } else {
        const created = await createAdminCategory(name.trim());
        setCategories((prev) => [...prev, created]);
        toast.success("Đã thêm danh mục mới!");
      }
      resetForm();
    } catch {
      toast.error("Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: CategoryAdminDto) => {
    setName(cat.title);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Đã xóa danh mục!");
    } catch {
      toast.error("Không thể xóa danh mục.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setName("");
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
        >
          <Plus className="size-4" /> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingId ? "Sửa danh mục" : "Thêm danh mục mới"}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="size-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Thiết kế UX/UI"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
            >
              <Check className="size-4" /> {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khóa học</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((cat) => {
              const color = pickColor(cat.slug || cat.title);
              return (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                        <Tag className="size-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cat.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Danh mục khóa học</p>
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
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">Không có danh mục.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
