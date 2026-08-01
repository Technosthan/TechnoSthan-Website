import {
  BarChart3,
  BookOpen,
  Bot,
  FlaskConical,
  Leaf,
  Monitor,
  Sparkles,
  Sprout,
  Tractor,
  Users,
} from "lucide-react";

export const CTA_ICON_MAP = {
  sprout: Sprout,
  leaf: Leaf,
  tractor: Tractor,
  bot: Bot,
  chart: BarChart3,
  monitor: Monitor,
  book: BookOpen,
  flask: FlaskConical,
  users: Users,
  sparkles: Sparkles,
};

export const CTA_ICON_OPTIONS = [
  { value: "sprout", label: "Sprout", icon: Sprout },
  { value: "leaf", label: "Leaf", icon: Leaf },
  { value: "tractor", label: "Tractor", icon: Tractor },
  { value: "bot", label: "Bot", icon: Bot },
  { value: "chart", label: "Chart", icon: BarChart3 },
  { value: "monitor", label: "Monitor", icon: Monitor },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "flask", label: "Flask", icon: FlaskConical },
  { value: "users", label: "Users", icon: Users },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
];

export const DEFAULT_CTA_ICON = Sprout;

export const getCtaIcon = (key = "") =>
  CTA_ICON_MAP[String(key || "").trim().toLowerCase()] || DEFAULT_CTA_ICON;

export const isSafeCtaButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (/^(javascript|data|vbscript|file):/i.test(raw)) return false;
  if (raw.startsWith("/") || raw.startsWith("#")) return true;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const normalizeCtaButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  if (raw.startsWith("/") || raw.startsWith("#")) return raw;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
};

export const isExternalCtaLink = (value = "") =>
  /^https?:\/\//i.test(String(value || "").trim());

export const getCtaSectionId = (section = {}, index = 0) =>
  String(section?._id || section?.id || index);

export const createCtaFeature = (index = 0) => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `feature-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  description: "",
  iconKey: "leaf",
  displayOrder: index,
});

