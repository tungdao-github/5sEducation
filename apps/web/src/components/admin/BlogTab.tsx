"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import { fetchAdminBlogPostDetail, fetchAdminBlogPosts, createAdminBlogPost, updateAdminBlogPost, deleteAdminBlogPost, type BlogPostAdminDto } from "@/services/api";
import { toast } from "@/lib/notify";
import BlogTabToolbar from "@/components/admin/blog/BlogTabToolbar";
import BlogPostForm, { defaultBlogForm, type BlogFormState } from "@/components/admin/blog/BlogPostForm";
import BlogPostList from "@/components/admin/blog/BlogPostList";

export default function BlogTab() {
  const { tx } = useI18n();
  const [posts, setPosts] = useState<BlogPostAdminDto[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BlogFormState>(defaultBlogForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminBlogPosts()
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreateForm = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(defaultBlogForm);
  };

  const resetForm = () => {
    setForm(defaultBlogForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (post: BlogPostAdminDto) => {
    try {
      const detail = await fetchAdminBlogPostDetail(post.slug);
      setForm({
        title: detail.title,
        summary: detail.summary,
        content: detail.content,
        authorName: detail.authorName,
        tags: (detail.tags || []).join(", "),
        locale: detail.locale || "vi",
        coverImageUrl: detail.coverImageUrl || "",
        isPublished: detail.publishedAt != null,
        seoTitle: detail.seoTitle || "",
        seoDescription: detail.seoDescription || "",
        slug: detail.slug || "",
      });
      setEditingId(detail.id);
      setShowForm(true);
    } catch {
      toast.error(tx("Unable to load the post.", "Không thể tải bài viết."));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminBlogPost(id);
      setPosts((prev) => prev.filter((item) => item.id !== id));
      toast.success(tx("Post deleted!", "Đã xóa bài viết!"));
    } catch {
      toast.error(tx("Unable to delete the post.", "Không thể xóa bài viết."));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.authorName.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error(tx("Title, author, summary and content are required.", "Tiêu đề, tác giả, mô tả và nội dung không được để trống"));
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      authorName: form.authorName.trim(),
      locale: form.locale || "vi",
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isPublished: form.isPublished,
      publishedAt: form.isPublished ? new Date().toISOString() : null,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      coverImageUrl: form.coverImageUrl.trim() || null,
      slug: form.slug.trim() || null,
    };

    try {
      if (editingId) {
        await updateAdminBlogPost(editingId, payload);
        const refreshed = await fetchAdminBlogPosts();
        setPosts(refreshed);
        toast.success(tx("Post updated!", "Đã cập nhật bài viết!"));
      } else {
        const created = await createAdminBlogPost(payload);
        setPosts((prev) => [created, ...prev]);
        toast.success(tx("Post created!", "Đã thêm bài viết mới!"));
      }
      resetForm();
    } catch {
      toast.error(tx("Unable to save the post.", "Lưu bài viết thất bại."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <BlogTabToolbar search={search} setSearch={setSearch} onCreateNew={openCreateForm} />

      {showForm ? (
        <BlogPostForm
          editingId={editingId}
          form={form}
          setForm={setForm}
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      ) : null}

      <BlogPostList posts={posts} loading={loading} search={search} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
