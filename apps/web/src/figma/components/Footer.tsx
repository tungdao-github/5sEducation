"use client";

import { Link } from "@/figma/compat/router";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/figma/compat/sonner";

const footerLinks = {
  platform: {
    title: "Nen tang",
    links: [
      { label: "Tat ca khoa hoc", href: "/courses" },
      { label: "Lo trinh hoc tap", href: "/paths" },
      { label: "Giang vien", href: "/instructors" },
      { label: "Chung chi", href: "/certificates" },
      { label: "Doanh nghiep", href: "/for-business" },
    ],
  },
  resources: {
    title: "Tai nguyen",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Huong dan su dung", href: "/guide" },
      { label: "Cau hoi thuong gap", href: "/faq" },
      { label: "Trung tam ho tro", href: "/support" },
      { label: "Cong dong", href: "/community" },
    ],
  },
  company: {
    title: "Cong ty",
    links: [
      { label: "Ve chung toi", href: "/about" },
      { label: "Doi ngu", href: "/team" },
      { label: "Tuyen dung", href: "/careers" },
      { label: "Lien he", href: "/contact" },
      { label: "Bao chi", href: "/press" },
    ],
  },
  legal: {
    title: "Phap ly",
    links: [
      { label: "Dieu khoan su dung", href: "/policy/terms" },
      { label: "Chinh sach bao mat", href: "/policy/privacy" },
      { label: "Chinh sach hoan tien", href: "/policy/refund" },
      { label: "Cookie", href: "/policy/cookies" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const stats = [
  { value: "50K+", label: "Hoc vien" },
  { value: "200+", label: "Khoa hoc" },
  { value: "50+", label: "Giang vien" },
  { value: "98%", label: "Hai long" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Dang ky nhan tin thanh cong!");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-main py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Nhan thong bao khoa hoc moi
              </h3>
              <p className="text-primary-foreground/70 text-lg">
                Dang ky de nhan thong tin ve khoa hoc moi, uu dai va meo hoc tap hieu qua.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                placeholder="Email cua ban..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 px-5 rounded-xl bg-white/10 border border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 bg-accent text-accent-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Dang gui..." : "Dang ky"}
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b border-white/10">
        <div className="container-main py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="size-10 rounded-xl bg-accent flex items-center justify-center">
                <GraduationCap className="size-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">EduCourse</span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Nen tang hoc truc tuyen hang dau voi cac khoa hoc UX/UI Design chat luong cao, 
              giang vien co kinh nghiem va lo trinh hoc tap ro rang.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="size-5 flex-shrink-0 mt-0.5" />
                <span>123 Duong ABC, Quan 1, TP.HCM, Viet Nam</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="size-5 flex-shrink-0" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="size-5 flex-shrink-0" />
                <span>contact@educourse.vn</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>2026 EduCourse. Tat ca quyen duoc bao luu.</p>
            <div className="flex items-center gap-6">
              <Link
                to="/policy/terms"
                className="hover:text-primary-foreground transition-colors"
              >
                Dieu khoan
              </Link>
              <Link
                to="/policy/privacy"
                className="hover:text-primary-foreground transition-colors"
              >
                Bao mat
              </Link>
              <Link
                to="/policy/cookies"
                className="hover:text-primary-foreground transition-colors"
              >
                Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
