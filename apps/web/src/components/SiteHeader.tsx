"use client";

import { useState } from "react";
import SiteHeaderDesktopNav from "@/components/SiteHeaderDesktopNav";
import SiteHeaderMobileMenu from "@/components/SiteHeaderMobileMenu";
import { useHeaderAccount } from "@/components/useHeaderAccount";
import { useI18n } from "@/app/providers";

export function SiteHeader() {
  const { tx } = useI18n();
  const account = useHeaderAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <SiteHeaderDesktopNav tx={tx} account={account} onToggleMenu={() => setMenuOpen((prev) => !prev)} menuOpen={menuOpen} />
      {menuOpen ? <SiteHeaderMobileMenu tx={tx} account={account} onClose={() => setMenuOpen(false)} /> : null}
    </header>
  );
}
