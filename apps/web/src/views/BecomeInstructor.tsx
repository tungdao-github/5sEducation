"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/app/providers";
import { Button } from "@/components/ui/button";
import BecomeInstructorStatusCard from "@/components/become-instructor/BecomeInstructorStatusCard";
import BecomeInstructorBenefits from "@/components/become-instructor/BecomeInstructorBenefits";
import BecomeInstructorApplicationForm from "@/components/become-instructor/BecomeInstructorApplicationForm";
import { toast } from "@/lib/notify";

export default function BecomeInstructor() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInstructor, applyAsInstructor, openAuthModal } = useAuth();
  const { tx } = useI18n();
  const [loading, setLoading] = useState(false);

  const submitApplication = async (payload: {
    bio: string;
    expertise: string[];
    socialLinks: {
      website?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
    };
  }) => {
    if (!payload.bio || payload.bio.length < 50) {
      toast.error(tx("Please write at least 50 characters.", "Vui lòng viết giới thiệu ít nhất 50 ký tự"));
      return;
    }

    if (payload.expertise.length === 0) {
      toast.error(tx("Please add at least one expertise area.", "Vui lòng thêm ít nhất một lĩnh vực chuyên môn"));
      return;
    }

    setLoading(true);
    try {
      const result = await applyAsInstructor({
        bio: payload.bio,
        expertise: payload.expertise,
        socialLinks: payload.socialLinks,
      });

      if (result.success) {
        toast.success(result.message);
        navigate("/account");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(tx("Something went wrong. Please try again.", "Có lỗi xảy ra. Vui lòng thử lại!"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <BecomeInstructorStatusCard type="login" onLogin={() => openAuthModal("login")} />;
  }

  if (isInstructor) {
    return (
      <BecomeInstructorStatusCard
        type="approved"
        onDashboard={() => navigate("/instructor")}
        onCreateCourse={() => navigate("/instructor/create-course")}
      />
    );
  }

  if (user?.instructorStatus === "pending") {
    return <BecomeInstructorStatusCard type="pending" onHome={() => navigate("/")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
            {tx("← Back", "← Quay lại")}
          </Button>
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">{tx("Become an instructor", "Trở thành Giảng viên")}</h1>
          <p className="text-gray-600">{tx("Share your knowledge with thousands of learners", "Chia sẻ kiến thức của bạn với hàng nghìn học viên")}</p>
        </div>

        <BecomeInstructorBenefits />
        <BecomeInstructorApplicationForm initialBio={user?.bio || ""} onSubmit={submitApplication} />
        {loading ? <div className="mt-4 text-sm text-gray-500">{tx("Processing...", "Đang xử lý...")}</div> : null}
      </div>
    </div>
  );
}
