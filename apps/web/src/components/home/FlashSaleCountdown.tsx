"use client";

import { useEffect, useState } from "react";
import { getFlashSaleCourses } from "@/data/home";
import type { Course } from "@/contexts/CartContext";
import FlashSaleHeader from "@/components/home/FlashSaleHeader";
import FlashSaleTimer from "@/components/home/FlashSaleTimer";
import FlashSaleCourseGrid from "@/components/home/FlashSaleCourseGrid";
import FlashSaleFooter from "@/components/home/FlashSaleFooter";
import { useI18n } from "@/app/providers";

export default function FlashSaleCountdown({ courses }: { courses: Course[] }) {
  const { tx } = useI18n();
  const [timeLeft, setTimeLeft] = useState({ h: 8, m: 23, s: 45 });

  useEffect(() => {
    const durationMs = 8 * 3600000 + 23 * 60000 + 45 * 1000;
    const endTime = Date.now() + durationMs;

    const updateTimeLeft = () => {
      const diff = Math.max(0, endTime - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };

    updateTimeLeft();
    const timer = setInterval(() => {
      updateTimeLeft();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (value: number) => String(value).padStart(2, "0");
  const flashCourses = getFlashSaleCourses(courses);

  return (
    <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <FlashSaleHeader title={tx("Flash sale", "Flash Sale")} subtitle={tx("Special offer - up to 30% off", "Ưu đãi đặc biệt - Giảm đến 30%")} />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">{tx("Ends in:", "Kết thúc sau:")}</span>
            <FlashSaleTimer
              values={[
                { label: tx("HOURS", "GIỜ"), value: pad(timeLeft.h) },
                { label: tx("MINS", "PHÚT"), value: pad(timeLeft.m) },
                { label: tx("SECS", "GIÂY"), value: pad(timeLeft.s) },
              ]}
            />
          </div>
        </div>

        <FlashSaleCourseGrid courses={flashCourses} />
        <FlashSaleFooter href="/search" label={tx("View all flash sale", "Xem tất cả Flash Sale")} />
      </div>
    </section>
  );
}
