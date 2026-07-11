export const normalizeHttpUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(javascript:|data:|file:)/i.test(raw)) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(candidate);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.href;
  } catch {
    return "";
  }
};

export const maskSecretValue = (value = "") => {
  const raw = String(value || "");
  return raw ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "";
};
