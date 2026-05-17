import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const SUPPORTED_LANGS = ["en", "es"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const LANG_STORAGE_KEY = "zuvio-lang";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    nonExplicitSupportedLngs: true, // treat es-MX, es-US as 'es'
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },
    returnNull: false,
  });

// Keep <html lang> in sync for SEO/a11y
if (typeof document !== "undefined") {
  const sync = (lng: string) => {
    const base = (lng || "en").split("-")[0];
    document.documentElement.lang = base;
  };
  sync(i18n.language);
  i18n.on("languageChanged", sync);
}

export default i18n;