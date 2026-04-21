"use client";

import { useEffect, useMemo, useState, type ElementType } from 'react';
import { Link, useParams } from '@/figma/compat/router';
import { Award, BookOpen, ChevronLeft, ChevronRight, Info, Menu, MessageSquare, PenSquare, StickyNote, X } from 'lucide-react';
import { toast } from '@/figma/compat/sonner';
import { useAuth } from '../contexts/AuthContext';
import {
  buildLearningSections,
  fetchCourseById,
  fetchCourseBySlug,
  fetchLessons,
  fetchProgress,
  mapCourseDetail,
  type CourseModel,
  type LearningLesson,
  type LearningSection,
  updateCourseProgress,
} from '../data/api';
import CourseSidebar from '../components/learning/CourseSidebar';
import ExercisePanel from '../components/learning/ExercisePanel';
import NotesPanel from '../components/learning/NotesPanel';
import OverviewPanel from '../components/learning/OverviewPanel';
import VideoPlayer from '../components/learning/VideoPlayer';

type TabId = 'overview' | 'notes' | 'qa' | 'exercise';

type QaItem = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  question: string;
  answer?: string;
  votes: number;
};

const TABS: { id: TabId; label: string; Icon: ElementType; showFor?: LearningLesson['type'][] }[] = [
  { id: 'overview', label: 'Tổng quan', Icon: Info },
  { id: 'notes', label: 'Ghi chú', Icon: StickyNote },
  { id: 'qa', label: 'Hỏi & Đáp', Icon: MessageSquare },
  { id: 'exercise', label: 'Bài tập', Icon: PenSquare, showFor: ['quiz'] },
];

const INITIAL_QA: QaItem[] = [
  {
    id: '1',
    user: 'Nguyễn Văn An',
    avatar: 'NA',
    time: '2 ngày trước',
    question: 'Nếu tôi làm lại bài quiz thì tiến độ có bị mất không?',
    answer:
      'Không. Tiến độ và kết quả bài quiz vẫn được lưu. Bạn có thể làm lại để cải thiện điểm bất cứ lúc nào.',
    votes: 12,
  },
  {
    id: '2',
    user: 'Trần Thị Bình',
    avatar: 'TB',
    time: '5 ngày trước',
    question: 'Video URL từ backend có hỗ trợ YouTube và Vimeo không?',
    answer:
      'Có. Trang học tự động đổi sang iframe embed cho YouTube và Vimeo, video file thì phát bằng player native.',
    votes: 8,
  },
  {
    id: '3',
    user: 'Lê Minh Đức',
    avatar: 'LM',
    time: '1 tuần trước',
    question: 'Ghi chú theo timestamp có tua video được không?',
    answer:
      'Có với video native. Nếu bài học đang dùng iframe embed thì ghi chú vẫn được lưu, nhưng việc tua phụ thuộc player gốc.',
    votes: 15,
  },
];

