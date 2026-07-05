import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import rj from "./locales/rj/translation.json";

const LANGUAGE_CODE_MAP = {
  en: "en",
  hi: "hi",
  rj: "rj",
  english: "en",
  hindi: "hi",
  rajasthani: "rj",
};

const normalizeLanguageCode = (lang) => {
  if (!lang) return null;
  return LANGUAGE_CODE_MAP[String(lang).trim().toLowerCase()] || null;
};

const initialLanguage =
  normalizeLanguageCode(localStorage.getItem("language")) || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    rj: { translation: rj },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: ["en", "hi", "rj"],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
