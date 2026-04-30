"use client";

import { useI18n } from "@/app/providers";
import VideoPlayer from "@/components/learning/VideoPlayer";
import CourseSidebar from "@/components/learning/CourseSidebar";
import CourseLearnAuthState from "@/components/learning/CourseLearnAuthState";
import CourseLearnLoadingState from "@/components/learning/CourseLearnLoadingState";
import CourseLearnErrorState from "@/components/learning/CourseLearnErrorState";
import CourseLearnHeaderBar from "@/components/learning/CourseLearnHeaderBar";
import CourseLearnLessonBar from "@/components/learning/CourseLearnLessonBar";
import CourseLearnTabsBar from "@/components/learning/CourseLearnTabsBar";
import CourseLearnContent from "@/components/learning/CourseLearnContent";
import { buildCourseLearnTabs } from "@/components/learning/courseLearnTabs";
import { useCourseLearnPage } from "@/components/learning/useCourseLearnPage";

export default function CourseLearn() {
  const { tx } = useI18n();
  const learn = useCourseLearnPage();
  const tabs = buildCourseLearnTabs(tx);

  if (!learn.isAuthenticated) return <CourseLearnAuthState />;
  if (learn.loading) return <CourseLearnLoadingState />;
  if (learn.error || !learn.course || !learn.currentLesson) return <CourseLearnErrorState message={learn.error || tx("Course not found", "Không tìm thấy khóa học")} />;

  const { course, currentLesson, sections, completionPercent, sidebarOpen, prevLesson, nextLesson, isCurrentCompleted } = learn;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950">
      <CourseLearnHeaderBar
        title={course.title}
        completionPercent={completionPercent}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => learn.setSidebarOpen((value) => !value)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col">
            <div className="shrink-0 bg-black">
              <VideoPlayer
                lesson={currentLesson}
                courseThumbnail={course.image}
                courseTitle={course.title}
                isCompleted={isCurrentCompleted}
                onComplete={() => void learn.handleLessonComplete()}
                onNext={nextLesson ? () => void learn.selectLesson(nextLesson) : undefined}
                onPrev={prevLesson ? () => void learn.selectLesson(prevLesson) : undefined}
                onTimeChange={learn.setCurrentTime}
                seekToSeconds={learn.seekRequest?.time ?? null}
                seekVersion={learn.seekRequest?.version ?? 0}
              />
            </div>

            <CourseLearnLessonBar
              currentLesson={currentLesson}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              sections={sections}
              onPrev={() => prevLesson && void learn.selectLesson(prevLesson)}
              onNext={() => nextLesson && void learn.selectLesson(nextLesson)}
            />

            <CourseLearnTabsBar tabs={tabs} activeTab={learn.activeTab} lesson={currentLesson} onSelect={learn.setActiveTab} />

            <CourseLearnContent
              lesson={currentLesson}
              courseId={String(course.id)}
              currentTime={learn.currentTime}
              activeTab={learn.activeTab}
              onSeek={learn.handleSeekFromNotes}
              onPassed={() => void learn.handleLessonComplete()}
            />
          </div>
        </div>

        <div className={`shrink-0 border-l border-gray-800 transition-all duration-300 ${sidebarOpen ? "w-80 xl:w-96" : "w-0 overflow-hidden"}`}>
          <div className="h-full w-80 xl:w-96">
            <CourseSidebar
              sections={sections}
              currentLessonId={currentLesson.id}
              completedIds={learn.completedIds}
              onSelectLesson={learn.selectLesson}
              courseTitle={course.title}
              completionPercent={completionPercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
