import { useState, useEffect, useCallback } from 'react';
import type { ElementType } from 'react';
import { useParams, Link } from 'react-router';
import {
  ChevronLeft, ChevronRight, Menu, X, BookOpen,
  MessageSquare, StickyNote, PenSquare, Info, Award
} from 'lucide-react';
import { courses } from '../data/courses';
import { courseSections, CourseLessonItem, getLessonsForCourse, getAdjacentLessons, getFirstLesson } from '../data/lessons';
import { useLearning } from '../contexts/LearningContext';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/learning/VideoPlayer';
import CourseSidebar from '../components/learning/CourseSidebar';
import ExercisePanel from '../components/learning/ExercisePanel';
import NotesPanel from '../components/learning/NotesPanel';
import OverviewPanel from '../components/learning/OverviewPanel';

type TabId = 'overview' | 'notes' | 'qa' | 'exercise';

const TABS: { id: TabId; label: string; Icon: ElementType; showFor?: CourseLessonItem['type'][] }[] = [
  { id: 'overview', label: 'Tổng quan', Icon: Info },
  { id: 'notes', label: 'Ghi chú', Icon: StickyNote },
  { id: 'qa', label: 'Hỏi & Đáp', Icon: MessageSquare },
  { id: 'exercise', label: 'Bài tập', Icon: PenSquare, showFor: ['quiz'] },
];

