"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { useI18n } from "@/app/providers";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "@/lib/notify";
import AccountAddressesTab from "@/components/account/AccountAddressesTab";
import AccountGuestPrompt from "@/components/account/AccountGuestPrompt";
import AccountHeader from "@/components/account/AccountHeader";
import AccountLoyaltyTab from "@/components/account/AccountLoyaltyTab";
import AccountOrdersTab from "@/components/account/AccountOrdersTab";
import AccountPasswordTab from "@/components/account/AccountPasswordTab";
import AccountProfileTab from "@/components/account/AccountProfileTab";
import AccountSidebar, { type AccountTabId } from "@/components/account/AccountSidebar";
import AccountWishlistTab from "@/components/account/AccountWishlistTab";
import { ACCOUNT_LEVEL_COLORS, buildAccountTabs } from "@/components/account/accountTabs";

export default function Account() {
  const { tx } = useI18n();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { wishlistItems } = useWishlist();
  const [searchParams] = useSearchParams();

  const initialTab = (searchParams.get("tab") as AccountTabId) || "profile";
  const [activeTab, setActiveTab] = useState<AccountTabId>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isAuthenticated || !user) {
    return <AccountGuestPrompt onLogin={() => openAuthModal("login")} />;
  }

  const lc = ACCOUNT_LEVEL_COLORS[user.level] || ACCOUNT_LEVEL_COLORS.Bronze;
  const tabs = buildAccountTabs(wishlistItems.length, tx);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AccountHeader
          name={user.name}
          email={user.email}
          level={user.level}
          points={user.points}
          levelClassName={lc}
          onLogout={() => {
            logout();
            toast.success(tx("You have been signed out.", "Đã đăng xuất!"));
          }}
        />

        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <AccountSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
          </div>

          <div className="md:col-span-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              {activeTab === "profile" && <AccountProfileTab />}
              {activeTab === "orders" && <AccountOrdersTab />}
              {activeTab === "wishlist" && <AccountWishlistTab />}
              {activeTab === "addresses" && <AccountAddressesTab />}
              {activeTab === "loyalty" && <AccountLoyaltyTab />}
              {activeTab === "password" && <AccountPasswordTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
