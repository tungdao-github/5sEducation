"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  createLesson,
  deleteLesson,
  fetchCategories,
  fetchInstructorCourseById,
  fetchLessons,
  updateCourse,
  uploadLocalVideo,
} from "@/services/api";
import type { LessonDto } from "@/services/api";
import { resolveApiAsset } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";
import StudioCourseForm from "@/components/studio/StudioCourseForm";
import { StudioLessonsSection } from "@/components/studio/StudioLessonsSection";

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

type CourseEditorDto = Awaited<ReturnType<typeof fetchInstructorCourseById>> & {
  isPublished?: boolean;
};

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

const normalizeLesson = (lesson: LessonDto): Lesson => ({
  id: lesson.id,
  title: lesson.title,
  contentType: lesson.contentType,
  durationMinutes: lesson.durationMinutes ?? 0,
  videoUrl: lesson.videoUrl ?? "",
  sortOrder: lesson.sortOrder ?? 0,
  hasExercise: lesson.hasExercise ?? false,
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
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };

    const loadCourse = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      try {
        const data = (await fetchInstructorCourseById(courseId)) as CourseEditorDto;
        setTitle(String(data.title ?? ""));
        setShortDescription(String(data.shortDescription ?? ""));
        setDescription(String(data.description ?? ""));
        setOutcome(String(data.outcome ?? ""));
        setRequirements(String(data.requirements ?? ""));
        setLanguage(String(data.language ?? "English"));
        setPrice(String(data.price ?? "19.99"));
        setFlashSalePrice(
          data.flashSalePrice !== null && data.flashSalePrice !== undefined
            ? String(data.flashSalePrice)
            : ""
        );
        setFlashSaleStartsAt(
          data.flashSaleStartsAt ? new Date(String(data.flashSaleStartsAt)).toISOString().slice(0, 16) : ""
        );
        setFlashSaleEndsAt(
          data.flashSaleEndsAt ? new Date(String(data.flashSaleEndsAt)).toISOString().slice(0, 16) : ""
        );
        setLevel(String(data.level ?? "Beginner"));
        setPreviewVideoUrl(String(data.previewVideoUrl ?? ""));
        setIsPublished(Boolean(data.isPublished));
        setCategoryId(data.category?.id ? String(data.category.id) : "");
        const courseLessons = Array.isArray(data.lessons)
          ? data.lessons.map(normalizeLesson)
          : [];
        setLessons(courseLessons);
        setLessonSortOrder(String(courseLessons.length + 1));
      } catch {
        notify({
          title: tx("Course not found", "Khong tim thay khoa hoc"),
          message: tx("We could not load this course.", "Khong the tai khoa hoc nay."),
        });
        return;
      }
    };

    const loadLessons = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      try {
        const data = await fetchLessons(courseId);
        const normalizedLessons = data.map(normalizeLesson);
        setLessons(normalizedLessons);
        setLessonSortOrder(String(normalizedLessons.length + 1));
      } catch {
        setNeedsAuth(true);
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

  const uploadLocalCourseVideo = async (file: File) => {
    const localData = await uploadLocalVideo(courseId, file);
    return resolveApiAsset(localData.videoUrl ?? "");
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      await updateCourse(courseId, {
        title,
        categoryId: categoryId ? Number(categoryId) : null,
        shortDescription,
        description,
        outcome,
        requirements,
        language,
        price: Number(price),
        flashSalePrice: flashSalePrice ? Number(flashSalePrice) : null,
        flashSaleStartsAt: flashSaleStartsAt ? new Date(flashSaleStartsAt).toISOString() : null,
        flashSaleEndsAt: flashSaleEndsAt ? new Date(flashSaleEndsAt).toISOString() : null,
        level,
        previewVideoUrl,
        thumbnailUrl: "",
        isPublished,
        thumbnailFile: thumbnail,
      });
      notify({
        title: tx("Course updated", "Da cap nhat khoa hoc"),
        message: tx("Changes saved successfully.", "Da luu thay doi thanh cong."),
      });
    } catch {
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

    try {
      await createLesson({
        courseId,
        title: lessonTitle,
        contentType: lessonContentType as "video" | "exercise",
        durationMinutes: Number(lessonDuration),
        videoUrl: lessonContentType === "video" ? lessonVideoUrl.trim() : "",
        exerciseQuestion: isExerciseType ? firstQuestion?.question ?? "" : "",
        exerciseOptionA: isExerciseType ? firstQuestion?.optionA ?? "" : "",
        exerciseOptionB: isExerciseType ? firstQuestion?.optionB ?? "" : "",
        exerciseOptionC: isExerciseType ? firstQuestion?.optionC ?? "" : "",
        exerciseOptionD: isExerciseType ? firstQuestion?.optionD ?? "" : "",
        exerciseCorrectOption: isExerciseType ? firstQuestion?.correctOption : undefined,
        exerciseExplanation: isExerciseType ? firstQuestion?.explanation ?? "" : "",
        exercisePassingPercent: isExerciseType ? parsedPassingPercent : 80,
        exerciseTimeLimitMinutes: isExerciseType ? parsedTimeLimitMinutes : 0,
        exerciseMaxTabSwitches: isExerciseType ? parsedMaxTabSwitches : 2,
        exerciseQuestions: isExerciseType ? normalizedExerciseQuestions : [],
        sortOrder: Number(lessonSortOrder),
      });
      const data = await fetchLessons(courseId);
      setLessons(data.map(normalizeLesson));
      setLessonTitle("");
      setLessonContentType("video");
      setLessonDuration("5");
      setLessonVideoUrl("");
      setLessonExerciseQuestions([createQuestionDraft()]);
      setLessonExercisePassingPercent("80");
      setLessonExerciseTimeLimitMinutes("0");
      setLessonExerciseMaxTabSwitches("2");
      setLessonSortOrder(String((data?.length ?? 0) + 1));
    } catch {
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

    setIsUploadingVideo(true);
    try {
      const uploadedVideoUrl = await uploadLocalCourseVideo(file);
      setLessonVideoUrl(uploadedVideoUrl);
      notify({
        title: tx("Video uploaded", "ÄÃ£ táº£i video"),
        message: tx(
          "Upload complete. The lesson video URL was filled automatically.",
          "Táº£i video thÃ nh cÃ´ng. Link bÃ i há»c Ä‘Ã£ Ä‘Æ°á»£c Ä‘iá»n tá»± Ä‘á»™ng."
        ),
      });
    } catch (error) {
      notify({
        title: tx("Upload failed", "Táº£i lÃªn tháº¥t báº¡i"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui lÃ²ng thá»­ láº¡i."),
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handlePreviewVideoUpload = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsUploadingVideo(true);
    try {
      const uploadedVideoUrl = await uploadLocalCourseVideo(file);
      setPreviewVideoUrl(uploadedVideoUrl);
      notify({
        title: tx("Preview video uploaded", "ÄÃ£ táº£i video xem trÆ°á»›c"),
        message: tx(
          "The preview video URL was filled automatically.",
          "ÄÆ°á»ng dáº«n video xem trÆ°á»›c Ä‘Ã£ Ä‘Æ°á»£c Ä‘iá»n tá»± Ä‘á»™ng."
        ),
      });
    } catch (error) {
      notify({
        title: tx("Upload failed", "Táº£i lÃªn tháº¥t báº¡i"),
        message: error instanceof Error ? error.message : tx("Please try again.", "Vui lÃ²ng thá»­ láº¡i."),
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

    try {
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch {
      notify({
        title: tx("Delete failed", "Xoa that bai"),
        message: tx("Please try again.", "Vui long thu lai."),
      });
    }
  };

  const courseFormProps = {
    tx,
    categories,
    title,
    setTitle,
    categoryId,
    setCategoryId,
    shortDescription,
    setShortDescription,
    description,
    setDescription,
    outcome,
    setOutcome,
    requirements,
    setRequirements,
    language,
    setLanguage,
    price,
    setPrice,
    flashSalePrice,
    setFlashSalePrice,
    flashSaleStartsAt,
    setFlashSaleStartsAt,
    flashSaleEndsAt,
    setFlashSaleEndsAt,
    level,
    setLevel,
    previewVideoUrl,
    setPreviewVideoUrl,
    thumbnail,
    setThumbnail,
    isPublished,
    setIsPublished,
    isUploadingVideo,
    onPreviewVideoUpload: handlePreviewVideoUpload,
    onSubmit: handleUpdate,
  };

  if (needsAuth) {
    return (
      <div className="section-shell py-16 fade-in">
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to edit courses.", "Vui long dang nhap de sua khoa hoc.")}
          </p>
          <Link
            href={`/?auth=login&next=${encodeURIComponent(`/studio/${courseId}`)}`}
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <StudioCourseForm {...courseFormProps} />

      <StudioLessonsSection
        tx={tx}
        lessons={lessons}
        lessonTitle={lessonTitle}
        setLessonTitle={setLessonTitle}
        lessonContentType={lessonContentType}
        setLessonContentType={setLessonContentType}
        lessonDuration={lessonDuration}
        setLessonDuration={setLessonDuration}
        lessonVideoUrl={lessonVideoUrl}
        setLessonVideoUrl={setLessonVideoUrl}
        lessonSortOrder={lessonSortOrder}
        setLessonSortOrder={setLessonSortOrder}
        lessonExerciseQuestions={lessonExerciseQuestions}
        lessonExercisePassingPercent={lessonExercisePassingPercent}
        setLessonExercisePassingPercent={setLessonExercisePassingPercent}
        lessonExerciseTimeLimitMinutes={lessonExerciseTimeLimitMinutes}
        setLessonExerciseTimeLimitMinutes={setLessonExerciseTimeLimitMinutes}
        lessonExerciseMaxTabSwitches={lessonExerciseMaxTabSwitches}
        setLessonExerciseMaxTabSwitches={setLessonExerciseMaxTabSwitches}
        isUploadingVideo={isUploadingVideo}
        onAddLesson={handleAddLesson}
        onDeleteLesson={handleDeleteLesson}
        onUploadVideo={handleVideoUpload}
        onUpdateExerciseQuestion={updateExerciseQuestion}
        onAddExerciseQuestion={addExerciseQuestion}
        onRemoveExerciseQuestion={removeExerciseQuestion}
      />
    </div>
  );
}



