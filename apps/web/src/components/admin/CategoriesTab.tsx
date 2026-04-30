"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/app/providers";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, type CategoryAdminDto } from "@/services/api";
import { toast } from "@/lib/notify";
import {
  CategoriesEmptyState,
  CategoriesFormPanel,
  CategoriesSearchBar,
  CategoriesTable,
} from "@/components/admin/CategoriesTabParts";

export default function CategoriesTab() {
  const { tx } = useI18n();
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
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => categories.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(tx("Category name cannot be empty.", "Tên danh mục không được để trống"));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminCategory(editingId, name.trim());
        setCategories(await fetchAdminCategories());
        toast.success(tx("Category updated!", "Đã cập nhật danh mục!"));
      } else {
        const created = await createAdminCategory(name.trim());
        setCategories((prev) => [...prev, created]);
        toast.success(tx("Category created!", "Đã thêm danh mục mới!"));
      }
      resetForm();
    } catch {
      toast.error(tx("Unable to save category.", "Không thể lưu danh mục."));
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
      toast.success(tx("Category deleted!", "Đã xóa danh mục!"));
    } catch {
      toast.error(tx("Unable to delete category.", "Không thể xóa danh mục."));
    }
  };

  return (
    <div>
      <CategoriesSearchBar
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setShowForm(true);
          setEditingId(null);
          setName("");
        }}
      />

      {showForm ? (
        <CategoriesFormPanel
          editingId={editingId}
          name={name}
          setName={setName}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          saving={saving}
        />
      ) : null}

      <CategoriesTable categories={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      {filtered.length === 0 ? <table className="w-full"><tbody><CategoriesEmptyState /></tbody></table> : null}
    </div>
  );
}
