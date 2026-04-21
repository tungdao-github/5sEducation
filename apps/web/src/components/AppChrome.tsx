"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import Footer from "@/figma/components/Footer";
import FigmaAuthModal from "@/figma/components/AuthModal";
import RouteAuthModal from "@/components/AuthModal";
import ChatWidget from "@/figma/components/ChatWidget";

function isFullscreenRoute(pathname: string) {
  return pathname.startsWith("/learn/");
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const fullscreen = isFullscreenRoute(pathname);

  if (fullscreen) {
    return (
      <>
        <main className="flex-1">{children}</main>
        <FigmaAuthModal />
        <RouteAuthModal />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <FigmaAuthModal />
      <RouteAuthModal />
      <ChatWidget />
    </>
  );
}
