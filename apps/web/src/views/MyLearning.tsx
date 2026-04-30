"use client";

import MyLearningHero from "@/components/my-learning/MyLearningHero";
import MyLearningCoursesSection from "@/components/my-learning/MyLearningCoursesSection";
import MyLearningEmptyState from "@/components/my-learning/MyLearningEmptyState";
import MyLearningSignInPrompt from "@/components/my-learning/MyLearningSignInPrompt";
import { useMyLearningPage } from "@/components/my-learning/useMyLearningPage";

export default function MyLearning() {
  const learning = useMyLearningPage();

  if (!learning.isAuthenticated) {
    return <MyLearningSignInPrompt onSignIn={() => learning.openAuthModal("login")} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <MyLearningHero totalCourses={learning.courses.length} inProgressCourses={learning.inProgressCourses.length} completedCourses={learning.completedCourses.length} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {learning.loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải khóa học...</div>
        ) : learning.courses.length === 0 ? (
          <MyLearningEmptyState />
        ) : (
          <MyLearningCoursesSection
            inProgressCourses={learning.inProgressCourses}
            completedCourses={learning.completedCourses}
            notStartedCourses={learning.notStartedCourses}
          />
        )}
      </div>
    </div>
  );
}
