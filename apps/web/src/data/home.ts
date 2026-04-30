import type { Course } from "@/contexts/CartContext";

export function getFlashSaleCourses(courses: Course[]) {
  return courses.filter((course) => course.originalPrice && course.originalPrice > course.price).slice(0, 4);
}