export default function CourseLearn() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    getProgress, markLessonComplete, setCurrentLesson,
    isLessonCompleted, getCompletionPercent,
  } = useLearning();

  const course = courses.find(c => c.id === courseId);
  const sections = courseId ? (courseSections[courseId] ?? []) : [];
  const allLessons = courseId ? getLessonsForCourse(courseId) : [];

  // Current lesson state
  const [currentLesson, setCurrentLessonState] = useState<CourseLessonItem | null>(() => {
    if (!courseId) return null;
    const progress = getProgress(courseId);
    const savedId = progress.currentLessonId;
    if (savedId) {
      const found = allLessons.find(l => l.id === savedId);
      if (found) return found;
    }
    return getFirstLesson(courseId) ?? null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [currentTime] = useState(0); // would track actual video time

  const progress = courseId ? getProgress(courseId) : null;
  const completedIds = progress?.completedLessonIds ?? [];
  const completionPercent = courseId ? getCompletionPercent(courseId, allLessons.length) : 0;

  // Auto-switch to exercise tab for quiz lessons
  useEffect(() => {
    if (currentLesson?.type === 'quiz') {
      setActiveTab('overview');
    }
  }, [currentLesson?.id]);

  // Sync current lesson to context
  useEffect(() => {
    if (courseId && currentLesson) {
      setCurrentLesson(courseId, currentLesson.id);
    }
  }, [courseId, currentLesson?.id]);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
    }
  }, [isAuthenticated]);

  const handleSelectLesson = useCallback((lesson: CourseLessonItem) => {
    setCurrentLessonState(lesson);
    setActiveTab('overview');
  }, []);

  const handleLessonComplete = useCallback(() => {
    if (!courseId || !currentLesson) return;
    markLessonComplete(courseId, currentLesson);
  }, [courseId, currentLesson, markLessonComplete]);

  const handleNext = useCallback(() => {
    if (!courseId || !currentLesson) return;
    const { next } = getAdjacentLessons(courseId, currentLesson.id);
    if (next) handleSelectLesson(next);
  }, [courseId, currentLesson, handleSelectLesson]);

  const handlePrev = useCallback(() => {
    if (!courseId || !currentLesson) return;
    const { prev } = getAdjacentLessons(courseId, currentLesson.id);
    if (prev) handleSelectLesson(prev);
  }, [courseId, currentLesson, handleSelectLesson]);

  const { prev: prevLesson, next: nextLesson } = courseId && currentLesson
    ? getAdjacentLessons(courseId, currentLesson.id)
    : { prev: null, next: null };

  const isCurrentCompleted = courseId && currentLesson
    ? isLessonCompleted(courseId, currentLesson.id)
    : false;

  if (!course || !courseId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <BookOpen className="size-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl mb-4">Không tìm thấy khóa học</h2>
          <Link to="/my-learning" className="text-blue-400 hover:underline">
            ← Về trang học của tôi
          </Link>
        </div>
      </div>
    );
  }

  // Determine visible tabs
  const visibleTabs = TABS.filter(t => !t.showFor || (currentLesson && t.showFor.includes(currentLesson.type)));

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* ── Top Nav ── */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0 z-20">
        <Link
          to="/my-learning"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm shrink-0"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">EduCourse</span>
        </Link>

        <div className="w-px h-5 bg-gray-700 shrink-0" />

        <h1 className="text-sm text-gray-200 truncate flex-1 font-medium">
          {course.title}
        </h1>

        {/* Progress bar */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {completionPercent}% <span className="text-gray-600 hidden lg:inline">hoàn thành</span>
            </span>
          </div>
        </div>

        {/* Certificate button */}
        {completionPercent === 100 && (
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-gray-900 rounded-lg text-xs font-bold hover:bg-yellow-400 transition">
            <Award className="size-3.5" />
            Chứng chỉ
          </button>
        )}

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          title={sidebarOpen ? 'Đóng nội dung khóa học' : 'Mở nội dung khóa học'}
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* ── Main Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Video + Scrollable Content - SCROLL TOÀN BỘ ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col">
            
            {/* Video Area - Scroll cùng với content */}
            <div className="bg-black shrink-0">
              {currentLesson ? (
                <VideoPlayer
                  lesson={currentLesson}
                  courseThumbnail={course.image}
                  courseTitle={course.title}
                  isCompleted={isCurrentCompleted}
                  onComplete={handleLessonComplete}
                  onNext={nextLesson ? handleNext : undefined}
                  onPrev={prevLesson ? handlePrev : undefined}
                />
              ) : (
                <div
                  className="w-full bg-gray-900 flex items-center justify-center"
                  style={{ aspectRatio: '16/9' }}
                >
                  <p className="text-gray-500">Chọn bài học để bắt đầu</p>
                </div>
              )}
            </div>

            {/* Prev / Next navigation + lesson title */}
            {currentLesson && (
              <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={!prevLesson}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Bài trước</span>
                </button>

                <div className="flex-1 min-w-0 text-center">
                  <p className="text-sm text-gray-200 font-medium truncate">{currentLesson.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sections.find(s => s.id === currentLesson.sectionId)?.title}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!nextLesson}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
                >
                  <span className="hidden sm:inline">Bài tiếp</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}

            {!currentLesson ? (
              <div className="flex items-center justify-center min-h-[400px] text-gray-400 py-20">
                <div className="text-center">
                  <BookOpen className="size-12 mx-auto mb-3 opacity-50" />
                  <p>Chọn một bài học từ danh sách bên phải</p>
                </div>
              </div>
            ) : (
              <>
                {/* Tab Bar - Sticky khi scroll xuống */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm">
                  <div className="flex overflow-x-auto">
                    {visibleTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap
                          ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <tab.Icon className="size-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                    {/* Exercise tab for quiz lessons */}
                    {currentLesson?.type === 'quiz' && currentLesson.exercise && !visibleTabs.find(t => t.id === 'exercise') && (
                      <button
                        onClick={() => setActiveTab('exercise')}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap
                          ${activeTab === 'exercise'
                            ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <PenSquare className="size-4" />
                        <span>Bài tập</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white pb-20">
                  {activeTab === 'overview' ? (
                    <OverviewPanel lesson={currentLesson} />
                  ) : activeTab === 'notes' ? (
                    <NotesPanel courseId={courseId} lessonId={currentLesson.id} currentTime={currentTime} />
                  ) : activeTab === 'qa' ? (
                    <QATab lesson={currentLesson} />
                  ) : activeTab === 'exercise' && currentLesson.exercise ? (
                    <ExercisePanel
                      exercise={currentLesson.exercise}
                      courseId={courseId}
                      lessonId={currentLesson.id}
                      onPassed={handleLessonComplete}
                    />
                  ) : activeTab === 'exercise' && !currentLesson.exercise ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                      <div className="text-center">
                        <PenSquare className="size-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Bài học này không có bài tập</p>
                        <p className="text-sm mt-1">Chọn bài kiểm tra 🧪 trong danh sách bài học</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Course Sidebar ── */}
        <div
          className={`transition-all duration-300 shrink-0 border-l border-gray-800
            ${sidebarOpen ? 'w-80 xl:w-96' : 'w-0 overflow-hidden'}`}
        >
          <div className="h-full w-80 xl:w-96">
            <CourseSidebar
              sections={sections}
              currentLessonId={currentLesson?.id ?? ''}
              completedIds={completedIds}
              onSelectLesson={handleSelectLesson}
              courseTitle={course.title}
              completionPercent={completionPercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Q&A Tab (inline) ─────────────────────────────────────────────────────────

interface MockQA {
  id: string;
  user: string;
  avatar: string;
  time: string;
  question: string;
  answer?: string;
  votes: number;
}

const MOCK_QA: MockQA[] = [
  {
    id: '1', user: 'Nguyễn Văn An', avatar: 'NV', time: '2 ngày trước',
    question: 'Tại sao nguyên tắc Gestalt lại quan trọng hơn việc chỉ dùng màu sắc đẹp?',
    answer: 'Màu sắc đẹp tạo ấn tượng ban đầu, nhưng Gestalt giúp người dùng hiểu cấu trúc thông tin mà không cần suy nghĩ. Đây là sự khác biệt giữa "đẹp" và "dễ dùng".',
    votes: 12,
  },
  {
    id: '2', user: 'Trần Thị Bình', avatar: 'TB', time: '5 ngày trước',
    question: 'Có tool nào để kiểm tra Gestalt principles trong thiết kế của mình không?',
    votes: 8,
  },
  {
    id: '3', user: 'Lê Minh Đức', avatar: 'LM', time: '1 tuần trước',
    question: 'Phân biệt Figure-Ground với Contrast trong thiết kế thế nào?',
    answer: 'Figure-Ground nói về mối quan hệ không gian giữa đối tượng và nền. Contrast nói về sự khác biệt về màu sắc/độ sáng. Chúng liên quan nhưng khác nhau.',
    votes: 15,
  },
];

function QATab({ lesson }: { lesson: CourseLessonItem }) {
  const [question, setQuestion] = useState('');

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">Hỏi & Đáp</h2>
          <span className="text-sm text-gray-500">{MOCK_QA.length} câu hỏi</span>
        </div>

        {/* Ask question */}
        <div className="border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Đặt câu hỏi cho bài học này</h3>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          <div className="flex justify-end">
            <button
              disabled={!question.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 transition"
              onClick={() => { setQuestion(''); }}
            >
              Gửi câu hỏi
            </button>
          </div>
        </div>

        {/* Q&A list */}
        <div className="space-y-4">
          {MOCK_QA.map(qa => (
            <div key={qa.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Question */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="size-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {qa.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{qa.user}</span>
                      <span className="text-xs text-gray-400">{qa.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{qa.question}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition">
                    ▲ {qa.votes}
                  </button>
                </div>
              </div>

              {/* Answer */}
              {qa.answer && (
                <div className="bg-blue-50 border-t border-blue-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      GV
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-900">{lesson.courseId && 'Giảng viên'}</span>
                        <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Giảng viên</span>
                      </div>
                      <p className="text-sm text-blue-800">{qa.answer}</p>
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