"use client";

import AuthModalBody from "@/components/AuthModalBody";
import AuthModalHeader from "@/components/AuthModalHeader";
import { useAuthModal } from "@/components/useAuthModal";

export default function AuthModal() {
  const auth = useAuthModal();

  if (!auth.mode || !auth.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={auth.closeModal} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <AuthModalHeader mode={auth.mode} tx={auth.tx} onClose={auth.closeModal} />
        <div className="p-6">
          <AuthModalBody
            mode={auth.mode}
            tx={auth.tx}
            loading={auth.loading}
            error={auth.error}
            successMessage={auth.successMessage}
            confirmLink={auth.confirmLink}
            resetLink={auth.resetLink}
            needsConfirmation={auth.needsConfirmation}
            showPassword={auth.showPassword}
            setShowPassword={auth.setShowPassword}
            form={auth.form}
            setForm={auth.setForm}
            nextPath={auth.nextPath}
            onSubmit={auth.handleSubmit}
            onGoHome={auth.goToLogin}
            onGoLogin={auth.goToLogin}
            onGoRegister={auth.goToRegister}
            onGoForgot={auth.goToForgot}
          />
        </div>
      </div>
    </div>
  );
}
