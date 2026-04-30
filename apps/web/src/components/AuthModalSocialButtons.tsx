"use client";

import { FacebookSignInButton } from "@/components/FacebookSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import type { AuthMode } from "@/components/AuthModalBody";

type Props = {
  mode: AuthMode;
  nextPath: string;
};

export default function AuthModalSocialButtons({ mode, nextPath }: Props) {
  if (mode !== "login" && mode !== "register") {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <GoogleSignInButton nextPath={nextPath} mode={mode === "register" ? "signup" : "signin"} />
        <FacebookSignInButton nextPath={nextPath} mode={mode === "register" ? "signup" : "signin"} />
      </div>
      <div className="my-4 flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="text-sm text-gray-400">Hoặc</span>
        <hr className="flex-1 border-gray-200" />
      </div>
    </>
  );
}
