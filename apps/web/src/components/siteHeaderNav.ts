import { Briefcase, Landmark, User, Users2 } from "lucide-react";

export const SITE_HEADER_AUDIENCE_LINKS = [
  { href: "/?category=students", label: "Dành cho Học sinh", icon: Users2 },
  { href: "/?category=personal", label: "Dành cho Cá nhân", icon: User },
  { href: "/?category=business", label: "Dành cho Doanh nghiệp", icon: Briefcase },
  { href: "/?category=government", label: "Dành cho Chính phủ", icon: Landmark },
] as const;

export const SITE_HEADER_MAIN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Tài liệu" },
  { href: "/my-learning", label: "My Learning" },
] as const;
