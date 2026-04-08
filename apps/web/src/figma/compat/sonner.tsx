"use client";

import { notify } from "@/lib/notify";

type ToastOptions = {
  icon?: string;
  duration?: number;
};

type ToastFn = ((message: string, options?: ToastOptions) => void) & {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
};

const baseNotify = (title: string, message: string) => {
  notify({ title, message });
};

export const toast: ToastFn = ((message: string) => {
  baseNotify("Info", message);
}) as ToastFn;

toast.success = (message: string) => baseNotify("Success", message);
toast.error = (message: string) => baseNotify("Error", message);
toast.info = (message: string) => baseNotify("Info", message);
toast.warning = (message: string) => baseNotify("Warning", message);

export function Toaster() {
  return null;
}
