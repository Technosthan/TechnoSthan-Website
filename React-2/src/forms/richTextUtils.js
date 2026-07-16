import DOMPurify from "dompurify";
import {
  DEFAULT_DESCRIPTION_STYLE,
  normalizeTypographyStyle,
} from "./formTypography";

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

const ALLOWED_ATTRS = ["href", "target", "rel", "title", "style", "face", "size", "color"];
const SAFE_URL_PATTERN = /^(?:https?:|mailto:|tel:|\/|#)/i;

const normalizePlainTextToHtml = (value = "") =>
  String(value || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const escaped = paragraph
        .split("\n")
        .map((line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
        .join("<br>");
      return `<p>${escaped}</p>`;
    })
    .join("");

const sanitizeStyleProperty = (property, value = "") => {
  const clean = String(value || "").trim();
  if (!clean) return "";

  switch (property) {
    case "fontFamily":
      return clean.replace(/[^a-zA-Z0-9\s,'"\-]/g, "");
    case "fontSize":
    case "lineHeight":
    case "letterSpacing":
    case "margin":
    case "padding":
      return clean.match(/^(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?)(?:\s+(?:0|[0-9]*\.?[0-9]+(?:px|rem|em|%|pt|lh)?)){0,3}$/i)
        ? clean
        : "";
    case "fontWeight":
      return clean.match(/^(?:normal|bold|bolder|lighter|[1-9]00)$/i) ? clean : "";
    case "fontStyle":
      return clean.match(/^(?:normal|italic|oblique)$/i) ? clean : "";
    case "textDecoration":
      return clean.match(/^(?:none|underline|line-through|overline|underline line-through|line-through underline)$/i)
        ? clean
        : "";
    case "textAlign":
      return clean.match(/^(?:left|right|center|justify|start|end)$/i) ? clean.toLowerCase() : "";
    case "color":
    case "backgroundColor":
      return clean.match(/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|transparent|currentColor|inherit)$/i)
        ? clean
        : "";
    default:
      return "";
  }
};

const sanitizeInlineStyles = (element) => {
  const raw = element.getAttribute("style") || "";
  if (!raw) return;

  const scratch = document.createElement("div");
  scratch.style.cssText = raw;

  const allowed = [
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
  ];

  const next = [];
  allowed.forEach((property) => {
    const value = scratch.style[property];
    const clean = sanitizeStyleProperty(property, value);
    if (clean) {
      next.push(`${property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${clean}`);
    }
  });

  if (next.length) {
    element.setAttribute("style", next.join(";"));
  } else {
    element.removeAttribute("style");
  }
};

const convertFontTag = (node) => {
  const span = document.createElement("span");
  const styles = [];
  const face = String(node.getAttribute("face") || "").trim();
  const size = String(node.getAttribute("size") || "").trim();
  const color = String(node.getAttribute("color") || "").trim();

  if (face) {
    styles.push(`font-family:${face.replace(/[^a-zA-Z0-9\s,'"\-]/g, "")}`);
  }
  if (size) {
    const sizeMap = {
      1: "10px",
      2: "13px",
      3: "16px",
      4: "18px",
      5: "24px",
      6: "32px",
      7: "48px",
    };
    const resolvedSize = sizeMap[size] || size;
    styles.push(`font-size:${resolvedSize}`);
  }
  if (color) {
    styles.push(`color:${color}`);
  }

  const inlineStyle = node.getAttribute("style") || "";
  if (inlineStyle) {
    styles.push(inlineStyle);
  }

  if (styles.length) {
    span.setAttribute("style", styles.join(";"));
  }

  while (node.firstChild) {
    span.appendChild(node.firstChild);
  }

  node.parentNode?.replaceChild(span, node);
  sanitizeNode(span);
};

const sanitizeNode = (node) => {
  if (!node) return;

  if (node.nodeType === Node.TEXT_NODE) {
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.remove?.();
    return;
  }

  const tagName = node.tagName.toLowerCase();
  if (tagName === "font") {
    convertFontTag(node);
    return;
  }
  if (!ALLOWED_TAGS.includes(tagName)) {
    const parent = node.parentNode;
    if (parent) {
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    }
    return;
  }

  [...node.attributes].forEach((attribute) => {
    const { name, value } = attribute;
    if (name.startsWith("on")) {
      node.removeAttribute(name);
      return;
    }

    if (name === "style") {
      sanitizeInlineStyles(node);
      return;
    }

    if (!ALLOWED_ATTRS.includes(name)) {
      node.removeAttribute(name);
      return;
    }

    if (name === "href") {
      const trimmed = String(value || "").trim();
      if (!trimmed || !SAFE_URL_PATTERN.test(trimmed)) {
        node.removeAttribute(name);
      }
    }
  });

  if (tagName === "a") {
    const href = String(node.getAttribute("href") || "").trim();
    if (!href || !SAFE_URL_PATTERN.test(href)) {
      node.removeAttribute("href");
    }
    node.setAttribute("rel", "noopener noreferrer");
  }

  [...node.childNodes].forEach(sanitizeNode);
};

export const sanitizeRichTextHtml = (value = "") => {
  const raw = String(value || "");
  if (!raw.trim()) return "";

  const source = /<\/?[a-z][\s\S]*>/i.test(raw)
    ? raw
    : normalizePlainTextToHtml(raw);

  const purified = DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "svg", "math"],
    FORBID_ATTR: ["srcset", "formaction", "onload", "onclick", "onerror", "onmouseover"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  const doc = new DOMParser().parseFromString(`<div id="root">${purified}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return "";

  [...root.childNodes].forEach(sanitizeNode);
  return root.innerHTML;
};

export const richTextToPlainText = (value = "") => {
  if (!value) return "";
  const html = sanitizeRichTextHtml(value);
  if (!html) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  return String(doc.body.textContent || "").replace(/\u00a0/g, " ").trim();
};

export const normalizeRichTextValue = (value = "") => sanitizeRichTextHtml(value);

export const createDescriptionStyle = (style = {}) =>
  normalizeTypographyStyle(style, DEFAULT_DESCRIPTION_STYLE);
