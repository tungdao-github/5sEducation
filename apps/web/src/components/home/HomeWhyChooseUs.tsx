"use client";

import { useI18n } from "@/app/providers";

export default function HomeWhyChooseUs() {
  const { tx } = useI18n();
  const features = [
    { icon: "🎯", title: tx("Hands-on learning", "Học thực chiến"), desc: tx("Content built from real projects that you can apply immediately.", "Nội dung được thiết kế từ dự án thực tế, áp dụng ngay vào công việc") },
    { icon: "♾️", title: tx("Lifetime access", "Trọn đời"), desc: tx("Buy once, learn forever. Free content updates included.", "Mua một lần, học mãi mãi. Cập nhật nội dung mới miễn phí") },
    { icon: "🏆", title: tx("Valuable certificates", "Chứng chỉ có giá trị"), desc: tx("Certificates recognized by more than 200 companies in the industry.", "Chứng chỉ được công nhận bởi hơn 200 công ty trong ngành") },
    { icon: "💬", title: tx("24/7 support", "Hỗ trợ 24/7"), desc: tx("Our support team is always ready to answer your questions.", "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn") },
    { icon: "🔁", title: tx("30-day refund", "Hoàn tiền 30 ngày"), desc: tx("Not satisfied? Get a full refund within 30 days.", "Không hài lòng? Hoàn lại 100% học phí trong vòng 30 ngày") },
    { icon: "📱", title: tx("Learn on any device", "Học mọi thiết bị"), desc: tx("Watch on laptop, tablet, or phone on your schedule.", "Xem trên laptop, tablet hay điện thoại theo lịch của bạn") },
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">{tx("Why choose EduCourse?", "Tại sao chọn EduCourse?")}</h2>
          <p className="text-gray-500">{tx("We are committed to the best learning experience", "Chúng tôi cam kết mang lại trải nghiệm học tốt nhất")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4 rounded-xl p-5 transition hover:bg-gray-50">
              <div className="flex-shrink-0 text-3xl">{feature.icon}</div>
              <div>
                <h3 className="mb-1 font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
