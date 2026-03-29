"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { API_URL, resolveApiAsset } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

interface Category {
  id: number;
  title: string;
}

interface Lesson {
  id: number;
  title: string;
  contentType?: string;
  durationMinutes: number;
  videoUrl: string;
  sortOrder: number;
  hasExercise?: boolean;
}

interface VideoUploadSession {
  uploadUrl: string;
  videoUid: string;
  playerUrl: string;
}

interface ExerciseQuestionDraft {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

const useLocalUploadsOnly = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER === "local";

const createQuestionDraft = (): ExerciseQuestionDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "1",
  explanation: "",
});

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const { tx } = useI18n();

  const [needsAuth, setNeedsAuth] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

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

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContentType, setLessonContentType] = useState("video");
  const [lessonDuration, setLessonDuration] = useState("5");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonSortOrder, setLessonSortOrder] = useState("1");
  const [lessonExerciseQuestions, setLessonExerciseQuestions] = useState<ExerciseQuestionDraft[]>([createQuestionDraft()]);
  const [lessonExercisePassingPercent, setLessonExercisePassingPercent] = useState("80");
  const [lessonExerciseTimeLimitMinutes, setLessonExerciseTimeLimitMinutes] = useState("0");
  const [lessonExerciseMaxTabSwitches, setLessonExerciseMaxTabSwitches] = useState("2");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    };

    const loadCourse = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      const res = await fetch(`${API_URL}/api/instructor/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        notify({
          title: tx("Course not found", "Khong tim thay khoa hoc"),
          message: tx("We could not load this course.", "Khong the tai khoa hoc nay."),
        });
        return;
      }

      const data = await res.json();
      setTitle(data.title ?? "");
      setShortDescription(data.shortDescription ?? "");
      setDescription(data.description ?? "");
      setOutcome(data.outcome ?? "");
      setRequirements(data.requirements ?? "");
      setLanguage(data.language ?? "English");
      setPrice(String(data.price ?? "19.99"));
      setFlashSalePrice(
        data.flashSalePrice !== null && data.flashSalePrice !== undefined
          ? String(data.flashSalePrice)
          : ""
      );
      setFlashSaleStartsAt(
        data.flashSaleStartsAt ? new Date(data.flashSaleStartsAt).toISOString().slice(0, 16) : ""
      );
      setFlashSaleEndsAt(
        data.flashSaleEndsAt ? new Date(data.flashSaleEndsAt).toISOString().slice(0, 16) : ""
      );
      setLevel(data.level ?? "Beginner");
      setPreviewVideoUrl(data.previewVideoUrl ?? "");
      setIsPublished(Boolean(data.isPublished));
      setCategoryId(data.category?.id ? String(data.category.id) : "");
      setLessons(data.lessons ?? []);
      setLessonSortOrder(String((data.lessons?.length ?? 0) + 1));
    };

    const loadLessons = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      const res = await fetch(`${API_URL}/api/lessons?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLessons(data);
        setLessonSortOrder(String((data?.length ?? 0) + 1));
      }
    };

    loadCategories();
    loadCourse();
    loadLessons();
  }, [courseId]);

  const updateExerciseQuestion = (
    id: string,
    key: keyof Omit<ExerciseQuestionDraft, "id">,
    value: string
  ) => {
    setLessonExerciseQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, [key]: value } : question))
    );
  };

  const addExerciseQuestion = () => {
    setLessonExerciseQuestions((prev) => [...prev, createQuestionDraft()]);
  };

  const removeExerciseQuestion = (id: string) => {
    setLessonExerciseQuestions((prev) => {
      if (prev.length <= 1) {
        return [createQuestionDraft()];
      }

      return prev.filter((question) => question.id !== id);
    });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
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

    const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      notify({
        title: tx("Course updated", "Da cap nhat khoa hoc"),
        message: tx("Changes saved successfully.", "Da luu thay doi thanh cong."),
      });
    } else {
      notify({
        title: tx("Update failed", "Cap nhat that bai"),
        message: tx("Please review the form and try again.", "Vui long kiem tra form va thu lai."),
      });
    }
  };

  const handleAddLesson = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const isExerciseType = lessonContentType === "exercise";

    if (lessonContentType === "video" && !lessonVideoUrl.trim()) {
      notify({
        title: tx("Missing video URL", "Thieu link video"),
        message: tx("Video lesson needs a video URL or uploaded video.", "Bai video can co link hoac file da upload."),
      });
      return;
    }

    const normalizedExerciseQuestions = lessonExerciseQuestions
      .map((question, index) => ({
        question: question.question.trim(),
        optionA: question.optionA.trim(),
        optionB: question.optionB.trim(),
        optionC: question.optionC.trim(),
        optionD: question.optionD.trim(),
        explanation: question.explanation.trim(),
        correctOption: Number(question.correctOption),
        sortOrder: index + 1,
      }))
      .filter((question) =>
        question.question
        || question.optionA
        || question.optionB
        || question.optionC
        || question.optionD
        || question.explanation
      );

    if (isExerciseType) {
      if (normalizedExerciseQuestions.length === 0) {
        notify({
          title: tx("Missing exercise questions", "Thieu cau hoi bai tap"),
          message: tx("Please add at least one exercise question.", "Hay them it nhat mot cau hoi."),
        });
        return;
      }

      for (const [index, question] of normalizedExerciseQuestions.entries()) {
        if (!question.question) {
          notify({
            title: tx(`Question ${index + 1} missing`, `Thieu cau hoi ${index + 1}`),
            message: tx("Please enter question text.", "Hay nhap noi dung cau hoi."),
          });
          return;
        }

        if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
          notify({
            title: tx(`Question ${index + 1} incomplete`, `Cau hoi ${index + 1} chua day du`),
            message: tx("Each question needs four answer options.", "Moi cau hoi can 4 lua chon."),
          });
          return;
        }

        if (!Number.isInteger(question.correctOption) || question.correctOption < 1 || question.correctOption > 4) {
          notify({
            title: tx(`Question ${index + 1} invalid`, `Cau hoi ${index + 1} khong hop le`),
            message: tx("Correct answer must be between 1 and 4.", "Dap an dung phai tu 1 den 4."),
          });
          return;
        }
      }
    }

    const parsedPassingPercent = Number(lessonExercisePassingPercent);
    const parsedTimeLimitMinutes = Number(lessonExerciseTimeLimitMinutes);
    const parsedMaxTabSwitches = Number(lessonExerciseMaxTabSwitches);

    if (isExerciseType && (!Number.isInteger(parsedPassingPercent) || parsedPassingPercent < 1 || parsedPassingPercent > 100)) {
      notify({
        title: tx("Invalid passing score", "Diem dat khong hop le"),
        message: tx("Passing score must be between 1 and 100.", "Diem dat phai tu 1 den 100."),
      });
      return;
    }

    if (isExerciseType && (!Number.isInteger(parsedTimeLimitMinutes) || parsedTimeLimitMinutes < 0 || parsedTimeLimitMinutes > 180)) {
      notify({
        title: tx("Invalid time limit", "Thoi gian khong hop le"),
        message: tx("Time limit must be between 0 and 180 minutes.", "Thoi gian phai tu 0 den 180 phut."),
      });
      return;
    }

    if (isExerciseType && (!Number.isInteger(parsedMaxTabSwitches) || parsedMaxTabSwitches < 0 || parsedMaxTabSwitches > 20)) {
      notify({
        title: tx("Invalid tab switch limit", "Gioi han doi tab khong hop le"),
        message: tx("Tab switch limit must be between 0 and 20.", "Gioi han doi tab phai tu 0 den 20."),
      });
      return;
    }

    const firstQuestion = normalizedExerciseQuestions[0];

    const res = await fetch(`${API_URL}/api/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId,
        title: lessonTitle,
        contentType: lessonContentType,
        durationMinutes: Number(lessonDuration),
        videoUrl: lessonContentType === "video" ? lessonVideoUrl.trim() : "",
        sortOrder: Number(lessonSortOrder),
        exerciseQuestion: isExerciseType ? firstQuestion?.question ?? "" : "",
        exerciseOptionA: isExerciseType ? firstQuestion?.optionA ?? "" : "",
        exerciseOptionB: isExerciseType ? firstQuestion?.optionB ?? "" : "",
        exerciseOptionC: isExerciseType ? firstQuestion?.optionC ?? "" : "",
        exerciseOptionD: isExerciseType ? firstQuestion?.optionD ?? "" : "",
        exerciseCorrectOption: isExerciseType ? firstQuestion?.correctOption ?? null : null,
        exerciseExplanation: isExerciseType ? firstQuestion?.explanation ?? "" : "",
        exercisePassingPercent: isExerciseType ? parsedPassingPercent : 80,
        exerciseTimeLimitMinutes: isExerciseType ? parsedTimeLimitMinutes : 0,
        exerciseMaxTabSwitches: isExerciseType ? parsedMaxTabSwitches : 2,
        exerciseQuestions: isExerciseType ? normalizedExerciseQuestions : [],
      }),
    });

    if (res.ok) {
      const reload = await fetch(`${API_URL}/api/lessons?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reload.ok) {
        const data = await reload.json();
        setLessons(data);
        setLessonTitle("");
        setLessonContentType("video");
        setLessonDuration("5");
        setLessonVideoUrl("");
        setLessonExerciseQuestions([createQuestionDraft()]);
        setLessonExercisePassingPercent("80");
        setLessonExerciseTimeLimitMinutes("0");
        setLessonExerciseMaxTabSwitches("2");
        setLessonSortOrder(String((data?.length ?? 0) + 1));
      }
    } else {
      notify({
        title: tx("Lesson not saved", "Khong the luu bai hoc"),
        message: tx("Please check the lesson fields.", "Hay kiem tra thong tin bai hoc."),
      });
    }
  };

  const handleVideoUpload = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const readErrorMessage = async (res: Response) => {
      let raw = "";
      try {
        raw = await res.text();
      } catch {
        return `Request failed (${res.status})`;
      }

      if (!raw) {
        return `Request failed (${res.status})`;
      }

      try {
        const data = JSON.parse(raw) as Record<string, unknown>;
        if (typeof data.message === "string") return data.message;
        if (typeof data.detail === "string") return data.detail;
        if (typeof data.title === "string") return data.title;
      } catch {
        // raw is not JSON
      }

      return raw;
    };

    setIsUploadingVideo(true);
    try {
      let uploadedVideoUrl = "";
      let cloudflareError = "";

      if (useLocalUploadsOnly) {
        const localForm = new FormData();
        localForm.append("courseId", String(courseId));
        localForm.append("file", file);

        const localRes = await fetch(`${API_URL}/api/uploads/video/local`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: localForm,
        });

        if (!localRes.ok) {
          const fallbackErrorText = await localRes.text();
          throw new Error(fallbackErrorText || "Video upload failed.");
        }

        const localData = (await localRes.json()) as { videoUrl?: string };
        uploadedVideoUrl = resolveApiAsset(localData.videoUrl ?? "");
      } else {
      try {
        const sessionRes = await fetch(`${API_URL}/api/uploads/video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
          }),
        });

        if (!sessionRes.ok) {
          cloudflareError = await readErrorMessage(sessionRes);
          throw new Error(cloudflareError);
        }

        const session = (await sessionRes.json()) as VideoUploadSession;
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(session.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          cloudflareError = "Cloudflare upload failed.";
          throw new Error(cloudflareError);
        }

        uploadedVideoUrl = session.playerUrl;
      } catch {
        const localForm = new FormData();
        localForm.append("courseId", String(courseId));
        localForm.append("file", file);

        const localRes = await fetch(`${API_URL}/api/uploads/video/local`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: localForm,
        });

        if (!localRes.ok) {
          const fallbackErrorText = await localRes.text();
          throw new Error(fallbackErrorText || "Video upload failed.");
        }

        const localData = (await localRes.json()) as { videoUrl?: string };
        uploadedVideoUrl = resolveApiAsset(localData.videoUrl ?? "");

        if (cloudflareError) {
          notify({
            title: "Cloudflare upload failed",
            message: `Local upload was used instead. ${cloudflareError}`,
          });
        }
      }
      }

      setLessonVideoUrl(uploadedVideoUrl);
      notify({
        title: tx("Video uploaded", "Da tai video"),
        message: tx(
          "Upload complete. The lesson video URL was filled automatically.",
          "Tai video thanh cong. Link bai hoc da duoc dien tu dong."
        ),
      });
    } catch (error) {
      notify({
        title: tx("Upload failed", "Tai len that bai"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui long thu lai."),
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const res = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    }
  };

  if (needsAuth) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 fade-in">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to edit courses.", "Vui long dang nhap de sua khoa hoc.")}
          </p>
          <Link
            href={`/login?next=/studio/${courseId}`}
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12 fade-in">
      <div className="space-y-2">
        <Link href="/studio" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Studio
        </Link>
        <h1 className="section-title text-4xl font-semibold text-emerald-950">
          {tx("Edit course", "Sua khoa hoc")}
        </h1>
        <p className="text-sm text-emerald-800/70">
          {tx("Update details and manage lessons.", "Cap nhat thong tin va quan ly bai hoc.")}
        </p>
      </div>

      <form onSubmit={handleUpdate} className="glass-card space-y-6 rounded-3xl p-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {tx("Title", "Tieu de")}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Preview URL", "Lien ket preview")}
            </label>
            <input
              value={previewVideoUrl}
              onChange={(e) => setPreviewVideoUrl(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
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
          className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
        >
          {tx("Save changes", "Luu thay doi")}
        </button>
      </form>

      <section className="glass-card space-y-6 rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title text-2xl font-semibold text-emerald-950">
              {tx("Lessons", "Bai hoc")}
            </h2>
            <p className="text-sm text-emerald-800/70">
              {tx("Add, reorder, or remove lessons.", "Them, sap xep, hoac xoa bai hoc.")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {lessons.length === 0 && (
            <p className="text-sm text-emerald-800/70">
              {tx("No lessons yet. Add your first lesson below.", "Chua co bai hoc. Hay them bai hoc dau tien.")}
            </p>
          )}
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
              <div>
                <p className="text-sm font-semibold text-emerald-950">{lesson.title}</p>
                <p className="text-xs text-emerald-800/70">
                  {lesson.durationMinutes} mins - Sort {lesson.sortOrder}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {(lesson.contentType ?? "video").toLowerCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteLesson(lesson.id)}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
              >
                {tx("Delete", "Xoa")}
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Lesson title", "Tieu de bai hoc")}
            </label>
            <input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Lesson type", "Loai bai hoc")}
            </label>
            <select
              value={lessonContentType}
              onChange={(e) => setLessonContentType(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            >
              <option value="video">{tx("Video", "Video")}</option>
              <option value="exercise">{tx("Exercise", "Bai tap")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Duration (mins)", "Thoi luong (phut)")}
            </label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          {lessonContentType === "video" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Video URL", "Link video")}
                </label>
                <input
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.currentTarget.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Upload video (Cloudflare Stream)", "Tai video (Cloudflare Stream)")}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      handleVideoUpload(file);
                    }
                    e.currentTarget.value = "";
                  }}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                />
                <p className="text-xs text-emerald-800/70">
                  {tx("We will upload the video and fill the lesson URL automatically.", "He thong se tu dong dien link bai hoc sau khi tai xong.")}
                </p>
                {isUploadingVideo && (
                  <p className="text-xs font-semibold text-emerald-700">
                    {tx("Uploading video...", "Dang tai video...")}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {tx("Sort order", "Thu tu")}
            </label>
            <input
              type="number"
              value={lessonSortOrder}
              onChange={(e) => setLessonSortOrder(e.currentTarget.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
            />
          </div>
          {lessonContentType === "exercise" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Passing score (%)", "Diem dat (%)")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={lessonExercisePassingPercent}
                  onChange={(e) => setLessonExercisePassingPercent(e.currentTarget.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Time limit (minutes, 0 = no limit)", "Gioi han thoi gian (0 = khong gioi han)")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={lessonExerciseTimeLimitMinutes}
                  onChange={(e) => setLessonExerciseTimeLimitMinutes(e.currentTarget.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {tx("Max tab switches", "So lan doi tab toi da")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={lessonExerciseMaxTabSwitches}
                  onChange={(e) => setLessonExerciseMaxTabSwitches(e.currentTarget.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                {lessonExerciseQuestions.map((question, index) => (
                  <div key={question.id} className="rounded-2xl border border-emerald-100 bg-white/70 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {tx(`Question ${index + 1}`, `Cau hoi ${index + 1}`)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeExerciseQuestion(question.id)}
                        className="rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-900"
                      >
                        {tx("Remove", "Xoa")}
                      </button>
                    </div>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateExerciseQuestion(question.id, "question", e.currentTarget.value)}
                      rows={2}
                      placeholder={tx("Add a quiz question for this lesson...", "Nhap cau hoi cho bai hoc...")}
                      className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={question.optionA}
                        onChange={(e) => updateExerciseQuestion(question.id, "optionA", e.currentTarget.value)}
                        placeholder={tx("Option A", "Lua chon A")}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      />
                      <input
                        value={question.optionB}
                        onChange={(e) => updateExerciseQuestion(question.id, "optionB", e.currentTarget.value)}
                        placeholder={tx("Option B", "Lua chon B")}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      />
                      <input
                        value={question.optionC}
                        onChange={(e) => updateExerciseQuestion(question.id, "optionC", e.currentTarget.value)}
                        placeholder={tx("Option C", "Lua chon C")}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      />
                      <input
                        value={question.optionD}
                        onChange={(e) => updateExerciseQuestion(question.id, "optionD", e.currentTarget.value)}
                        placeholder={tx("Option D", "Lua chon D")}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={question.correctOption}
                        onChange={(e) => updateExerciseQuestion(question.id, "correctOption", e.currentTarget.value)}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      >
                        <option value="1">{tx("Correct option: A", "Dap an dung: A")}</option>
                        <option value="2">{tx("Correct option: B", "Dap an dung: B")}</option>
                        <option value="3">{tx("Correct option: C", "Dap an dung: C")}</option>
                        <option value="4">{tx("Correct option: D", "Dap an dung: D")}</option>
                      </select>
                      <input
                        value={question.explanation}
                        onChange={(e) => updateExerciseQuestion(question.id, "explanation", e.currentTarget.value)}
                        placeholder={tx("Explanation (optional)", "Giai thich (tuy chon)")}
                        className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExerciseQuestion}
                  className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900"
                >
                  {tx("Add another question", "Them cau hoi")}
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddLesson}
          className="rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-900"
        >
          {tx("Add lesson", "Them bai hoc")}
        </button>
      </section>
    </div>
  );
}
