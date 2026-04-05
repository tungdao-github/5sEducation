"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

interface Category {
  id: number;
  title: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { tx } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [requirements, setRequirements] = useState("");
  const [language, setLanguage] = useState("English");
  const [price, setPrice] = useState("19.99");
  const [flashSalePrice, setFlashSalePrice] = useState("");
  const [flashSaleStartsAt, setFlashSaleStartsAt] = useState("");
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?next=/studio/new");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("ShortDescription", shortDescription);
    formData.append("Description", description);
    formData.append("Outcome", outcome);
    formData.append("Requirements", requirements);
    formData.append("Language", language);
    formData.append("Price", price);
    if (flashSalePrice) {
      formData.append("FlashSalePrice", flashSalePrice);
    }
    if (flashSaleStartsAt) {
      formData.append("FlashSaleStartsAt", new Date(flashSaleStartsAt).toISOString());
    }
    if (flashSaleEndsAt) {
      formData.append("FlashSaleEndsAt", new Date(flashSaleEndsAt).toISOString());
    }
    formData.append("Level", level);
    formData.append("PreviewVideoUrl", previewVideoUrl);
    formData.append("IsPublished", String(isPublished));

    if (categoryId) {
      formData.append("CategoryId", categoryId);
    }

    if (thumbnail) {
      formData.append("Thumbnail", thumbnail);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Create course failed");
      }

      notify({
        title: tx("Course created", "Da tao khoa hoc"),
        message: tx("Your course has been saved.", "Khoa hoc da duoc luu."),
      });
      router.push("/studio");
    } catch {
      notify({
        title: tx("Could not create course", "Khong the tao khoa hoc"),
        message: tx("Please review the form and try again.", "Vui long kiem tra form va thu lai."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/studio" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Studio
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Create a new course", "Tao khoa hoc moi")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Set the foundation for your new learning experience.", "Thiet lap noi dung co ban cho khoa hoc moi.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card space-y-6 rounded-3xl p-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Title", "Tieu de")}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Category", "Danh muc")}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            >
              <option value="">{tx("Select category", "Chon danh muc")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Level", "Trinh do")}
            </label>
            <input
              value={level}
              onChange={(e) => setLevel(e.currentTarget.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Short description", "Mo ta ngan")}
          </label>
          <input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.currentTarget.value)}
            required
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Description", "Mo ta")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
            rows={4}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Outcome", "Ket qua")}
            </label>
            <input
              value={outcome}
              onChange={(e) => setOutcome(e.currentTarget.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Requirements", "Yeu cau")}
            </label>
            <input
              value={requirements}
              onChange={(e) => setRequirements(e.currentTarget.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Language", "Ngon ngu")}
            </label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.currentTarget.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Price", "Gia")}
            </label>
            <input
              type="number"
              min="9.99"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.currentTarget.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Flash sale price", "Gia giam nhanh")}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={flashSalePrice}
              onChange={(e) => setFlashSalePrice(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Preview URL", "Lien ket preview")}
            </label>
            <input
              value={previewVideoUrl}
              onChange={(e) => setPreviewVideoUrl(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Flash sale start", "Bat dau giam gia")}
            </label>
            <input
              type="datetime-local"
              value={flashSaleStartsAt}
              onChange={(e) => setFlashSaleStartsAt(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Flash sale end", "Ket thuc giam gia")}
            </label>
            <input
              type="datetime-local"
              value={flashSaleEndsAt}
              onChange={(e) => setFlashSaleEndsAt(e.currentTarget.value)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Thumbnail", "Anh dai dien")}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.currentTarget.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-emerald-900">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.currentTarget.checked)}
              className="h-4 w-4"
            />
            {tx("Publish immediately", "Cong khai ngay")}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
        >
          {loading ? tx("Saving...", "Dang luu...") : tx("Save course", "Luu khoa hoc")}
        </button>
      </form>
    </div>
  );
}
