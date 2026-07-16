import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Copy,
  Eye,
  Pencil,
  Trash2,
  Save,
  Send,
  ArrowUp,
  ArrowDown,
  Copy as Duplicate,
  Download,
  ExternalLink,
  FileText,
  Settings,
  MessageSquare,
  ListPlus,
  Upload,
  Mail,
  Bell,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  buildPublicFormUrl,
  createAdminForm,
  deleteAdminForm,
  deleteAdminFormResponse,
  exportAdminFormResponses,
  getAdminFormExport,
  getAdminFormById,
  getAdminForms,
  getAdminFormResponse,
  getAdminFormResponses,
  importAdminFormFile,
  revealAdminFormResponseSecret,
  updateAdminForm,
} from "../../forms/formsApi";
import {
  deleteCloudinaryAsset,
  uploadFormBannerImage,
  uploadFormLogoImage,
} from "./adminApi";
import { getOptimizedImageUrl } from "../../shared/lib/assetUrl";
import { normalizeHttpUrl } from "../../forms/formUtils";
import RichTextEditor from "../../forms/RichTextEditor";
import {
  ALIGNMENT_OPTIONS,
  DEFAULT_DESCRIPTION_STYLE,
  DEFAULT_TITLE_STYLE,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  normalizeTypographyStyle,
  resolveTypographyStyle,
} from "../../forms/formTypography";
import {
  normalizeRichTextValue,
  sanitizeRichTextHtml,
} from "../../forms/richTextUtils";

const QUESTION_TYPES = [
  { value: "shortAnswer", label: "One Line Text" },
  { value: "paragraph", label: "Paragraph" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "link", label: "Link" },
  { value: "password", label: "Password / Secret" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "fileUpload", label: "File Upload" },
  { value: "imageUpload", label: "Image Upload" },
  { value: "rating", label: "Rating" },
  { value: "address", label: "Address" },
  { value: "sectionHeading", label: "Section Heading" },
];

const EMAIL_TEMPLATE_PRESETS = {
  "green-professional": {
    label: "Green Professional",
    headerBackgroundColor: "#166534",
    bodyBackgroundColor: "#f0fdf4",
    cardBackgroundColor: "#ffffff",
    accentColor: "#16a34a",
    textColor: "#0f172a",
    buttonColor: "#16a34a",
    borderRadius: 24,
  },
  "blue-corporate": {
    label: "Blue Corporate",
    headerBackgroundColor: "#1e3a8a",
    bodyBackgroundColor: "#eff6ff",
    cardBackgroundColor: "#ffffff",
    accentColor: "#2563eb",
    textColor: "#0f172a",
    buttonColor: "#2563eb",
    borderRadius: 22,
  },
  "dark-modern": {
    label: "Dark Modern",
    headerBackgroundColor: "#020617",
    bodyBackgroundColor: "#0f172a",
    cardBackgroundColor: "#111827",
    accentColor: "#38bdf8",
    textColor: "#e2e8f0",
    buttonColor: "#38bdf8",
    borderRadius: 28,
  },
  "minimal-white": {
    label: "Minimal White",
    headerBackgroundColor: "#ffffff",
    bodyBackgroundColor: "#f8fafc",
    cardBackgroundColor: "#ffffff",
    accentColor: "#0f172a",
    textColor: "#0f172a",
    buttonColor: "#0f172a",
    borderRadius: 18,
  },
  custom: {
    label: "Custom",
  },
};

const DEFAULT_EMAIL_TEMPLATE = {
  preset: "green-professional",
  headerTitle: "{{formName}}",
  headerSubtitle: "Thank you for your submission",
  successMessage: "Thank you for your response.",
  footerText: "This email was sent automatically.",
  companyName: "TechnoSthan",
  websiteButtonText: "Visit Website",
  websiteButtonUrl: "",
  headerBackgroundColor: "#166534",
  bodyBackgroundColor: "#f0fdf4",
  cardBackgroundColor: "#ffffff",
  accentColor: "#16a34a",
  textColor: "#0f172a",
  buttonColor: "#16a34a",
  borderRadius: 24,
  logoUrl: "",
  logoAsset: null,
  bannerImageUrl: "",
  bannerImageAsset: null,
  footerButtons: [],
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  sendEmailNotification: true,
  sendDashboardNotification: false,
  sendTelegramNotification: false,
  telegramBotToken: "",
  telegramChatId: "",
  sendWhatsAppNotification: false,
  whatsappAccessToken: "",
  whatsappPhoneNumberId: "",
  whatsappVerifyToken: "",
  whatsappBusinessNumber: "",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  titleStyle: { ...DEFAULT_TITLE_STYLE },
  descriptionStyle: { ...DEFAULT_DESCRIPTION_STYLE },
  slug: "",
  status: "draft",
  successMessage: "Thanks for your response.",
  logoUrl: "",
  logoAsset: null,
  bannerImage: "",
  bannerImageUrl: "",
  bannerImageAsset: null,
  emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
  notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
  notificationEmail: "",
  confirmationEmailEnabled: false,
  allowFileUpload: false,
  expiresAt: "",
  themeColor: "#16a34a",
  questions: [],
};

const createQuestion = () => ({
  id: crypto.randomUUID(),
  label: "Untitled question",
  type: "shortAnswer",
  placeholder: "",
  helpText: "",
  required: false,
  validationEnabled: false,
  options: [],
  optionsText: "",
  validation: normalizeNumberValidation(),
  order: 0,
});

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const sanitizeExportQuestion = (question = {}, index = 0) => ({
  type: question.type || "shortAnswer",
  label: String(question.label || question.title || "").trim(),
  description: String(question.description || question.helpText || "").trim(),
  placeholder: String(question.placeholder || "").trim(),
  required: question.required === true,
  validationEnabled: question.validationEnabled === true,
  options: Array.isArray(question.options)
    ? question.options.map((option) => String(option).trim()).filter(Boolean)
    : [],
  validation:
    question.validation && typeof question.validation === "object"
      ? {
          minValue:
            question.validation.minValue === undefined
              ? null
              : question.validation.minValue,
          maxValue:
            question.validation.maxValue === undefined
              ? null
              : question.validation.maxValue,
          minDigits:
            question.validation.minDigits === undefined
              ? null
              : question.validation.minDigits,
          maxDigits:
            question.validation.maxDigits === undefined
              ? null
              : question.validation.maxDigits,
          errorMessage: String(question.validation.errorMessage || "").trim(),
        }
      : {
          minValue: null,
          maxValue: null,
          minDigits: null,
          maxDigits: null,
          errorMessage: "",
        },
  order: typeof question.order === "number" ? question.order : index,
});

const createFormExportData = (form = {}) => {
  const questions = Array.isArray(form.questions) ? form.questions : [];
  const safeQuestions = questions
    .map((question, index) => sanitizeExportQuestion(question, index))
    .sort((a, b) => a.order - b.order);
  const titleStyle = normalizeTypographyStyle(form.titleStyle, DEFAULT_TITLE_STYLE);
  const descriptionStyle = normalizeTypographyStyle(
    form.descriptionStyle,
    DEFAULT_DESCRIPTION_STYLE,
  );

  return {
    exportVersion: "1.0",
    exportedAt: new Date().toISOString(),
    form: {
      title: String(form.title || "").trim(),
      description: String(form.description || ""),
      titleStyle,
      descriptionStyle,
      slug: String(form.slug || form.publicSlug || "").trim(),
      status: String(form.status || "").trim(),
      successMessage: String(form.successMessage || "").trim(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      themeColor: String(form.themeColor || "").trim(),
      logoUrl: String(form.logoUrl || form.emailTemplate?.logoUrl || "").trim(),
      bannerImage: String(form.bannerImage || form.bannerImageUrl || "").trim(),
      questions: safeQuestions,
    },
  };
};

const createSafeExportFilename = (form = {}) => {
  const baseName = form.slug || form.title || "form";
  const safeName = slugify(baseName) || "form";
  return `${safeName}-form.json`;
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (input) => String(input).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTimeDisplay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace("am", "AM")
    .replace("pm", "PM");
};

const parseOptionsText = (value = "") =>
  String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeNumberValidation = (validation = {}) => ({
  minValue:
    validation.minValue === null || validation.minValue === undefined
      ? ""
      : String(validation.minValue),
  maxValue:
    validation.maxValue === null || validation.maxValue === undefined
      ? ""
      : String(validation.maxValue),
  minDigits:
    validation.minDigits === null || validation.minDigits === undefined
      ? ""
      : String(validation.minDigits),
  maxDigits:
    validation.maxDigits === null || validation.maxDigits === undefined
      ? ""
      : String(validation.maxDigits),
  errorMessage: validation.errorMessage || "",
});

const normalizeEmailTemplate = (template = {}, form = {}) => {
  const source = template && typeof template === "object" ? template : {};
  const legacy = form && typeof form === "object" ? form : {};
  const normalizeFooterButtons = (buttons = []) =>
    (Array.isArray(buttons) ? buttons : [])
      .map((button, index) => ({
        id: String(button?.id || crypto.randomUUID()),
        text: String(button?.text || button?.label || "").trim(),
        url: normalizeHttpUrl(button?.url || ""),
        order: typeof button?.order === "number" ? button.order : index,
      }))
      .filter((button) => button.text && button.url)
      .sort((a, b) => a.order - b.order);
  return {
    preset: source.preset || legacy.emailTemplate?.preset || DEFAULT_EMAIL_TEMPLATE.preset,
    headerTitle: source.headerTitle ?? legacy.emailTemplate?.headerTitle ?? DEFAULT_EMAIL_TEMPLATE.headerTitle,
    headerSubtitle:
      source.headerSubtitle ?? legacy.emailTemplate?.headerSubtitle ?? DEFAULT_EMAIL_TEMPLATE.headerSubtitle,
    successMessage:
      source.successMessage ?? legacy.emailTemplate?.successMessage ?? legacy.successMessage ?? DEFAULT_EMAIL_TEMPLATE.successMessage,
    footerText: source.footerText ?? legacy.emailTemplate?.footerText ?? DEFAULT_EMAIL_TEMPLATE.footerText,
    companyName:
      source.companyName ?? legacy.emailTemplate?.companyName ?? legacy.companyName ?? DEFAULT_EMAIL_TEMPLATE.companyName,
    websiteButtonText:
      source.websiteButtonText ?? legacy.emailTemplate?.websiteButtonText ?? DEFAULT_EMAIL_TEMPLATE.websiteButtonText,
    websiteButtonUrl:
      source.websiteButtonUrl ?? legacy.emailTemplate?.websiteButtonUrl ?? DEFAULT_EMAIL_TEMPLATE.websiteButtonUrl,
    headerBackgroundColor:
      source.headerBackgroundColor ?? legacy.emailTemplate?.headerBackgroundColor ?? DEFAULT_EMAIL_TEMPLATE.headerBackgroundColor,
    bodyBackgroundColor:
      source.bodyBackgroundColor ?? legacy.emailTemplate?.bodyBackgroundColor ?? DEFAULT_EMAIL_TEMPLATE.bodyBackgroundColor,
    cardBackgroundColor:
      source.cardBackgroundColor ?? legacy.emailTemplate?.cardBackgroundColor ?? DEFAULT_EMAIL_TEMPLATE.cardBackgroundColor,
    accentColor:
      source.accentColor ?? legacy.emailTemplate?.accentColor ?? DEFAULT_EMAIL_TEMPLATE.accentColor,
    textColor: source.textColor ?? legacy.emailTemplate?.textColor ?? DEFAULT_EMAIL_TEMPLATE.textColor,
    buttonColor: source.buttonColor ?? legacy.emailTemplate?.buttonColor ?? DEFAULT_EMAIL_TEMPLATE.buttonColor,
    borderRadius:
      source.borderRadius ?? legacy.emailTemplate?.borderRadius ?? DEFAULT_EMAIL_TEMPLATE.borderRadius,
    logoUrl:
      source.logoUrl ?? legacy.emailTemplate?.logoUrl ?? "",
    logoAsset: source.logoAsset ?? legacy.emailTemplate?.logoAsset ?? null,
    bannerImageUrl:
      source.bannerImageUrl ?? legacy.emailTemplate?.bannerImageUrl ?? legacy.bannerImageUrl ?? "",
    bannerImageAsset:
      source.bannerImageAsset ??
      legacy.emailTemplate?.bannerImageAsset ??
      legacy.bannerImageAsset ??
      null,
    footerButtons: normalizeFooterButtons(
      source.footerButtons ??
        legacy.emailTemplate?.footerButtons ??
        (legacy.websiteButtonText && legacy.websiteButtonUrl
          ? [{ text: legacy.websiteButtonText, url: legacy.websiteButtonUrl }]
          : []),
    ),
  };
};

const normalizeEditableFooterButtons = (template = {}, form = {}) => {
  const source = template && typeof template === "object" ? template : {};
  const legacy = form && typeof form === "object" ? form : {};
  const buttons = Array.isArray(source.footerButtons)
    ? source.footerButtons
    : Array.isArray(legacy.emailTemplate?.footerButtons)
      ? legacy.emailTemplate.footerButtons
      : legacy.websiteButtonText && legacy.websiteButtonUrl
        ? [{ text: legacy.websiteButtonText, url: legacy.websiteButtonUrl }]
        : [];

  return buttons
    .map((button, index) => ({
      id: String(button?.id || `footer-button-${index}`),
      text: String(button?.text || button?.label || "").trim(),
      url: normalizeHttpUrl(button?.url || ""),
      order: typeof button?.order === "number" ? button.order : index,
    }))
    .sort((a, b) => a.order - b.order);
};

const normalizeNotificationSettings = (settings = {}, form = {}) => {
  const source = settings && typeof settings === "object" ? settings : {};
  const legacy = form && typeof form === "object" ? form : {};
  return {
    sendEmailNotification:
      source.sendEmailNotification ??
      legacy.notificationSettings?.sendEmailNotification ??
      DEFAULT_NOTIFICATION_SETTINGS.sendEmailNotification,
    sendDashboardNotification:
      source.sendDashboardNotification ??
      legacy.notificationSettings?.sendDashboardNotification ??
      DEFAULT_NOTIFICATION_SETTINGS.sendDashboardNotification,
    sendTelegramNotification:
      source.sendTelegramNotification ??
      legacy.notificationSettings?.sendTelegramNotification ??
      DEFAULT_NOTIFICATION_SETTINGS.sendTelegramNotification,
    telegramBotToken:
      source.telegramBotToken ??
      legacy.notificationSettings?.telegramBotToken ??
      "",
    telegramChatId:
      source.telegramChatId ?? legacy.notificationSettings?.telegramChatId ?? "",
    sendWhatsAppNotification:
      source.sendWhatsAppNotification ??
      legacy.notificationSettings?.sendWhatsAppNotification ??
      DEFAULT_NOTIFICATION_SETTINGS.sendWhatsAppNotification,
    whatsappAccessToken:
      source.whatsappAccessToken ??
      legacy.notificationSettings?.whatsappAccessToken ??
      "",
    whatsappPhoneNumberId:
      source.whatsappPhoneNumberId ??
      legacy.notificationSettings?.whatsappPhoneNumberId ??
      "",
    whatsappVerifyToken:
      source.whatsappVerifyToken ??
      legacy.notificationSettings?.whatsappVerifyToken ??
      "",
    whatsappBusinessNumber:
      source.whatsappBusinessNumber ??
      legacy.notificationSettings?.whatsappBusinessNumber ??
      "",
  };
};

const applyPresetToTemplate = (presetKey, currentTemplate = {}) => {
  const preset = EMAIL_TEMPLATE_PRESETS[presetKey] || EMAIL_TEMPLATE_PRESETS.custom;
  if (presetKey === "custom") {
    return {
      ...normalizeEmailTemplate(currentTemplate),
      preset: "custom",
    };
  }

  const { label: _label, ...presetStyles } = preset;
  return {
    ...normalizeEmailTemplate(currentTemplate),
    preset: presetKey,
    ...presetStyles,
  };
};

const interpolateTemplateText = (value = "", context = {}) =>
  String(value || "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, token) => {
    const replacement = context[token];
    return replacement === undefined || replacement === null ? "" : String(replacement);
  });

