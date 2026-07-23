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
import useAutoDraft from "../../hooks/useAutoDraft";
import useModuleDrafts from "../../hooks/useModuleDrafts";
import DraftsButton from "./drafts/DraftsButton";
import DraftsPanel from "./drafts/DraftsPanel";
import {
  buildDraftKey,
  clearDraft,
  findLatestDraftKeyForModule,
  getCurrentDraftUserId,
} from "../../shared/lib/draftPersistence";
import { getStoredUser } from "../../utils/auth";
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

const CONDITIONAL_FIELD_TYPES_REQUIRING_OPTIONS = new Set([
  "dropdown",
  "radio",
  "checkbox",
  "multipleSelect",
]);

const CONDITIONAL_FIELD_TYPE_OPTIONS = [
  ...QUESTION_TYPES,
  { value: "multipleSelect", label: "Multiple Choice" },
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

const HEADER_BACKGROUND_TYPE_OPTIONS = [
  { value: "color", label: "Color" },
  { value: "image", label: "Image" },
];

const HEADER_BACKGROUND_POSITION_OPTIONS = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const HEADER_BACKGROUND_SIZE_OPTIONS = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "auto", label: "Auto" },
];

const HEADER_TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

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
  headerBackgroundType: "color",
  headerBackgroundImageUrl: "",
  headerBackgroundImagePublicId: "",
  headerBackgroundPosition: "center",
  headerBackgroundSize: "cover",
  headerOverlayColor: "#000000",
  headerOverlayOpacity: 0.45,
  headerMinHeight: 220,
  headerTextAlign: "left",
  headerTextColor: "",
  bodyBackgroundColor: "#f0fdf4",
  cardBackgroundColor: "#ffffff",
  accentColor: "#16a34a",
  textColor: "#0f172a",
  buttonColor: "#16a34a",
  borderRadius: 24,
  logoUrl: "",
  logoAsset: null,
  bannerUrl: "",
  bannerImageUrl: "",
  bannerImageAsset: null,
  headerBackgroundImageAsset: null,
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

const IMAGE_SIZE_LIMIT_MESSAGE =
  "Image size is too large. Please upload a file 5 MB or smaller.";
const UPLOAD_REQUEST_TIMEOUT_MS = 90000;

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
  bannerUrl: "",
  bannerImageUrl: "",
  bannerImageAsset: null,
  headerBackgroundImageUrl: "",
  headerBackgroundImagePublicId: "",
  headerBackgroundImageAsset: null,
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
  conditionalFields: [],
  validation: normalizeNumberValidation(),
  order: 0,
});

const createQuestionOption = (label = "Option 1", order = 0) => ({
  id: crypto.randomUUID(),
  label,
  value: label,
  order,
  conditionalLogic: {
    enabled: false,
    resetOnHide: true,
    fields: [],
  },
});

const createConditionalField = (order = 0) => ({
  id: crypto.randomUUID(),
  label: "Untitled field",
  type: "shortAnswer",
  placeholder: "",
  helpText: "",
  required: false,
  validationEnabled: false,
  validation: normalizeNumberValidation(),
  options: [],
  uploadConfig: {
    uploadType: "",
    required: false,
    multiple: false,
    maxFiles: 1,
    maxFileSize: 5,
    allowedExtensions: [],
    allowedMimeTypes: [],
    previewEnabled: true,
    downloadEnabled: true,
    label: "",
    helpText: "",
    errorText: "",
  },
  order,
  isActive: true,
  conditionalLogic: {
    enabled: false,
    resetOnHide: true,
    fields: [],
  },
});

const createConditionalFieldOption = (label = "", order = 0) => ({
  id: crypto.randomUUID(),
  label,
  value: label,
  order,
  conditionalLogic: {
    enabled: false,
    resetOnHide: true,
    fields: [],
  },
});

const mapConditionalOptionNodes = (options = [], visitor) =>
  (Array.isArray(options) ? options : []).map((option, index) => {
    const current = visitor?.({ kind: "option", node: option, index }) || option;
    const conditionalFields = Array.isArray(current?.conditionalLogic?.fields)
      ? current.conditionalLogic.fields
      : [];
    return {
      ...current,
      conditionalLogic: {
        ...(current.conditionalLogic || {}),
        enabled:
          current?.conditionalLogic?.enabled === true ||
          conditionalFields.length > 0,
        resetOnHide: current?.conditionalLogic?.resetOnHide !== false,
        fields: mapConditionalFieldNodes(conditionalFields, visitor),
      },
    };
  });

const mapConditionalFieldNodes = (fields = [], visitor) =>
  (Array.isArray(fields) ? fields : []).map((field, index) => {
    const current = visitor?.({ kind: "field", node: field, index }) || field;
    return {
      ...current,
      options: mapConditionalOptionNodes(current.options || [], visitor),
      conditionalLogic: {
        ...(current.conditionalLogic || {}),
        enabled: current?.conditionalLogic?.enabled === true,
        resetOnHide: current?.conditionalLogic?.resetOnHide !== false,
        fields: mapConditionalFieldNodes(current?.conditionalLogic?.fields || [], visitor),
      },
    };
  });

const mapQuestionConditionalTree = (question, visitor) => ({
  ...question,
  options: mapConditionalOptionNodes(question.options || [], visitor),
  conditionalFields: mapConditionalFieldNodes(question.conditionalFields || [], visitor),
});

