"use client";

import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
};

type Props = {
  testimonial: Testimonial;
};

export default function HomeTestimonialCard({ testimonial }: Props) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
      <div className="mb-4 flex justify-center">
        {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
          <Star key={starIndex} className="size-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className="mb-6 text-lg italic leading-relaxed text-gray-700">&quot;{testimonial.text}&quot;</blockquote>
      <div className="flex items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-bold text-white">
          {testimonial.avatar}
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
