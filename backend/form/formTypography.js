const FONT_FAMILY_OPTIONS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Courier New",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Inter",
  "Noto Sans",
  "Noto Serif",
  "Mangal",
  "Noto Sans Devanagari",
];

const FONT_STACKS = {
  Arial: "Arial, Helvetica, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  "Times New Roman": "Times New Roman, Times, serif",
  Georgia: "Georgia, Times New Roman, serif",
  Verdana: "Verdana, Geneva, sans-serif",
  Tahoma: "Tahoma, Geneva, sans-serif",
  "Trebuchet MS": "Trebuchet MS, Helvetica, sans-serif",
  "Courier New": "Courier New, Courier, monospace",
  Poppins: "Poppins, Arial, sans-serif",
  Roboto: "Roboto, Arial, sans-serif",
  "Open Sans": "Open Sans, Arial, sans-serif",
  Montserrat: "Montserrat, Arial, sans-serif",
  Lato: "Lato, Arial, sans-serif",
  Inter: "Inter, Arial, sans-serif",
  "Noto Sans": "Noto Sans, Arial, sans-serif",
  "Noto Serif": "Noto Serif, Times New Roman, serif",
  Mangal: "Mangal, Noto Sans Devanagari, sans-serif",
  "Noto Sans Devanagari": "Noto Sans Devanagari, Mangal, sans-serif",
};

const DEFAULT_TITLE_STYLE = {
  fontFamily: "Poppins",
  fontSize: "36px",
  fontWeight: "700",
  color: "#111827",
  textAlign: "left",
  fontStyle: "normal",
  textDecoration: "none",
};

const DEFAULT_DESCRIPTION_STYLE = {
  fontFamily: "",
  fontSize: "",
  fontWeight: "",
  color: "",
  backgroundColor: "",
  textAlign: "left",
  fontStyle: "",
  textDecoration: "",
  lineHeight: "",
  letterSpacing: "",
  margin: "",
  padding: "",
};

const FONT_FAMILY_SET = new Set(FONT_FAMILY_OPTIONS);
const LENGTH_PATTERN = /^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)(?:\s+(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)){0,3}$/i;
const FONT_SIZE_PATTERN = /^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt))$/i;
const COLOR_PATTERN = /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|transparent|currentColor|inherit)$/i;
const FONT_WEIGHT_PATTERN = /^(?:normal|bold|bolder|lighter|[1-9]00)$/i;
const FONT_STYLE_PATTERN = /^(?:normal|italic|oblique)$/i;
const TEXT_DECORATION_PATTERN = /^(?:none|underline|line-through|overline|underline line-through|line-through underline)$/i;
const TEXT_ALIGN_PATTERN = /^(?:left|right|center|justify|start|end)$/i;
const FONT_FAMILY_PATTERN = /^[\w\s,'"-]+$/i;
const LINE_HEIGHT_PATTERN = /^(?:normal|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?|[0-9]*\.?[0-9]+)$/i;

const sanitizeLength = (value = "") => {
  const raw = String(value || "").trim();
  return LENGTH_PATTERN.test(raw) ? raw : "";
};

const sanitizeColor = (value = "") => {
  const raw = String(value || "").trim();
  return COLOR_PATTERN.test(raw) ? raw : "";
};

const sanitizeFontFamily = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (FONT_FAMILY_SET.has(raw)) return raw;
  return FONT_FAMILY_PATTERN.test(raw) ? raw : "";
};

const sanitizeFontWeight = (value = "") => {
  const raw = String(value || "").trim();
  return FONT_WEIGHT_PATTERN.test(raw) ? raw : "";
};

const sanitizeFontStyle = (value = "") => {
  const raw = String(value || "").trim();
  return FONT_STYLE_PATTERN.test(raw) ? raw : "";
};

const sanitizeTextDecoration = (value = "") => {
  const raw = String(value || "").trim();
  return TEXT_DECORATION_PATTERN.test(raw) ? raw : "";
};

const sanitizeTextAlign = (value = "") => {
  const raw = String(value || "").trim();
  return TEXT_ALIGN_PATTERN.test(raw) ? raw.toLowerCase() : "";
};

const sanitizeLineHeight = (value = "") => {
  const raw = String(value || "").trim();
  return LINE_HEIGHT_PATTERN.test(raw) ? raw : "";
};

const sanitizeTypographyValue = (property, value = "") => {
  switch (property) {
    case "fontFamily":
      return sanitizeFontFamily(value);
    case "fontSize":
      return sanitizeLength(value) || (FONT_SIZE_PATTERN.test(String(value || "").trim()) ? String(value || "").trim() : "");
    case "fontWeight":
      return sanitizeFontWeight(value);
    case "fontStyle":
      return sanitizeFontStyle(value);
    case "textDecoration":
      return sanitizeTextDecoration(value);
    case "textAlign":
      return sanitizeTextAlign(value);
    case "color":
    case "backgroundColor":
      return sanitizeColor(value);
    case "lineHeight":
      return sanitizeLineHeight(value);
    case "letterSpacing":
    case "margin":
    case "padding":
      return sanitizeLength(value);
    default:
      return "";
  }
};

const normalizeTypographyStyle = (style = {}, fallback = {}) => {
  const source = style && typeof style === "object" ? style : {};
  const base = fallback && typeof fallback === "object" ? fallback : {};
  const result = { ...base };

  [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "textDecoration",
    "color",
    "backgroundColor",
    "textAlign",
    "lineHeight",
    "letterSpacing",
    "margin",
    "padding",
  ].forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(source, property)) {
      result[property] = sanitizeTypographyValue(property, source[property]);
    } else if (result[property] === undefined) {
      result[property] = "";
    }
  });

  return result;
};

const resolveFontFamilyStack = (fontFamily = "") =>
  FONT_STACKS[String(fontFamily || "").trim()] || String(fontFamily || "").trim() || "";

const resolveTypographyStyle = (style = {}, fallback = {}) => {
  const normalized = normalizeTypographyStyle(style, fallback);
  if (!normalized.fontFamily) {
    return normalized;
  }

  return {
    ...normalized,
    fontFamily: resolveFontFamilyStack(normalized.fontFamily),
  };
};

module.exports = {
  ALIGNMENT_OPTIONS: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Justify", value: "justify" },
  ],
  DEFAULT_DESCRIPTION_STYLE,
  DEFAULT_TITLE_STYLE,
  FONT_FAMILY_OPTIONS,
  FONT_STACKS,
  FONT_FAMILY_SET,
  FONT_SIZE_PATTERN,
  FONT_WEIGHT_PATTERN,
  FONT_STYLE_PATTERN,
  TEXT_DECORATION_PATTERN,
  TEXT_ALIGN_PATTERN,
  COLOR_PATTERN,
  LINE_HEIGHT_PATTERN,
  sanitizeTypographyValue,
  normalizeTypographyStyle,
  resolveFontFamilyStack,
  resolveTypographyStyle,
};