const cloneConditionalTree = (question) => mapQuestionConditionalTree(question, (entry) => {
  const node = entry.node || {};
  return {
    ...node,
    id: crypto.randomUUID(),
    conditionalLogic: {
      ...(node.conditionalLogic || {}),
    },
  };
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
  options: normalizeQuestionOptions(question),
  conditionalFields: Array.isArray(question.conditionalFields)
    ? question.conditionalFields.map((field, fieldIndex) =>
        normalizeConditionalField(field, fieldIndex),
      )
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
      emailTemplate: normalizeEmailTemplate(form.emailTemplate, form),
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

const normalizeConditionalValidation = (validation = {}) => ({
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

const normalizeConditionalField = (field = {}, index = 0) => ({
  id: String(field.id || field.fieldId || crypto.randomUUID()),
  label: String(field.label || field.title || "Untitled field"),
  type: String(field.type || "shortAnswer"),
  placeholder: String(field.placeholder || ""),
  helpText: String(field.helpText || field.description || ""),
  required: field.required === true,
  validationEnabled: field.validationEnabled === true,
  validation: normalizeConditionalValidation(field.validation),
  options: Array.isArray(field.options)
    ? field.options.map((option, optionIndex) =>
        typeof option === "string"
          ? createQuestionOption(option, optionIndex)
          : {
              id: String(option.id || crypto.randomUUID()),
              label: String(option.label || option.value || ""),
              value: String(option.value || option.label || ""),
              order: typeof option.order === "number" ? option.order : optionIndex,
              conditionalLogic: {
                enabled: option.conditionalLogic?.enabled === true,
                resetOnHide: option.conditionalLogic?.resetOnHide !== false,
                fields: Array.isArray(option.conditionalLogic?.fields)
                  ? option.conditionalLogic.fields.map((fieldItem, fieldIndex) =>
                      normalizeConditionalField(fieldItem, fieldIndex),
                    )
                  : [],
              },
            },
      )
    : [],
  uploadConfig: {
    uploadType: String(field.uploadConfig?.uploadType || ""),
    required: field.uploadConfig?.required === true,
    multiple: field.uploadConfig?.multiple === true,
    maxFiles:
      Number.isInteger(field.uploadConfig?.maxFiles) && field.uploadConfig.maxFiles > 0
        ? field.uploadConfig.maxFiles
        : 1,
    maxFileSize:
      Number.isFinite(Number(field.uploadConfig?.maxFileSize))
        ? Number(field.uploadConfig.maxFileSize)
        : 5,
    allowedExtensions: Array.isArray(field.uploadConfig?.allowedExtensions)
      ? field.uploadConfig.allowedExtensions
      : [],
    allowedMimeTypes: Array.isArray(field.uploadConfig?.allowedMimeTypes)
      ? field.uploadConfig.allowedMimeTypes
      : [],
    previewEnabled: field.uploadConfig?.previewEnabled !== false,
    downloadEnabled: field.uploadConfig?.downloadEnabled !== false,
    label: String(field.uploadConfig?.label || ""),
    helpText: String(field.uploadConfig?.helpText || ""),
    errorText: String(field.uploadConfig?.errorText || ""),
  },
  order: typeof field.order === "number" ? field.order : index,
  isActive: field.isActive !== false,
  conditionalLogic: {
    enabled: field.conditionalLogic?.enabled === true,
    resetOnHide: field.conditionalLogic?.resetOnHide !== false,
    fields: Array.isArray(field.conditionalLogic?.fields)
      ? field.conditionalLogic.fields.map((fieldItem, fieldIndex) =>
          normalizeConditionalField(fieldItem, fieldIndex),
        )
      : [],
  },
});

const normalizeQuestionOptions = (question = {}) =>
  (Array.isArray(question.options) ? question.options : []).map((option, index) =>
    typeof option === "string"
      ? createQuestionOption(option, index)
      : {
          id: String(option.id || option.optionId || crypto.randomUUID()),
          label: String(option.label || option.value || `Option ${index + 1}`),
          value: String(option.value || option.label || `option-${index + 1}`),
          order: typeof option.order === "number" ? option.order : index,
          conditionalLogic: {
            enabled: option.conditionalLogic?.enabled === true,
            resetOnHide: option.conditionalLogic?.resetOnHide !== false,
            fields: Array.isArray(option.conditionalLogic?.fields)
              ? option.conditionalLogic.fields.map((field, fieldIndex) =>
                  normalizeConditionalField(field, fieldIndex),
                )
              : [],
          },
        },
  );

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

const normalizeHttpsUrl = (value = "") => {
  const normalized = normalizeHttpUrl(value);
  return normalized.startsWith("https://") ? normalized : "";
};

const resolveHeaderBackgroundImageUrl = (template = {}) =>
  normalizeHttpsUrl(
    template?.headerBackgroundImageUrl ||
      template?.headerBackgroundImageAsset?.secureUrl ||
      template?.headerBackgroundImageAsset?.secure_url ||
      template?.headerBackgroundImageAsset?.url ||
      template?.headerBackgroundImage ||
      "",
  );

const toAssetPayload = (asset = null, fallbackUrl = "") => {
  if (!asset && !fallbackUrl) {
    return null;
  }

  if (typeof asset === "string") {
    return {
      url: normalizeHttpsUrl(asset || fallbackUrl),
      secureUrl: normalizeHttpsUrl(asset || fallbackUrl),
      publicId: "",
      resourceType: "image",
      format: "",
      originalName: "",
      mimeType: "",
      size: 0,
      bytes: 0,
      width: null,
      height: null,
      version: null,
      folder: "",
    };
  }

  if (!asset || typeof asset !== "object") {
    const safeUrl = normalizeHttpsUrl(fallbackUrl);
    return safeUrl
      ? {
          url: safeUrl,
          secureUrl: safeUrl,
          publicId: "",
          resourceType: "image",
          format: "",
          originalName: "",
          mimeType: "",
          size: 0,
          bytes: 0,
          width: null,
          height: null,
          version: null,
          folder: "",
        }
      : null;
  }

  const safeUrl = normalizeHttpsUrl(
    asset.secureUrl ||
      asset.secure_url ||
      asset.url ||
      asset.fileUrl ||
      fallbackUrl ||
      "",
  );

  return {
    ...asset,
    url: safeUrl,
    secureUrl: safeUrl,
    publicId: String(asset.publicId || asset.public_id || "").trim(),
    resourceType: String(asset.resourceType || asset.resource_type || "image").trim() || "image",
    format: String(asset.format || "").trim(),
    originalName: String(asset.originalName || asset.originalFilename || "").trim(),
    mimeType: String(asset.mimeType || "").trim(),
    size: Number(asset.size || asset.bytes || 0) || 0,
    bytes: Number(asset.bytes || asset.size || 0) || 0,
    width: asset.width ?? null,
    height: asset.height ?? null,
    version: asset.version ?? null,
    folder: String(asset.folder || "").trim(),
  };
};

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
  const toTrimmed = (value = "") => String(value || "").trim();
  const clampOpacity = (value, fallbackValue = 0.45) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallbackValue;
    return Math.min(1, Math.max(0, parsed));
  };
  const clampMinHeight = (value, fallbackValue = 220) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
  };
  const normalizeChoice = (value, allowed, fallbackValue) =>
    allowed.includes(String(value || "").trim())
      ? String(value).trim()
      : fallbackValue;
  const headerBackgroundImageAsset = toAssetPayload(
    source.headerBackgroundImageAsset ?? legacy.emailTemplate?.headerBackgroundImageAsset ?? null,
    source.headerBackgroundImageUrl ??
      legacy.headerBackgroundImageUrl ??
      legacy.emailTemplate?.headerBackgroundImageUrl ??
      legacy.headerBackground ??
      legacy.emailTemplate?.headerBackground ??
      "",
  );
  const headerBackgroundImageUrl = normalizeHttpsUrl(
    source.headerBackgroundImageUrl ??
      legacy.headerBackgroundImageUrl ??
      legacy.emailTemplate?.headerBackgroundImageUrl ??
      legacy.headerBackground ??
      legacy.emailTemplate?.headerBackground ??
      headerBackgroundImageAsset?.secureUrl ??
      headerBackgroundImageAsset?.url ??
      "",
  );
  const headerBackgroundType = normalizeChoice(
    source.headerBackgroundType ??
      legacy.headerBackgroundType ??
      legacy.emailTemplate?.headerBackgroundType ??
      "",
    ["color", "image"],
    headerBackgroundImageUrl || headerBackgroundImageAsset ? "image" : "color",
  );
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
    headerBackgroundType,
    headerBackgroundImageUrl,
    headerBackgroundImagePublicId: toTrimmed(
      source.headerBackgroundImagePublicId ??
        legacy.headerBackgroundImagePublicId ??
        legacy.emailTemplate?.headerBackgroundImagePublicId ??
        headerBackgroundImageAsset?.publicId ??
        "",
    ),
    headerBackgroundPosition: normalizeChoice(
      source.headerBackgroundPosition ??
        legacy.headerBackgroundPosition ??
        legacy.emailTemplate?.headerBackgroundPosition ??
        DEFAULT_EMAIL_TEMPLATE.headerBackgroundPosition,
      ["center", "top", "bottom", "left", "right"],
      DEFAULT_EMAIL_TEMPLATE.headerBackgroundPosition,
    ),
    headerBackgroundSize: normalizeChoice(
      source.headerBackgroundSize ??
        legacy.headerBackgroundSize ??
        legacy.emailTemplate?.headerBackgroundSize ??
        DEFAULT_EMAIL_TEMPLATE.headerBackgroundSize,
      ["cover", "contain", "auto"],
      DEFAULT_EMAIL_TEMPLATE.headerBackgroundSize,
    ),
    headerOverlayColor: toTrimmed(
      source.headerOverlayColor ??
        legacy.headerOverlayColor ??
        legacy.emailTemplate?.headerOverlayColor ??
        DEFAULT_EMAIL_TEMPLATE.headerOverlayColor,
    ),
    headerOverlayOpacity: clampOpacity(
      source.headerOverlayOpacity ??
        legacy.headerOverlayOpacity ??
        legacy.emailTemplate?.headerOverlayOpacity ??
        DEFAULT_EMAIL_TEMPLATE.headerOverlayOpacity,
      DEFAULT_EMAIL_TEMPLATE.headerOverlayOpacity,
    ),
    headerMinHeight: clampMinHeight(
      source.headerMinHeight ??
        legacy.headerMinHeight ??
        legacy.emailTemplate?.headerMinHeight ??
        DEFAULT_EMAIL_TEMPLATE.headerMinHeight,
      DEFAULT_EMAIL_TEMPLATE.headerMinHeight,
    ),
    headerTextAlign: normalizeChoice(
      source.headerTextAlign ??
        legacy.headerTextAlign ??
        legacy.emailTemplate?.headerTextAlign ??
        DEFAULT_EMAIL_TEMPLATE.headerTextAlign,
      ["left", "center", "right"],
      DEFAULT_EMAIL_TEMPLATE.headerTextAlign,
    ),
    headerTextColor: toTrimmed(
      source.headerTextColor ??
        legacy.headerTextColor ??
        legacy.emailTemplate?.headerTextColor ??
        "",
    ),
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
    bannerUrl:
      source.bannerUrl ??
      legacy.emailTemplate?.bannerUrl ??
      legacy.bannerUrl ??
      legacy.emailTemplate?.bannerImageUrl ??
      legacy.bannerImageUrl ??
      "",
    bannerImageUrl:
      source.bannerImageUrl ??
      legacy.emailTemplate?.bannerImageUrl ??
      legacy.bannerImageUrl ??
      legacy.emailTemplate?.bannerUrl ??
      legacy.bannerUrl ??
      "",
    bannerImageAsset:
      source.bannerImageAsset ??
      legacy.emailTemplate?.bannerImageAsset ??
      legacy.bannerImageAsset ??
      null,
    headerBackgroundImageAsset,
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

const hexToRgba = (value = "#000000", opacity = 0.45) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^#([0-9a-f]{6})$/i);
  const safeOpacity = Math.min(1, Math.max(0, Number(opacity) || 0));
  if (!match) {
    return `rgba(0, 0, 0, ${safeOpacity})`;
  }

  const hex = match[1];
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
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
    resolved.bannerUrl ||
    resolved.bannerImage ||
    resolved.bannerImageUrl ||
    "";
  const logoUrl = resolved.logoAsset || resolved.logoUrl || "";
  const headerBackgroundImageUrl = resolveHeaderBackgroundImageUrl(resolved);
  const tableRows = [
    { question: "Full Name", answer: "John Doe" },
    { question: "Email", answer: "john@example.com" },
    { question: "Phone", answer: "+91 98765 43210" },
  ];

  return {
    resolved,
    headerBackgroundType:
      (resolved.headerBackgroundType === "image" || headerBackgroundImageUrl) &&
      headerBackgroundImageUrl
        ? "image"
        : "color",
    headerBackgroundImageUrl,
    headerBackgroundPosition: resolved.headerBackgroundPosition || "center",
    headerBackgroundSize: resolved.headerBackgroundSize || "cover",
    headerOverlayColor: resolved.headerOverlayColor || "#000000",
    headerOverlayOpacity: Number.isFinite(Number(resolved.headerOverlayOpacity))
      ? Math.min(1, Math.max(0, Number(resolved.headerOverlayOpacity)))
      : 0.45,
    headerMinHeight: Number.isFinite(Number(resolved.headerMinHeight))
      ? Number(resolved.headerMinHeight)
      : 220,
    headerTextAlign: resolved.headerTextAlign || "left",
    headerTextColor:
      resolved.headerTextColor ||
      (isLightHexColor(resolved.headerBackgroundColor) ? "#0f172a" : "#ffffff"),
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
  options: normalizeQuestionOptions(question),
  optionsText: normalizeQuestionOptions(question)
    .map((option) => option.label)
    .join("\n"),
  conditionalFields: Array.isArray(question.conditionalFields)
    ? question.conditionalFields.map((field, fieldIndex) =>
        normalizeConditionalField(field, fieldIndex),
      )
    : [],
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
      const label = answer.displayLabel || answer.fieldLabel || answer.question?.label || "";
      const context = answer.displayContext || answer.parentOptionLabel || "";
      if (answer.fileName) return [label, context, answer.fileName, answer.fileUrl || ""];
      if (Array.isArray(answer.value)) return [label, context, ...answer.value];
      return [label, context, answer.value ?? ""];
    }),
  ]
    .join(" ")
    .toLowerCase();
};

