"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { AuthModalConfirmState } from "@/components/AuthModalConfirmState";
import AuthModalFormFields from "@/components/AuthModalFormFields";

export type AuthMode = "login" | "register" | "forgot" | "reset" | "confirm-email";

export type AuthFormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  resetPassword: string;
};

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
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  form: AuthFormState;
  setForm: Dispatch<SetStateAction<AuthFormState>>;
  nextPath: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoHome: () => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoForgot: () => void;
};

export default function AuthModalBody(props: Props) {
  if (props.mode === "confirm-email") {
    return (
      <AuthModalConfirmState
        loading={props.loading}
        error={props.error}
        successMessage={props.successMessage}
        tx={props.tx}
        onGoHome={props.onGoHome}
      />
    );
  }

  return <AuthModalFormFields {...props} />;
}
