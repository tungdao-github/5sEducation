"use client";

import { Check, Edit, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { CategoryAdminDto } from "@/services/api";

const colorPalette = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#F97316", "#84CC16"];

export function pickCategoryColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % colorPalette.length;
  return colorPalette[idx];
}

export function CategoriesSearchBar({
  search,
  setSearch,
  onAdd,
}: {
  search: string;
  setSearch: (value: string) => void;
  onAdd: () => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tx("Search categories...", "Tìm danh mục...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        <Plus className="size-4" /> {tx("Add category", "Thêm danh mục")}
      </button>
    </div>
  );
}

export function CategoriesFormPanel({
  editingId,
  name,
  setName,
  onSubmit,
  onCancel,
  saving,
}: {
  editingId: number | null;
  name: string;
  setName: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{editingId ? tx("Edit category", "Sửa danh mục") : tx("Add new category", "Thêm danh mục mới")}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="size-5" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{tx("Category name *", "Tên danh mục *")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tx("e.g. UX/UI design", "VD: Thiết kế UX/UI")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <Check className="size-4" /> {saving ? tx("Saving...", "Đang lưu...") : editingId ? tx("Update", "Cập nhật") : tx("Add new", "Thêm mới")}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          {tx("Cancel", "Hủy")}
        </button>
      </div>
    </div>
  );
}

function CategoriesRow({ cat, onEdit, onDelete }: { cat: CategoryAdminDto; onEdit: (cat: CategoryAdminDto) => void; onDelete: (id: number) => void }) {
  const { tx } = useI18n();
  const color = pickCategoryColor(cat.slug || cat.title);

  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Tag className="size-4" style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{cat.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{tx("Course category", "Danh mục khóa học")}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{cat.slug}</code>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-gray-900">{cat.courseCount} {tx("courses", "khóa học")}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(cat)} className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50">
            <Edit className="size-4" />
          </button>
          <button onClick={() => onDelete(cat.id)} className="rounded p-1.5 text-red-500 transition hover:bg-red-50">
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
}: {
  categories: CategoryAdminDto[];
  onEdit: (cat: CategoryAdminDto) => void;
  onDelete: (id: number) => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{tx("Category", "Danh mục")}</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{tx("Slug", "Đường dẫn")}</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{tx("Courses", "Khóa học")}</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{tx("Actions", "Thao tác")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <CategoriesRow key={cat.id} cat={cat} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CategoriesEmptyState() {
  const { tx } = useI18n();
  return <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">{tx("No categories yet.", "Không có danh mục.")}</td></tr>;
}