const isLightHexColor = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/^#([0-9a-f]{6})$/i);
  if (!match) return false;
  const hex = match[1];
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 160;
};

const buildTemplatePreview = (template = {}, formTitle = "") => {
  const resolved = normalizeEmailTemplate(template, { title: formTitle });
  const context = {
    formName: formTitle || "Sample Form",
    submissionDate: "09 Jul 2026, 01:24 PM",
    userName: "John Doe",
    userEmail: "john@example.com",
    companyName: resolved.companyName || "TechnoSthan",
  };

  const headerTitle = interpolateTemplateText(resolved.headerTitle, context) || context.formName;
  const headerSubtitle =
    interpolateTemplateText(resolved.headerSubtitle, context) || "Thank you for your submission";
  const successMessage =
    interpolateTemplateText(resolved.successMessage, context) ||
    "Thank you for your response.";
  const footerText = interpolateTemplateText(resolved.footerText, context);
  const buttonText =
    interpolateTemplateText(resolved.websiteButtonText, context) || "Visit Website";
  const buttonUrl =
    interpolateTemplateText(resolved.websiteButtonUrl, context) || "https://example.com";
  const footerButtons = Array.isArray(resolved.footerButtons)
    ? resolved.footerButtons.map((button, index) => ({
        id: button.id || `footer-button-${index}`,
        text: interpolateTemplateText(button.text, context).trim(),
        url: normalizeHttpUrl(interpolateTemplateText(button.url, context)),
        order: typeof button.order === "number" ? button.order : index,
      })).filter((button) => button.text && button.url)
    : [];
  const bannerUrl =
    resolved.bannerImageAsset ||
    resolved.bannerImage ||
    resolved.bannerImageUrl ||
    "";
  const logoUrl = resolved.logoAsset || resolved.logoUrl || "";
  const tableRows = [
    { question: "Full Name", answer: "John Doe" },
    { question: "Email", answer: "john@example.com" },
    { question: "Phone", answer: "+91 98765 43210" },
  ];

  return {
    resolved,
    headerTextColor: isLightHexColor(resolved.headerBackgroundColor)
      ? "#0f172a"
      : "#ffffff",
    headerTitle,
    headerSubtitle,
    successMessage,
    footerText,
    buttonText,
    buttonUrl,
    footerButtons,
    bannerUrl,
    logoUrl,
    tableRows,
    context,
  };
};

const parseOptionalNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseOptionalInteger = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const buildQuestionValidationPayload = (question) => {
  if (question.type !== "number") {
    return undefined;
  }

  return {
    minValue: parseOptionalNumber(question.validation?.minValue),
    maxValue: parseOptionalNumber(question.validation?.maxValue),
    minDigits: parseOptionalInteger(question.validation?.minDigits),
    maxDigits: parseOptionalInteger(question.validation?.maxDigits),
    errorMessage: String(question.validation?.errorMessage || "").trim(),
  };
};

const normalizeQuestion = (question, index) => ({
  id: question._id || question.id || crypto.randomUUID(),
  label: question.label || "",
  type: question.type || "shortAnswer",
  placeholder: question.placeholder || "",
  helpText: question.helpText || "",
  required: question.required === true,
  validationEnabled: question.validationEnabled === true,
  options: Array.isArray(question.options)
    ? question.options
    : typeof question.options === "string"
      ? parseOptionsText(question.options)
      : [],
  optionsText: Array.isArray(question.options)
    ? question.options.join("\n")
    : typeof question.options === "string"
      ? question.options
      : "",
  validation: normalizeNumberValidation(question.validation),
  order: typeof question.order === "number" ? question.order : index,
});

const normalizeForm = (form) => ({
  ...EMPTY_FORM,
  ...form,
  status: form?.status || (form?.active ? "live" : "draft"),
  slug: form?.slug || form?.publicSlug || "",
  titleStyle: normalizeTypographyStyle(form?.titleStyle, DEFAULT_TITLE_STYLE),
  descriptionStyle: normalizeTypographyStyle(
    form?.descriptionStyle,
    DEFAULT_DESCRIPTION_STYLE,
  ),
  expiresAt: formatDateTimeLocal(form?.expiresAt),
  bannerImage:
    form?.bannerImage ||
    form?.bannerImageUrl ||
    form?.bannerImageAsset?.secureUrl ||
    form?.bannerImageAsset?.url ||
    "",
  bannerImageUrl:
    form?.bannerImageUrl ||
    form?.bannerImage ||
    form?.bannerImageAsset?.secureUrl ||
    form?.bannerImageAsset?.url ||
    "",
  logoUrl:
    form?.logoUrl ||
    form?.logoAsset?.secureUrl ||
    form?.logoAsset?.url ||
    form?.emailTemplate?.logoUrl ||
    form?.emailTemplate?.logoAsset?.secureUrl ||
    form?.emailTemplate?.logoAsset?.url ||
    "",
  logoAsset:
    form?.logoAsset ||
    form?.emailTemplate?.logoAsset ||
    null,
  emailTemplate: normalizeEmailTemplate(form?.emailTemplate, form),
  notificationSettings: normalizeNotificationSettings(
    form?.notificationSettings,
    form,
  ),
  questions: Array.isArray(form?.questions)
    ? form.questions.map(normalizeQuestion)
    : [],
});

const normalizeResponsesPayload = (payload) =>
  Array.isArray(payload) ? payload : payload?.items || [];

const getResponseText = (response) => {
  const answers = Array.isArray(response?.answers) ? response.answers : [];
  return [
    response?.referenceId,
    response?.name,
    response?.email,
    response?.phone,
    ...answers.flatMap((answer) => {
      if (answer.fileName) return [answer.fileName, answer.fileUrl || ""];
      if (Array.isArray(answer.value)) return answer.value;
      return [answer.value ?? ""];
    }),
  ]
    .join(" ")
    .toLowerCase();
};

const maskSecretValue = () => "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

const getLinkHref = (value = "") => normalizeHttpUrl(value);

const renderAnswerValue = (answer, options = {}) => {
  if (!answer) return "-";

  if (answer.fileUrl) {
    return (
      <a
        href={answer.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 break-words text-cyan-300 underline decoration-cyan-300/50 underline-offset-4"
      >
        <ExternalLink size={14} />
        <span className="break-all">{answer.fileName || answer.fileUrl}</span>
      </a>
    );
  }

  if (answer.question?.type === "password") {
    const revealed = options.revealedValue || "";
    return options.revealed ? (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
          <span className="break-all text-cyan-100">{revealed}</span>
          <button
            type="button"
            onClick={options.onCopy}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
        <p className="text-xs text-slate-400">Secret auto-hides after 30 seconds.</p>
      </div>
    ) : (
      <div className="flex flex-wrap items-center gap-3">
        <span className="tracking-[0.35em] text-slate-300">{maskSecretValue()}</span>
        <button
          type="button"
          onClick={options.onReveal}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200"
        >
          <Eye size={14} /> Reveal Secret
        </button>
      </div>
    );
  }

  if (answer.question?.type === "link") {
    const href = getLinkHref(answer.value);
    const label = String(answer.value || href || "-");
    return href ? (
      <div className="space-y-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-cyan-200 transition hover:bg-cyan-500/15"
        >
          <ExternalLink size={14} />
          <span className="font-semibold">Open Link</span>
        </a>
        <div className="break-all rounded-2xl border border-cyan-500/10 bg-slate-950/30 px-3 py-2 text-cyan-100">
          {label}
        </div>
      </div>
    ) : (
      <span className="break-all">{label}</span>
    );
  }

  if (Array.isArray(answer.value)) {
    return answer.value.join(", ");
  }

  return String(answer.value ?? "-");
};

const getAnswerText = (answer) => {
  if (!answer) return "";
  if (Array.isArray(answer.value)) return answer.value.join(", ");
  return String(answer.value ?? "");
};

const getRatingValue = (response) => {
  if (typeof response?.ratingValue === "number") return response.ratingValue;
  const answers = Array.isArray(response?.answers) ? response.answers : [];
  for (const answer of answers) {
    const questionLabel = String(answer.question?.label || "").toLowerCase();
    const isRating =
      answer.question?.type === "rating" || /star|rating/.test(questionLabel);
    if (!isRating) continue;
    const value = Number.parseInt(getAnswerText(answer), 10);
    if (Number.isFinite(value) && value >= 1 && value <= 5) return value;
  }
  return null;
};

const getInterestAnswer = (response) => {
  if (response?.interestedAnswer) return response.interestedAnswer;
  if (response?.availableAnswer) return response.availableAnswer;
  const answers = Array.isArray(response?.answers) ? response.answers : [];
  const match = answers.find((answer) => {
    const label = String(answer.question?.label || "").toLowerCase();
    return /interested|available to join|available|join|seminar/.test(label);
  });
  return match ? getAnswerText(match) : "";
};

const getScoreBucket = (score) => {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
};

const formatSubmittedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace("am", "AM").replace("pm", "PM");
};

