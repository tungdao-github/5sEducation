"use client";

import { BookOpen, Star, Users } from "lucide-react";
import { useI18n } from "@/app/providers";

export default function HomeInstructors() {
  const { tx } = useI18n();
  const instructors = [
    { name: "Tanner Kohler", title: tx("UX Design Specialist", "Chuyên gia thiết kế UX"), courses: 3, students: 8500, rating: 4.9, avatar: "T", color: "from-blue-500 to-indigo-500" },
    { name: "Kate Moran", title: tx("UX Writer & Researcher", "UX Writer & Nghiên cứu UX"), courses: 2, students: 6200, rating: 4.9, avatar: "K", color: "from-purple-500 to-pink-500" },
    { name: "Jakob Nielsen", title: tx("Usability Expert", "Chuyên gia khả dụng"), courses: 1, students: 5432, rating: 4.9, avatar: "J", color: "from-green-500 to-teal-500" },
    { name: "Sarah Gibbons", title: tx("UX Strategy Lead", "Trưởng nhóm chiến lược UX"), courses: 1, students: 2234, rating: 4.8, avatar: "S", color: "from-orange-500 to-red-500" },
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">{tx("Top instructors", "Giảng viên hàng đầu")}</h2>
          <p className="text-gray-500">{tx("Learn from real-world UX/UI Design experts", "Học từ những chuyên gia UX/UI Design với kinh nghiệm thực chiến")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((item) => (
            <div key={item.name} className="group cursor-pointer text-center">
              <div className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-3xl font-bold text-white shadow-lg transition-transform group-hover:scale-105`}>
                {item.avatar}
              </div>
              <h3 className="mb-0.5 font-bold text-gray-900">{item.name}</h3>
              <p className="mb-3 text-sm text-gray-500">{item.title}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {item.courses} {tx("courses", "KH")}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {item.students.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
