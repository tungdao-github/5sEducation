"use client";

import { Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/providers";

type Props =
  | {
      type: "login";
      onLogin: () => void;
    }
  | {
      type: "approved";
      onDashboard: () => void;
      onCreateCourse: () => void;
    }
  | {
      type: "pending";
      onHome: () => void;
    };

export default function BecomeInstructorStatusCard(props: Props) {
  const { tx } = useI18n();

  if (props.type === "login") {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">{tx("Become an instructor", "Trở thành Giảng viên")}</h1>
          <p className="mb-8 text-gray-600">{tx("Please sign in to apply as an instructor", "Vui lòng đăng nhập để đăng ký trở thành giảng viên")}</p>
          <Button onClick={props.onLogin} size="lg">
            {tx("Sign in", "Đăng nhập")}
          </Button>
        </div>
      </div>
    );
  }

  if (props.type === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">{tx("You are now an instructor!", "Bạn đã là Giảng viên!")}</h1>
          <p className="mb-8 text-gray-600">{tx("You can start creating and managing your courses.", "Bạn có thể bắt đầu tạo và quản lý khóa học của mình.")}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={props.onDashboard} size="lg">
              {tx("Go to Dashboard", "Đi tới Dashboard")}
            </Button>
            <Button onClick={props.onCreateCourse} variant="outline" size="lg">
              {tx("Create new course", "Tạo khóa học mới")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Award className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="mb-4 text-3xl font-semibold text-gray-900">{tx("Application under review", "Đơn đăng ký đang được xem xét")}</h1>
        <p className="mb-8 text-gray-600">
          {tx(
            "We are reviewing your instructor application. This usually takes 24-48 hours. We will email you once it is approved.",
            "Chúng tôi đang xem xét đơn đăng ký giảng viên của bạn. Quá trình này thường mất 24-48 giờ. Chúng tôi sẽ thông báo cho bạn qua email khi có kết quả."
          )}
        </p>
        <Button onClick={props.onHome} variant="outline">
          {tx("Back to home", "Quay về Trang chủ")}
        </Button>
      </div>
    </div>
  );
}
