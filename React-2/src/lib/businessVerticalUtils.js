import hospitalityIcon from "../assets/hospitality.png";
import innovationIcon from "../assets/innovation.png";
import agritechIcon from "../assets/agri.png";
import itIcon from "../assets/it.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const BUSINESS_VERTICALS_UPDATED_EVENT = "business-verticals-updated";
export const BUSINESS_VERTICALS_UPDATED_STORAGE_KEY =
  "business-verticals-updated-at";

export const DEFAULT_VERTICAL_IMAGE_MAP = {
  DEFAULT_HOSPITALITY: hospitalityIcon,
  DEFAULT_INNOVATION: innovationIcon,
  DEFAULT_AGRITECH: agritechIcon,
  DEFAULT_IT: itIcon,
};

const isAbsoluteUrl = (value) => /^(data:|blob:|https?:\/\/)/i.test(value);

export const resolveBusinessVerticalImageSrc = (vertical) => {
  const candidate =
    vertical?.imageUrl || vertical?.image || vertical?.imageKey || "";

  if (!candidate) {
    return "";
  }

  const mapped = DEFAULT_VERTICAL_IMAGE_MAP[candidate];
  if (mapped) {
    return mapped;
  }

  if (isAbsoluteUrl(candidate)) {
    return candidate;
  }

  if (candidate.startsWith("/uploads/") || candidate.startsWith("uploads/")) {
    const normalizedPath = candidate.startsWith("/")
      ? candidate
      : `/${candidate}`;

    try {
      return new URL(normalizedPath, API_BASE).toString();
    } catch {
      return normalizedPath;
    }
  }

  if (candidate.startsWith("/")) {
    return candidate;
  }

  try {
    return new URL(`/${candidate}`, API_BASE).toString();
  } catch {
    return `/${candidate}`;
  }
};

export const getBusinessVerticalFallbackSrc = () =>
  DEFAULT_VERTICAL_IMAGE_MAP.DEFAULT_HOSPITALITY;

export const mergeBusinessVerticals = (items = []) => {
  const merged = [...items];
  const seenIds = new Set();

  return merged.filter((item) => {
    if (!item?._id) {
      return true;
    }

    if (seenIds.has(item._id)) {
      return false;
    }

    seenIds.add(item._id);
    return true;
  });
};