const maskSecretValue = () => "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

const getLinkHref = (value = "") => normalizeHttpUrl(value);

const renderAnswerValue = (answer, options = {}) => {
  if (!answer) return "-";
  const answerType = String(answer.fieldType || answer.question?.type || "").toLowerCase();

  if (Array.isArray(answer.fileUrls) && answer.fileUrls.length > 1) {
    return (
      <div className="space-y-3">
        {answer.fileUrls.map((url, index) => {
          const fileName = answer.fileNames?.[index] || `File ${index + 1}`;
          return (
            <div key={`${url}-${index}`} className="space-y-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 break-words text-cyan-300 underline decoration-cyan-300/50 underline-offset-4"
              >
                <ExternalLink size={14} />
                <span className="break-all">{fileName}</span>
              </a>
            </div>
          );
        })}
      </div>
    );
  }

  if (Array.isArray(answer.value)) {
    return (
      <ul className="space-y-2 pl-5">
        {answer.value.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc break-words">
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (answer.fileUrl) {
    if (/^image\//i.test(String(answer.fileType || "")) || answerType === "imageupload") {
      return (
        <div className="space-y-2">
          <a href={answer.fileUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-white/10">
            <img
              src={answer.fileUrl}
              alt={answer.fileName || "Uploaded image"}
              className="max-h-56 w-full object-contain"
            />
          </a>
          <a
            href={answer.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 break-words text-cyan-300 underline decoration-cyan-300/50 underline-offset-4"
          >
            <ExternalLink size={14} />
            <span className="break-all">{answer.fileName || answer.fileUrl}</span>
          </a>
        </div>
      );
    }
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

  if (answerType === "password") {
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

  if (answerType === "link") {
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
  const draftUserId = getCurrentDraftUserId(getStoredUser());
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
  const [expandedConditionalPanels, setExpandedConditionalPanels] = useState({});
  const lastSavedFormRef = useRef(null);
  const draftResolutionRef = useRef(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
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
  const emailHeaderBackgroundInputRef = useRef(null);
  const [uploadingEmailTemplateField, setUploadingEmailTemplateField] = useState("");
  const [formLogoPreviewFailed, setFormLogoPreviewFailed] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [bannerPreviewFailed, setBannerPreviewFailed] = useState(false);
  const [headerBackgroundPreviewFailed, setHeaderBackgroundPreviewFailed] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [draftKey, setDraftKey] = useState(() =>
    findLatestDraftKeyForModule(draftUserId, "form-builder") ||
    buildDraftKey({
      module: "form-builder",
      mode: "create",
      recordId: "new",
      userId: draftUserId,
    }),
  );
  const recoveryHandledRef = useRef(false);
  const draftState = useMemo(
    () => ({
      ...draft,
      selectedFormId,
    }),
    [draft, selectedFormId],
  );
  const {
    draftSnapshot,
    draftStatus,
    draftError,
    restoreDraft,
    discardDraft,
    markRecoveryHandled,
  } = useAutoDraft({
    key: draftKey,
    data: draftState,
    enabled: true,
    module: "form-builder",
    mode: selectedFormId ? "edit" : "create",
    recordId: selectedFormId || "new",
    userId: draftUserId,
  });
  const { drafts, count, removeDraft } = useModuleDrafts({
    module: "form-builder",
    userId: getStoredUser(),
  });

  useEffect(() => {
    recoveryHandledRef.current = false;
  }, [draftKey]);

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
    setDraftKey(
      buildDraftKey({
        module: "form-builder",
        mode: "edit",
        recordId: form._id,
        userId: draftUserId,
      }),
    );
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
      if (draftResolutionRef.current !== "restore") {
        setDraft(normalized);
      }
      draftResolutionRef.current = null;
      setResponses(normalizeResponsesPayload(responseRes.data?.data));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load form");
    }
  };

  const startNewForm = () => {
    setSelectedFormId(null);
    setDraftKey(
      buildDraftKey({
        module: "form-builder",
        mode: "create",
        recordId: "new",
        userId: draftUserId,
      }),
    );
    setActiveTab("questions");
    setResponsesTab("list");
    setSlugTouched(false);
    setImportPreview(null);
    draftResolutionRef.current = null;
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
    setHeaderBackgroundPreviewFailed(false);
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

  const uploadWithTimeout = async (promise, timeoutMessage = "Upload timed out. Please try again.") => {
    let timeoutId;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => {
            reject(new Error(timeoutMessage));
          }, UPLOAD_REQUEST_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  };

  const buildUploadedAsset = (uploadData = {}, file = null, defaultFolder = "") => {
    const secureUrl =
      uploadData.secureUrl ||
      uploadData.secure_url ||
      uploadData.url ||
      "";
    return {
      provider: uploadData.provider || "cloudinary",
      url: uploadData.url || secureUrl,
      secureUrl,
      publicId: uploadData.publicId || uploadData.public_id || "",
      resourceType: uploadData.resourceType || uploadData.resource_type || "image",
      format: uploadData.format || "",
      originalName:
        uploadData.originalName ||
        uploadData.originalFilename ||
        uploadData.original_filename ||
        file?.name ||
        "",
      originalFilename:
        uploadData.originalFilename ||
        uploadData.originalName ||
        uploadData.original_filename ||
        file?.name ||
        "",
      mimeType: uploadData.mimeType || uploadData.mimetype || file?.type || "",
      size: uploadData.size || uploadData.bytes || file?.size || 0,
      bytes: uploadData.bytes || uploadData.size || file?.size || 0,
      width: uploadData.width ?? uploadData.asset?.width ?? null,
      height: uploadData.height ?? uploadData.asset?.height ?? null,
      version: uploadData.version ?? uploadData.asset?.version ?? null,
      folder: uploadData.folder || uploadData.asset?.folder || defaultFolder,
    };
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
        currentIndex === index
          ? {
              ...question,
              [field]: value,
              ...(field === "type" && ["dropdown", "radio", "checkbox"].includes(value) && !(question.options || []).length
                ? {
                    options: [createQuestionOption("Option 1", 0), createQuestionOption("Option 2", 1)],
                  }
                : {}),
            }
          : question,
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

  const addQuestionOption = (index) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) =>
        currentIndex === index
          ? {
              ...question,
              options: [
                ...(question.options || []),
                createQuestionOption(`Option ${(question.options || []).length + 1}`),
              ],
            }
          : question,
      ),
    }));
  };

  const updateQuestionOption = (questionIndex, optionId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        const options = (question.options || []).map((option) =>
          option.id === optionId ? { ...option, [field]: value } : option,
        );
        return {
          ...question,
          options,
          optionsText: options.map((option) => option.label).join("\n"),
        };
      }),
    }));
  };

  const removeQuestionOption = (questionIndex, optionId) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        const options = (question.options || []).filter((option) => option.id !== optionId);
        return {
          ...question,
          options,
          optionsText: options.map((option) => option.label).join("\n"),
        };
      }),
    }));
  };

  const addConditionalFieldToOption = (questionIndex, optionId) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "option" || entry.node.id !== optionId) return entry.node;
          const fields = Array.isArray(entry.node.conditionalLogic?.fields)
            ? entry.node.conditionalLogic.fields
            : [];
          return {
            ...entry.node,
            conditionalLogic: {
              ...(entry.node.conditionalLogic || {}),
              enabled: true,
              fields: [...fields, createConditionalField(fields.length)],
            },
          };
        });
      }),
    }));
  };

  const updateConditionalField = (questionIndex, optionId, fieldId, key, value) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId) return entry.node;
          const next = {
            ...entry.node,
            [key]: value,
          };
          if (
            key === "type" &&
            CONDITIONAL_FIELD_TYPES_REQUIRING_OPTIONS.has(value) &&
            !(next.options || []).length
          ) {
            next.options = [createConditionalFieldOption("", 0)];
          }
          return next;
        });
      }),
    }));
  };

  const updateConditionalFieldOption = (questionIndex, optionId, fieldId, fieldOptionId, value) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "option" || entry.node.id !== fieldOptionId) return entry.node;
          return {
            ...entry.node,
            label: value,
            value,
          };
        });
      }),
    }));
  };

  const addConditionalFieldOption = (questionIndex, optionId, fieldId) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId) return entry.node;
          const fieldOptions = Array.isArray(entry.node.options) ? [...entry.node.options] : [];
          fieldOptions.push(createConditionalFieldOption("", fieldOptions.length));
          return {
            ...entry.node,
            options: fieldOptions,
          };
        });
      }),
    }));
  };

  const moveConditionalFieldOption = (questionIndex, optionId, fieldId, fieldOptionId, direction) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId) return entry.node;
          const fieldOptions = Array.isArray(entry.node.options) ? [...entry.node.options] : [];
          const currentIndexInField = fieldOptions.findIndex((item) => item.id === fieldOptionId);
          const targetIndex = currentIndexInField + direction;
          if (
            currentIndexInField < 0 ||
            targetIndex < 0 ||
            targetIndex >= fieldOptions.length
          ) {
            return entry.node;
          }
          [fieldOptions[currentIndexInField], fieldOptions[targetIndex]] = [
            fieldOptions[targetIndex],
            fieldOptions[currentIndexInField],
          ];
          return {
            ...entry.node,
            options: fieldOptions,
          };
        });
      }),
    }));
  };

  const removeConditionalFieldOption = (questionIndex, optionId, fieldId, fieldOptionId) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId) return entry.node;
          return {
            ...entry.node,
            options: (entry.node.options || []).filter(
              (fieldOption) => fieldOption.id !== fieldOptionId,
            ),
          };
        });
      }),
    }));
  };

  const getConditionalFieldOptionValues = (field = {}) =>
    (Array.isArray(field.options) ? field.options : [])
      .map((option) => {
        if (typeof option === "string") {
          return option;
        }
        return option?.label || option?.value || "";
      })
      .map((option) => String(option || "").trim())
      .filter(Boolean);

  const validateConditionalFieldOptionConfig = (questions = []) => {
    const inspectFields = (fields = []) => {
      for (const field of Array.isArray(fields) ? fields : []) {
        if (field?.isActive === false) {
          continue;
        }
        if (
          CONDITIONAL_FIELD_TYPES_REQUIRING_OPTIONS.has(field.type) &&
          !getConditionalFieldOptionValues(field).length
        ) {
          return `Conditional field "${field.label || "Untitled field"}" needs at least one option.`;
        }

        const nestedFields = Array.isArray(field.conditionalLogic?.fields)
          ? field.conditionalLogic.fields
          : [];
        const nestedError = inspectFields(nestedFields);
        if (nestedError) {
          return nestedError;
        }

        const fieldOptions = Array.isArray(field.options) ? field.options : [];
        for (const option of fieldOptions) {
          const optionNestedError = inspectFields(option?.conditionalLogic?.fields || []);
          if (optionNestedError) {
            return optionNestedError;
          }
        }
      }

      return "";
    };

    for (const question of questions) {
      const questionOptions = Array.isArray(question.options) ? question.options : [];
      for (const option of questionOptions) {
        const error = inspectFields(option?.conditionalLogic?.fields || []);
        if (error) {
          return error;
        }
      }

      const directConditionalError = inspectFields(question.conditionalFields || []);
      if (directConditionalError) {
        return directConditionalError;
      }
    }

    return "";
  };

  const removeConditionalField = (questionIndex, optionId, fieldId) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        const options = (question.options || []).map((option) => {
          if (option.id !== optionId) return option;
          const fields = (option.conditionalLogic?.fields || []).filter((field) => field.id !== fieldId);
          return {
            ...option,
            conditionalLogic: {
              ...(option.conditionalLogic || {}),
              enabled: fields.length > 0,
              fields,
            },
          };
        });
        return { ...question, options };
      }),
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

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxLogoImageSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      toast.error("Please choose a valid image file");
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      return;
    }

    if (file.size > maxLogoImageSizeBytes) {
      toast.error(IMAGE_SIZE_LIMIT_MESSAGE);
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingFormLogoImage(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assetType", "logo");
        const response = await uploadWithTimeout(uploadFormLogoImage(formData));
        const uploadData = response.data?.data || {};
        const imageUrl = uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        updateDraft("logoUrl", imageUrl);
        updateDraft("logoAsset", buildUploadedAsset(uploadData, file, "technosthan/form-builder/email-assets/logos"));
        setFormLogoPreviewFailed(false);
        registerSessionAsset(
          uploadData.asset || buildUploadedAsset(uploadData, file, "technosthan/form-builder/email-assets/logos"),
        );
        toast.success("Form logo uploaded successfully");
      } catch (error) {
        const uploadErrorMessage =
          error.response?.status === 413
            ? IMAGE_SIZE_LIMIT_MESSAGE
            : error.response?.data?.message || error.message || "Failed to upload image";
        toast.error(
          uploadErrorMessage,
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
      toast.error(IMAGE_SIZE_LIMIT_MESSAGE);
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingBannerImage(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assetType", "banner");
        const response = await uploadWithTimeout(uploadFormBannerImage(formData));
        const uploadData = response.data?.data || {};
        const imageUrl = uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
        updateDraft("bannerImage", imageUrl);
        updateDraft("bannerImageUrl", imageUrl);
        updateDraft("bannerImageAsset", buildUploadedAsset(uploadData, file, "technosthan/form-builder/email-assets/banners"));
        registerSessionAsset(
          uploadData.asset || buildUploadedAsset(uploadData, file, "technosthan/form-builder/email-assets/banners"),
        );
        toast.success("Form image uploaded successfully");
      } catch (error) {
        const uploadErrorMessage =
          error.response?.status === 413
            ? IMAGE_SIZE_LIMIT_MESSAGE
            : error.response?.data?.message || error.message || "Failed to upload image";
        toast.error(
          uploadErrorMessage,
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
    const isHeaderField = field === "headerBackgroundImageUrl";
    const isLogoField = field === "logoUrl";
    const isBannerField = field === "bannerImageUrl";

    if (!file) {
      updateEmailTemplate(field, "");
      updateEmailTemplate(
        isLogoField
          ? "logoAsset"
          : isHeaderField
            ? "headerBackgroundImageAsset"
            : "bannerImageAsset",
        null,
      );
      if (!isLogoField) {
        updateEmailTemplate(isHeaderField ? "headerBackgroundImageUrl" : "bannerUrl", "");
      }
      if (isHeaderField) {
        updateEmailTemplate("headerBackgroundImagePublicId", "");
        updateEmailTemplate("headerBackgroundType", "color");
        setHeaderBackgroundPreviewFailed(false);
        if (emailHeaderBackgroundInputRef.current) {
          emailHeaderBackgroundInputRef.current.value = "";
        }
      } else if (isLogoField) {
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

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxImageSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      toast.error("Please choose a valid image file");
      if (isLogoField && emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
      if (isBannerField && emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
      if (isHeaderField && emailHeaderBackgroundInputRef.current) {
        emailHeaderBackgroundInputRef.current.value = "";
      }
      return;
    }

    if (file.size > maxImageSizeBytes) {
      toast.error(IMAGE_SIZE_LIMIT_MESSAGE);
      if (isLogoField && emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
      if (isBannerField && emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
      if (isHeaderField && emailHeaderBackgroundInputRef.current) {
        emailHeaderBackgroundInputRef.current.value = "";
      }
      return;
    }

    const upload = async () => {
      setUploadingEmailTemplateField(field);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "assetType",
          isLogoField ? "logo" : isHeaderField ? "header-background" : "banner",
        );
        const response = await uploadWithTimeout(uploadFormBannerImage(formData));
        const uploadData = response.data?.data || {};
        const imageUrl = uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        const folder = isLogoField
          ? "technosthan/form-builder/email-assets/logos"
          : isHeaderField
            ? "technosthan/form-builder/email-assets/header-backgrounds"
            : "technosthan/form-builder/email-assets/banners";
        const asset = buildUploadedAsset(uploadData, file, folder);

        updateEmailTemplate(field, imageUrl);
        if (isLogoField) {
          updateEmailTemplate("logoAsset", asset);
          setLogoPreviewFailed(false);
        } else if (isHeaderField) {
          updateEmailTemplate("headerBackgroundType", "image");
          updateEmailTemplate("headerBackgroundImageUrl", imageUrl);
          updateEmailTemplate("headerBackgroundImagePublicId", asset.publicId || "");
          updateEmailTemplate("headerBackgroundImageAsset", asset);
          setHeaderBackgroundPreviewFailed(false);
        } else {
          updateEmailTemplate("bannerUrl", imageUrl);
          updateEmailTemplate("bannerImageUrl", imageUrl);
          updateEmailTemplate("bannerImageAsset", asset);
          setBannerPreviewFailed(false);
        }

        registerSessionAsset(uploadData.asset || asset);
        toast.success(
          isLogoField
            ? "Email logo uploaded successfully"
            : isHeaderField
              ? "Header background uploaded successfully"
              : "Email banner uploaded successfully",
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || "Failed to upload image",
        );
      } finally {
        setUploadingEmailTemplateField("");
        if (isLogoField && emailLogoInputRef.current) {
          emailLogoInputRef.current.value = "";
        }
        if (isBannerField && emailBannerInputRef.current) {
          emailBannerInputRef.current.value = "";
        }
        if (isHeaderField && emailHeaderBackgroundInputRef.current) {
          emailHeaderBackgroundInputRef.current.value = "";
        }
      }
    };

    upload();
  };

  const clearEmailTemplateImage = (field) => {
    const isHeaderField = field === "headerBackgroundImageUrl";
    const isLogoField = field === "logoUrl";
    updateEmailTemplate(field, "");
    updateEmailTemplate(
      isLogoField
        ? "logoAsset"
        : isHeaderField
          ? "headerBackgroundImageAsset"
          : "bannerImageAsset",
      null,
    );
    if (isLogoField) {
      setLogoPreviewFailed(false);
      if (emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
    } else if (isHeaderField) {
      updateEmailTemplate("headerBackgroundImageUrl", "");
      updateEmailTemplate("headerBackgroundImagePublicId", "");
      updateEmailTemplate("headerBackgroundType", "color");
      setHeaderBackgroundPreviewFailed(false);
      if (emailHeaderBackgroundInputRef.current) {
        emailHeaderBackgroundInputRef.current.value = "";
      }
    } else {
      updateEmailTemplate("bannerUrl", "");
      updateEmailTemplate("bannerImageUrl", "");
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
        emailTemplate: normalizeEmailTemplate(data.emailTemplate, data),
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
              options: Array.isArray(question.options) ? question.options : [],
              conditionalFields: Array.isArray(question.conditionalFields)
                ? question.conditionalFields
                : [],
              optionsText: Array.isArray(question.options)
                ? question.options
                    .map((option) => String(option.label || option.value || option))
                    .join("\n")
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
        options: Array.isArray(question.options) &&
          question.options.some(
            (option) => option && typeof option === "object" && (option.id || option.conditionalLogic),
          )
          ? question.options.map((option, optionIndex) =>
              typeof option === "string"
                ? createQuestionOption(option, optionIndex)
                : {
                    ...option,
                    id: String(option.id || crypto.randomUUID()),
                    label: String(option.label || option.value || "").trim(),
                    value: String(option.value || option.label || "").trim(),
                  },
            )
          : parseOptionsText(question.optionsText || "").map((option, optionIndex) =>
              createQuestionOption(option, optionIndex),
            ),
        conditionalFields: Array.isArray(question.conditionalFields)
          ? question.conditionalFields.map((field, fieldIndex) => ({
              ...createConditionalField(fieldIndex),
              ...field,
              id: String(field.id || crypto.randomUUID()),
            }))
          : [],
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
        emailTemplate: importPreview.emailTemplate
          ? normalizeEmailTemplate(importPreview.emailTemplate, prev)
          : normalizeEmailTemplate(prev.emailTemplate, prev),
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
      const copy = cloneConditionalTree({
        ...source,
        id: crypto.randomUUID(),
        label: `${source.label} copy`,
        order: prev.questions.length,
      });
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
        form?.emailTemplate?.headerBackgroundImageAsset,
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
    const previousHeaderBackground =
      previousForm?.emailTemplate?.headerBackgroundImageAsset || null;
    const nextHeaderBackground =
      nextForm?.emailTemplate?.headerBackgroundImageAsset || null;

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
      {
        previous: previousHeaderBackground,
        current: nextHeaderBackground,
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

    const conditionalFieldValidationError = validateConditionalFieldOptionConfig(
      draft.questions || [],
    );
    if (conditionalFieldValidationError) {
      toast.error(conditionalFieldValidationError);
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
      headerBackgroundImageUrl:
        draft.emailTemplate?.headerBackgroundImageUrl ||
        draft.emailTemplate?.headerBackgroundImageAsset?.secureUrl ||
        draft.emailTemplate?.headerBackgroundImageAsset?.url ||
        "",
      headerBackgroundImagePublicId:
        draft.emailTemplate?.headerBackgroundImagePublicId ||
        draft.emailTemplate?.headerBackgroundImageAsset?.publicId ||
        "",
      headerBackgroundImageAsset: draft.emailTemplate?.headerBackgroundImageAsset || null,
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
        id: question.id,
        label: String(question.label || "").trim(),
        type: question.type,
        placeholder: String(question.placeholder || "").trim(),
        helpText: String(question.helpText || "").trim(),
        required: question.required === true,
        validationEnabled: question.validationEnabled === true,
        options: Array.isArray(question.options)
          ? question.options.map((option, optionIndex) => ({
              id: String(option.id || crypto.randomUUID()),
              label: String(option.label || option.value || "").trim(),
              value: String(option.value || option.label || "").trim(),
              order: typeof option.order === "number" ? option.order : optionIndex,
              conditionalLogic: {
                enabled: option.conditionalLogic?.enabled === true,
                resetOnHide: option.conditionalLogic?.resetOnHide !== false,
                fields: Array.isArray(option.conditionalLogic?.fields)
                  ? option.conditionalLogic.fields.map((field, fieldIndex) => ({
                      id: String(field.id || crypto.randomUUID()),
                      label: String(field.label || "").trim(),
                      type: String(field.type || "shortAnswer"),
                      placeholder: String(field.placeholder || "").trim(),
                      helpText: String(field.helpText || "").trim(),
                      required: field.required === true,
                      validationEnabled: field.validationEnabled === true,
                      validation: normalizeNumberValidation(field.validation),
                      options: Array.isArray(field.options)
                        ? field.options
                            .map((childOption, childIndex) => {
                              const optionSource =
                                typeof childOption === "string"
                                  ? { label: childOption, value: childOption }
                                  : childOption || {};
                              return {
                                ...optionSource,
                                id: String(optionSource.id || crypto.randomUUID()),
                                label: String(
                                  optionSource.label || optionSource.value || "",
                                ).trim(),
                                value: String(
                                  optionSource.value || optionSource.label || "",
                                ).trim(),
                                order:
                                  typeof optionSource.order === "number"
                                    ? optionSource.order
                                    : childIndex,
                              };
                            })
                            .filter((childOption) =>
                              String(childOption.label || childOption.value || "").trim(),
                            )
                            .map((childOption, childIndex) => ({
                              ...childOption,
                              order: childIndex,
                            }))
                        : [],
                      uploadConfig: field.uploadConfig || null,
                      order: typeof field.order === "number" ? field.order : fieldIndex,
                      isActive: field.isActive !== false,
                    }))
                  : [],
              },
            }))
          : [],
        conditionalFields: Array.isArray(question.conditionalFields)
          ? question.conditionalFields.map((field, fieldIndex) => ({
              id: String(field.id || crypto.randomUUID()),
              label: String(field.label || "").trim(),
              type: String(field.type || "shortAnswer"),
              placeholder: String(field.placeholder || "").trim(),
              helpText: String(field.helpText || "").trim(),
              required: field.required === true,
              validationEnabled: field.validationEnabled === true,
              validation: normalizeNumberValidation(field.validation),
              options: Array.isArray(field.options)
                ? field.options
                    .map((childOption, childIndex) => {
                      const optionSource =
                        typeof childOption === "string"
                          ? { label: childOption, value: childOption }
                          : childOption || {};
                      return {
                        ...optionSource,
                        id: String(optionSource.id || crypto.randomUUID()),
                        label: String(optionSource.label || optionSource.value || "").trim(),
                        value: String(optionSource.value || optionSource.label || "").trim(),
                        order:
                          typeof optionSource.order === "number"
                            ? optionSource.order
                            : childIndex,
                      };
                    })
                    .filter((childOption) =>
                      String(childOption.label || childOption.value || "").trim(),
                    )
                    .map((childOption, childIndex) => ({
                      ...childOption,
                      order: childIndex,
                    }))
                : [],
              uploadConfig: field.uploadConfig || null,
              order: typeof field.order === "number" ? field.order : fieldIndex,
              isActive: field.isActive !== false,
            }))
          : [],
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
      clearDraft(draftKey);
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
  const toggleConditionalPanel = (panelKey) => {
    setExpandedConditionalPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

  const isConditionalPanelExpanded = (panelKey) =>
    expandedConditionalPanels[panelKey] === true;

  const renderConditionalFieldEditor = (
    questionId,
    questionIndex,
    optionId,
    field,
    level = 1,
    breadcrumb = [],
  ) => {
    const fieldBreadcrumb = [...breadcrumb, field.label || "Untitled field"];
    const fieldOptions = Array.isArray(field.options) ? field.options : [];
    const isChoiceField = CONDITIONAL_FIELD_TYPES_REQUIRING_OPTIONS.has(String(field.type || ""));

    return (
      <div
        key={field.id}
        className={`rounded-2xl border border-white/10 bg-slate-950/30 p-4 space-y-4 ${
          level > 1 ? "ml-4 md:ml-6" : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-100">
              {field.label || "Untitled field"}
            </div>
            <div className="text-xs text-slate-400">
              {fieldBreadcrumb.join(" -> ")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeConditionalField(questionIndex, optionId, field.id)}
            className="rounded-2xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
          >
            Remove Field
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">Field Label</label>
            <input
              value={field.label || ""}
              onChange={(e) =>
                updateConditionalField(questionIndex, optionId, field.id, "label", e.target.value)
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">Field Type</label>
            <select
              value={field.type || "shortAnswer"}
              onChange={(e) =>
                updateConditionalField(questionIndex, optionId, field.id, "type", e.target.value)
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            >
              {CONDITIONAL_FIELD_TYPE_OPTIONS.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>
                  {typeOption.label}
                </option>
              ))}
              <option value="heading">Heading / Information</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">Placeholder</label>
            <input
              value={field.placeholder || ""}
              onChange={(e) =>
                updateConditionalField(questionIndex, optionId, field.id, "placeholder", e.target.value)
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">Help Text</label>
            <input
              value={field.helpText || ""}
              onChange={(e) =>
                updateConditionalField(questionIndex, optionId, field.id, "helpText", e.target.value)
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required === true}
              onChange={(e) =>
                updateConditionalField(questionIndex, optionId, field.id, "required", e.target.checked)
              }
            />
            Required
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.validationEnabled === true}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "validationEnabled",
                  e.target.checked,
                )
              }
            />
            Enable Validation
          </label>
        </div>

        {isChoiceField && (
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  {field.type === "dropdown" ? "Dropdown Options" : "Field Options"}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Add one option per row. Each option can open its own conditional branch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => addConditionalFieldOption(questionIndex, optionId, field.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {fieldOptions.map((fieldOption, fieldOptionIndex) => {
                const panelKey = `${questionId}::${optionId}::${field.id}::${fieldOption.id}`;
                const childFields = Array.isArray(fieldOption.conditionalLogic?.fields)
                  ? fieldOption.conditionalLogic.fields
                  : [];
                const expanded = isConditionalPanelExpanded(panelKey);
                const childBreadcrumb = [...fieldBreadcrumb, fieldOption.label || `Option ${fieldOptionIndex + 1}`];

                return (
                  <div
                    key={fieldOption.id}
                    className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3"
                  >
                    <div className="text-xs text-slate-400">
                      {childBreadcrumb.join(" -> ")}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto_auto]">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-300">
                          Option Label
                        </label>
                        <input
                          value={fieldOption.label || ""}
                          onChange={(e) =>
                            updateConditionalFieldOption(
                              questionIndex,
                              optionId,
                              field.id,
                              fieldOption.id,
                              e.target.value,
                            )
                          }
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                          placeholder={`Option ${fieldOptionIndex + 1}`}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-300">
                          Option Value
                        </label>
                        <input
                          value={fieldOption.value || ""}
                          onChange={(e) =>
                            updateConditionalFieldOption(
                              questionIndex,
                              optionId,
                              field.id,
                              fieldOption.id,
                              e.target.value,
                            )
                          }
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                          placeholder="Stable internal value"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleConditionalPanel(panelKey)}
                        className="mt-7 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                      >
                        {expanded ? "Collapse" : "Expand"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moveConditionalFieldOption(
                            questionIndex,
                            optionId,
                            field.id,
                            fieldOption.id,
                            -1,
                          )
                        }
                        disabled={fieldOptionIndex === 0}
                        className="mt-7 rounded-2xl border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move option up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moveConditionalFieldOption(
                            questionIndex,
                            optionId,
                            field.id,
                            fieldOption.id,
                            1,
                          )
                        }
                        disabled={fieldOptionIndex === fieldOptions.length - 1}
                        className="mt-7 rounded-2xl border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move option down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeConditionalFieldOption(
                            questionIndex,
                            optionId,
                            field.id,
                            fieldOption.id,
                          )
                        }
                        className="mt-7 rounded-2xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Stable ID: {fieldOption.id}</span>
                      <button
                        type="button"
                        onClick={() => addConditionalFieldToOption(questionIndex, fieldOption.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200"
                      >
                        <ListPlus size={12} /> Add Conditional Question
                      </button>
                    </div>

                    {expanded && (
                      <div className="space-y-3 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                              Conditional Fields
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              {childBreadcrumb.join(" → ")}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addConditionalFieldToOption(questionIndex, fieldOption.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                          >
                            <Plus size={14} /> Add Conditional Question
                          </button>
                        </div>

                        <div className="space-y-3">
                          {childFields.map((nestedField) =>
                            renderConditionalFieldEditor(
                              questionId,
                              questionIndex,
                              fieldOption.id,
                              nestedField,
                              level + 1,
                              childBreadcrumb,
                            ),
                          )}
                          {!childFields.length && (
                            <div className="rounded-2xl border border-dashed border-cyan-500/30 bg-slate-950/20 p-4 text-xs text-slate-400">
                              No conditional questions yet. Add one to continue nesting.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {!fieldOptions.length && (
                <div className="rounded-2xl border border-dashed border-cyan-500/30 bg-slate-950/20 p-4 text-xs text-slate-400">
                  No options yet. Add at least one option before saving.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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
          <DraftsButton count={count} onClick={() => setDraftsOpen(true)} />
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
              <div className="w-full text-right text-xs text-slate-400">
                {draftError
                  ? draftError
                  : draftStatus === "saved"
                    ? "Draft saved"
                    : draftStatus === "restored"
                      ? "Draft restored"
                      : draftStatus === "external-update"
                        ? "This draft was updated in another tab."
                        : ""}
              </div>
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
                    {/* <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                      Public preview
                    </span> */}
                  </div>
                  <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-row items-center gap-4">
                      {draft.logoUrl ? (
                        <img
                          src={getOptimizedImageUrl(draft.logoAsset || draft.logoUrl)}
                          alt="Form logo preview"
                          className="h-16 w-16 shrink-0 rounded-2xl bg-white/5 object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                          <Eye size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h1
                          className="break-words"
                          style={resolveTypographyStyle(draft.titleStyle, DEFAULT_TITLE_STYLE)}
                        >
                          {draft.title || "Form title preview"}
                        </h1>
                        {draft.description ? (
                          <div
                            className={`public-form-description mt-2 break-words ${theme.textSecondary}`}
                            style={resolveTypographyStyle(
                              draft.descriptionStyle,
                              DEFAULT_DESCRIPTION_STYLE,
                            )}
                            dangerouslySetInnerHTML={{
                              __html: sanitizeRichTextHtml(draft.description || ""),
                            }}
                          />
                        ) : (
                          <div className="mt-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400">
                            Your form description will appear here.
                          </div>
                        )}
                      </div>
                    </div>
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
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <label className="block text-sm font-semibold">Options</label>
                            <button
                              type="button"
                              onClick={() => addQuestionOption(index)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                            >
                              <Plus size={14} /> Add Option
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(question.options || []).map((option, optionIndex) => (
                              <div
                                key={option.id}
                                className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4"
                              >
                                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                  <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                                      Option Label
                                    </label>
                                    <input
                                      value={option.label || ""}
                                      onChange={(e) =>
                                        updateQuestionOption(index, option.id, "label", e.target.value)
                                      }
                                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                                      Option Value
                                    </label>
                                    <input
                                      value={option.value || ""}
                                      onChange={(e) =>
                                        updateQuestionOption(index, option.id, "value", e.target.value)
                                      }
                                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                                      placeholder="Stable internal value"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeQuestionOption(index, option.id)}
                                    className="mt-7 rounded-2xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => addConditionalFieldToOption(index, option.id)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                                  >
                                    <ListPlus size={14} /> Configure conditional fields
                                  </button>
                                  <span className="text-xs text-slate-400">
                                    Stable ID: {option.id}
                                  </span>
                                </div>

                                {option.conditionalLogic?.fields?.length > 0 && (
                                  <div className="space-y-3 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                                      Conditional Fields
                                    </div>
                                    {option.conditionalLogic.fields.map((field, fieldIndex) =>
                                      renderConditionalFieldEditor(question.id, index, option.id, field, 1, [
                                        question.label || "Question",
                                        option.label || "Option",
                                      ]),
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
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
                          id="form-logo-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFormLogoFile(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="form-logo-upload"
                          aria-disabled={uploadingFormLogoImage}
                          onClick={(event) => {
                            if (uploadingFormLogoImage) {
                              event.preventDefault();
                            }
                          }}
                          className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold ${
                            uploadingFormLogoImage
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:bg-white/10"
                          }`}
                        >
                          <Upload size={16} />
                          {uploadingFormLogoImage
                            ? "Uploading..."
                            : draft.logoUrl
                              ? "Change Logo"
                              : "Upload Logo"}
                        </label>
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
                        id="form-banner-upload"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleBannerImageFile(e.target.files?.[0] || null)}
                      />
                      <label
                        htmlFor="form-banner-upload"
                        aria-disabled={uploadingBannerImage}
                        onClick={(event) => {
                          if (uploadingBannerImage) {
                            event.preventDefault();
                          }
                        }}
                        className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold ${
                          uploadingBannerImage
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:bg-white/10"
                        }`}
                      >
                        <Upload size={16} />
                        {uploadingBannerImage ? "Uploading..." : "Upload Image"}
                      </label>
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

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <label className="block text-sm font-semibold">Header Background</label>
                        <p className="mt-1 text-xs text-slate-400">
                          Choose a solid color or a header image with text overlay.
                        </p>
                      </div>
                      <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                        {HEADER_BACKGROUND_TYPE_OPTIONS.map((option) => {
                          const active =
                            (draft.emailTemplate?.headerBackgroundType || "color") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateEmailTemplate("headerBackgroundType", option.value)}
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                active ? "bg-cyan-500 text-white" : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(draft.emailTemplate?.headerBackgroundType || "color") === "color" ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Header Background Color</label>
                        <input
                          value={draft.emailTemplate?.headerBackgroundColor || ""}
                          onChange={(e) => updateEmailTemplate("headerBackgroundColor", e.target.value)}
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          placeholder="#166534"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">Header Background Image URL</label>
                          <input
                            value={draft.emailTemplate?.headerBackgroundImageUrl || ""}
                            onChange={(e) => {
                              const normalized = normalizeHttpsUrl(e.target.value);
                              updateEmailTemplate("headerBackgroundType", normalized ? "image" : "color");
                              updateEmailTemplate("headerBackgroundImageUrl", normalized);
                              updateEmailTemplate("headerBackgroundImagePublicId", "");
                              updateEmailTemplate("headerBackgroundImageAsset", null);
                              setHeaderBackgroundPreviewFailed(false);
                            }}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            placeholder="https://res.cloudinary.com/..."
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            ref={emailHeaderBackgroundInputRef}
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleEmailTemplateImageFile("headerBackgroundImageUrl", e.target.files?.[0] || null)}
                          />
                          <button
                            type="button"
                            onClick={() => emailHeaderBackgroundInputRef.current?.click()}
                            disabled={!!uploadingEmailTemplateField}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Upload size={16} />
                            {uploadingEmailTemplateField === "headerBackgroundImageUrl"
                              ? "Uploading..."
                              : draft.emailTemplate?.headerBackgroundImageUrl
                                ? "Change Image"
                                : "Upload Header Image"}
                          </button>
                          {draft.emailTemplate?.headerBackgroundImageUrl && (
                            <button
                              type="button"
                              onClick={() => clearEmailTemplateImage("headerBackgroundImageUrl")}
                              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                            >
                              Clear Image
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Recommended size: 1200 × 500 px. Use a wide image with enough empty space for readable text.
                        </p>
                        {(draft.emailTemplate?.headerBackgroundImageUrl || draft.emailTemplate?.headerBackgroundImageAsset) &&
                        !headerBackgroundPreviewFailed ? (
                          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                            <img
                              src={getOptimizedImageUrl(
                                draft.emailTemplate.headerBackgroundImageAsset ||
                                  draft.emailTemplate.headerBackgroundImageUrl,
                              )}
                              alt="Header background preview"
                              onError={() => setHeaderBackgroundPreviewFailed(true)}
                              className="h-40 w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                            No header image selected
                          </div>
                        )}
                        {headerBackgroundPreviewFailed && (
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-100">
                            Header image preview unavailable. The fallback color will be used in the live preview and email.
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Overlay Color</label>
                            <input
                              value={draft.emailTemplate?.headerOverlayColor || ""}
                              onChange={(e) => updateEmailTemplate("headerOverlayColor", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#000000"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Overlay Opacity</label>
                            <input
                              type="range"
                              min="0"
                              max="0.9"
                              step="0.05"
                              value={draft.emailTemplate?.headerOverlayOpacity ?? 0.45}
                              onChange={(e) => updateEmailTemplate("headerOverlayOpacity", e.target.value)}
                              className="w-full"
                            />
                            <div className="mt-2 text-xs text-slate-400">
                              {Math.round((Number(draft.emailTemplate?.headerOverlayOpacity ?? 0.45) || 0) * 100)}%
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Header Text Color</label>
                            <input
                              value={draft.emailTemplate?.headerTextColor || ""}
                              onChange={(e) => updateEmailTemplate("headerTextColor", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#ffffff"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Background Position</label>
                            <select
                              value={draft.emailTemplate?.headerBackgroundPosition || "center"}
                              onChange={(e) => updateEmailTemplate("headerBackgroundPosition", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_POSITION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Background Size</label>
                            <select
                              value={draft.emailTemplate?.headerBackgroundSize || "cover"}
                              onChange={(e) => updateEmailTemplate("headerBackgroundSize", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Text Alignment</label>
                            <select
                              value={draft.emailTemplate?.headerTextAlign || "left"}
                              onChange={(e) => updateEmailTemplate("headerTextAlign", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_TEXT_ALIGN_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">Minimum Header Height</label>
                            <input
                              type="number"
                              min="120"
                              step="10"
                              value={draft.emailTemplate?.headerMinHeight ?? 220}
                              onChange={(e) => updateEmailTemplate("headerMinHeight", e.target.value)}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="220"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                        accept="image/jpeg,image/png,image/webp"
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
                          value={draft.emailTemplate?.bannerUrl || draft.emailTemplate?.bannerImageUrl || ""}
                          onChange={(e) => {
                            updateEmailTemplate("bannerUrl", e.target.value);
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
                    {(draft.emailTemplate?.bannerUrl || draft.emailTemplate?.bannerImageUrl) && !bannerPreviewFailed ? (
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                        <img
                          src={getOptimizedImageUrl(draft.emailTemplate.bannerImageAsset || draft.emailTemplate.bannerUrl || draft.emailTemplate.bannerImageUrl)}
                          alt="Email banner preview"
                          onError={() => setBannerPreviewFailed(true)}
                          className="h-32 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                        No banner selected
                      </div>
                    )}
                      {bannerPreviewFailed && (draft.emailTemplate?.bannerUrl || draft.emailTemplate?.bannerImageUrl) && (
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
                      <div
                        className="relative overflow-hidden"
                        style={{
                          minHeight: `${emailTemplatePreview.headerMinHeight || 220}px`,
                          backgroundColor: emailTemplatePreview.resolved.headerBackgroundColor,
                          color: emailTemplatePreview.headerTextColor,
                        }}
                      >
                        {emailTemplatePreview.headerBackgroundType === "image" &&
                        emailTemplatePreview.headerBackgroundImageUrl &&
                        !headerBackgroundPreviewFailed ? (
                          <img
                            src={getOptimizedImageUrl(emailTemplatePreview.headerBackgroundImageUrl)}
                            alt="Header background preview"
                            onError={() => setHeaderBackgroundPreviewFailed(true)}
                            className="absolute inset-0 h-full w-full"
                            style={{
                              objectFit: emailTemplatePreview.headerBackgroundSize || "cover",
                              objectPosition: emailTemplatePreview.headerBackgroundPosition || "center",
                            }}
                          />
                        ) : null}
                        {emailTemplatePreview.headerBackgroundType === "image" &&
                        emailTemplatePreview.headerBackgroundImageUrl &&
                        !headerBackgroundPreviewFailed ? (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              backgroundColor: hexToRgba(
                                emailTemplatePreview.headerOverlayColor,
                                emailTemplatePreview.headerOverlayOpacity ?? 0.45,
                              ),
                            }}
                          />
                        ) : null}
                        <div
                          className="relative z-10 flex h-full min-h-[220px] flex-col justify-center gap-2 p-5"
                          style={{
                            minHeight: `${emailTemplatePreview.headerMinHeight || 220}px`,
                            textAlign: emailTemplatePreview.headerTextAlign || "left",
                            color: emailTemplatePreview.headerTextColor,
                          }}
                      >
                        {emailTemplatePreview.logoUrl && !logoPreviewFailed ? (
                            <img
                              src={getOptimizedImageUrl(emailTemplatePreview.logoUrl)}
                              alt="Email preview logo"
                              onError={() => setLogoPreviewFailed(true)}
                              className={`mb-2 h-12 w-full object-contain ${
                                emailTemplatePreview.headerTextAlign === "center"
                                  ? "object-center"
                                  : emailTemplatePreview.headerTextAlign === "right"
                                    ? "object-right"
                                    : "object-left"
                              }`}
                            />
                          ) : (
                            <div className="mb-2 text-lg font-black">
                              {emailTemplatePreview.context.companyName}
                            </div>
                          )}
                          <div className="text-xs uppercase tracking-[0.25em] opacity-80">
                            {emailTemplatePreview.context.companyName}
                          </div>
                          <div className="mt-2 text-2xl font-black">
                            {emailTemplatePreview.headerTitle}
                          </div>
                          <p className="mt-2 text-sm leading-6 opacity-90">
                            {emailTemplatePreview.headerSubtitle}
                          </p>
                        </div>
                      </div>
                      {headerBackgroundPreviewFailed &&
                      emailTemplatePreview.headerBackgroundType === "image" &&
                      emailTemplatePreview.headerBackgroundImageUrl ? (
                        <div className="px-5 pt-4">
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-100">
                            Unable to load this image URL. The fallback header color is shown instead.
                          </div>
                        </div>
                      ) : null}

                      {emailTemplatePreview.bannerUrl && !bannerPreviewFailed ? (
                        <div className="px-5 pt-5">
                          <img
                            src={getOptimizedImageUrl(emailTemplatePreview.bannerUrl)}
                            alt="Email banner preview"
                            onError={() => setBannerPreviewFailed(true)}
                            className="h-40 w-full rounded-3xl object-contain"
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

            <div className="space-y-6">
              {(() => {
                const answers = Array.isArray(selectedResponse.answers) ? selectedResponse.answers : [];
                const mainAnswers = answers.filter((answer) => !answer.conditional);
                const conditionalAnswers = answers.filter((answer) => answer.conditional);

                const renderAnswerCard = (answer, keyPrefix) => {
                  const questionId =
                    answer.question?._id ||
                    answer.questionId?._id ||
                    answer.questionId ||
                    answer._id;
                  return (
                    <div key={`${keyPrefix}-${answer._id || questionId}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold">
                        {answer.displayLabel || answer.fieldLabel || answer.question?.label || "Question"}
                      </div>
                      {answer.displayContext ? (
                        <div className="mt-1 text-xs text-cyan-200/80">
                          {answer.displayContext}
                        </div>
                      ) : null}
                      <div className="mt-2 text-sm text-slate-300">
                        {renderAnswerValue(answer, {
                          revealed: Boolean(revealedSecrets[questionId]),
                          revealedValue: revealedSecrets[questionId],
                          onReveal: () => revealSecret(questionId),
                          onCopy: async () => {
                            const secret = revealedSecrets[questionId];
                            if (!secret) return;
                            await navigator.clipboard.writeText(secret);
                            toast.success("Secret copied");
                          },
                        })}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {mainAnswers.length > 0 && (
                      <section className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Submission Details
                        </div>
                        <div className="space-y-3">
                          {mainAnswers.map((answer) => renderAnswerCard(answer, "main"))}
                        </div>
                      </section>
                    )}

                    {conditionalAnswers.length > 0 && (
                      <section className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Conditional Answers
                        </div>
                        <div className="space-y-3">
                          {conditionalAnswers.map((answer) => renderAnswerCard(answer, "conditional"))}
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <DraftsPanel
        open={draftsOpen}
        onClose={() => setDraftsOpen(false)}
        drafts={drafts}
        moduleLabel="Form Builder"
        hasUnsavedChanges={false}
        titleResolver={(draftItem) =>
          draftItem.data?.title || draftItem.data?.emailTemplate?.headerTitle || "Untitled Form Draft"
        }
        summaryResolver={(draftItem) => {
          const questionCount = Array.isArray(draftItem.data?.questions)
            ? draftItem.data.questions.length
            : 0;
          const conditionalCount = Array.isArray(draftItem.data?.questions)
            ? draftItem.data.questions.reduce(
                (total, question) =>
                  total +
                  (Array.isArray(question?.conditionalFields)
                    ? question.conditionalFields.length
                    : 0),
                0,
              )
            : 0;
          return [
            draftItem.mode === "edit" ? "Editing form" : "New form",
            `${questionCount} questions`,
            `${conditionalCount} conditional fields`,
          ].join(" • ");
        }}
        onRestore={(draftItem) => {
          const nextData = {
            ...EMPTY_FORM,
            emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
            notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
            ...(draftItem.data || {}),
          };
          setSelectedFormId(nextData.selectedFormId || null);
          setDraft(nextData);
          setSlugTouched(Boolean(nextData.slug));
          setDraftsOpen(false);
        }}
        onDelete={(draftItem) => {
          removeDraft(draftItem.key);
        }}
      />
    </div>
  );
};

export default FormManagement;
