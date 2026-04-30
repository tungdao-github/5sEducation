import type { Course } from "@/contexts/CartContext";

export interface LearningCourse extends Course {
  progress: number;
  lastAccessed: string;
  completedLessons: number;
  totalLessons: number;
}
