export const SERVICE_LANGUAGES = ["en", "hi", "rj"];

export const normalizeServiceLanguage = (language = "en") => {
  const normalized = String(language || "en").trim().toLowerCase();
  return SERVICE_LANGUAGES.includes(normalized) ? normalized : "en";
};

export const getLocalizedText = (value = {}, language = "en") => {
  const normalizedLanguage = normalizeServiceLanguage(language);
  return (
    String(value?.[normalizedLanguage] || "").trim() ||
    String(value?.en || "").trim() ||
    String(value?.hi || "").trim() ||
    String(value?.rj || "").trim() ||
    ""
  );
};

export const isSafeServiceUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return false;

  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};
