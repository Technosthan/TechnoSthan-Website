const DRIVE_ID_PATTERNS = [
  /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/docs\.google\.com\/(?:file|presentation|spreadsheets|document)\/d\/([a-zA-Z0-9_-]{10,})/i,
  /\/d\/([a-zA-Z0-9_-]{10,})/i,
  /[?&]id=([a-zA-Z0-9_-]{10,})/i,
  /\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
];

const BACKEND_PUBLIC_BASE = String(process.env.BACKEND_PUBLIC_URL || process.env.PUBLIC_URL || "").replace(
  /\/$/,
  "",
);
const isInternalUploadHost = (hostname = "") =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.endsWith(".onrender.com") ||
  hostname.endsWith(".technosthan.com");

export const extractGoogleFileId = (url = "") => {
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = String(url).match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

export const normalizeMediaUrl = (url, type = "image") => {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  const fileId = extractGoogleFileId(value);
  if (fileId) {
    if (type === "video") {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  if (value.startsWith("/uploads/")) {
    return value;
  }

  if (value.startsWith("uploads/")) {
    return `/${value}`;
  }

  if (value.startsWith("http")) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/uploads/") && isInternalUploadHost(parsed.hostname)) {
        return parsed.pathname;
      }
    } catch (_error) {
      return value;
    }
  }

  return value;
};
