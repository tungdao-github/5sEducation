"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function HomeTestimonialsControls({ onPrev, onNext }: Props) {
  return (
    <>
      <button type="button" onClick={onPrev} className="absolute left-0 top-1/2 size-10 -translate-x-4 -translate-y-1/2 rounded-full bg-white shadow-md transition hover:text-blue-600" aria-label="Xem testimonial truoc">
        <ChevronLeft className="mx-auto size-5" />
      </button>
      <button type="button" onClick={onNext} className="absolute right-0 top-1/2 size-10 translate-x-4 -translate-y-1/2 rounded-full bg-white shadow-md transition hover:text-blue-600" aria-label="Xem testimonial tiep theo">
        <ChevronRight className="mx-auto size-5" />
      </button>
    </>
  );
}