export default function CourseLearn() {
  const params = useParams() as { courseId?: string; id?: string; slug?: string };
  const courseKey = params.courseId ?? params.id ?? params.slug ?? '';
  const { isAuthenticated, openAuthModal } = useAuth();
  const [course, setCourse] = useState<CourseModel | null>(null);
  const [sections, setSections] = useState<LearningSection[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<LearningLesson | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekRequest, setSeekRequest] = useState<{ time: number; version: number } | null>(null);

  const flatLessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!courseKey) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const numericCourseKey = Number(courseKey);
        const courseDetail =
          Number.isFinite(numericCourseKey) && numericCourseKey > 0
            ? await fetchCourseById(numericCourseKey)
            : await fetchCourseBySlug(courseKey);
        const resolvedCourseId = Number(courseDetail.id);
        const [courseLessons, progress] = await Promise.all([
          fetchLessons(resolvedCourseId),
          fetchProgress(resolvedCourseId),
        ]);
        if (cancelled) return;

        const mappedCourse = mapCourseDetail(courseDetail);
        const learningSections = buildLearningSections(courseLessons);
        const learningLessons = learningSections.flatMap((section) => section.lessons);
        const initialLesson = learningLessons.find((lesson) => lesson.numericId === progress.lastLessonId) ?? learningLessons[0] ?? null;

        setCourse(mappedCourse);
        setSections(learningSections);
        setCompletedIds(progress.completedLessonIds ?? []);
        setCompletionPercent(progress.progressPercent ?? 0);
        setCurrentLesson(initialLesson);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : 'Không thể tải bài học.';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseKey, isAuthenticated, openAuthModal]);

  useEffect(() => {
    if (currentLesson?.type === 'quiz') {
      setActiveTab('overview');
    }
    setCurrentTime(0);
    setSeekRequest(null);
  }, [currentLesson?.id]);

  const currentIndex = flatLessons.findIndex((lesson) => lesson.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const isCurrentCompleted = !!currentLesson && completedIds.includes(currentLesson.numericId);

  const visibleTabs = TABS.filter((tab) => !tab.showFor || (currentLesson && tab.showFor.includes(currentLesson.type)));

  const selectLesson = async (lesson: LearningLesson) => {
    setCurrentLesson(lesson);
    setActiveTab(lesson.type === 'quiz' ? 'exercise' : 'overview');
    try {
      const snapshot = await updateCourseProgress({
        courseId: Number(course?.id ?? courseKey),
        lessonId: lesson.numericId,
        setAsLast: true,
      });
      setCompletedIds(snapshot.completedLessonIds ?? []);
      setCompletionPercent(snapshot.progressPercent ?? 0);
    } catch {
      // background sync only
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !course) return;
    try {
      const snapshot = await updateCourseProgress({
        courseId: Number(course.id),
        lessonId: currentLesson.numericId,
        isCompleted: true,
        setAsLast: true,
      });
      setCompletedIds(snapshot.completedLessonIds ?? []);
      setCompletionPercent(snapshot.progressPercent ?? 0);
      toast.success('Đã cập nhật tiến độ học tập.');
    } catch (completeError) {
      toast.error(completeError instanceof Error ? completeError.message : 'Cập nhật tiến độ thất bại.');
    }
  };

  const handleSeekFromNotes = (time: number) => {
    setSeekRequest((current) => ({
      time,
      version: (current?.version ?? 0) + 1,
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 size-16 opacity-50" />
          <p>Bạn cần đăng nhập để học khóa học.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Đang tải bài học...
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 size-16 opacity-50" />
          <h2 className="mb-4 text-xl">{error || 'Không tìm thấy khóa học'}</h2>
          <Link to="/my-learning" className="text-blue-400 hover:underline">
            ← Về trang học của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950">
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-gray-800 bg-gray-900 px-4">
        <Link
          to="/my-learning"
          className="flex shrink-0 items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">EduCourse</span>
        </Link>
        <div className="h-5 w-px shrink-0 bg-gray-700" />
        <h1 className="flex-1 truncate text-sm font-medium text-gray-200">{course.title}</h1>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-gray-700">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${completionPercent}%` }} />
            </div>
            <span className="text-xs text-gray-400">
              {Math.round(completionPercent)}% <span className="hidden text-gray-600 lg:inline">hoàn thành</span>
            </span>
          </div>
        </div>
        {Math.round(completionPercent) === 100 && (
          <button className="hidden items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-gray-900 transition hover:bg-yellow-400 sm:flex">
            <Award className="size-3.5" /> Chứng chỉ
          </button>
        )}
        <button
          onClick={() => setSidebarOpen((value) => !value)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          title={sidebarOpen ? "Đóng nội dung khóa học" : "Mở nội dung khóa học"}
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col">
            <div className="shrink-0 bg-black">
              <VideoPlayer
                lesson={currentLesson}
                courseThumbnail={course.image}
                courseTitle={course.title}
                isCompleted={isCurrentCompleted}
                onComplete={() => void handleLessonComplete()}
                onNext={nextLesson ? () => void selectLesson(nextLesson) : undefined}
                onPrev={prevLesson ? () => void selectLesson(prevLesson) : undefined}
                onTimeChange={setCurrentTime}
                seekToSeconds={seekRequest?.time ?? null}
                seekVersion={seekRequest?.version ?? 0}
              />
            </div>

            {currentLesson && (
              <div className="flex items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 py-3">
                <button
                  onClick={() => prevLesson && void selectLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="inline size-4" /> Bài trước
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-sm font-medium text-gray-200">{currentLesson.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {sections.find((section) => section.id === currentLesson.sectionId)?.title}
                  </p>
                </div>
                <button
                  onClick={() => nextLesson && void selectLesson(nextLesson)}
                  disabled={!nextLesson}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Bài tiếp <ChevronRight className="inline size-4" />
                </button>
              </div>
            )}

            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "border-blue-600 bg-blue-50/50 text-blue-600"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.Icon className="size-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
                {currentLesson?.type === "quiz" && currentLesson.exercise && !visibleTabs.find((tab) => tab.id === "exercise") && (
                  <button
                    onClick={() => setActiveTab("exercise")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition ${
                      activeTab === "exercise"
                        ? "border-orange-500 bg-orange-50/50 text-orange-600"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <PenSquare className="size-4" />
                    <span>Bài tập</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white pb-20">
              {activeTab === "overview" ? (
                <OverviewPanel lesson={currentLesson} />
              ) : activeTab === "notes" ? (
                <NotesPanel
                  courseId={String(course.id)}
                  lessonId={currentLesson.id}
                  currentTime={currentTime}
                  onSeek={handleSeekFromNotes}
                />
              ) : activeTab === "qa" ? (
                <QATab lesson={currentLesson} />
              ) : activeTab === "exercise" ? (
                currentLesson.exercise ? (
                  <ExercisePanel
                    lesson={currentLesson}
                    courseId={String(course.id)}
                    lessonId={currentLesson.id}
                    onPassed={() => void handleLessonComplete()}
                  />
                ) : (
                  <div className="flex items-center justify-center py-20 text-gray-400">
                    <div className="text-center">
                      <PenSquare className="mx-auto mb-3 size-12 opacity-50" />
                      <p className="font-medium">Bài học này không có bài tập</p>
                      <p className="mt-1 text-sm">Chọn bài kiểm tra 🧪 trong danh sách bài học</p>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={`shrink-0 border-l border-gray-800 transition-all duration-300 ${
            sidebarOpen ? "w-80 xl:w-96" : "w-0 overflow-hidden"
          }`}
        >
          <div className="h-full w-80 xl:w-96">
            <CourseSidebar
              sections={sections}
              currentLessonId={currentLesson.id}
              completedIds={completedIds}
              onSelectLesson={selectLesson}
              courseTitle={course.title}
              completionPercent={completionPercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QATab({ lesson }: { lesson: LearningLesson }) {
  const [question, setQuestion] = useState('');
  const [items, setItems] = useState<QaItem[]>(INITIAL_QA);

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setItems((current) => [
      {
        id: `local-${Date.now()}`,
        user: 'Bạn',
        avatar: 'BN',
        time: 'Vừa xong',
        question: trimmed,
        votes: 0,
      },
      ...current,
    ]);
    setQuestion('');
  };

  const handleVote = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item)));
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Hỏi & Đáp</h2>
          <span className="text-sm text-gray-500">{items.length} câu hỏi</span>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Đặt câu hỏi cho bài học này</h3>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            rows={3}
            className="mb-2 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-end">
            <button
              disabled={!question.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-40"
              onClick={handleSubmit}
            >
              Gửi câu hỏi
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-gray-200">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {item.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.user}</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.question}</p>
                  </div>
                  <button
                    onClick={() => handleVote(item.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-blue-600"
                  >
                    ▲ {item.votes}
                  </button>
                </div>
              </div>
              {item.answer && (
                <div className="border-t border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      GV
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-900">Giảng viên</span>
                        <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs text-blue-800">Giảng viên</span>
                      </div>
                      <p className="text-sm text-blue-800">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

