"use client";

import type { AuthFormState, AuthMode } from "@/components/AuthModalBody";
import AuthModalFooter from "@/components/AuthModalFooter";
import AuthModalForm from "@/components/AuthModalForm";
import AuthModalNotice from "@/components/AuthModalNotice";
import AuthModalSocialButtons from "@/components/AuthModalSocialButtons";

type Props = {
  mode: AuthMode;
  tx: (en: string, vi: string) => string;
  loading: boolean;
  error: string;
  successMessage: string;
  confirmLink: string;
  resetLink: string;
  needsConfirmation: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  form: AuthFormState;
  setForm: React.Dispatch<React.SetStateAction<AuthFormState>>;
  nextPath: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoForgot: () => void;
};

export default function AuthModalFormFields({
  mode,
  tx,
  loading,
  error,
  successMessage,
  confirmLink,
  resetLink,
  needsConfirmation,
  showPassword,
  setShowPassword,
  form,
  setForm,
  nextPath,
  onSubmit,
  onGoLogin,
  onGoRegister,
  onGoForgot,
}: Props) {
  if (mode === "confirm-email") return null;

  return (
    <>
      <AuthModalSocialButtons mode={mode} nextPath={nextPath} />
      <AuthModalNotice
        mode={mode}
        tx={tx}
        error={error}
        successMessage={successMessage}
        confirmLink={confirmLink}
        resetLink={resetLink}
        needsConfirmation={needsConfirmation}
      />
      <AuthModalForm
        mode={mode}
        tx={tx}
        loading={loading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        form={form}
        setForm={setForm}
        onSubmit={onSubmit}
        onGoForgot={onGoForgot}
      />
      <AuthModalFooter mode={mode} tx={tx} onGoLogin={onGoLogin} onGoRegister={onGoRegister} />

      {mode === "login" ? (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <strong>Demo:</strong> user@test.com / 123456 (hoặc admin@educourse.vn / admin123)
        </div>
      ) : null}
    </>
  );
}
