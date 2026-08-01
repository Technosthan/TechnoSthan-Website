import {
  BookOpen,
  Cpu,
  GraduationCap,
  Leaf,
  Monitor,
  Sparkles,
  Sprout,
  Tractor,
  Users,
} from "lucide-react";

export const CARD_ICONS = {
  tractor: Tractor,
  leaf: Leaf,
  book: BookOpen,
  users: Users,
  monitor: Monitor,
  graduation: GraduationCap,
  cpu: Cpu,
  sprout: Sprout,
  sparkles: Sparkles,
};

export const DEFAULT_CARD_ICON = Tractor;

export const getCardIcon = (key = "") =>
  CARD_ICONS[String(key || "").trim().toLowerCase()] || DEFAULT_CARD_ICON;

export const isSafeCardButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw || raw === "#") return true;
  if (/^(javascript|data|vbscript):/i.test(raw)) return false;
  if (raw.startsWith("/") || raw.startsWith("#")) return true;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const normalizeCardButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "#";
  if (raw.startsWith("/") || raw.startsWith("#")) return raw;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
};

