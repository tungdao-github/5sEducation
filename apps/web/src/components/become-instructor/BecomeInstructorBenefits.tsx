"use client";

import { Award, DollarSign, Users, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/app/providers";

export default function BecomeInstructorBenefits() {
  const { tx } = useI18n();

  const benefits = [
    {
      icon: <Video className="h-6 w-6 text-blue-600" />,
      title: tx("Create courses", "Tạo khóa học"),
      desc: tx("Easily create and manage courses", "Dễ dàng tạo và quản lý khóa học"),
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: tx("Reach learners", "Tiếp cận học viên"),
      desc: tx("Connect with thousands of learners", "Kết nối với hàng nghìn học viên"),
    },
    {
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      title: tx("Stable income", "Thu nhập ổn định"),
      desc: tx("Earn from your knowledge", "Kiếm tiền từ kiến thức của bạn"),
    },
    {
      icon: <Award className="h-6 w-6 text-orange-600" />,
      title: tx("Build your brand", "Xây dựng thương hiệu"),
      desc: tx("Become an expert in your field", "Trở thành chuyên gia trong lĩnh vực"),
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {benefits.map((benefit) => (
        <Card key={benefit.title} className="text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              {benefit.icon}
            </div>
            <h3 className="mb-1 font-semibold">{benefit.title}</h3>
            <p className="text-sm text-gray-600">{benefit.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
