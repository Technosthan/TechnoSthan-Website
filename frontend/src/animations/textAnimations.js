export const splitLines = (text = "") =>
  String(text)
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const splitWords = (text = "") =>
  String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
