"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import AuthModal from "@/components/AuthModal";
import { SupportChatWidget } from "@/components/SupportChatWidget";

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
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AuthModal />
      <SupportChatWidget />
    </>
  );
}
