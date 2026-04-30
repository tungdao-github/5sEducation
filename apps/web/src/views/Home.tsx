"use client";

import FlashSaleCountdown from "@/components/home/FlashSaleCountdown";
import HomeCTA from "@/components/home/HomeCTA";
import HomeCourseSection from "@/components/home/HomeCourseSection";
import HomeFeaturedSection from "@/components/home/HomeFeaturedSection";
import HomeHero from "@/components/home/HomeHero";
import HomeInstructors from "@/components/home/HomeInstructors";
import HomeLearningPaths from "@/components/home/HomeLearningPaths";
import HomeStats from "@/components/home/HomeStats";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomeWhyChooseUs from "@/components/home/HomeWhyChooseUs";
import { useHomePage } from "@/components/home/useHomePage";

export default function Home() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    courses,
    filteredCourses,
    handleSearch,
    featuredCourses,
    topRatedCourses,
  } = useHomePage();

  return (
    <main className="bg-gray-50">
      <HomeHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmitSearch={handleSearch}
        featuredCourses={featuredCourses}
        totalCourses={courses.length}
      />
      <HomeStats />
      <HomeCourseSection
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredCourses={filteredCourses}
      />
      <FlashSaleCountdown courses={courses} />
      <HomeFeaturedSection topRatedCourses={topRatedCourses} />
      <HomeLearningPaths />
      <HomeInstructors />
      <HomeWhyChooseUs />
      <HomeTestimonials />
      <HomeCTA />
    </main>
  );
}
