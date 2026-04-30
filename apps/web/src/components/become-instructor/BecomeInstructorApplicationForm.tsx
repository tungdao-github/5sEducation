"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  initialBio: string;
  onSubmit: (payload: {
    bio: string;
    expertise: string[];
    socialLinks: {
      website?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
    };
  }) => Promise<void>;
};

export default function BecomeInstructorApplicationForm({ initialBio, onSubmit }: Props) {
  const { tx } = useI18n();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: initialBio,
    expertise: [""],
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
  });

  const updateExpertise = (index: number, value: string) => {
    const next = [...formData.expertise];
    next[index] = value;
    setFormData((current) => ({ ...current, expertise: next }));
  };

  const addExpertise = () => setFormData((current) => ({ ...current, expertise: [...current.expertise, ""] }));
  const removeExpertise = (index: number) =>
    setFormData((current) => ({ ...current, expertise: current.expertise.filter((_, i) => i !== index) }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        bio: formData.bio,
        expertise: formData.expertise.filter((item) => item.trim() !== ""),
        socialLinks: {
          website: formData.website || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          twitter: formData.twitter || undefined,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("Instructor application", "Đơn đăng ký Giảng viên")}</CardTitle>
        <CardDescription>{tx("Please fill in all information so we can review your application.", "Vui lòng điền đầy đủ thông tin để chúng tôi xem xét đơn đăng ký của bạn")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="bio">{tx("About you", "Giới thiệu về bạn")} *</Label>
            <Textarea
              id="bio"
              placeholder={tx(
                "Tell us about your experience, achievements and why you want to become an instructor...",
                "Hãy cho chúng tôi biết về kinh nghiệm, thành tựu và lý do bạn muốn trở thành giảng viên..."
              )}
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData((current) => ({ ...current, bio: e.currentTarget.value }))}
              required
            />
            <p className="mt-1 text-sm text-gray-500">{formData.bio.length}/50 {tx("minimum characters", "ký tự tối thiểu")}</p>
          </div>

          <div>
            <Label>{tx("Expertise", "Lĩnh vực chuyên môn")} *</Label>
            <p className="mb-3 text-sm text-gray-500">{tx("Add the areas you are qualified to teach", "Thêm các lĩnh vực bạn có chuyên môn để giảng dạy")}</p>
            <div className="space-y-3">
              {formData.expertise.map((exp, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={tx("e.g. UX Design, Figma, User Research...", "VD: UX Design, Figma, User Research...")}
                    value={exp}
                    onChange={(e) => updateExpertise(index, e.currentTarget.value)}
                  />
                  {index > 0 ? (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeExpertise(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExpertise} className="gap-2">
                <Plus className="h-4 w-4" />
                {tx("Add expertise", "Thêm chuyên môn")}
              </Button>
            </div>
          </div>

          <div>
            <Label>{tx("Social links", "Liên kết mạng xã hội")}</Label>
            <p className="mb-3 text-sm text-gray-500">{tx("Help learners learn more about you (optional)", "Giúp học viên tìm hiểu thêm về bạn (không bắt buộc)")}</p>
            <div className="space-y-3">
              {[
                { key: "website", label: "Website" },
                { key: "linkedin", label: "LinkedIn" },
                { key: "github", label: "GitHub" },
                { key: "twitter", label: "Twitter/X" },
              ].map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type="url"
                    placeholder={`https://${field.key}.com/your-profile`}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData((current) => ({ ...current, [field.key]: e.currentTarget.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">{tx("Instructor terms", "Điều khoản Giảng viên")}</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• {tx("You commit to providing high-quality and lawful content.", "Bạn cam kết cung cấp nội dung chất lượng cao và đúng pháp luật")}</li>
              <li>• {tx("Courses must follow EduCourse content standards.", "Khóa học phải tuân thủ các tiêu chuẩn nội dung của EduCourse")}</li>
              <li>• {tx("You retain the intellectual property rights to your content.", "Bạn giữ quyền sở hữu trí tuệ của nội dung")}</li>
              <li>• {tx("EduCourse charges a 30% commission on course sales.", "EduCourse thu hoa hồng 30% trên doanh số khóa học")}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? tx("Processing...", "Đang xử lý...") : tx("Submit application", "Gửi đơn đăng ký")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
