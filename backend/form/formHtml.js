const sanitizeHtml = require("sanitize-html");

const {
  DEFAULT_DESCRIPTION_STYLE,
} = require("./formTypography.js");

const ALLOWED_TAGS = [
  "p",
  "div",
  "span",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "sub",
  "sup",
  "font",
];

const ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"];

const SANITIZE_CONFIG = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel", "title", "style"],
    font: ["face", "size", "color", "style"],
    p: ["style"],
    div: ["style"],
    span: ["style"],
    blockquote: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    h5: ["style"],
    h6: ["style"],
    ul: ["style"],
    ol: ["style"],
    li: ["style"],
    sub: ["style"],
    sup: ["style"],
    strong: ["style"],
    b: ["style"],
    em: ["style"],
    i: ["style"],
    u: ["style"],
    s: ["style"],
  },
  allowedSchemes: ALLOWED_SCHEMES,
  allowProtocolRelative: false,
  parser: {
    lowerCaseTags: true,
  },
  allowedStyles: {
    "*": {
      "font-family": [/^[\w\s,'"\-]+$/i],
      "font-size": [/^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt))$/i],
      "font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/i],
      "font-style": [/^(?:normal|italic|oblique)$/i],
      "text-decoration": [/^(?:none|underline|line-through|overline|underline line-through|line-through underline)$/i],
      color: [/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|transparent|currentColor|inherit)$/i],
      "background-color": [/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|transparent|currentColor|inherit)$/i],
      "text-align": [/^(?:left|right|center|justify|start|end)$/i],
      "line-height": [/^(?:normal|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?|[0-9]*\.?[0-9]+)$/i],
      "letter-spacing": [/^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?)(?:\s+(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?)){0,3}$/i],
      margin: [/^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)(?:\s+(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)){0,3}$/i],
      padding: [/^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)(?:\s+(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|vh|vw|ch|lh)?)){0,3}$/i],
    },
  },
};

const normalizePlainTextToHtml = (value = "") =>
  String(value || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const escaped = paragraph
        .split("\n")
        .map((line) =>
          line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
        )
        .join("<br>");
      return `<p>${escaped}</p>`;
    })
    .join("");

const sanitizeRichTextHtml = (value = "") => {
  const raw = String(value || "");
  if (!raw.trim()) return "";

  const source = /<\/?[a-z][\s\S]*>/i.test(raw)
    ? raw
    : normalizePlainTextToHtml(raw);

  return sanitizeHtml(source, {
    ...SANITIZE_CONFIG,
    transformTags: {
      a: (tagName, attribs) => {
        const href = String(attribs.href || "").trim();
        if (!href) {
          return { tagName: "a", attribs: {} };
        }

        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
          },
        };
      },
      font: (tagName, attribs) => {
        const sizeMap = {
          1: "10px",
          2: "13px",
          3: "16px",
          4: "18px",
          5: "24px",
          6: "32px",
          7: "48px",
        };
        const styles = [];
        const face = String(attribs.face || "").trim();
        const size = String(attribs.size || "").trim();
        const color = String(attribs.color || "").trim();
        const inlineStyle = String(attribs.style || "").trim();

        if (face) {
          styles.push(`font-family:${face.replace(/[^a-zA-Z0-9\s,'"\-]/g, "")}`);
        }
        if (size) {
          styles.push(`font-size:${sizeMap[size] || size}`);
        }
        if (color) {
          styles.push(`color:${color}`);
        }
        if (inlineStyle) {
          styles.push(inlineStyle);
        }

        return {
          tagName: "span",
          attribs: styles.length ? { style: styles.join(";") } : {},
        };
      },
    },
  });
};

const richTextToPlainText = (value = "") =>
  String(
    sanitizeHtml(sanitizeRichTextHtml(value), {
      allowedTags: [],
      allowedAttributes: {},
      textFilter: (text) => text,
    }),
  )
    .replace(/\u00a0/g, " ")
    .trim();

const normalizeDescriptionStyle = (style = {}) => ({
  ...DEFAULT_DESCRIPTION_STYLE,
  ...(style && typeof style === "object" ? style : {}),
});

module.exports = {
  ALLOWED_TAGS,
  SANITIZE_CONFIG,
  normalizeDescriptionStyle,
  normalizePlainTextToHtml,
  richTextToPlainText,
  sanitizeRichTextHtml,
};
