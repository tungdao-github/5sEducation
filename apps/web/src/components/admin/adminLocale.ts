"use client";

export function toIntlLocale(locale: string) {
  if (locale === "vi") return "vi-VN";
  if (locale === "fr") return "fr-FR";
  if (locale === "es") return "es-ES";
  return "en-US";
}
