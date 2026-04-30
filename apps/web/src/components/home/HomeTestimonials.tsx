"use client";

import { useEffect, useState } from "react";
import HomeTestimonialCard from "@/components/home/HomeTestimonialCard";
import HomeTestimonialsControls from "@/components/home/HomeTestimonialsControls";
import { useI18n } from "@/app/providers";

type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
};

export default function HomeTestimonials() {
  const { tx } = useI18n();
  const testimonials: Testimonial[] = [
    {
      name: tx("Nguyen Thi Mai", "Nguyễn Thị Mai"),
      role: tx("UX Designer at FPT Software", "UX Designer tại FPT Software"),
      avatar: "M",
      rating: 5,
      text: tx(
        "The Gestalt Principles course changed how I approach design. I applied it to real projects right away and got highly positive client feedback!",
        "Khóa học Gestalt Principles đã thay đổi cách tôi tiếp cận thiết kế. Tôi áp dụng ngay vào dự án và nhận được phản hồi rất tích cực từ khách hàng!"
      ),
    },
    {
      name: tx("Tran Van Hung", "Trần Văn Hùng"),
      role: tx("Product Designer at VNG", "Product Designer tại VNG"),
      avatar: "H",
      rating: 5,
      text: tx(
        "High-quality content and truly experienced instructors. After three months, I got promoted to Senior UX Designer without needing a degree.",
        "Nội dung chất lượng cao, giảng viên có kinh nghiệm thực tế. Sau 3 tháng học, tôi đã đạt được vị trí Senior UX Designer mà không cần bằng cấp."
      ),
    },
    {
      name: tx("Le Thi Hoa", "Lê Thị Hoa"),
      role: tx("Freelance UX Writer", "Freelance UX Writer"),
      avatar: "H",
      rating: 5,
      text: tx(
        "The Microcopy course was a game-changer! I increased conversion by 40% just by rewriting buttons and form labels.",
        "Khóa Microcopy là một game-changer! Tôi đã tăng được tỷ lệ chuyển đổi của khách hàng lên 40% chỉ bằng cách viết lại button và form labels."
      ),
    },
    {
      name: tx("Pham Minh Duc", "Phạm Minh Đức"),
      role: tx("UI Designer at Grab Vietnam", "UI Designer tại Grab Vietnam"),
      avatar: "D",
      rating: 5,
      text: tx(
        "EduCourse is the best UX/UI learning platform I have used. Content is updated constantly and the learner community is very supportive.",
        "EduCourse là nền tảng học UX/UI tốt nhất tôi từng dùng. Nội dung cập nhật liên tục, cộng đồng học viên rất supportive và nhiệt tình."
      ),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const count = testimonials.length;
  const slides = count > 1 ? [testimonials[count - 1], ...testimonials, testimonials[0]] : testimonials;
  const activeIndex = count > 0 ? (currentIndex - 1 + count) % count : 0;

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = window.setInterval(() => setCurrentIndex((value) => value + 1), 1800);
    return () => window.clearInterval(timer);
  }, [isPaused, count]);

  useEffect(() => {
    if (count <= 1) return;
    if (currentIndex === 0) {
      const frame = window.requestAnimationFrame(() => setCurrentIndex(count));
      return () => window.cancelAnimationFrame(frame);
    }
    if (currentIndex === count + 1) {
      const frame = window.requestAnimationFrame(() => setCurrentIndex(1));
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [currentIndex, count]);

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">{tx("What students say about us", "Học viên nói gì về chúng tôi")}</h2>
          <p className="text-gray-500">{tx("Over 50,000 learners trust EduCourse", "Hơn 50,000 học viên đã tin tưởng EduCourse")}</p>
        </div>
        <div className="relative mx-auto max-w-3xl" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <div className="overflow-hidden rounded-3xl">
            <div
              className={`flex will-change-transform ${count > 1 ? "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" : ""}`}
              style={{ transform: `translate3d(-${currentIndex * 100}%, 0, 0)` }}
            >
              {slides.map((testimonial, index) => (
                <div key={`${testimonial.name}-${index}`} className="min-w-full px-0">
                  <HomeTestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          <HomeTestimonialsControls onPrev={() => setCurrentIndex((value) => value - 1)} onNext={() => setCurrentIndex((value) => value + 1)} />
          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index + 1)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-6 bg-blue-600" : "w-2 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