const getFilterRange = (filter) => {
  const now = new Date();
  if (filter === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  if (filter === "yesterday") {
    const from = new Date(now);
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  if (filter === "7days") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  if (filter === "30days") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  return {};
};

const FormManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [draft, setDraft] = useState(() => ({
    ...EMPTY_FORM,
    emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
    notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
  }));
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [responsesTab, setResponsesTab] = useState("list");
  const [responseSearch, setResponseSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState("all");
  const [responseDateFrom, setResponseDateFrom] = useState("");
  const [responseDateTo, setResponseDateTo] = useState("");
  const [exportingFormId, setExportingFormId] = useState(null);
  const [analysisLeadFilter, setAnalysisLeadFilter] = useState("all");
  const [analysisRatingFilter, setAnalysisRatingFilter] = useState("all");
  const [analysisInterestFilter, setAnalysisInterestFilter] = useState("all");
  const [analysisAvailabilityFilter, setAnalysisAvailabilityFilter] = useState("all");
  const [analysisEmailFilter, setAnalysisEmailFilter] = useState("all");
  const [analysisPhoneFilter, setAnalysisPhoneFilter] = useState("all");
  const lastSavedFormRef = useRef(null);
  const sessionUploadedAssetsRef = useRef([]);
  const secretRevealTimersRef = useRef({});
  const importFileInputRef = useRef(null);
  const formLogoInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);
  const [uploadingFormLogoImage, setUploadingFormLogoImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [importingFormFile, setImportingFormFile] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const emailLogoInputRef = useRef(null);
  const emailBannerInputRef = useRef(null);
  const [uploadingEmailTemplateField, setUploadingEmailTemplateField] = useState("");
  const [formLogoPreviewFailed, setFormLogoPreviewFailed] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [bannerPreviewFailed, setBannerPreviewFailed] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState({});

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await getAdminForms();
      setForms(res.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const selectForm = async (form, nextTab = "questions") => {
    setSelectedFormId(form._id);
    setActiveTab(nextTab);
    setResponsesTab("list");
    setSlugTouched(true);
    setSelectedResponse(null);
    setImportPreview(null);
    sessionUploadedAssetsRef.current = [];
    setUploadingEmailTemplateField("");
    setUploadingFormLogoImage(false);
    setFormLogoPreviewFailed(false);
    setLogoPreviewFailed(false);
    setBannerPreviewFailed(false);
    try {
      const [detailRes, responseRes] = await Promise.all([
        getAdminFormById(form._id),
        getAdminFormResponses(form._id),
      ]);
      const normalized = normalizeForm(detailRes.data?.data || form);
      lastSavedFormRef.current = normalized;
      setDraft(normalized);
      setResponses(normalizeResponsesPayload(responseRes.data?.data));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load form");
    }
  };

  const startNewForm = () => {
    setSelectedFormId(null);
    setActiveTab("questions");
    setResponsesTab("list");
    setSlugTouched(false);
    setImportPreview(null);
    setDraft({
      ...EMPTY_FORM,
      emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
      notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
    });
    lastSavedFormRef.current = null;
    sessionUploadedAssetsRef.current = [];
    setUploadingEmailTemplateField("");
    setUploadingFormLogoImage(false);
    setFormLogoPreviewFailed(false);
    setLogoPreviewFailed(false);
    setBannerPreviewFailed(false);
    setResponses([]);
    setSelectedResponse(null);
  };

  const updateDraft = (field, value) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const updateTitleStyle = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      titleStyle: normalizeTypographyStyle(
        {
          ...(prev.titleStyle || {}),
          [field]: value,
        },
        DEFAULT_TITLE_STYLE,
      ),
    }));
  };

  const updateEmailTemplate = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      emailTemplate: {
        ...normalizeEmailTemplate(prev.emailTemplate),
        [field]: value,
      },
    }));
  };

  const updateFooterButton = (index, field, value) => {
    setDraft((prev) => {
      const buttons = normalizeEditableFooterButtons(prev.emailTemplate, prev);
      buttons[index] = { ...buttons[index], [field]: value };
      return {
        ...prev,
        emailTemplate: {
          ...normalizeEmailTemplate(prev.emailTemplate),
          footerButtons: buttons,
        },
      };
    });
  };

  const addFooterButton = () => {
    setDraft((prev) => {
      const buttons = normalizeEditableFooterButtons(prev.emailTemplate, prev);
      buttons.push({ id: crypto.randomUUID(), text: "", url: "", order: buttons.length });
      return {
        ...prev,
        emailTemplate: {
          ...normalizeEmailTemplate(prev.emailTemplate),
          footerButtons: buttons,
        },
      };
    });
  };

  const moveFooterButton = (index, direction) => {
    setDraft((prev) => {
      const buttons = normalizeEditableFooterButtons(prev.emailTemplate, prev);
      const target = index + direction;
      if (target < 0 || target >= buttons.length) return prev;
      [buttons[index], buttons[target]] = [buttons[target], buttons[index]];
      return {
        ...prev,
        emailTemplate: {
          ...normalizeEmailTemplate(prev.emailTemplate),
          footerButtons: buttons.map((button, order) => ({ ...button, order })),
        },
      };
    });
  };

  const deleteFooterButton = (index) => {
    setDraft((prev) => {
      const buttons = normalizeEditableFooterButtons(prev.emailTemplate, prev).filter(
        (_, currentIndex) => currentIndex !== index,
      );
      return {
        ...prev,
        emailTemplate: {
          ...normalizeEmailTemplate(prev.emailTemplate),
          footerButtons: buttons.map((button, order) => ({ ...button, order })),
        },
      };
    });
  };

  const updateEmailTemplatePreset = (presetKey) => {
    setDraft((prev) => ({
      ...prev,
      emailTemplate: applyPresetToTemplate(presetKey, prev.emailTemplate),
    }));
  };

  const updateNotificationSettings = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      notificationSettings: {
        ...normalizeNotificationSettings(prev.notificationSettings, prev),
        [field]: value,
      },
    }));
  };

  const updateQuestion = (index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  };

  const updateQuestionValidation = (index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) =>
        currentIndex === index
          ? {
              ...question,
              validation: {
                ...normalizeNumberValidation(question.validation),
                [field]: value,
              },
            }
          : question,
      ),
    }));
  };

  const handleFormLogoFile = (file) => {
    if (!file) {
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      updateDraft("logoUrl", "");
      updateDraft("logoAsset", null);
      setFormLogoPreviewFailed(false);
      return;
    }

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ]);
    const maxLogoImageSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      toast.error("Please choose a valid image file");
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      return;
    }

    if (file.size > maxLogoImageSizeBytes) {
      toast.error("Logo image must be 5 MB or smaller");
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingFormLogoImage(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "forms/logos");
        const response = await uploadFormLogoImage(formData);
        const uploadData = response.data?.data || {};
        const imageUrl =
          uploadData.secureUrl ||
          uploadData.url ||
          uploadData.imageUrl ||
          "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        updateDraft("logoUrl", imageUrl);
        updateDraft("logoAsset", {
          url: uploadData.url || imageUrl,
          secureUrl: uploadData.secureUrl || imageUrl,
          publicId: uploadData.publicId || "",
          resourceType: uploadData.resourceType || "image",
          format: uploadData.format || "",
          originalName: uploadData.originalName || file.name,
          mimeType: uploadData.mimeType || file.type,
          size: uploadData.size || file.size,
          bytes: uploadData.size || file.size,
          width: uploadData.asset?.width || null,
          height: uploadData.asset?.height || null,
          version: uploadData.asset?.version || null,
          folder: uploadData.asset?.folder || "technosthan/forms/logos",
        });
        setFormLogoPreviewFailed(false);
        registerSessionAsset(
          uploadData.asset || {
            publicId: uploadData.publicId || "",
            resourceType: uploadData.resourceType || "image",
            url: uploadData.url || imageUrl,
            secureUrl: uploadData.secureUrl || imageUrl,
          },
        );
        toast.success("Logo uploaded");
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || "Failed to upload image",
        );
      } finally {
        setUploadingFormLogoImage(false);
        if (formLogoInputRef.current) {
          formLogoInputRef.current.value = "";
        }
      }
    };

    upload();
  };

  const handleBannerImageFile = (file) => {
    if (!file) {
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
      updateDraft("bannerImageUrl", "");
      updateDraft("bannerImage", "");
      updateDraft("bannerImageAsset", null);
      return;
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxBannerImageSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      toast.error("Please choose a valid image file");
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
      return;
    }

    if (file.size > maxBannerImageSizeBytes) {
      toast.error("Banner image must be 5 MB or smaller");
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingBannerImage(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "forms/banners");
        const response = await uploadFormBannerImage(formData);
        const uploadData = response.data?.data || {};
        const imageUrl =
          uploadData.secureUrl ||
          uploadData.url ||
          uploadData.imageUrl ||
          "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
        updateDraft("bannerImage", imageUrl);
        updateDraft("bannerImageUrl", imageUrl);
        updateDraft("bannerImageAsset", {
          url: uploadData.url || imageUrl,
          secureUrl: uploadData.secureUrl || imageUrl,
          publicId: uploadData.publicId || "",
          resourceType: uploadData.resourceType || "image",
          format: uploadData.format || "",
          originalName: uploadData.originalName || file.name,
          mimeType: uploadData.mimeType || file.type,
          size: uploadData.size || file.size,
          bytes: uploadData.size || file.size,
          width: uploadData.asset?.width || null,
          height: uploadData.asset?.height || null,
          version: uploadData.asset?.version || null,
          folder: uploadData.asset?.folder || "technosthan/forms/banners",
        });
        registerSessionAsset(
          uploadData.asset || {
            publicId: uploadData.publicId || "",
            resourceType: uploadData.resourceType || "image",
            url: uploadData.url || imageUrl,
            secureUrl: uploadData.secureUrl || imageUrl,
          },
        );
        toast.success("Image uploaded");
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || "Failed to upload image",
        );
      } finally {
        setUploadingBannerImage(false);
        if (bannerImageInputRef.current) {
          bannerImageInputRef.current.value = "";
        }
      }
    };

    upload();
  };

  const handleEmailTemplateImageFile = (field, file) => {
    if (!file) {
      updateEmailTemplate(field, "");
      updateEmailTemplate(field === "logoUrl" ? "logoAsset" : "bannerImageAsset", null);
      if (field === "logoUrl") {
        setLogoPreviewFailed(false);
        if (emailLogoInputRef.current) {
          emailLogoInputRef.current.value = "";
        }
      } else {
        setBannerPreviewFailed(false);
        if (emailBannerInputRef.current) {
          emailBannerInputRef.current.value = "";
        }
      }
      return;
    }

    const allowedTypes =
      field === "logoUrl"
        ? new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"])
        : new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxImageSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      toast.error("Please choose a valid image file");
      if (field === "logoUrl" && emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
      if (field === "bannerImageUrl" && emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
      return;
    }

    if (file.size > maxImageSizeBytes) {
      toast.error("Image must be 5 MB or smaller");
      if (field === "logoUrl" && emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
      if (field === "bannerImageUrl" && emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingEmailTemplateField(field);
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "forms/email-templates");
        const response = await uploadFormBannerImage(formData);
        const uploadData = response.data?.data || {};
        const imageUrl =
          uploadData.secureUrl ||
          uploadData.url ||
          uploadData.imageUrl ||
          "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
        updateEmailTemplate(field, imageUrl);
        updateEmailTemplate(field === "logoUrl" ? "logoAsset" : "bannerImageAsset", {
          url: uploadData.url || imageUrl,
          secureUrl: uploadData.secureUrl || imageUrl,
          publicId: uploadData.publicId || "",
          resourceType: uploadData.resourceType || "image",
          format: uploadData.format || "",
          originalName: uploadData.originalName || file.name,
          mimeType: uploadData.mimeType || file.type,
          size: uploadData.size || file.size,
          bytes: uploadData.size || file.size,
          width: uploadData.asset?.width || null,
          height: uploadData.asset?.height || null,
          version: uploadData.asset?.version || null,
          folder: uploadData.asset?.folder || "technosthan/forms/email-templates",
        });
        if (field === "logoUrl") {
          setLogoPreviewFailed(false);
        } else {
          setBannerPreviewFailed(false);
        }
        registerSessionAsset(
          uploadData.asset || {
            publicId: uploadData.publicId || "",
            resourceType: uploadData.resourceType || "image",
            url: uploadData.url || imageUrl,
            secureUrl: uploadData.secureUrl || imageUrl,
          },
        );
        toast.success("Image uploaded");
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || "Failed to upload image",
        );
      } finally {
        setUploadingEmailTemplateField("");
        if (field === "logoUrl" && emailLogoInputRef.current) {
          emailLogoInputRef.current.value = "";
        }
        if (field === "bannerImageUrl" && emailBannerInputRef.current) {
          emailBannerInputRef.current.value = "";
        }
      }
    };

    upload();
  };

  const clearEmailTemplateImage = (field) => {
    updateEmailTemplate(field, "");
    updateEmailTemplate(field === "logoUrl" ? "logoAsset" : "bannerImageAsset", null);
    if (field === "logoUrl") {
      setLogoPreviewFailed(false);
      if (emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
    } else {
      setBannerPreviewFailed(false);
      if (emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
    }
  };

  const addQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { ...createQuestion(), order: prev.questions.length },
      ],
    }));
  };

  const handleImportFormFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 10 * 1024 * 1024;
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".json"];
    const fileName = String(file.name || "").toLowerCase();
    const isAllowedExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!isAllowedExtension) {
      toast.error("Please upload a PDF, DOC, DOCX, TXT, or JSON file.");
      if (importFileInputRef.current) importFileInputRef.current.value = "";
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error("Maximum file size allowed is 10 MB.");
      if (importFileInputRef.current) importFileInputRef.current.value = "";
      return;
    }

    setImportingFormFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await importAdminFormFile(formData);
      const data = response.data?.data || {};
      setImportPreview({
        title: data.title || "",
        description: normalizeRichTextValue(data.description || ""),
        titleStyle: normalizeTypographyStyle(data.titleStyle, DEFAULT_TITLE_STYLE),
        descriptionStyle: normalizeTypographyStyle(
          data.descriptionStyle,
          DEFAULT_DESCRIPTION_STYLE,
        ),
        hasTypographySettings: fileName.endsWith(".json"),
        sections: Array.isArray(data.sections) ? data.sections : [],
        questions: Array.isArray(data.questions)
          ? data.questions.map((question, index) => ({
              id: crypto.randomUUID(),
              selected: true,
              label: question.label || "",
              type: question.type || "shortAnswer",
              required: question.required === true,
              placeholder: question.placeholder || "",
              helpText: question.helpText || "",
              optionsText: Array.isArray(question.options)
                ? question.options.join("\n")
                : String(question.options || ""),
              order: typeof question.order === "number" ? question.order : index,
            }))
          : [],
      });
      setActiveTab("questions");
      toast.success("Analyzing file complete");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to analyze file");
    } finally {
      setImportingFormFile(false);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
    }
  };

  const updateImportedQuestion = (index, field, value) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions || [])];
      questions[index] = {
        ...questions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions,
      };
    });
  };

  const updateImportPreviewField = (field, value) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const toggleImportedQuestion = (index) => {
    setImportPreview((prev) => {
      if (!prev) return prev;
      const questions = [...(prev.questions || [])];
      questions[index] = {
        ...questions[index],
        selected: !questions[index]?.selected,
      };
      return { ...prev, questions };
    });
  };

  const applyImportedForm = () => {
    if (!importPreview) return;

    const importedQuestions = (importPreview.questions || [])
      .filter((question) => question.selected)
      .map((question) => ({
        ...createQuestion(),
        id: crypto.randomUUID(),
        label: question.label || "Untitled question",
        type: question.type || "shortAnswer",
        required: question.required === true,
        placeholder: question.placeholder || "",
        helpText: question.helpText || "",
        optionsText: question.optionsText || "",
        options: parseOptionsText(question.optionsText || ""),
        order: 0,
      }))
      .filter((question) => question.label.trim());

    setDraft((prev) => {
      const existing = Array.isArray(prev.questions) ? [...prev.questions] : [];
      const existingKeys = new Set(
        existing.map((question) =>
          `${String(question.label || "").trim().toLowerCase()}::${String(question.type || "").trim().toLowerCase()}`,
        ),
      );

      const merged = [...existing];
      importedQuestions.forEach((question) => {
        const key = `${String(question.label || "").trim().toLowerCase()}::${String(question.type || "").trim().toLowerCase()}`;
        if (existingKeys.has(key)) {
          return;
        }
        existingKeys.add(key);
        merged.push(question);
      });

      return {
        ...prev,
        title: String(prev.title || "").trim() ? prev.title : importPreview.title || prev.title,
        description: String(prev.description || "").trim()
          ? prev.description
          : normalizeRichTextValue(importPreview.description || prev.description),
        titleStyle: importPreview.hasTypographySettings
          ? normalizeTypographyStyle(importPreview.titleStyle, DEFAULT_TITLE_STYLE)
          : normalizeTypographyStyle(prev.titleStyle, DEFAULT_TITLE_STYLE),
        descriptionStyle: importPreview.hasTypographySettings
          ? normalizeTypographyStyle(
              importPreview.descriptionStyle,
              DEFAULT_DESCRIPTION_STYLE,
            )
          : normalizeTypographyStyle(prev.descriptionStyle, DEFAULT_DESCRIPTION_STYLE),
        questions: merged.map((question, order) => ({ ...question, order })),
      };
    });

    setImportPreview(null);
    toast.success("Imported fields applied");
  };

  const cancelImportedForm = () => {
    setImportPreview(null);
  };

  const duplicateQuestion = (index) => {
    setDraft((prev) => {
      const source = prev.questions[index];
      if (!source) return prev;
      const copy = {
        ...source,
        id: crypto.randomUUID(),
        label: `${source.label} copy`,
        order: prev.questions.length,
      };
      return { ...prev, questions: [...prev.questions, copy] };
    });
  };

  const removeQuestion = (index) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const moveQuestion = (index, direction) => {
    setDraft((prev) => {
      const next = [...prev.questions];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...prev,
        questions: next.map((question, order) => ({ ...question, order })),
      };
    });
  };

  const getAssetPublicId = (asset) =>
    asset && typeof asset === "object" ? asset.publicId || asset.public_id || "" : "";

  const registerSessionAsset = (asset) => {
    const publicId = getAssetPublicId(asset);
    if (!publicId) return;

    sessionUploadedAssetsRef.current = [
      ...sessionUploadedAssetsRef.current.filter(
        (item) => getAssetPublicId(item) !== publicId,
      ),
      asset,
    ];
  };

  const collectSavedAssetPublicIds = (form) =>
    new Set(
      [
        form?.logoAsset,
        form?.bannerImageAsset,
        form?.emailTemplate?.logoAsset,
        form?.emailTemplate?.bannerImageAsset,
      ]
        .filter(Boolean)
        .map((asset) => getAssetPublicId(asset))
        .filter(Boolean),
    );

  const cleanupSessionUploads = async (savedForm) => {
    const keepIds = collectSavedAssetPublicIds(savedForm);
    const assetsToDelete = sessionUploadedAssetsRef.current.filter((asset) => {
      const publicId = getAssetPublicId(asset);
      return publicId && !keepIds.has(publicId);
    });

    await Promise.all(
      assetsToDelete.map((asset) =>
        deleteCloudinaryAsset({
          publicId: getAssetPublicId(asset),
          resourceType: asset?.resourceType || "image",
        }).catch((error) => {
          console.warn("Failed to delete temporary uploaded asset:", error.message);
        }),
      ),
    );

    sessionUploadedAssetsRef.current = sessionUploadedAssetsRef.current.filter((asset) =>
      keepIds.has(getAssetPublicId(asset)),
    );
  };

  const cleanupReplacedAssets = async (previousForm, nextForm) => {
    const previousFormLogo = previousForm?.logoAsset || null;
    const nextFormLogo = nextForm?.logoAsset || null;
    const previousBanner = previousForm?.bannerImageAsset || null;
    const nextBanner = nextForm?.bannerImageAsset || null;
    const previousLogo = previousForm?.emailTemplate?.logoAsset || null;
    const nextLogo = nextForm?.emailTemplate?.logoAsset || null;
    const previousTemplateBanner =
      previousForm?.emailTemplate?.bannerImageAsset || null;
    const nextTemplateBanner = nextForm?.emailTemplate?.bannerImageAsset || null;

    const assetsToDelete = [
      {
        previous: previousFormLogo,
        current: nextFormLogo,
      },
      {
        previous: previousBanner,
        current: nextBanner,
      },
      {
        previous: previousLogo,
        current: nextLogo,
      },
      {
        previous: previousTemplateBanner,
        current: nextTemplateBanner,
      },
    ]
      .filter(({ previous, current }) => {
        const previousId = getAssetPublicId(previous);
        const currentId = getAssetPublicId(current);
        return previousId && previousId !== currentId;
      })
      .map(({ previous }) => previous);

    await Promise.all(
      assetsToDelete.map((asset) =>
        deleteCloudinaryAsset({
          publicId: getAssetPublicId(asset),
          resourceType: asset?.resourceType || "image",
        }).catch((error) => {
          console.warn("Failed to delete replaced asset:", error.message);
        }),
      ),
    );
  };

  const saveForm = async (nextStatus = draft.status) => {
    if (!draft.title.trim()) {
      toast.error("Form title is required");
      return;
    }

    const parsedExpiresAt = draft.expiresAt ? new Date(draft.expiresAt) : null;
    const normalizedEmailTemplate = normalizeEmailTemplate(draft.emailTemplate, {
      ...draft,
      logoUrl: "",
      logoAsset: null,
    });

    const payload = {
      ...draft,
      logoUrl: draft.logoUrl || "",
      logoAsset: draft.logoAsset || null,
      bannerImage: draft.bannerImage || draft.bannerImageUrl || "",
      bannerImageUrl: draft.bannerImageUrl || draft.bannerImage || "",
      description: sanitizeRichTextHtml(draft.description || ""),
      titleStyle: normalizeTypographyStyle(draft.titleStyle, DEFAULT_TITLE_STYLE),
      descriptionStyle: normalizeTypographyStyle(
        draft.descriptionStyle,
        DEFAULT_DESCRIPTION_STYLE,
      ),
      emailTemplate: {
        ...normalizedEmailTemplate,
        footerButtons: normalizedEmailTemplate.footerButtons || [],
      },
      status: nextStatus,
      slug: slugify(draft.slug || draft.title),
      expiresAt:
        parsedExpiresAt && !Number.isNaN(parsedExpiresAt.getTime())
          ? parsedExpiresAt.toISOString()
          : null,
      questions: draft.questions.map((question, order) => ({
        label: question.label,
        type: question.type,
        placeholder: question.placeholder,
        helpText: question.helpText,
        required: question.required,
        validationEnabled: question.validationEnabled === true,
        options: parseOptionsText(question.optionsText ?? question.options),
        validation: buildQuestionValidationPayload(question),
        order,
      })),
    };

    setSaving(true);
    try {
      const previousForm = lastSavedFormRef.current;
      const res = selectedFormId
        ? await updateAdminForm(selectedFormId, payload)
        : await createAdminForm(payload);

      const saved = res.data?.data;
      await cleanupReplacedAssets(previousForm, {
        ...saved,
        emailTemplate: saved?.emailTemplate || payload.emailTemplate,
      });
      await cleanupSessionUploads({
        ...saved,
        emailTemplate: saved?.emailTemplate || payload.emailTemplate,
      });
      lastSavedFormRef.current = normalizeForm(saved || payload);
      toast.success(selectedFormId ? "Form updated" : "Form created");
      await loadForms();
      if (saved?._id) {
        await selectForm(saved);
      } else {
        startNewForm();
      }
      setDraft((prev) => ({
        ...prev,
        status: nextStatus,
      }));
    } catch (error) {
      await cleanupSessionUploads(lastSavedFormRef.current);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    await saveForm("live");
  };

  const deleteForm = async (formId) => {
    if (!window.confirm("Delete this form permanently?")) return;
    try {
      await deleteAdminForm(formId);
      toast.success("Form deleted");
      if (selectedFormId === formId) startNewForm();
      await loadForms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete form");
    }
  };

  const copyLink = async (slug) => {
    if (!slug) {
      toast.error("Save the form first");
      return;
    }
    const url = buildPublicFormUrl(slug);
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const previewLink = () => {
    if (!draft.slug) return toast.error("Save the form first");
    window.open(buildPublicFormUrl(draft.slug), "_blank", "noopener,noreferrer");
  };

  const exportResponses = async (params = {}, filenameSuffix = "responses") => {
    if (!selectedFormId) return;
    const res = await exportAdminFormResponses(selectedFormId, params);
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(draft.slug || draft.title || "form")}-${filenameSuffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportForm = async (formId) => {
    if (!formId) return;

    setExportingFormId(formId);
    try {
      const response = await getAdminFormExport(formId);
      const exportedForm = response.data?.data || response.data || {};
      if (!Array.isArray(exportedForm.form?.questions)) {
        throw new Error("Form export data is incomplete");
      }

      const exportData = createFormExportData(exportedForm.form || exportedForm);
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], {
        type: "application/json;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const filename = createSafeExportFilename(exportData.form);

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success("Form exported successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to export form. Please try again.");
    } finally {
      setExportingFormId(null);
    }
  };

  const openResponse = async (response) => {
    if (!selectedFormId || !response?._id) return;
    Object.values(secretRevealTimersRef.current).forEach((timer) => {
      window.clearTimeout(timer);
    });
    secretRevealTimersRef.current = {};
    setRevealedSecrets({});
    try {
      const res = await getAdminFormResponse(selectedFormId, response._id);
      setSelectedResponse(res.data?.data || response);
    } catch (error) {
      setSelectedResponse(response);
    }
  };

  const clearSecretReveal = (questionId) => {
    const timer = secretRevealTimersRef.current[questionId];
    if (timer) {
      window.clearTimeout(timer);
      delete secretRevealTimersRef.current[questionId];
    }
    setRevealedSecrets((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const revealSecret = async (questionId) => {
    if (!selectedFormId || !selectedResponse?._id || !questionId) return;

    try {
      const response = await revealAdminFormResponseSecret(
        selectedFormId,
        selectedResponse._id,
        questionId,
      );
      const data = response.data;
      if (!data?.success) {
        throw new Error(data?.message || "Failed to reveal secret");
      }

      setRevealedSecrets((prev) => ({
        ...prev,
        [questionId]: data.data?.value || "",
      }));

      if (secretRevealTimersRef.current[questionId]) {
        window.clearTimeout(secretRevealTimersRef.current[questionId]);
      }

      secretRevealTimersRef.current[questionId] = window.setTimeout(() => {
        clearSecretReveal(questionId);
      }, 30000);
    } catch (error) {
      toast.error(error.message || "Failed to reveal secret");
    }
  };

  const deleteResponse = async (responseId) => {
    if (!selectedFormId) return;
    if (!window.confirm("Delete this response?")) return;
    try {
      await deleteAdminFormResponse(selectedFormId, responseId);
      toast.success("Response deleted");
      const res = await getAdminFormResponses(selectedFormId);
      setResponses(normalizeResponsesPayload(res.data?.data));
      if (selectedResponse?._id === responseId) setSelectedResponse(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete response");
    }
  };

  useEffect(() => {
    return () => {
      Object.values(secretRevealTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
      secretRevealTimersRef.current = {};
    };
  }, []);

  const filteredForms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter((form) =>
      [form.title, form.slug, form.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [forms, search]);

  const responseTable = useMemo(() => {
    const term = responseSearch.trim().toLowerCase();
    const fromTime = responseDateFrom ? new Date(responseDateFrom).getTime() : null;
    const toTime = responseDateTo ? new Date(responseDateTo).getTime() : null;

    return responses
      .filter((response) => {
        const submittedTime = new Date(
          response.submittedAt || response.createdAt,
        ).getTime();
        if (responseFilter === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (submittedTime < today.getTime()) return false;
        }
        if (responseFilter === "yesterday") {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - 1);
          const end = new Date(start);
          end.setDate(end.getDate() + 1);
          if (submittedTime < start.getTime() || submittedTime >= end.getTime()) return false;
        }
        if (responseFilter === "7days") {
          const start = new Date();
          start.setDate(start.getDate() - 7);
          if (submittedTime < start.getTime()) return false;
        }
        if (responseFilter === "30days") {
          const start = new Date();
          start.setDate(start.getDate() - 30);
          if (submittedTime < start.getTime()) return false;
        }
        if (fromTime && submittedTime < fromTime) return false;
        if (toTime && submittedTime > toTime + 24 * 60 * 60 * 1000 - 1) return false;
        if (!term) return true;
        return getResponseText(response).includes(term);
      })
      .map((response) => {
      const answers = Array.isArray(response.answers) ? response.answers : [];
      const email =
        response.email ||
        answers.find((item) => item.question?.type === "email")?.value ||
        "";
      const phone =
        response.phone ||
        answers.find((item) => item.question?.type === "phone")?.value ||
        "";
      const name =
        response.name ||
        answers.find((item) => item.question?.type === "shortAnswer")?.value ||
        answers.find((item) => /name/i.test(item.question?.label || ""))?.value ||
        "";
      return {
        ...response,
        name,
        email,
        phone,
      };
      });
  }, [responseDateFrom, responseDateTo, responseFilter, responseSearch, responses]);

  const analysisRows = useMemo(() => {
    return responseTable.filter((response) => {
      const score = Number(response.score || 0);
      const leadCategory = response.leadCategory || getScoreBucket(score);
      const ratingValue = getRatingValue(response);
      const interestAnswer = getInterestAnswer(response);
      const hasYes = /^(yes|y|true|interested|available|available to join)$/i.test(
        String(interestAnswer || "").trim(),
      );
      const availableYes = Boolean(response.availableYes);
      const hasEmail = Boolean(response.email);
      const hasPhone = Boolean(response.phone);

      if (analysisLeadFilter !== "all" && leadCategory !== analysisLeadFilter) {
        return false;
      }

      if (
        analysisRatingFilter !== "all" &&
        Number(analysisRatingFilter) !== ratingValue
      ) {
        return false;
      }

      if (analysisInterestFilter === "yes" && !hasYes) return false;
      if (analysisInterestFilter === "no" && hasYes) return false;
      if (analysisAvailabilityFilter === "yes" && !availableYes) return false;
      if (analysisAvailabilityFilter === "no" && availableYes) return false;
      if (analysisEmailFilter === "yes" && !hasEmail) return false;
      if (analysisEmailFilter === "no" && hasEmail) return false;
      if (analysisPhoneFilter === "yes" && !hasPhone) return false;
      if (analysisPhoneFilter === "no" && hasPhone) return false;

      return true;
    });
  }, [
    analysisEmailFilter,
    analysisInterestFilter,
    analysisAvailabilityFilter,
    analysisLeadFilter,
    analysisPhoneFilter,
    analysisRatingFilter,
    responseTable,
  ]);

  const analysisStats = useMemo(() => {
    return analysisRows.reduce(
      (acc, response) => {
        const score = Number(response.score || 0);
        const rating = getRatingValue(response);
        const leadCategory = response.leadCategory || getScoreBucket(score);
        if (leadCategory === "hot") acc.hot += 1;
        if (leadCategory === "warm") acc.warm += 1;
        if (leadCategory === "cold") acc.cold += 1;
        if (rating) acc.ratings[rating] += 1;
        if (response.interestedYes) acc.interestedYes += 1;
        if (response.availableYes) acc.availableYes += 1;
        if (response.email) acc.hasEmail += 1;
        if (response.phone) acc.hasPhone += 1;
        return acc;
      },
      {
        hot: 0,
        warm: 0,
        cold: 0,
        interestedYes: 0,
        availableYes: 0,
        hasEmail: 0,
        hasPhone: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    );
  }, [analysisRows]);

  const emailTemplatePreview = useMemo(
    () => buildTemplatePreview(draft.emailTemplate, draft.title),
    [draft.emailTemplate, draft.title],
  );
  const emailFooterButtons = useMemo(
    () => normalizeEditableFooterButtons(draft.emailTemplate, draft),
    [draft.emailTemplate, draft],
  );

  return (
    <div className={`p-6 ${theme.text} space-y-6`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">Forms Builder</h1>
          <p className={theme.textSecondary}>
            Clean Google Forms-style builder for public links and response tracking.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startNewForm}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
          >
            New Form
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className={`${theme.card} rounded-3xl border ${theme.border} p-4 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">All Forms</h2>
              <p className={`text-sm ${theme.textSecondary}`}>Title, slug, status, responses.</p>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
              {forms.length}
            </span>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
            placeholder="Search forms..."
          />

          {loading ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-3xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/10" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className={`rounded-3xl border p-4 transition ${
                    selectedFormId === form._id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : `border-white/10 bg-white/5`
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectForm(form)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{form.title}</div>
                        <div className="text-xs text-slate-400">/{form.slug}</div>
                      </div>
                      <span className={`text-xs font-semibold ${form.status === "live" ? "text-cyan-300" : "text-amber-300"}`}>
                        {form.status === "live" ? "Live" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{form.responseCount || 0} responses</span>
                      <span>{formatDateTimeDisplay(form.createdAt)}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Updated {formatDateTimeDisplay(form.updatedAt)}
                    </div>
                  </button>

                  <div className="form-actions mt-4 flex flex-wrap gap-[10px]">
                    <button
                      type="button"
                      onClick={() => selectForm(form)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => selectForm(form, "responses")}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs"
                    >
                      <Eye size={14} /> Responses
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(form.slug)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs"
                    >
                      <Copy size={14} /> Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportForm(form._id || form.id)}
                      disabled={exportingFormId === (form._id || form.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={14} />
                      {exportingFormId === (form._id || form.id)
                        ? "Exporting..."
                        : "Export Form"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteForm(form._id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}

              {!filteredForms.length && (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                  No forms found.
                </div>
              )}
            </div>
          )}
        </aside>

        <section className={`${theme.card} rounded-3xl border ${theme.border} p-6 space-y-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">{draft.title || "Untitled form"}</h2>
              <p className={`text-sm ${theme.textSecondary}`}>
                Public link: {draft.slug ? buildPublicFormUrl(draft.slug) : "Save to generate link"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={previewLink}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
              >
                <ExternalLink size={16} /> Preview
              </button>
              <button
                type="button"
                onClick={() => copyLink(draft.slug)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
              >
                <Copy size={16} /> Copy Link
              </button>
              <button
                type="button"
                onClick={() => saveForm("draft")}
                disabled={saving || uploadingBannerImage || !!uploadingEmailTemplateField}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                <Save size={16} /> Save
              </button>
              <button
                type="button"
                onClick={publishForm}
                disabled={saving || uploadingBannerImage || !!uploadingEmailTemplateField}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send size={16} /> Publish
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
            {[
              { id: "questions", label: "Questions", icon: ListPlus },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "notification-settings", label: "Notification Settings", icon: Bell },
              { id: "email-template", label: "Email Template", icon: Mail },
              { id: "responses", label: "Responses", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                    active ? "bg-cyan-600 text-white" : "bg-white/5 text-slate-300"
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "questions" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Form Title</label>
                  <input
                    value={draft.title}
                    onChange={(e) => updateDraft("title", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="Internship Application"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Slug / Public Route</label>
                  <input
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateDraft("slug", slugify(e.target.value));
                    }}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="internship-application"
                  />
                  <p className="mt-2 text-xs text-slate-400">Public URL: /forms/{draft.slug || "slug"}</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Title Font Family</label>
                      <select
                        value={draft.titleStyle?.fontFamily || ""}
                        onChange={(e) => updateTitleStyle("fontFamily", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      >
                        <option value="">Default</option>
                        {FONT_FAMILY_OPTIONS.map((fontFamily) => (
                          <option key={fontFamily} value={fontFamily}>
                            {fontFamily}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Title Font Size</label>
                      <select
                        value={draft.titleStyle?.fontSize || ""}
                        onChange={(e) => updateTitleStyle("fontSize", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      >
                        <option value="">Default</option>
                        {FONT_SIZE_OPTIONS.map((fontSize) => (
                          <option key={fontSize} value={fontSize}>
                            {fontSize}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Title Font Weight</label>
                      <select
                        value={draft.titleStyle?.fontWeight || ""}
                        onChange={(e) => updateTitleStyle("fontWeight", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      >
                        <option value="">Default</option>
                        {FONT_WEIGHT_OPTIONS.map((weight) => (
                          <option key={weight.value} value={weight.value}>
                            {weight.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Title Color</label>
                      <input
                        type="color"
                        value={draft.titleStyle?.color || "#111827"}
                        onChange={(e) => updateTitleStyle("color", e.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-transparent px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {ALIGNMENT_OPTIONS.map((alignment) => (
                      <button
                        key={alignment.value}
                        type="button"
                        onClick={() => updateTitleStyle("textAlign", alignment.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                          (draft.titleStyle?.textAlign || "left") === alignment.value
                            ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                            : "border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {alignment.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateTitleStyle(
                          "fontStyle",
                          draft.titleStyle?.fontStyle === "italic" ? "normal" : "italic",
                        )
                      }
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        draft.titleStyle?.fontStyle === "italic"
                          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTitleStyle(
                          "textDecoration",
                          draft.titleStyle?.textDecoration === "underline" ? "none" : "underline",
                        )
                      }
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        draft.titleStyle?.textDecoration === "underline"
                          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      Underline
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, titleStyle: { ...DEFAULT_TITLE_STYLE } }))}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200"
                    >
                      Reset title style
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">Description</label>
                    <RichTextEditor
                      value={draft.description}
                      onChange={(html) => updateDraft("description", html)}
                      placeholder="Describe the form..."
                      minHeight="240px"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/45 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">Live Preview</div>
                      <div className="text-xs text-slate-400">Matches the public form typography</div>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                      Public preview
                    </span>
                  </div>
                  <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h1
                      className="break-words"
                      style={resolveTypographyStyle(draft.titleStyle, DEFAULT_TITLE_STYLE)}
                    >
                      {draft.title || "Form title preview"}
                    </h1>
                    <div
                      className="public-form-description break-words"
                      style={normalizeTypographyStyle(
                        draft.descriptionStyle,
                        DEFAULT_DESCRIPTION_STYLE,
                      )}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichTextHtml(
                          draft.description || "<p>Your form description will appear here.</p>",
                        ),
                      }}
                    />
                  </div>
                  <div className="mt-4 grid gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 sm:grid-cols-2">
                    <div>
                      <div className="text-slate-400">Title font</div>
                      <div className="mt-1 font-semibold text-slate-100">
                        {draft.titleStyle?.fontFamily || DEFAULT_TITLE_STYLE.fontFamily}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Description font</div>
                      <div className="mt-1 font-semibold text-slate-100">
                        {draft.descriptionStyle?.fontFamily || "Inherited / pasted"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">Questions</div>
                  <div className="text-sm text-slate-400">Add unlimited questions.</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    disabled={importingFormFile}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload size={16} />
                    {importingFormFile ? "Analyzing File..." : "Import Form From File"}
                  </button>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.txt,.json"
                    onChange={handleImportFormFile}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {draft.questions.map((question, index) => {
                  const type = question.type;
                  const isChoice = ["dropdown", "radio", "checkbox"].includes(type);
                  return (
                    <div key={question.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Question {index + 1}</div>
                          <div className="text-xs text-slate-400">Drag-free reorder with arrows</div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moveQuestion(index, -1)} className="rounded-xl border border-white/10 p-2">
                            <ArrowUp size={14} />
                          </button>
                          <button type="button" onClick={() => moveQuestion(index, 1)} className="rounded-xl border border-white/10 p-2">
                            <ArrowDown size={14} />
                          </button>
                          <button type="button" onClick={() => duplicateQuestion(index)} className="rounded-xl border border-white/10 p-2">
                            <Duplicate size={14} />
                          </button>
                          <button type="button" onClick={() => removeQuestion(index)} className="rounded-xl border border-red-500/30 p-2 text-red-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">Question Label</label>
                          <input
                            value={question.label}
                            onChange={(e) => updateQuestion(index, "label", e.target.value)}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            placeholder="Enter question text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold">Question Type</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, "type", e.target.value)}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          >
                            {QUESTION_TYPES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">Placeholder</label>
                          <input
                            value={question.placeholder}
                            onChange={(e) => updateQuestion(index, "placeholder", e.target.value)}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold">Help Text</label>
                          <input
                            value={question.helpText}
                            onChange={(e) => updateQuestion(index, "helpText", e.target.value)}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(index, "required", e.target.checked)}
                          />
                          Required
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={question.validationEnabled === true}
                            onChange={(e) => updateQuestion(index, "validationEnabled", e.target.checked)}
                          />
                          Enable Validation
                        </label>
                        <span className="text-xs text-slate-400">Type: {question.type}</span>
                      </div>

                      {type === "number" && (
                        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-4 text-sm font-semibold">Number Validation</div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Minimum Value</label>
                              <input
                                type="number"
                                step="1"
                                value={question.validation?.minValue ?? ""}
                                onChange={(e) =>
                                  updateQuestionValidation(index, "minValue", e.target.value)
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="18"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Maximum Value</label>
                              <input
                                type="number"
                                step="1"
                                value={question.validation?.maxValue ?? ""}
                                onChange={(e) =>
                                  updateQuestionValidation(index, "maxValue", e.target.value)
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="60"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Minimum Digit Length</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={question.validation?.minDigits ?? ""}
                                onChange={(e) =>
                                  updateQuestionValidation(index, "minDigits", e.target.value)
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="2"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Maximum Digit Length</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={question.validation?.maxDigits ?? ""}
                                onChange={(e) =>
                                  updateQuestionValidation(index, "maxDigits", e.target.value)
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="2"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-semibold">Custom Error Message</label>
                              <textarea
                                value={question.validation?.errorMessage ?? ""}
                                onChange={(e) =>
                                  updateQuestionValidation(index, "errorMessage", e.target.value)
                                }
                                rows={3}
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                                placeholder="Please enter a valid age between 18 and 60."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {isChoice && (
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-semibold">Options</label>
                          <textarea
                            value={question.optionsText ?? ""}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "optionsText",
                                e.target.value,
                              )
                            }
                            rows={4}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                            placeholder="One option per line"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {!draft.questions.length && (
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                    Add your first question to start building.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => updateDraft("status", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                  >
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Theme Color</label>
                  <input
                    value={draft.themeColor}
                    onChange={(e) => updateDraft("themeColor", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="#16a34a"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    value={draft.expiresAt}
                    onChange={(e) => updateDraft("expiresAt", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Leave empty if the form should never expire.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Success Message</label>
                  <textarea
                    value={draft.successMessage}
                    onChange={(e) => updateDraft("successMessage", e.target.value)}
                    rows={3}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Form Logo</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={formLogoInputRef}
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={(e) => handleFormLogoFile(e.target.files?.[0] || null)}
                        />
                        <button
                          type="button"
                          onClick={() => formLogoInputRef.current?.click()}
                          disabled={uploadingFormLogoImage}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload size={16} />
                          {uploadingFormLogoImage
                            ? "Uploading..."
                            : draft.logoUrl
                              ? "Change Logo"
                              : "Upload Logo"}
                        </button>
                        {(draft.logoUrl || draft.logoAsset) && (
                          <button
                            type="button"
                            onClick={() => {
                              updateDraft("logoUrl", "");
                              updateDraft("logoAsset", null);
                              setFormLogoPreviewFailed(false);
                              if (formLogoInputRef.current) {
                                formLogoInputRef.current.value = "";
                              }
                            }}
                            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4">
                      {draft.logoUrl && !formLogoPreviewFailed ? (
                        <img
                          src={getOptimizedImageUrl(draft.logoAsset || draft.logoUrl)}
                          alt="Form logo preview"
                          className="block max-h-24 w-auto max-w-full object-contain"
                          onError={() => setFormLogoPreviewFailed(true)}
                        />
                      ) : draft.logoUrl ? (
                        <div className="text-sm text-slate-400">Logo preview unavailable</div>
                      ) : (
                        <div className="text-sm text-slate-400">No logo selected</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Form Banner Image</label>
                      <input
                        value={draft.bannerImage || draft.bannerImageUrl}
                        onChange={(e) => {
                          updateDraft("bannerImage", e.target.value);
                          updateDraft("bannerImageUrl", e.target.value);
                          updateDraft("bannerImageAsset", null);
                        }}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Paste image URL"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={bannerImageInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleBannerImageFile(e.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        onClick={() => bannerImageInputRef.current?.click()}
                        disabled={uploadingBannerImage}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Upload size={16} />
                        {uploadingBannerImage ? "Uploading..." : "Upload Image"}
                      </button>
                      {(draft.bannerImage || draft.bannerImageUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            updateDraft("bannerImage", "");
                            updateDraft("bannerImageUrl", "");
                            updateDraft("bannerImageAsset", null);
                            if (bannerImageInputRef.current) {
                              bannerImageInputRef.current.value = "";
                            }
                          }}
                          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                    {(draft.bannerImage || draft.bannerImageUrl) && (
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                        <img
                          src={getOptimizedImageUrl(
                            draft.bannerImageAsset ||
                              draft.bannerImage ||
                              draft.bannerImageUrl,
                          )}
                          alt="Form banner preview"
                          className="block w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Admin Notification Email</label>
                    <input
                      value={draft.notificationEmail}
                      onChange={(e) => updateDraft("notificationEmail", e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.confirmationEmailEnabled}
                      onChange={(e) => updateDraft("confirmationEmailEnabled", e.target.checked)}
                    />
                    Send confirmation email to submitter
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowFileUpload}
                      onChange={(e) => updateDraft("allowFileUpload", e.target.checked)}
                    />
                    Allow file/image uploads
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notification-settings" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold">Notification Settings</div>
                <div className="text-sm text-slate-400">
                  Enable the delivery channels you want for this form.
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.notificationSettings?.sendEmailNotification !== false}
                    onChange={(e) =>
                      updateNotificationSettings("sendEmailNotification", e.target.checked)
                    }
                  />
                  Email Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.notificationSettings?.sendDashboardNotification === true}
                    onChange={(e) =>
                      updateNotificationSettings("sendDashboardNotification", e.target.checked)
                    }
                  />
                  Send Dashboard Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.notificationSettings?.sendTelegramNotification === true}
                    onChange={(e) =>
                      updateNotificationSettings("sendTelegramNotification", e.target.checked)
                    }
                  />
                  Send Telegram Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.notificationSettings?.sendWhatsAppNotification === true}
                    onChange={(e) =>
                      updateNotificationSettings("sendWhatsAppNotification", e.target.checked)
                    }
                  />
                  Send WhatsApp Notification
                </label>
              </div>

              {draft.notificationSettings?.sendTelegramNotification && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Telegram Bot Token</label>
                    <input
                      value={draft.notificationSettings?.telegramBotToken || ""}
                      onChange={(e) =>
                        updateNotificationSettings("telegramBotToken", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="123456:ABC..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Telegram Chat ID</label>
                    <input
                      value={draft.notificationSettings?.telegramChatId || ""}
                      onChange={(e) =>
                        updateNotificationSettings("telegramChatId", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="-1001234567890"
                    />
                  </div>
                </div>
              )}

              {draft.notificationSettings?.sendWhatsAppNotification && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Access Token</label>
                    <input
                      value={draft.notificationSettings?.whatsappAccessToken || ""}
                      onChange={(e) =>
                        updateNotificationSettings("whatsappAccessToken", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="Meta access token"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Phone Number ID</label>
                    <input
                      value={draft.notificationSettings?.whatsappPhoneNumberId || ""}
                      onChange={(e) =>
                        updateNotificationSettings("whatsappPhoneNumberId", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Verify Token (optional)</label>
                    <input
                      value={draft.notificationSettings?.whatsappVerifyToken || ""}
                      onChange={(e) =>
                        updateNotificationSettings("whatsappVerifyToken", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="optional"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Business Number</label>
                    <input
                      value={draft.notificationSettings?.whatsappBusinessNumber || ""}
                      onChange={(e) =>
                        updateNotificationSettings("whatsappBusinessNumber", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "email-template" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="text-lg font-semibold">Email Template</div>
                  <div className="text-sm text-slate-400">
                    Configure confirmation and notification emails for this form.
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Variables: {"{{formName}}"}, {"{{submissionDate}}"}, {"{{userName}}"}, {"{{userEmail}}"}, {"{{responsesTable}}"}, {"{{companyName}}"}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <label className="mb-3 block text-sm font-semibold">Theme Preset</label>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(EMAIL_TEMPLATE_PRESETS).map(([key, preset]) => {
                        const active = (draft.emailTemplate?.preset || "green-professional") === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateEmailTemplatePreset(key)}
                            className={`rounded-2xl border p-4 text-left transition ${
                              active
                                ? "border-cyan-500 bg-cyan-500/10 text-white"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            <div className="font-semibold">{preset.label}</div>
                            <div className="mt-2 flex gap-2">
                              {key !== "custom" && (
                                <>
                                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.headerBackgroundColor }} />
                                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                                  <span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: preset.cardBackgroundColor }} />
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Header Title</label>
                      <input
                        value={draft.emailTemplate?.headerTitle || ""}
                        onChange={(e) => updateEmailTemplate("headerTitle", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="{{formName}}"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Header Subtitle</label>
                      <input
                        value={draft.emailTemplate?.headerSubtitle || ""}
                        onChange={(e) => updateEmailTemplate("headerSubtitle", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Thank you for your submission"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Success / Thank-you Message</label>
                      <textarea
                        value={draft.emailTemplate?.successMessage || ""}
                        onChange={(e) => updateEmailTemplate("successMessage", e.target.value)}
                        rows={3}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                        placeholder="Thank you for your response."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Footer Text</label>
                      <textarea
                        value={draft.emailTemplate?.footerText || ""}
                        onChange={(e) => updateEmailTemplate("footerText", e.target.value)}
                        rows={3}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                        placeholder="This email was sent automatically."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Company Name</label>
                      <input
                        value={draft.emailTemplate?.companyName || ""}
                        onChange={(e) => updateEmailTemplate("companyName", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="TechnoSthan"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Website Button Text</label>
                      <input
                        value={draft.emailTemplate?.websiteButtonText || ""}
                        onChange={(e) => updateEmailTemplate("websiteButtonText", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Visit Website"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold">Website Button URL</label>
                      <input
                        value={draft.emailTemplate?.websiteButtonUrl || ""}
                        onChange={(e) => updateEmailTemplate("websiteButtonUrl", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Footer Buttons</div>
                        <div className="text-xs text-slate-400">Optional buttons rendered in email footers.</div>
                      </div>
                      <button
                        type="button"
                        onClick={addFooterButton}
                        className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100"
                      >
                        + Add Footer Button
                      </button>
                    </div>

                    <div className="space-y-4">
                      {emailFooterButtons.map((button, index) => (
                        <div key={button.id || index} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Button Text</label>
                              <input
                                value={button.text || ""}
                                onChange={(e) => updateFooterButton(index, "text", e.target.value)}
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="Visit Website"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">Button URL</label>
                              <input
                                value={button.url || ""}
                                onChange={(e) => updateFooterButton(index, "url", e.target.value)}
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="https://technosthan.com"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveFooterButton(index, -1)}
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold"
                            >
                              Move Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFooterButton(index, 1)}
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold"
                            >
                              Move Down
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteFooterButton(index)}
                              className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Header Background</label>
                      <input
                        value={draft.emailTemplate?.headerBackgroundColor || ""}
                        onChange={(e) => updateEmailTemplate("headerBackgroundColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#166534"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Body Background</label>
                      <input
                        value={draft.emailTemplate?.bodyBackgroundColor || ""}
                        onChange={(e) => updateEmailTemplate("bodyBackgroundColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#f0fdf4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Card Background</label>
                      <input
                        value={draft.emailTemplate?.cardBackgroundColor || ""}
                        onChange={(e) => updateEmailTemplate("cardBackgroundColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#ffffff"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Accent Color</label>
                      <input
                        value={draft.emailTemplate?.accentColor || ""}
                        onChange={(e) => updateEmailTemplate("accentColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#16a34a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Text Color</label>
                      <input
                        value={draft.emailTemplate?.textColor || ""}
                        onChange={(e) => updateEmailTemplate("textColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#0f172a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Button Color</label>
                      <input
                        value={draft.emailTemplate?.buttonColor || ""}
                        onChange={(e) => updateEmailTemplate("buttonColor", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#16a34a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Border Radius</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.emailTemplate?.borderRadius ?? ""}
                        onChange={(e) => updateEmailTemplate("borderRadius", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Logo URL</label>
                      <input
                        value={draft.emailTemplate?.logoUrl || ""}
                        onChange={(e) => {
                          updateEmailTemplate("logoUrl", e.target.value);
                          updateEmailTemplate("logoAsset", null);
                          setLogoPreviewFailed(false);
                        }}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Paste logo image URL"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={emailLogoInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={(e) => handleEmailTemplateImageFile("logoUrl", e.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        onClick={() => emailLogoInputRef.current?.click()}
                        disabled={!!uploadingEmailTemplateField}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Upload size={16} />
                        {uploadingEmailTemplateField === "logoUrl" ? "Uploading..." : draft.emailTemplate?.logoUrl ? "Change Logo" : "Upload Logo"}
                      </button>
                      {draft.emailTemplate?.logoUrl && (
                        <button
                          type="button"
                          onClick={() => clearEmailTemplateImage("logoUrl")}
                          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                        >
                          Clear Logo
                        </button>
                      )}
                    </div>
                    {draft.emailTemplate?.logoUrl && !logoPreviewFailed ? (
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-3">
                        <img
                          src={getOptimizedImageUrl(draft.emailTemplate.logoAsset || draft.emailTemplate.logoUrl)}
                          alt="Email logo preview"
                          onError={() => setLogoPreviewFailed(true)}
                          className="h-20 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                        No logo selected
                      </div>
                    )}
                      {logoPreviewFailed && draft.emailTemplate?.logoUrl && (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm font-semibold">
                          Logo preview unavailable
                        </div>
                      )}
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Banner Image URL</label>
                        <input
                          value={draft.emailTemplate?.bannerImageUrl || ""}
                          onChange={(e) => {
                            updateEmailTemplate("bannerImageUrl", e.target.value);
                            updateEmailTemplate("bannerImageAsset", null);
                            setBannerPreviewFailed(false);
                          }}
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          placeholder="Paste banner image URL"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={emailBannerInputRef}
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleEmailTemplateImageFile("bannerImageUrl", e.target.files?.[0] || null)}
                        />
                      <button
                        type="button"
                        onClick={() => emailBannerInputRef.current?.click()}
                        disabled={!!uploadingEmailTemplateField}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload size={16} />
                          {uploadingEmailTemplateField === "bannerImageUrl" ? "Uploading..." : draft.emailTemplate?.bannerImageUrl ? "Change Banner" : "Upload Banner"}
                      </button>
                      {draft.emailTemplate?.bannerImageUrl && (
                        <button
                          type="button"
                          onClick={() => clearEmailTemplateImage("bannerImageUrl")}
                          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                        >
                          Clear Banner
                        </button>
                      )}
                    </div>
                    {draft.emailTemplate?.bannerImageUrl && !bannerPreviewFailed ? (
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                        <img
                          src={getOptimizedImageUrl(draft.emailTemplate.bannerImageAsset || draft.emailTemplate.bannerImageUrl)}
                          alt="Email banner preview"
                          onError={() => setBannerPreviewFailed(true)}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                        No banner selected
                      </div>
                    )}
                      {bannerPreviewFailed && draft.emailTemplate?.bannerImageUrl && (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm font-semibold">
                          Banner preview unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-semibold">Live Preview</div>
                    <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl" style={{ backgroundColor: emailTemplatePreview.resolved.bodyBackgroundColor }}>
                    <div style={{ backgroundColor: emailTemplatePreview.resolved.headerBackgroundColor, color: emailTemplatePreview.headerTextColor }} className="p-5">
                      {emailTemplatePreview.logoUrl && !logoPreviewFailed ? (
                        <img
                          src={getOptimizedImageUrl(emailTemplatePreview.logoUrl)}
                          alt="Email preview logo"
                          onError={() => setLogoPreviewFailed(true)}
                          className="mb-4 h-12 w-full object-contain object-left"
                        />
                      ) : (
                        <div className="mb-4 text-lg font-black">{emailTemplatePreview.context.companyName}</div>
                      )}
                      <div className="text-xs uppercase tracking-[0.25em] opacity-80">{emailTemplatePreview.context.companyName}</div>
                      <div className="mt-2 text-2xl font-black">{emailTemplatePreview.headerTitle}</div>
                      <p className="mt-2 text-sm leading-6 opacity-90">{emailTemplatePreview.headerSubtitle}</p>
                    </div>

                      {emailTemplatePreview.bannerUrl && !bannerPreviewFailed ? (
                        <div className="px-5 pt-5">
                          <img
                            src={getOptimizedImageUrl(emailTemplatePreview.bannerUrl)}
                            alt="Email banner preview"
                            onError={() => setBannerPreviewFailed(true)}
                            className="h-40 w-full rounded-3xl object-cover"
                          />
                        </div>
                      ) : emailTemplatePreview.bannerUrl ? (
                        <div className="px-5 pt-5">
                          <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/10 text-sm text-slate-300">
                            Banner preview unavailable
                          </div>
                        </div>
                      ) : null}

                      <div className="p-5" style={{ color: emailTemplatePreview.resolved.textColor }}>
                        <div className="rounded-3xl border p-4" style={{ backgroundColor: emailTemplatePreview.resolved.bodyBackgroundColor, borderColor: emailTemplatePreview.resolved.accentColor }}>
                          <div className="text-sm font-bold">{emailTemplatePreview.successMessage}</div>
                          <div className="mt-3 space-y-1 text-xs leading-6 opacity-80">
                            <div><strong>Form:</strong> {draft.title || "Sample Form"}</div>
                            <div><strong>Submitted at:</strong> {emailTemplatePreview.context.submissionDate}</div>
                          </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-3xl border" style={{ borderColor: "rgba(148,163,184,0.18)", backgroundColor: emailTemplatePreview.resolved.cardBackgroundColor }}>
                          <table className="min-w-full text-left text-sm">
                            <tbody>
                              {emailTemplatePreview.tableRows.map((row) => (
                                <tr key={row.question} className="border-t first:border-t-0" style={{ borderColor: "rgba(148,163,184,0.18)" }}>
                                  <td className="w-1/3 px-4 py-3 font-semibold" style={{ color: emailTemplatePreview.resolved.textColor, backgroundColor: "rgba(0,0,0,0.02)" }}>{row.question}</td>
                                  <td className="px-4 py-3" style={{ color: emailTemplatePreview.resolved.textColor }}>{row.answer}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 space-y-3">
                          {(emailTemplatePreview.footerButtons || []).length ? (
                            emailTemplatePreview.footerButtons.map((button) => (
                              <a
                                key={button.id}
                                href={button.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white"
                                style={{ backgroundColor: emailTemplatePreview.resolved.buttonColor || emailTemplatePreview.resolved.accentColor }}
                              >
                                {button.text}
                              </a>
                            ))
                          ) : (
                            <a
                              href={emailTemplatePreview.buttonUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                              style={{ backgroundColor: emailTemplatePreview.resolved.buttonColor || emailTemplatePreview.resolved.accentColor }}
                            >
                              {emailTemplatePreview.buttonText}
                            </a>
                          )}
                        </div>

                        {emailTemplatePreview.footerText && (
                          <div className="mt-5 border-t pt-4 text-xs leading-6 opacity-80" style={{ borderColor: "rgba(148,163,184,0.18)" }}>
                            {emailTemplatePreview.footerText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "responses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Responses</h3>
                  <p className={`text-sm ${theme.textSecondary}`}>{responseTable.length} submissions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportResponses(
                        {
                          search: responseSearch,
                          ...getFilterRange(responseFilter),
                          from: responseDateFrom || getFilterRange(responseFilter).from,
                          to: responseDateTo || getFilterRange(responseFilter).to,
                        },
                        "filtered",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponsesTab((prev) => (prev === "list" ? "analysis" : "list"))}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    {responsesTab === "list" ? "Interest Analysis" : "Response List"}
                  </button>
                </div>
              </div>

              {responsesTab === "analysis" ? (
                <div className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Hot Leads", value: "hot", count: analysisStats.hot },
                      { label: "Warm Leads", value: "warm", count: analysisStats.warm },
                      { label: "Cold Leads", value: "cold", count: analysisStats.cold },
                      { label: "5 Star", value: "5", count: analysisStats.ratings[5] },
                      { label: "Interested Yes", value: "interested", count: analysisStats.interestedYes },
                      { label: "Available to Join", value: "available", count: analysisStats.availableYes },
                      { label: "Has Phone", value: "phone", count: analysisStats.hasPhone },
                      { label: "Has Email", value: "email", count: analysisStats.hasEmail },
                    ].map((card) => {
                      const active =
                        (card.value === "hot" && analysisLeadFilter === "hot") ||
                        (card.value === "warm" && analysisLeadFilter === "warm") ||
                        (card.value === "cold" && analysisLeadFilter === "cold") ||
                        (card.value === "5" && analysisRatingFilter === "5") ||
                        (card.value === "interested" && analysisInterestFilter === "yes") ||
                        (card.value === "available" && analysisAvailabilityFilter === "yes") ||
                        (card.value === "phone" && analysisPhoneFilter === "yes") ||
                        (card.value === "email" && analysisEmailFilter === "yes");

                      return (
                        <button
                          key={card.label}
                          type="button"
                          onClick={() => {
                            if (card.value === "hot" || card.value === "warm" || card.value === "cold") {
                              setAnalysisLeadFilter(card.value);
                              setAnalysisRatingFilter("all");
                              setAnalysisInterestFilter("all");
                              setAnalysisEmailFilter("all");
                              setAnalysisPhoneFilter("all");
                            } else if (card.value === "5") {
                              setAnalysisLeadFilter("all");
                              setAnalysisRatingFilter("5");
                            } else if (card.value === "interested") {
                              setAnalysisInterestFilter("yes");
                            } else if (card.value === "available") {
                              setAnalysisAvailabilityFilter("yes");
                            } else if (card.value === "phone") {
                              setAnalysisPhoneFilter("yes");
                            } else if (card.value === "email") {
                              setAnalysisEmailFilter("yes");
                            }
                          }}
                          className={`rounded-3xl border p-4 text-left transition ${
                            active
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-white/10 bg-white/5 hover:border-cyan-500/40"
                          }`}
                        >
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
                          <div className="mt-2 text-3xl font-black">{card.count}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-3 xl:grid-cols-3">
                    <select
                      value={analysisRatingFilter}
                      onChange={(e) => setAnalysisRatingFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Star</option>
                      <option value="4">4 Star</option>
                      <option value="3">3 Star</option>
                      <option value="2">2 Star</option>
                      <option value="1">1 Star</option>
                    </select>
                    <select
                      value={analysisInterestFilter}
                      onChange={(e) => setAnalysisInterestFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All Interest</option>
                      <option value="yes">Interested Yes</option>
                      <option value="no">Interested No</option>
                    </select>
                    <select
                      value={analysisAvailabilityFilter}
                      onChange={(e) => setAnalysisAvailabilityFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">Availability Any</option>
                      <option value="yes">Available Yes</option>
                      <option value="no">Available No</option>
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                      <select
                        value={analysisEmailFilter}
                        onChange={(e) => setAnalysisEmailFilter(e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      >
                        <option value="all">Email Any</option>
                        <option value="yes">Email Available</option>
                        <option value="no">No Email</option>
                      </select>
                      <select
                        value={analysisPhoneFilter}
                        onChange={(e) => setAnalysisPhoneFilter(e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      >
                        <option value="all">Phone Any</option>
                        <option value="yes">Phone Available</option>
                        <option value="no">No Phone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
                    <input
                      value={responseSearch}
                      onChange={(e) => setResponseSearch(e.target.value)}
                      placeholder="Search name, email, phone, reference, answers..."
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <select
                      value={responseFilter}
                      onChange={(e) => setResponseFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All time</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                    </select>
                    <input
                      type="date"
                      value={responseDateFrom}
                      onChange={(e) => setResponseDateFrom(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <input
                      type="date"
                      value={responseDateTo}
                      onChange={(e) => setResponseDateTo(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setResponseSearch("");
                        setResponseFilter("all");
                        setResponseDateFrom("");
                        setResponseDateTo("");
                        setAnalysisLeadFilter("all");
                        setAnalysisRatingFilter("all");
                        setAnalysisInterestFilter("all");
                        setAnalysisAvailabilityFilter("all");
                        setAnalysisEmailFilter("all");
                        setAnalysisPhoneFilter("all");
                      }}
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold lg:col-span-5"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportResponses(
                        {
                          score: "hot",
                          search: responseSearch,
                          ...getFilterRange(responseFilter),
                          from: responseDateFrom || getFilterRange(responseFilter).from,
                          to: responseDateTo || getFilterRange(responseFilter).to,
                        },
                        "hot-leads",
                      )
                    }
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    Export Hot Leads
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      exportResponses(
                        {
                          rating: 5,
                          search: responseSearch,
                          ...getFilterRange(responseFilter),
                          from: responseDateFrom || getFilterRange(responseFilter).from,
                          to: responseDateTo || getFilterRange(responseFilter).to,
                        },
                        "5-star",
                      )
                    }
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    Export 5 Star
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      exportResponses(
                        {
                          search: responseSearch,
                          ...getFilterRange(responseFilter),
                          from: responseDateFrom || getFilterRange(responseFilter).from,
                          to: responseDateTo || getFilterRange(responseFilter).to,
                        },
                        "filtered",
                      )
                    }
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    Export Filtered
                  </button>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-white/10">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/5 text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Rating</th>
                          <th className="px-4 py-3">Interest Answer</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3">View Details</th>
                          <th className="px-4 py-3">Export</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisRows.map((response) => (
                          <tr key={response._id} className="border-t border-white/10">
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                (response.leadCategory || getScoreBucket(Number(response.score || 0))) === "hot"
                                  ? "bg-red-500/20 text-red-300"
                                  : (response.leadCategory || getScoreBucket(Number(response.score || 0))) === "warm"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-slate-500/20 text-slate-300"
                              }`}>
                                {Number(response.score || 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3">{response.name || "-"}</td>
                            <td className="px-4 py-3">{response.email || "-"}</td>
                            <td className="px-4 py-3">{response.phone || "-"}</td>
                            <td className="px-4 py-3">{getRatingValue(response) || "-"}</td>
                            <td className="px-4 py-3">{getInterestAnswer(response) || "-"}</td>
                            <td className="px-4 py-3">{formatSubmittedAt(response.submittedAt || response.createdAt)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => openResponse(response)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                              >
                                View Details
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  exportResponses(
                                    {
                                      search: responseSearch,
                                      from: responseDateFrom,
                                      to: responseDateTo,
                                      rating: getRatingValue(response) || undefined,
                                      score: response.leadCategory || getScoreBucket(Number(response.score || 0)),
                                    },
                                    `lead-${slugify(response.name || response.referenceId || "response")}`,
                                  )
                                }
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                              >
                                Export
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!analysisRows.length && (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                              No interest analysis matches found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
                    <input
                      value={responseSearch}
                      onChange={(e) => setResponseSearch(e.target.value)}
                      placeholder="Search name, email, phone, reference, answers..."
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <select
                      value={responseFilter}
                      onChange={(e) => setResponseFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                    </select>
                    <input
                      type="date"
                      value={responseDateFrom}
                      onChange={(e) => setResponseDateFrom(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <input
                      type="date"
                      value={responseDateTo}
                      onChange={(e) => setResponseDateTo(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setResponseSearch("");
                        setResponseFilter("all");
                        setResponseDateFrom("");
                        setResponseDateTo("");
                      }}
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold lg:col-span-5"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-white/10">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/5 text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3">View</th>
                          <th className="px-4 py-3">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseTable.map((response) => (
                          <tr key={response._id} className="border-t border-white/10">
                            <td className="px-4 py-3">{response.name || "-"}</td>
                            <td className="px-4 py-3">{response.email || "-"}</td>
                            <td className="px-4 py-3">{response.phone || "-"}</td>
                            <td className="px-4 py-3">{formatSubmittedAt(response.submittedAt || response.createdAt)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => openResponse(response)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                              >
                                View
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => deleteResponse(response._id)}
                                className="rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!responseTable.length && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                              No responses yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`${theme.card} max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border ${theme.border} p-6`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Import Form Preview</h3>
                <p className={`text-sm ${theme.textSecondary}`}>Review and adjust detected fields before applying them.</p>
              </div>
              <button
                type="button"
                onClick={cancelImportedForm}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Detected Form Title</label>
                <input
                  value={importPreview.title || ""}
                  onChange={(e) => updateImportPreviewField("title", e.target.value)}
                  className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                  placeholder="Form title"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Detected Description</label>
                <RichTextEditor
                  value={importPreview.description || ""}
                  onChange={(html) => updateImportPreviewField("description", html)}
                  placeholder="Form description"
                  minHeight="220px"
                />
              </div>
            </div>

            {Array.isArray(importPreview.sections) && importPreview.sections.length > 0 && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 text-sm font-semibold">Detected Sections</div>
                <div className="flex flex-wrap gap-2">
                  {importPreview.sections.map((section) => (
                    <span
                      key={section.order ?? section.label}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                    >
                      {section.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="text-sm font-semibold">Detected Questions</div>
              {importPreview.questions.map((question, index) => (
                <div key={question.id || index} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={question.selected !== false}
                        onChange={() => toggleImportedQuestion(index)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent"
                      />
                      Import
                    </label>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {question.type || "shortAnswer"}
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">Question Label</label>
                      <input
                        value={question.label || ""}
                        onChange={(e) => updateImportedQuestion(index, "label", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">Question Type</label>
                      <select
                        value={question.type || "shortAnswer"}
                        onChange={(e) => updateImportedQuestion(index, "type", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      >
                        {QUESTION_TYPES.map((typeOption) => (
                          <option key={typeOption.value} value={typeOption.value}>
                            {typeOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">Placeholder</label>
                      <input
                        value={question.placeholder || ""}
                        onChange={(e) => updateImportedQuestion(index, "placeholder", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">Help Text</label>
                      <input
                        value={question.helpText || ""}
                        onChange={(e) => updateImportedQuestion(index, "helpText", e.target.value)}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={question.required === true}
                          onChange={(e) => updateImportedQuestion(index, "required", e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent"
                        />
                        Required
                      </label>
                    </div>
                    {["dropdown", "radio", "checkbox"].includes(question.type) && (
                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-slate-300">Options</label>
                        <textarea
                          value={question.optionsText || ""}
                          onChange={(e) => updateImportedQuestion(index, "optionsText", e.target.value)}
                          rows={4}
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm resize-none`}
                          placeholder={"Option 1\nOption 2\nOption 3"}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!importPreview.questions.length && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  No questions were detected in this file.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={cancelImportedForm}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyImportedForm}
                className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Apply Imported Form
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`${theme.card} max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border ${theme.border} p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Response Details</h3>
                <p className={`text-sm ${theme.textSecondary}`}>{selectedResponse.referenceId}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedResponse(null);
                  Object.values(secretRevealTimersRef.current).forEach((timer) => {
                    window.clearTimeout(timer);
                  });
                  secretRevealTimersRef.current = {};
                  setRevealedSecrets({});
                }}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => deleteResponse(selectedResponse._id)}
                className="rounded-2xl border border-red-500/30 px-4 py-2 text-sm text-red-300"
              >
                Delete
              </button>
            </div>

            <div className="space-y-4">
              {(selectedResponse.answers || []).map((answer) => (
                <div key={answer._id || answer.questionId?._id || answer.questionId} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">{answer.question?.label || "Question"}</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {(() => {
                      const questionId =
                        answer.question?._id ||
                        answer.questionId?._id ||
                        answer.questionId ||
                        answer._id;
                      return renderAnswerValue(answer, {
                        revealed: Boolean(revealedSecrets[questionId]),
                        revealedValue: revealedSecrets[questionId],
                        onReveal: () => revealSecret(questionId),
                        onCopy: async () => {
                          const secret = revealedSecrets[questionId];
                          if (!secret) return;
                          await navigator.clipboard.writeText(secret);
                          toast.success("Secret copied");
                        },
                      });
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormManagement;
