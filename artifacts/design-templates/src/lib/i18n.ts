import he from "@/locales/he.json";
import en from "@/locales/en.json";

export const translations = { he, en };

export type TranslationKey = keyof typeof he;
export type Lang = "he" | "en";

export function t(key: TranslationKey, lang: Lang = "he"): string {
  const dict = translations[lang] as Record<string, string>;
  return dict[key] ?? (translations.he as Record<string, string>)[key] ?? key;
}
