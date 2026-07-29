import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  exportAdminFormResponsesByFormat,
  getAdminFormExport,
  getAdminFormById,
  getAdminForms,
  getAdminFormResponse,
  getAdminFormResponses,
  importAdminFormFile,
  importAdminFormResponses,
  importAdminFormResponsesPreview,
  revealAdminFormResponseSecret,
  undoAdminFormResponseImport,
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
  { value: "time", label: "Time" },
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
  emailBodyBackgroundType: "color",
  emailBodyBackgroundImageUrl: "",
  emailBodyBackgroundImagePublicId: "",
  emailBodyBackgroundImageAsset: null,
  emailBodyBackgroundPosition: "center",
  emailBodyBackgroundSize: "cover",
  emailBodyOverlayColor: "#ffffff",
  emailBodyOverlayOpacity: 0.9,
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

  footerBackgroundType: "color",
  footerBackgroundColor: "#166534",
  footerBackgroundImageUrl: "",
  footerBackgroundImagePublicId: "",
  footerBackgroundImageAsset: null,
  footerBackgroundPosition: "center",
  footerBackgroundSize: "cover",
  footerOverlayColor: "#000000",
  footerOverlayOpacity: 0.45,
  footerMinHeight: 220,
  footerTextColor: "#ffffff",
  footerTextAlign: "left",

  submissionIntroText:
    "Thank you for completing this form. Please review your submitted information below.",
  footerButtons: [],
};

const EMAIL_TEMPLATE_IMAGE_FIELDS = {
  logoUrl: {
    assetField: "logoAsset",
    publicIdField: "",
    successMessage: "Email logo uploaded successfully",
  },

  bannerImageUrl: {
    assetField: "bannerImageAsset",
    publicIdField: "",
    successMessage: "Email banner uploaded successfully",
  },

  headerBackgroundImageUrl: {
    assetField: "headerBackgroundImageAsset",
    publicIdField: "headerBackgroundImagePublicId",
    successMessage: "Header background uploaded successfully",
  },

  emailBodyBackgroundImageUrl: {
    assetField: "emailBodyBackgroundImageAsset",
    publicIdField: "emailBodyBackgroundImagePublicId",
    successMessage: "Complete email background uploaded successfully",
  },

  footerBackgroundImageUrl: {
    assetField: "footerBackgroundImageAsset",
    publicIdField: "footerBackgroundImagePublicId",
    successMessage: "Footer background uploaded successfully",
  },
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

const DEFAULT_DECLARATION_SETTINGS = {
  enabled: false,
  text: "",
  required: true,
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
  declarationSettings: { ...DEFAULT_DECLARATION_SETTINGS },
  questions: [],
  sections: [],
};

const LEGACY_DEFAULT_SECTION_ID = "legacy-default-section";
const LEGACY_DEFAULT_SECTION_TITLE = "Form Details";

const createLegacySection = () => ({
  id: LEGACY_DEFAULT_SECTION_ID,
  title: LEGACY_DEFAULT_SECTION_TITLE,
  description: "",
  order: 0,
  isActive: true,
});

const createSection = (order = 0, overrides = {}) => ({
  id: overrides.id || crypto.randomUUID(),
  title: overrides.title || "Untitled Section",
  description: overrides.description || "",
  order,
  isActive: overrides.isActive !== false,
});

const normalizeSection = (section = {}, index = 0) => ({
  id:
    String(section.id || section.sectionId || section.key || "").trim() ||
    crypto.randomUUID(),
  title: (() => {
    const rawTitle = String(section.title || section.label || "");
    return rawTitle.trim() ? rawTitle : "Untitled Section";
  })(),
  description: String(section.description || section.helpText || ""),
  order: typeof section.order === "number" ? section.order : index,
  isActive: section.isActive !== false,
});

const normalizeSections = (sections = [], questions = []) => {
  const normalized = (Array.isArray(sections) ? sections : [])
    .map((section, index) => normalizeSection(section, index))
    .filter(
      (section, index, list) =>
        list.findIndex((item) => item.id === section.id) === index,
    )
    .sort((left, right) => left.order - right.order);

  if (normalized.length) {
    return normalized;
  }

  const sectionHints = (Array.isArray(questions) ? questions : [])
    .map((question) => ({
      id: String(question?.sectionId || "").trim(),
      title: String(question?.sectionTitle || "").trim(),
      description: String(question?.sectionDescription || "").trim(),
      order:
        typeof question?.sectionOrder === "number" ? question.sectionOrder : 0,
      isActive:
        question?.sectionIsActive !== undefined
          ? question.sectionIsActive === true
          : true,
    }))
    .filter((section) => section.id);

  const hasMeaningfulHints = sectionHints.some(
    (section) => section.id !== LEGACY_DEFAULT_SECTION_ID,
  );

  if (!hasMeaningfulHints) {
    return [createLegacySection()];
  }

  return sectionHints
    .filter(
      (section, index, list) =>
        list.findIndex((item) => item.id === section.id) === index,
    )
    .map((section, index) => ({
      id: section.id,
      title: section.title || LEGACY_DEFAULT_SECTION_TITLE,
      description: section.description || "",
      order: typeof section.order === "number" ? section.order : index,
      isActive: section.isActive !== false,
    }))
    .sort((left, right) => left.order - right.order);
};

const groupQuestionsBySection = (questions = [], sections = []) => {
  const normalizedSections = normalizeSections(sections, questions);
  const sectionMap = new Map(
    normalizedSections.map((section) => [
      section.id,
      { ...section, questions: [] },
    ]),
  );
  const defaultSection = sectionMap.get(LEGACY_DEFAULT_SECTION_ID) ||
    sectionMap.values().next().value || {
      ...createLegacySection(),
      questions: [],
    };

  if (!sectionMap.has(defaultSection.id)) {
    sectionMap.set(defaultSection.id, defaultSection);
  }

  (Array.isArray(questions) ? questions : [])
    .map((question, index) => normalizeQuestion(question, index))
    .forEach((question) => {
      const targetId = sectionMap.has(question.sectionId)
        ? question.sectionId
        : defaultSection.id;
      const section = sectionMap.get(targetId) || defaultSection;
      section.questions.push({
        ...question,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionDescription: section.description,
        sectionOrder: section.order,
        sectionIsActive: section.isActive,
      });
    });

  return Array.from(sectionMap.values())
    .map((section) => ({
      ...section,
      questions: (section.questions || []).sort((left, right) => {
        const leftOrder = typeof left.order === "number" ? left.order : 0;
        const rightOrder = typeof right.order === "number" ? right.order : 0;
        return (
          leftOrder - rightOrder ||
          String(left.id).localeCompare(String(right.id))
        );
      }),
    }))
    .sort((left, right) => left.order - right.order);
};

const createQuestion = () => ({
  id: crypto.randomUUID(),
  label: "Untitled question",
  type: "shortAnswer",
  placeholder: "",
  helpText: "",
  required: false,
  validationEnabled: false,
  allowUserToAddMore: false,
  options: [],
  conditionalFields: [],
  validation: normalizeNumberValidation(),
  order: 0,
  sectionId: LEGACY_DEFAULT_SECTION_ID,
  sectionTitle: LEGACY_DEFAULT_SECTION_TITLE,
  sectionDescription: "",
  sectionOrder: 0,
  sectionIsActive: true,
});

const createInitialFormStructure = () => {
  const section = createLegacySection();

  const question = {
    ...createQuestion(),
    sectionId: section.id,
    sectionTitle: section.title,
    sectionDescription: section.description,
    sectionOrder: section.order,
    sectionIsActive: section.isActive,
    order: 0,
  };

  return {
    sections: [section],
    questions: [question],
  };
};

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
  allowUserToAddMore: false,
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
    const current =
      visitor?.({ kind: "option", node: option, index }) || option;
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
        fields: mapConditionalFieldNodes(
          current?.conditionalLogic?.fields || [],
          visitor,
        ),
      },
    };
  });

const mapQuestionConditionalTree = (question, visitor) => ({
  ...question,
  options: mapConditionalOptionNodes(question.options || [], visitor),
  conditionalFields: mapConditionalFieldNodes(
    question.conditionalFields || [],
    visitor,
  ),
});

const cloneConditionalTree = (question) =>
  mapQuestionConditionalTree(question, (entry) => {
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
  allowUserToAddMore: question.allowUserToAddMore === true,
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
  const titleStyle = normalizeTypographyStyle(
    form.titleStyle,
    DEFAULT_TITLE_STYLE,
  );
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

  label:
    field.label !== undefined && field.label !== null
      ? String(field.label)
      : field.title !== undefined && field.title !== null
        ? String(field.title)
        : "Untitled field",

  type: String(field.type || "shortAnswer"),

  placeholder:
    field.placeholder !== undefined && field.placeholder !== null
      ? String(field.placeholder)
      : "",

  helpText:
    field.helpText !== undefined && field.helpText !== null
      ? String(field.helpText)
      : field.description !== undefined && field.description !== null
        ? String(field.description)
        : "",
  required: field.required === true,
  validationEnabled: field.validationEnabled === true,
  allowUserToAddMore: field.allowUserToAddMore === true,
  validation: normalizeConditionalValidation(field.validation),
  options: Array.isArray(field.options)
    ? field.options.map((option, optionIndex) =>
        typeof option === "string"
          ? createQuestionOption(option, optionIndex)
          : {
              id: String(option.id || crypto.randomUUID()),
              label:
                option.label !== undefined && option.label !== null
                  ? String(option.label)
                  : option.value !== undefined && option.value !== null
                    ? String(option.value)
                    : "",

              value:
                option.value !== undefined && option.value !== null
                  ? String(option.value)
                  : option.label !== undefined && option.label !== null
                    ? String(option.label)
                    : "",
              order:
                typeof option.order === "number" ? option.order : optionIndex,
              conditionalLogic: {
                enabled: option.conditionalLogic?.enabled === true,
                resetOnHide: option.conditionalLogic?.resetOnHide !== false,
                fields: Array.isArray(option.conditionalLogic?.fields)
                  ? option.conditionalLogic.fields.map(
                      (fieldItem, fieldIndex) =>
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
      Number.isInteger(field.uploadConfig?.maxFiles) &&
      field.uploadConfig.maxFiles > 0
        ? field.uploadConfig.maxFiles
        : 1,
    maxFileSize: Number.isFinite(Number(field.uploadConfig?.maxFileSize))
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
  (Array.isArray(question.options) ? question.options : []).map(
    (option, index) => {
      if (typeof option === "string") {
        return createQuestionOption(option, index);
      }

      return {
        id: String(option.id || option.optionId || crypto.randomUUID()),

        label:
          option.label !== undefined && option.label !== null
            ? String(option.label)
            : option.value !== undefined && option.value !== null
              ? String(option.value)
              : `Option ${index + 1}`,

        value:
          option.value !== undefined && option.value !== null
            ? String(option.value)
            : option.label !== undefined && option.label !== null
              ? String(option.label)
              : `option-${index + 1}`,

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
      };
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

const resolveEmailTemplateImageUrl = (url, asset) => {
  const rawValue =
    url || asset?.secureUrl || asset?.secure_url || asset?.url || "";

  return normalizeHttpsUrl(rawValue);
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
    resourceType:
      String(asset.resourceType || asset.resource_type || "image").trim() ||
      "image",
    format: String(asset.format || "").trim(),
    originalName: String(
      asset.originalName || asset.originalFilename || "",
    ).trim(),
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
    source.headerBackgroundImageAsset ??
      legacy.emailTemplate?.headerBackgroundImageAsset ??
      null,
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
  const emailBodyBackgroundImageAsset = toAssetPayload(
    source.emailBodyBackgroundImageAsset ??
      legacy.emailTemplate?.emailBodyBackgroundImageAsset ??
      null,
    source.emailBodyBackgroundImageUrl ??
      legacy.emailTemplate?.emailBodyBackgroundImageUrl ??
      "",
  );

  const emailBodyBackgroundImageUrl = normalizeHttpsUrl(
    source.emailBodyBackgroundImageUrl ??
      legacy.emailTemplate?.emailBodyBackgroundImageUrl ??
      emailBodyBackgroundImageAsset?.secureUrl ??
      emailBodyBackgroundImageAsset?.url ??
      "",
  );
  const emailBodyBackgroundType = normalizeChoice(
    source.emailBodyBackgroundType ??
      legacy.emailTemplate?.emailBodyBackgroundType ??
      "",
    ["color", "image"],
    emailBodyBackgroundImageUrl ? "image" : "color",
  );

  const footerBackgroundImageAsset = toAssetPayload(
    source.footerBackgroundImageAsset ??
      legacy.emailTemplate?.footerBackgroundImageAsset ??
      null,
    source.footerBackgroundImageUrl ??
      legacy.emailTemplate?.footerBackgroundImageUrl ??
      "",
  );

  const footerBackgroundImageUrl = normalizeHttpsUrl(
    source.footerBackgroundImageUrl ??
      legacy.emailTemplate?.footerBackgroundImageUrl ??
      footerBackgroundImageAsset?.secureUrl ??
      footerBackgroundImageAsset?.url ??
      "",
  );

  const footerBackgroundType = normalizeChoice(
    source.footerBackgroundType ??
      legacy.emailTemplate?.footerBackgroundType ??
      "",
    ["color", "image"],
    footerBackgroundImageUrl ? "image" : "color",
  );
  return {
    preset:
      source.preset ||
      legacy.emailTemplate?.preset ||
      DEFAULT_EMAIL_TEMPLATE.preset,
    headerTitle:
      source.headerTitle ??
      legacy.emailTemplate?.headerTitle ??
      DEFAULT_EMAIL_TEMPLATE.headerTitle,
    headerSubtitle:
      source.headerSubtitle ??
      legacy.emailTemplate?.headerSubtitle ??
      DEFAULT_EMAIL_TEMPLATE.headerSubtitle,
    successMessage:
      source.successMessage ??
      legacy.emailTemplate?.successMessage ??
      legacy.successMessage ??
      DEFAULT_EMAIL_TEMPLATE.successMessage,
    footerText:
      source.footerText ??
      legacy.emailTemplate?.footerText ??
      DEFAULT_EMAIL_TEMPLATE.footerText,
    footerBackgroundType,

    footerBackgroundColor:
      source.footerBackgroundColor ??
      legacy.emailTemplate?.footerBackgroundColor ??
      DEFAULT_EMAIL_TEMPLATE.footerBackgroundColor,

    footerBackgroundImageUrl,

    footerBackgroundImagePublicId: toTrimmed(
      source.footerBackgroundImagePublicId ??
        legacy.emailTemplate?.footerBackgroundImagePublicId ??
        footerBackgroundImageAsset?.publicId ??
        "",
    ),

    footerBackgroundPosition: normalizeChoice(
      source.footerBackgroundPosition ??
        legacy.emailTemplate?.footerBackgroundPosition ??
        DEFAULT_EMAIL_TEMPLATE.footerBackgroundPosition,
      ["center", "top", "bottom", "left", "right"],
      DEFAULT_EMAIL_TEMPLATE.footerBackgroundPosition,
    ),

    footerBackgroundSize: normalizeChoice(
      source.footerBackgroundSize ??
        legacy.emailTemplate?.footerBackgroundSize ??
        DEFAULT_EMAIL_TEMPLATE.footerBackgroundSize,
      ["cover", "contain", "auto"],
      DEFAULT_EMAIL_TEMPLATE.footerBackgroundSize,
    ),

    footerOverlayColor: toTrimmed(
      source.footerOverlayColor ??
        legacy.emailTemplate?.footerOverlayColor ??
        DEFAULT_EMAIL_TEMPLATE.footerOverlayColor,
    ),

    footerOverlayOpacity: clampOpacity(
      source.footerOverlayOpacity ??
        legacy.emailTemplate?.footerOverlayOpacity ??
        DEFAULT_EMAIL_TEMPLATE.footerOverlayOpacity,
      DEFAULT_EMAIL_TEMPLATE.footerOverlayOpacity,
    ),

    footerMinHeight: clampMinHeight(
      source.footerMinHeight ??
        legacy.emailTemplate?.footerMinHeight ??
        legacy.footerMinHeight ??
        DEFAULT_EMAIL_TEMPLATE.footerMinHeight,
      DEFAULT_EMAIL_TEMPLATE.footerMinHeight,
    ),

    footerTextColor: toTrimmed(
      source.footerTextColor ??
        legacy.emailTemplate?.footerTextColor ??
        DEFAULT_EMAIL_TEMPLATE.footerTextColor,
    ),

    footerTextAlign: normalizeChoice(
      source.footerTextAlign ??
        legacy.emailTemplate?.footerTextAlign ??
        DEFAULT_EMAIL_TEMPLATE.footerTextAlign,
      ["left", "center", "right"],
      DEFAULT_EMAIL_TEMPLATE.footerTextAlign,
    ),

    submissionIntroText:
      source.submissionIntroText ??
      legacy.emailTemplate?.submissionIntroText ??
      DEFAULT_EMAIL_TEMPLATE.submissionIntroText,
    companyName:
      source.companyName ??
      legacy.emailTemplate?.companyName ??
      legacy.companyName ??
      DEFAULT_EMAIL_TEMPLATE.companyName,
    websiteButtonText:
      source.websiteButtonText ??
      legacy.emailTemplate?.websiteButtonText ??
      DEFAULT_EMAIL_TEMPLATE.websiteButtonText,
    websiteButtonUrl:
      source.websiteButtonUrl ??
      legacy.emailTemplate?.websiteButtonUrl ??
      DEFAULT_EMAIL_TEMPLATE.websiteButtonUrl,
    headerBackgroundColor:
      source.headerBackgroundColor ??
      legacy.emailTemplate?.headerBackgroundColor ??
      DEFAULT_EMAIL_TEMPLATE.headerBackgroundColor,
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
      source.bodyBackgroundColor ??
      legacy.emailTemplate?.bodyBackgroundColor ??
      DEFAULT_EMAIL_TEMPLATE.bodyBackgroundColor,
    emailBodyBackgroundType,
    emailBodyBackgroundImageUrl,

    emailBodyBackgroundImagePublicId: toTrimmed(
      source.emailBodyBackgroundImagePublicId ??
        legacy.emailTemplate?.emailBodyBackgroundImagePublicId ??
        emailBodyBackgroundImageAsset?.publicId ??
        "",
    ),

    emailBodyBackgroundPosition: normalizeChoice(
      source.emailBodyBackgroundPosition ??
        legacy.emailTemplate?.emailBodyBackgroundPosition ??
        DEFAULT_EMAIL_TEMPLATE.emailBodyBackgroundPosition,
      ["center", "top", "bottom", "left", "right"],
      DEFAULT_EMAIL_TEMPLATE.emailBodyBackgroundPosition,
    ),

    emailBodyBackgroundSize: normalizeChoice(
      source.emailBodyBackgroundSize ??
        legacy.emailTemplate?.emailBodyBackgroundSize ??
        DEFAULT_EMAIL_TEMPLATE.emailBodyBackgroundSize,
      ["cover", "contain", "auto"],
      DEFAULT_EMAIL_TEMPLATE.emailBodyBackgroundSize,
    ),

    emailBodyOverlayColor: toTrimmed(
      source.emailBodyOverlayColor ??
        legacy.emailTemplate?.emailBodyOverlayColor ??
        DEFAULT_EMAIL_TEMPLATE.emailBodyOverlayColor,
    ),

    emailBodyOverlayOpacity: clampOpacity(
      source.emailBodyOverlayOpacity ??
        legacy.emailTemplate?.emailBodyOverlayOpacity ??
        DEFAULT_EMAIL_TEMPLATE.emailBodyOverlayOpacity,
      DEFAULT_EMAIL_TEMPLATE.emailBodyOverlayOpacity,
    ),
    cardBackgroundColor:
      source.cardBackgroundColor ??
      legacy.emailTemplate?.cardBackgroundColor ??
      DEFAULT_EMAIL_TEMPLATE.cardBackgroundColor,
    accentColor:
      source.accentColor ??
      legacy.emailTemplate?.accentColor ??
      DEFAULT_EMAIL_TEMPLATE.accentColor,
    textColor:
      source.textColor ??
      legacy.emailTemplate?.textColor ??
      DEFAULT_EMAIL_TEMPLATE.textColor,
    buttonColor:
      source.buttonColor ??
      legacy.emailTemplate?.buttonColor ??
      DEFAULT_EMAIL_TEMPLATE.buttonColor,
    borderRadius:
      source.borderRadius ??
      legacy.emailTemplate?.borderRadius ??
      DEFAULT_EMAIL_TEMPLATE.borderRadius,
    logoUrl:
      source.logoUrl ?? legacy.logoUrl ?? legacy.emailTemplate?.logoUrl ?? "",
    logoAsset:
      source.logoAsset ??
      legacy.logoAsset ??
      legacy.emailTemplate?.logoAsset ??
      null,
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
    emailBodyBackgroundImageAsset,
    footerBackgroundImageAsset,

    footerButtons: normalizeFooterButtons(
      source.footerButtons ??
        legacy.emailTemplate?.footerButtons ??
        (legacy.websiteButtonText && legacy.websiteButtonUrl
          ? [
              {
                text: legacy.websiteButtonText,
                url: legacy.websiteButtonUrl,
              },
            ]
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
      source.telegramChatId ??
      legacy.notificationSettings?.telegramChatId ??
      "",
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
  const preset =
    EMAIL_TEMPLATE_PRESETS[presetKey] || EMAIL_TEMPLATE_PRESETS.custom;
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
    return replacement === undefined || replacement === null
      ? ""
      : String(replacement);
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

  const headerTitle =
    interpolateTemplateText(resolved.headerTitle, context) || context.formName;
  const headerSubtitle =
    interpolateTemplateText(resolved.headerSubtitle, context) ||
    "Thank you for your submission";
  const successMessage =
    interpolateTemplateText(resolved.successMessage, context) ||
    "Thank you for your response.";
  const footerText = interpolateTemplateText(resolved.footerText, context);
  const buttonText =
    interpolateTemplateText(resolved.websiteButtonText, context) ||
    "Visit Website";
  const buttonUrl =
    interpolateTemplateText(resolved.websiteButtonUrl, context) ||
    "https://example.com";
  const footerButtons = Array.isArray(resolved.footerButtons)
    ? resolved.footerButtons
        .map((button, index) => ({
          id: button.id || `footer-button-${index}`,
          text: interpolateTemplateText(button.text, context).trim(),
          url: normalizeHttpUrl(interpolateTemplateText(button.url, context)),
          order: typeof button.order === "number" ? button.order : index,
        }))
        .filter((button) => button.text && button.url)
    : [];
  const bannerUrl =
    resolved.bannerImageAsset ||
    resolved.bannerUrl ||
    resolved.bannerImage ||
    resolved.bannerImageUrl ||
    "";
  const logoUrl = resolved.logoAsset || resolved.logoUrl || "";
  const headerBackgroundImageUrl = resolveEmailTemplateImageUrl(
    resolved.headerBackgroundImageUrl,
    resolved.headerBackgroundImageAsset,
  );

  const emailBodyBackgroundImageUrl = resolveEmailTemplateImageUrl(
    resolved.emailBodyBackgroundImageUrl,
    resolved.emailBodyBackgroundImageAsset,
  );

  const footerBackgroundImageUrl = resolveEmailTemplateImageUrl(
    resolved.footerBackgroundImageUrl,
    resolved.footerBackgroundImageAsset,
  );

  const submissionIntroText = interpolateTemplateText(
    resolved.submissionIntroText,
    context,
  );
  const footerSectionHeight = Math.max(
    Number(resolved.headerMinHeight) || 220,
    Number(resolved.footerMinHeight) || 220,
  );
  const tableRows = [
    { question: "Full Name", answer: "John Doe" },
    { question: "Email", answer: "john@example.com" },
    { question: "Phone", answer: "+91 98765 43210" },
  ];

  return {
    resolved,
    headerBackgroundType:
      resolved.headerBackgroundType === "image" && headerBackgroundImageUrl
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
    emailBodyBackgroundType: resolved.emailBodyBackgroundType || "color",
    emailBodyBackgroundImageUrl,

    emailBodyBackgroundPosition:
      resolved.emailBodyBackgroundPosition || "center",

    emailBodyBackgroundSize: resolved.emailBodyBackgroundSize || "cover",

    emailBodyOverlayColor: resolved.emailBodyOverlayColor || "#ffffff",

    emailBodyOverlayOpacity: Number.isFinite(
      Number(resolved.emailBodyOverlayOpacity),
    )
      ? Math.min(1, Math.max(0, Number(resolved.emailBodyOverlayOpacity)))
      : 0.9,

    footerBackgroundColor:
      resolved.footerBackgroundColor ||
      resolved.headerBackgroundColor ||
      "#166534",

    footerBackgroundImageUrl,

    footerBackgroundPosition: resolved.footerBackgroundPosition || "center",

    footerBackgroundSize: resolved.footerBackgroundSize || "cover",

    footerOverlayColor: resolved.footerOverlayColor || "#000000",

    footerOverlayOpacity: Number.isFinite(Number(resolved.footerOverlayOpacity))
      ? Math.min(1, Math.max(0, Number(resolved.footerOverlayOpacity)))
      : 0.45,

    footerMinHeight: Number(resolved.footerMinHeight) || 220,
    footerSectionHeight,

    footerTextColor: resolved.footerTextColor || "#ffffff",

    footerTextAlign: resolved.footerTextAlign || "left",
    footerBackgroundType:
      resolved.footerBackgroundType === "image" && footerBackgroundImageUrl
        ? "image"
        : "color",

    submissionIntroText,
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
  sectionId:
    String(question.sectionId || question.section?.id || "").trim() ||
    LEGACY_DEFAULT_SECTION_ID,
  sectionTitle:
    String(question.sectionTitle || question.section?.title || "").trim() ||
    LEGACY_DEFAULT_SECTION_TITLE,
  sectionDescription: String(
    question.sectionDescription || question.section?.description || "",
  ).trim(),
  sectionOrder:
    typeof question.sectionOrder === "number"
      ? question.sectionOrder
      : typeof question.section?.order === "number"
        ? question.section.order
        : 0,
  sectionIsActive:
    question.sectionIsActive !== undefined
      ? question.sectionIsActive === true
      : question.section?.isActive !== false,
  label: question.label || "",
  type: question.type || "shortAnswer",
  placeholder: question.placeholder || "",
  helpText: question.helpText || "",
  required: question.required === true,
  validationEnabled: question.validationEnabled === true,
  allowUserToAddMore: question.allowUserToAddMore === true,
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
  logoAsset: form?.logoAsset || form?.emailTemplate?.logoAsset || null,
  emailTemplate: normalizeEmailTemplate(form?.emailTemplate, form),
  notificationSettings: normalizeNotificationSettings(
    form?.notificationSettings,
    form,
  ),
  declarationSettings: {
    ...DEFAULT_DECLARATION_SETTINGS,
    ...(form?.declarationSettings || {}),
    enabled: form?.declarationSettings?.enabled === true,
    text: String(form?.declarationSettings?.text || "").trim(),
    required: form?.declarationSettings?.required !== false,
  },
  sections: normalizeSections(form?.sections || [], form?.questions || []),
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
      const label =
        answer.displayLabel ||
        answer.fieldLabel ||
        answer.question?.label ||
        "";
      const context = answer.displayContext || answer.parentOptionLabel || "";
      if (answer.fileName)
        return [label, context, answer.fileName, answer.fileUrl || ""];
      if (Array.isArray(answer.value)) return [label, context, ...answer.value];
      return [label, context, answer.value ?? ""];
    }),
  ]
    .join(" ")
    .toLowerCase();
};

const maskSecretValue = () =>
  "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

const getLinkHref = (value = "") => normalizeHttpUrl(value);

const formatTimeTo12Hour = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return raw || "-";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return raw;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
};

const renderAnswerValue = (answer, options = {}) => {
  if (!answer) return "-";
  const answerType = String(
    answer.fieldType ||
      answer.questionType ||
      answer.type ||
      answer.question?.type ||
      "",
  ).toLowerCase();

  if (answerType === "time") {
    return (
      <span className="font-semibold text-cyan-200">
        {formatTimeTo12Hour(answer.value)}
      </span>
    );
  }

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
    if (
      /^image\//i.test(String(answer.fileType || "")) ||
      answerType === "imageupload"
    ) {
      return (
        <div className="space-y-2">
          <a
            href={answer.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl border border-white/10"
          >
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
            <span className="break-all">
              {answer.fileName || answer.fileUrl}
            </span>
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
        <p className="text-xs text-slate-400">
          Secret auto-hides after 30 seconds.
        </p>
      </div>
    ) : (
      <div className="flex flex-wrap items-center gap-3">
        <span className="tracking-[0.35em] text-slate-300">
          {maskSecretValue()}
        </span>
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
  const [draft, setDraft] = useState(() => {
    const initialStructure = createInitialFormStructure();

    return {
      ...EMPTY_FORM,
      ...initialStructure,
      emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
      notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
    };
  });
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [responsesTab, setResponsesTab] = useState("list");
  const [responseSearch, setResponseSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState("all");
  const [responseSourceFilter, setResponseSourceFilter] = useState("all");
  const [responseDateFrom, setResponseDateFrom] = useState("");
  const [responseDateTo, setResponseDateTo] = useState("");
  const [exportingFormId, setExportingFormId] = useState(null);
  const [responseExportModalOpen, setResponseExportModalOpen] =
    useState(false);
  const [responseExportFormat, setResponseExportFormat] = useState("csv");
  const [responseImportModalOpen, setResponseImportModalOpen] =
    useState(false);
  const [responseImportFile, setResponseImportFile] = useState(null);
  const [responseImportPreview, setResponseImportPreview] = useState(null);
  const [responseImportMappings, setResponseImportMappings] = useState([]);
  const [responseImportDuplicateStrategy, setResponseImportDuplicateStrategy] =
    useState("skip");
  const [responseImportDuplicateField, setResponseImportDuplicateField] =
    useState("email");
  const [responseImportLoading, setResponseImportLoading] = useState(false);
  const [responseImportProgress, setResponseImportProgress] = useState(0);
  const [responseImportSummary, setResponseImportSummary] = useState(null);
  const [responseImportErrorRows, setResponseImportErrorRows] = useState([]);
  const [responseImportBatchId, setResponseImportBatchId] = useState("");
  const responseImportInputRef = useRef(null);
  const [analysisLeadFilter, setAnalysisLeadFilter] = useState("all");
  const [analysisRatingFilter, setAnalysisRatingFilter] = useState("all");
  const [analysisInterestFilter, setAnalysisInterestFilter] = useState("all");
  const [analysisAvailabilityFilter, setAnalysisAvailabilityFilter] =
    useState("all");
  const [analysisEmailFilter, setAnalysisEmailFilter] = useState("all");
  const [analysisPhoneFilter, setAnalysisPhoneFilter] = useState("all");
  const [expandedConditionalPanels, setExpandedConditionalPanels] = useState(
    {},
  );
  const lastSavedFormRef = useRef(null);
  const [lastSavedFormSnapshot, setLastSavedFormSnapshot] = useState(null);
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
  const emailBodyBackgroundInputRef = useRef(null);
  const emailFooterBackgroundInputRef = useRef(null);
  const [uploadingEmailTemplateField, setUploadingEmailTemplateField] =
    useState("");
  const [formLogoPreviewFailed, setFormLogoPreviewFailed] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [bannerPreviewFailed, setBannerPreviewFailed] = useState(false);
  const [headerBackgroundPreviewFailed, setHeaderBackgroundPreviewFailed] =
    useState(false);
  const [bodyBackgroundPreviewFailed, setBodyBackgroundPreviewFailed] =
    useState(false);

  const [, setFooterBackgroundPreviewFailed] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [draftKey, setDraftKey] = useState(
    () =>
      findLatestDraftKeyForModule(draftUserId, "form-builder") ||
      buildDraftKey({
        module: "form-builder",
        mode: "create",
        recordId: "new",
        userId: draftUserId,
      }),
  );
  const recoveryHandledRef = useRef(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const draftState = useMemo(
    () => ({
      ...draft,
      selectedFormId,
    }),
    [draft, selectedFormId],
  );
  const hasMeaningfulCreateDraft = useMemo(() => {
    const title = String(draft.title || "").trim();
    const description = String(draft.description || "").trim();

    const hasQuestionChanges = Array.isArray(draft.questions)
      ? draft.questions.some((question) => {
          const label = String(question?.label || "").trim();

          return label && label !== "Untitled question";
        })
      : false;

    return Boolean(title || description || hasQuestionChanges);
  }, [draft]);

  const hasEditDraftChanges = useMemo(() => {
    if (!selectedFormId || !lastSavedFormSnapshot) {
      return false;
    }

    const currentValue = {
      ...draft,
      selectedFormId,
    };

    const savedValue = {
      ...lastSavedFormSnapshot,
      selectedFormId,
    };

    return JSON.stringify(currentValue) !== JSON.stringify(savedValue);
  }, [draft, selectedFormId, lastSavedFormSnapshot]);

  const shouldAutoSaveDraft = selectedFormId
    ? hasEditDraftChanges
    : hasMeaningfulCreateDraft;
  const draftSections = useMemo(
    () => groupQuestionsBySection(draft.questions, draft.sections),
    [draft.questions, draft.sections],
  );
  const { draftStatus, draftError } = useAutoDraft({
    key: draftKey,
    data: draftState,
    enabled: shouldAutoSaveDraft,
    module: "form-builder",
    mode: selectedFormId ? "edit" : "create",
    recordId: selectedFormId || "new",
    userId: draftUserId,
  });
  const { drafts, count, removeDraft, refreshDrafts } = useModuleDrafts({
    module: "form-builder",
    userId: draftUserId,
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
    const timeoutId = window.setTimeout(() => {
      void loadForms();
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
    setResponseExportModalOpen(false);
    setResponseImportModalOpen(false);
    setResponseImportFile(null);
    setResponseImportPreview(null);
    setResponseImportMappings([]);
    setResponseImportSummary(null);
    setResponseImportErrorRows([]);
    setResponseImportBatchId("");
    setResponseImportProgress(0);
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
      setLastSavedFormSnapshot(normalized);
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
    setResponseExportModalOpen(false);
    setResponseImportModalOpen(false);
    setResponseImportFile(null);
    setResponseImportPreview(null);
    setResponseImportMappings([]);
    setResponseImportSummary(null);
    setResponseImportErrorRows([]);
    setResponseImportBatchId("");
    setResponseImportProgress(0);
    setCollapsedSections({});
    draftResolutionRef.current = null;
    const initialStructure = createInitialFormStructure();

    setDraft({
      ...EMPTY_FORM,
      ...initialStructure,
      emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
      notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
    });
    lastSavedFormRef.current = null;
    setLastSavedFormSnapshot(null);
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
      titleStyle: {
        ...DEFAULT_TITLE_STYLE,
        ...(prev.titleStyle || {}),
        [field]: value,
      },
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

  const uploadWithTimeout = async (
    promise,
    timeoutMessage = "Upload timed out. Please try again.",
  ) => {
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

  const buildUploadedAsset = (
    uploadData = {},
    file = null,
    defaultFolder = "",
  ) => {
    const secureUrl =
      uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
    return {
      provider: uploadData.provider || "cloudinary",
      url: uploadData.url || secureUrl,
      secureUrl,
      publicId: uploadData.publicId || uploadData.public_id || "",
      resourceType:
        uploadData.resourceType || uploadData.resource_type || "image",
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

  const deleteAssetIfExists = async (asset) => {
    const publicId = getAssetPublicId(asset);
    if (!publicId) return;

    try {
      await deleteCloudinaryAsset({
        publicId,
        resourceType: asset?.resourceType || "image",
      });
    } catch (error) {
      console.warn("Failed to delete Cloudinary asset:", error.message);
    }
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
      buttons.push({
        id: crypto.randomUUID(),
        text: "",
        url: "",
        order: buttons.length,
      });
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
      const buttons = normalizeEditableFooterButtons(
        prev.emailTemplate,
        prev,
      ).filter((_, currentIndex) => currentIndex !== index);
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
              ...(field === "type" &&
              ["dropdown", "radio", "checkbox"].includes(value) &&
              !(question.options || []).length
                ? {
                    options: [
                      createQuestionOption("Option 1", 0),
                      createQuestionOption("Option 2", 1),
                    ],
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
                createQuestionOption(
                  `Option ${(question.options || []).length + 1}`,
                ),
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
        const options = (question.options || []).filter(
          (option) => option.id !== optionId,
        );
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
          if (entry.kind !== "option" || entry.node.id !== optionId)
            return entry.node;
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

  const updateConditionalField = (
    questionIndex,
    optionId,
    fieldId,
    key,
    value,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId)
            return entry.node;
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

  const updateConditionalFieldOption = (
    questionIndex,
    optionId,
    fieldId,
    fieldOptionId,
    fieldName,
    value,
  ) => {
    setDraft((prev) => ({
      ...prev,

      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) {
          return question;
        }

        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "option" || entry.node.id !== fieldOptionId) {
            return entry.node;
          }

          return {
            ...entry.node,
            [fieldName]: value,
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
          if (entry.kind !== "field" || entry.node.id !== fieldId)
            return entry.node;
          const fieldOptions = Array.isArray(entry.node.options)
            ? [...entry.node.options]
            : [];
          fieldOptions.push(
            createConditionalFieldOption("", fieldOptions.length),
          );
          return {
            ...entry.node,
            options: fieldOptions,
          };
        });
      }),
    }));
  };

  const moveConditionalFieldOption = (
    questionIndex,
    optionId,
    fieldId,
    fieldOptionId,
    direction,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId)
            return entry.node;
          const fieldOptions = Array.isArray(entry.node.options)
            ? [...entry.node.options]
            : [];
          const currentIndexInField = fieldOptions.findIndex(
            (item) => item.id === fieldOptionId,
          );
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

  const removeConditionalFieldOption = (
    questionIndex,
    optionId,
    fieldId,
    fieldOptionId,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;
        return mapQuestionConditionalTree(question, (entry) => {
          if (entry.kind !== "field" || entry.node.id !== fieldId)
            return entry.node;
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
          const optionNestedError = inspectFields(
            option?.conditionalLogic?.fields || [],
          );
          if (optionNestedError) {
            return optionNestedError;
          }
        }
      }

      return "";
    };

    for (const question of questions) {
      const questionOptions = Array.isArray(question.options)
        ? question.options
        : [];
      for (const option of questionOptions) {
        const error = inspectFields(option?.conditionalLogic?.fields || []);
        if (error) {
          return error;
        }
      }

      const directConditionalError = inspectFields(
        question.conditionalFields || [],
      );
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
          const fields = (option.conditionalLogic?.fields || []).filter(
            (field) => field.id !== fieldId,
          );
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
    const previousAsset = draft.logoAsset;

    if (!file) {
      if (formLogoInputRef.current) {
        formLogoInputRef.current.value = "";
      }
      deleteAssetIfExists(previousAsset);
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
        const imageUrl =
          uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        updateDraft("logoUrl", imageUrl);
        updateDraft(
          "logoAsset",
          buildUploadedAsset(
            uploadData,
            file,
            "technosthan/form-builder/email-assets/logos",
          ),
        );
        await deleteAssetIfExists(previousAsset);
        setFormLogoPreviewFailed(false);
        registerSessionAsset(
          uploadData.asset ||
            buildUploadedAsset(
              uploadData,
              file,
              "technosthan/form-builder/email-assets/logos",
            ),
        );
        toast.success("Form logo uploaded successfully");
      } catch (error) {
        const uploadErrorMessage =
          error.response?.status === 413
            ? IMAGE_SIZE_LIMIT_MESSAGE
            : error.response?.data?.message ||
              error.message ||
              "Failed to upload image";
        toast.error(uploadErrorMessage);
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
    const previousAsset = draft.bannerImageAsset;

    if (!file) {
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
      deleteAssetIfExists(previousAsset);
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
        const response = await uploadWithTimeout(
          uploadFormBannerImage(formData),
        );
        const uploadData = response.data?.data || {};
        const imageUrl =
          uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
        updateDraft("bannerImage", imageUrl);
        updateDraft("bannerImageUrl", imageUrl);
        updateDraft(
          "bannerImageAsset",
          buildUploadedAsset(
            uploadData,
            file,
            "technosthan/form-builder/email-assets/banners",
          ),
        );
        await deleteAssetIfExists(previousAsset);
        registerSessionAsset(
          uploadData.asset ||
            buildUploadedAsset(
              uploadData,
              file,
              "technosthan/form-builder/email-assets/banners",
            ),
        );
        toast.success("Form image uploaded successfully");
      } catch (error) {
        const uploadErrorMessage =
          error.response?.status === 413
            ? IMAGE_SIZE_LIMIT_MESSAGE
            : error.response?.data?.message ||
              error.message ||
              "Failed to upload image";
        toast.error(uploadErrorMessage);
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
    if (!file) return;

    const config = EMAIL_TEMPLATE_IMAGE_FIELDS[field];
    const previousAsset = config
      ? normalizeEmailTemplate(draft.emailTemplate, draft)[config.assetField]
      : null;

    if (!config) {
      toast.error("Unsupported email template image field");
      return;
    }

    if (!file.type?.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(IMAGE_SIZE_LIMIT_MESSAGE);
      return;
    }

    const upload = async () => {
      setUploadingEmailTemplateField(field);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await uploadWithTimeout(
          uploadFormBannerImage(formData),
        );

        const uploadData = response?.data?.data || response?.data || {};

        const secureUrl =
          uploadData.secureUrl || uploadData.secure_url || uploadData.url || "";

        if (!secureUrl) {
          throw new Error("Image uploaded, but image URL was not returned.");
        }

        const uploadedAsset = buildUploadedAsset(
          uploadData,
          file,
          "form-email-template",
        );

        setDraft((prev) => {
          const currentTemplate = normalizeEmailTemplate(
            prev.emailTemplate,
            prev,
          );

          return {
            ...prev,

            emailTemplate: {
              ...currentTemplate,

              [field]: secureUrl,

              [config.assetField]: uploadedAsset,

              ...(config.publicIdField
                ? {
                    [config.publicIdField]: uploadedAsset.publicId || "",
                  }
                : {}),

              ...(field === "headerBackgroundImageUrl"
                ? {
                    headerBackgroundType: "image",
                  }
                : {}),

              ...(field === "footerBackgroundImageUrl"
                ? {
                    footerBackgroundType: "image",
                  }
                : {}),
            },
          };
        });

        await deleteAssetIfExists(previousAsset);

        if (field === "logoUrl") {
          setLogoPreviewFailed(false);
        }

        if (field === "bannerImageUrl") {
          setBannerPreviewFailed(false);
        }

        if (field === "headerBackgroundImageUrl") {
          setHeaderBackgroundPreviewFailed(false);
        }

        if (field === "emailBodyBackgroundImageUrl") {
          setBodyBackgroundPreviewFailed(false);
        }

        if (field === "footerBackgroundImageUrl") {
          setFooterBackgroundPreviewFailed(false);
        }

        toast.success(config.successMessage);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to upload image",
        );
      } finally {
        setUploadingEmailTemplateField("");

        const inputRefs = {
          logoUrl: emailLogoInputRef,
          bannerImageUrl: emailBannerInputRef,
          headerBackgroundImageUrl: emailHeaderBackgroundInputRef,
          emailBodyBackgroundImageUrl: emailBodyBackgroundInputRef,
          footerBackgroundImageUrl: emailFooterBackgroundInputRef,
        };

        const inputRef = inputRefs[field];

        if (inputRef?.current) {
          inputRef.current.value = "";
        }
      }
    };

    upload();
  };

  const clearEmailTemplateImage = async (field) => {
    const config = EMAIL_TEMPLATE_IMAGE_FIELDS[field];

    if (!config) {
      toast.error("Unsupported email template image field");
      return;
    }

    const currentTemplate = normalizeEmailTemplate(draft.emailTemplate, draft);

    const currentAsset = currentTemplate[config.assetField];

    const publicId =
      currentAsset?.publicId ||
      currentAsset?.public_id ||
      (config.publicIdField ? currentTemplate[config.publicIdField] : "") ||
      "";

    if (publicId) {
      try {
        await deleteCloudinaryAsset(publicId);
      } catch (error) {
        console.error("Failed to delete Cloudinary email image:", error);
      }
    }

    setDraft((prev) => {
      const current = normalizeEmailTemplate(prev.emailTemplate, prev);

      return {
        ...prev,

        emailTemplate: {
          ...current,

          [field]: "",
          [config.assetField]: null,

          ...(config.publicIdField
            ? {
                [config.publicIdField]: "",
              }
            : {}),

          ...(field === "headerBackgroundImageUrl"
            ? {
                headerBackgroundType: "color",
              }
            : {}),

          ...(field === "footerBackgroundImageUrl"
            ? {
                footerBackgroundType: "color",
              }
            : {}),
        },
      };
    });

    if (field === "logoUrl") {
      setLogoPreviewFailed(false);

      if (emailLogoInputRef.current) {
        emailLogoInputRef.current.value = "";
      }
    }

    if (field === "bannerImageUrl") {
      setBannerPreviewFailed(false);

      if (emailBannerInputRef.current) {
        emailBannerInputRef.current.value = "";
      }
    }

    if (field === "headerBackgroundImageUrl") {
      setHeaderBackgroundPreviewFailed(false);

      if (emailHeaderBackgroundInputRef.current) {
        emailHeaderBackgroundInputRef.current.value = "";
      }
    }

    if (field === "emailBodyBackgroundImageUrl") {
      setBodyBackgroundPreviewFailed(false);

      if (emailBodyBackgroundInputRef.current) {
        emailBodyBackgroundInputRef.current.value = "";
      }
    }

    if (field === "footerBackgroundImageUrl") {
      setFooterBackgroundPreviewFailed(false);

      if (emailFooterBackgroundInputRef.current) {
        emailFooterBackgroundInputRef.current.value = "";
      }
    }
  };

  const addQuestion = (sectionId = null) => {
    setDraft((prev) => {
      const sections = normalizeSections(prev.sections, prev.questions);
      const targetSection =
        sections.find((section) => section.id === sectionId) ||
        sections[0] ||
        createLegacySection();
      const sectionQuestionCount = (prev.questions || []).filter(
        (question) =>
          String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
          targetSection.id,
      ).length;

      return {
        ...prev,
        sections,
        questions: [
          ...prev.questions,
          {
            ...createQuestion(),
            sectionId: targetSection.id,
            sectionTitle: targetSection.title,
            sectionDescription: targetSection.description,
            sectionOrder: targetSection.order,
            sectionIsActive: targetSection.isActive,
            order: sectionQuestionCount,
          },
        ],
      };
    });
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
        titleStyle: normalizeTypographyStyle(
          data.titleStyle,
          DEFAULT_TITLE_STYLE,
        ),
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
              sectionId: question.sectionId || question.section?.id || "",
              sectionTitle:
                question.sectionTitle || question.section?.title || "",
              sectionDescription:
                question.sectionDescription ||
                question.section?.description ||
                "",
              sectionOrder:
                typeof question.sectionOrder === "number"
                  ? question.sectionOrder
                  : typeof question.section?.order === "number"
                    ? question.section.order
                    : 0,
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
                    .map((option) =>
                      String(option.label || option.value || option),
                    )
                    .join("\n")
                : String(question.options || ""),
              order:
                typeof question.order === "number" ? question.order : index,
            }))
          : [],
      });
      setActiveTab("questions");
      toast.success("Analyzing file complete");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze file",
      );
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

    const importedSections = normalizeSections(
      importPreview.sections || [],
      importPreview.questions || [],
    );
    const importedQuestions = (importPreview.questions || [])
      .filter((question) => question.selected)
      .map((question) => {
        const resolvedSection =
          importedSections.find(
            (section) =>
              section.id ===
              String(question.sectionId || question.section?.id || "").trim(),
          ) ||
          importedSections[0] ||
          createLegacySection();
        return {
          ...createQuestion(),
          id: crypto.randomUUID(),
          label: question.label || "Untitled question",
          type: question.type || "shortAnswer",
          required: question.required === true,
          placeholder: question.placeholder || "",
          helpText: question.helpText || "",
          sectionId: resolvedSection.id,
          sectionTitle: resolvedSection.title,
          sectionDescription: resolvedSection.description,
          sectionOrder: resolvedSection.order,
          sectionIsActive: resolvedSection.isActive,
          options:
            Array.isArray(question.options) &&
            question.options.some(
              (option) =>
                option &&
                typeof option === "object" &&
                (option.id || option.conditionalLogic),
            )
              ? question.options.map((option, optionIndex) =>
                  typeof option === "string"
                    ? createQuestionOption(option, optionIndex)
                    : {
                        ...option,
                        id: String(option.id || crypto.randomUUID()),
                        label:
                          option.label !== undefined && option.label !== null
                            ? String(option.label).trim()
                            : "",

                        value:
                          option.value !== undefined && option.value !== null
                            ? String(option.value).trim()
                            : "",
                      },
                )
              : parseOptionsText(question.optionsText || "").map(
                  (option, optionIndex) =>
                    createQuestionOption(option, optionIndex),
                ),
          conditionalFields: Array.isArray(question.conditionalFields)
            ? question.conditionalFields.map((field, fieldIndex) => ({
                ...createConditionalField(fieldIndex),
                ...field,
                id: String(field.id || crypto.randomUUID()),
              }))
            : [],
          order: typeof question.order === "number" ? question.order : 0,
        };
      })
      .filter((question) => question.label.trim());

    setDraft((prev) => {
      const existing = Array.isArray(prev.questions) ? [...prev.questions] : [];
      const existingSections = normalizeSections(prev.sections, prev.questions);
      const hasMeaningfulSections = existingSections.some(
        (section) => section.id !== LEGACY_DEFAULT_SECTION_ID,
      );
      const mergedSections = hasMeaningfulSections ? [...existingSections] : [];
      const existingKeys = new Set(
        existing.map(
          (question) =>
            `${String(question.label || "")
              .trim()
              .toLowerCase()}::${String(question.type || "")
              .trim()
              .toLowerCase()}::${String(
              question.sectionId || LEGACY_DEFAULT_SECTION_ID,
            )
              .trim()
              .toLowerCase()}`,
        ),
      );

      const merged = [...existing];
      importedQuestions.forEach((question) => {
        const key = `${String(question.label || "")
          .trim()
          .toLowerCase()}::${String(question.type || "")
          .trim()
          .toLowerCase()}::${String(
          question.sectionId || LEGACY_DEFAULT_SECTION_ID,
        )
          .trim()
          .toLowerCase()}`;
        if (existingKeys.has(key)) {
          return;
        }
        existingKeys.add(key);
        if (
          !mergedSections.some((section) => section.id === question.sectionId)
        ) {
          mergedSections.push({
            id: question.sectionId,
            title: question.sectionTitle || LEGACY_DEFAULT_SECTION_TITLE,
            description: question.sectionDescription || "",
            order:
              typeof question.sectionOrder === "number"
                ? question.sectionOrder
                : mergedSections.length,
            isActive: question.sectionIsActive !== false,
          });
        }
        merged.push(question);
      });

      const nextSections = (
        mergedSections.length ? mergedSections : [createLegacySection()]
      ).sort((left, right) => left.order - right.order);

      return {
        ...prev,
        title: String(prev.title || "").trim()
          ? prev.title
          : importPreview.title || prev.title,
        description: String(prev.description || "").trim()
          ? prev.description
          : normalizeRichTextValue(
              importPreview.description || prev.description,
            ),
        titleStyle: importPreview.hasTypographySettings
          ? normalizeTypographyStyle(
              importPreview.titleStyle,
              DEFAULT_TITLE_STYLE,
            )
          : normalizeTypographyStyle(prev.titleStyle, DEFAULT_TITLE_STYLE),
        descriptionStyle: importPreview.hasTypographySettings
          ? normalizeTypographyStyle(
              importPreview.descriptionStyle,
              DEFAULT_DESCRIPTION_STYLE,
            )
          : normalizeTypographyStyle(
              prev.descriptionStyle,
              DEFAULT_DESCRIPTION_STYLE,
            ),
        emailTemplate: importPreview.emailTemplate
          ? normalizeEmailTemplate(importPreview.emailTemplate, prev)
          : normalizeEmailTemplate(prev.emailTemplate, prev),
        sections: nextSections,
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
      const sections = normalizeSections(prev.sections, prev.questions);
      const targetSection =
        sections.find((section) => section.id === source.sectionId) ||
        sections[0] ||
        createLegacySection();
      const copy = cloneConditionalTree({
        ...source,
        id: crypto.randomUUID(),
        label: `${source.label} copy`,
        sectionId: targetSection.id,
        sectionTitle: targetSection.title,
        sectionDescription: targetSection.description,
        sectionOrder: targetSection.order,
        sectionIsActive: targetSection.isActive,
        order: (prev.questions || []).filter(
          (question) => question.sectionId === targetSection.id,
        ).length,
      });
      return { ...prev, sections, questions: [...prev.questions, copy] };
    });
  };

  const removeQuestion = (index) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  const moveQuestion = (index, direction) => {
    setDraft((prev) => {
      const next = [...prev.questions];
      const source = next[index];
      if (!source) return prev;
      const sameSectionIndexes = next
        .map((question, currentIndex) =>
          String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
          String(source.sectionId || LEGACY_DEFAULT_SECTION_ID).trim()
            ? currentIndex
            : -1,
        )
        .filter((currentIndex) => currentIndex >= 0);
      const position = sameSectionIndexes.indexOf(index);
      const targetPosition = position + direction;
      if (targetPosition < 0 || targetPosition >= sameSectionIndexes.length) {
        return prev;
      }
      const target = sameSectionIndexes[targetPosition];
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...prev,
        questions: next.map((question, order) => ({ ...question, order })),
      };
    });
  };

  const addSection = () => {
    setDraft((prev) => {
      const sections = normalizeSections(prev.sections, prev.questions);

      const newSection = createSection(sections.length, {
        title: "Untitled Section",
      });

      const nextSections = [...sections, newSection].map((section, order) => ({
        ...section,
        order,
      }));

      const defaultQuestion = {
        ...createQuestion(),
        sectionId: newSection.id,
        sectionTitle: newSection.title,
        sectionDescription: newSection.description,
        sectionOrder: newSection.order,
        sectionIsActive: newSection.isActive,
        order: 0,
      };

      return {
        ...prev,
        sections: nextSections,
        questions: [...(prev.questions || []), defaultQuestion],
      };
    });
  };

  const addQuestionAfter = (sectionId, afterQuestionId) => {
    setDraft((prev) => {
      const sections = normalizeSections(prev.sections, prev.questions);

      const targetSection =
        sections.find((section) => section.id === sectionId) ||
        sections[0] ||
        createLegacySection();

      const questions = [...(prev.questions || [])];

      const currentQuestionIndex = questions.findIndex((question) => {
        const questionId = String(question?.id || question?._id || "");
        return questionId === afterQuestionId;
      });

      const sameSectionQuestions = questions
        .filter(
          (question) =>
            String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
            targetSection.id,
        )
        .sort(
          (left, right) =>
            (Number(left.order) || 0) - (Number(right.order) || 0),
        );

      const currentSectionPosition = sameSectionQuestions.findIndex(
        (question) => {
          const questionId = String(question?.id || question?._id || "");
          return questionId === afterQuestionId;
        },
      );

      const newQuestion = {
        ...createQuestion(),
        sectionId: targetSection.id,
        sectionTitle: targetSection.title,
        sectionDescription: targetSection.description,
        sectionOrder: targetSection.order,
        sectionIsActive: targetSection.isActive,
        order: currentSectionPosition + 1,
      };

      if (currentQuestionIndex === -1) {
        return {
          ...prev,
          sections,
          questions: [...questions, newQuestion],
        };
      }

      questions.splice(currentQuestionIndex + 1, 0, newQuestion);

      const normalizedQuestions = questions.map((question) => {
        if (
          String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() !==
          targetSection.id
        ) {
          return question;
        }

        return {
          ...question,
          order: questions
            .filter(
              (item) =>
                String(item.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
                targetSection.id,
            )
            .findIndex((item) => item.id === question.id),
        };
      });

      return {
        ...prev,
        sections,
        questions: normalizedQuestions,
      };
    });
  };

  const updateSection = (sectionId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      sections: normalizeSections(prev.sections, prev.questions).map(
        (section) =>
          section.id === sectionId
            ? { ...section, [field]: String(value ?? "") }
            : section,
      ),
      questions: prev.questions.map((question) =>
        String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
        String(sectionId).trim()
          ? {
              ...question,
              sectionId,
              sectionTitle:
                field === "title" ? String(value ?? "") : question.sectionTitle,
              sectionDescription:
                field === "description"
                  ? String(value ?? "")
                  : question.sectionDescription,
            }
          : question,
      ),
    }));
  };

  const toggleSectionCollapsed = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const deleteSection = (sectionId) => {
    const section = draftSections.find((item) => item.id === sectionId);
    const confirmDelete = window.confirm(
      `Delete section "${section?.title || "Untitled Section"}" and all of its questions?`,
    );
    if (!confirmDelete) return;

    setDraft((prev) => ({
      ...prev,
      sections: normalizeSections(prev.sections, prev.questions).filter(
        (item) => item.id !== sectionId,
      ),
      questions: prev.questions.filter(
        (question) =>
          String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() !==
          String(sectionId).trim(),
      ),
    }));
  };

  const duplicateSection = (sectionId) => {
    setDraft((prev) => {
      const sections = normalizeSections(prev.sections, prev.questions);
      const sourceSection = sections.find((item) => item.id === sectionId);
      if (!sourceSection) return prev;
      const sourceQuestions = prev.questions.filter(
        (question) =>
          String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim() ===
          String(sectionId).trim(),
      );
      const nextSection = {
        ...createSection(sourceSection.order + 1, {
          title: `${sourceSection.title} copy`,
          description: sourceSection.description,
          isActive: sourceSection.isActive,
        }),
      };
      const sectionInsertIndex = sections.findIndex(
        (item) => item.id === sectionId,
      );
      const nextSections = [...sections];
      nextSections.splice(sectionInsertIndex + 1, 0, nextSection);
      const clonedQuestions = sourceQuestions.map((question, index) =>
        cloneConditionalTree({
          ...question,
          id: crypto.randomUUID(),
          sectionId: nextSection.id,
          sectionTitle: nextSection.title,
          sectionDescription: nextSection.description,
          sectionOrder: nextSection.order,
          sectionIsActive: nextSection.isActive,
          label:
            index === 0 && String(question.label || "").trim()
              ? `${question.label} copy`
              : question.label,
          order: index,
        }),
      );
      return {
        ...prev,
        sections: nextSections.map((section, order) => ({ ...section, order })),
        questions: [...prev.questions, ...clonedQuestions].map(
          (question, order) => ({ ...question, order }),
        ),
      };
    });
  };

  const moveSection = (sectionId, direction) => {
    setDraft((prev) => {
      const sections = normalizeSections(prev.sections, prev.questions);
      const index = sections.findIndex((section) => section.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sections.length) return prev;
      const nextSections = [...sections];
      [nextSections[index], nextSections[target]] = [
        nextSections[target],
        nextSections[index],
      ];
      const normalizedSections = nextSections.map((section, order) => ({
        ...section,
        order,
      }));
      const sectionLookup = new Map(
        normalizedSections.map((section) => [section.id, section]),
      );
      return {
        ...prev,
        sections: normalizedSections,
        questions: prev.questions.map((question) => {
          const section = sectionLookup.get(
            String(question.sectionId || LEGACY_DEFAULT_SECTION_ID).trim(),
          );
          if (!section) return question;
          return {
            ...question,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionDescription: section.description,
            sectionOrder: section.order,
            sectionIsActive: section.isActive,
          };
        }),
      };
    });
  };

  const getAssetPublicId = (asset) =>
    asset && typeof asset === "object"
      ? asset.publicId || asset.public_id || ""
      : "";

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
        form?.headerBackgroundImageAsset,
        form?.emailBodyBackgroundImageAsset,
        form?.footerBackgroundImageAsset,
        form?.emailTemplate?.logoAsset,
        form?.emailTemplate?.bannerImageAsset,
        form?.emailTemplate?.headerBackgroundImageAsset,
        form?.emailTemplate?.emailBodyBackgroundImageAsset,
        form?.emailTemplate?.footerBackgroundImageAsset,
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
          console.warn(
            "Failed to delete temporary uploaded asset:",
            error.message,
          );
        }),
      ),
    );

    sessionUploadedAssetsRef.current = sessionUploadedAssetsRef.current.filter(
      (asset) => keepIds.has(getAssetPublicId(asset)),
    );
  };

  const cleanupReplacedAssets = async (previousForm, nextForm) => {
    const previousFormLogo = previousForm?.logoAsset || null;
    const nextFormLogo = nextForm?.logoAsset || null;
    const previousBanner = previousForm?.bannerImageAsset || null;
    const nextBanner = nextForm?.bannerImageAsset || null;
    const previousHeaderBackground =
      previousForm?.headerBackgroundImageAsset ||
      previousForm?.emailTemplate?.headerBackgroundImageAsset ||
      null;
    const nextHeaderBackground =
      nextForm?.headerBackgroundImageAsset ||
      nextForm?.emailTemplate?.headerBackgroundImageAsset ||
      null;
    const previousBodyBackground =
      previousForm?.emailBodyBackgroundImageAsset ||
      previousForm?.emailTemplate?.emailBodyBackgroundImageAsset ||
      null;
    const nextBodyBackground =
      nextForm?.emailBodyBackgroundImageAsset ||
      nextForm?.emailTemplate?.emailBodyBackgroundImageAsset ||
      null;
    const previousFooterBackground =
      previousForm?.footerBackgroundImageAsset ||
      previousForm?.emailTemplate?.footerBackgroundImageAsset ||
      null;
    const nextFooterBackground =
      nextForm?.footerBackgroundImageAsset ||
      nextForm?.emailTemplate?.footerBackgroundImageAsset ||
      null;
    const previousLogo = previousForm?.emailTemplate?.logoAsset || null;
    const nextLogo = nextForm?.emailTemplate?.logoAsset || null;
    const previousTemplateBanner =
      previousForm?.emailTemplate?.bannerImageAsset || null;
    const nextTemplateBanner =
      nextForm?.emailTemplate?.bannerImageAsset || null;

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
      {
        previous: previousBodyBackground,
        current: nextBodyBackground,
      },
      {
        previous: previousFooterBackground,
        current: nextFooterBackground,
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

    const conditionalFieldValidationError =
      validateConditionalFieldOptionConfig(draft.questions || []);
    if (conditionalFieldValidationError) {
      toast.error(conditionalFieldValidationError);
      return;
    }

    const parsedExpiresAt = draft.expiresAt ? new Date(draft.expiresAt) : null;
    const normalizedEmailTemplate = normalizeEmailTemplate(
      draft.emailTemplate,
      {
        ...draft,
        logoUrl: "",
        logoAsset: null,
      },
    );
    const normalizedSections = normalizeSections(
      draft.sections,
      draft.questions,
    );
    const groupedSections = groupQuestionsBySection(
      draft.questions,
      normalizedSections,
    );

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
      headerBackgroundImageAsset:
        draft.emailTemplate?.headerBackgroundImageAsset || null,
      description: sanitizeRichTextHtml(draft.description || ""),
      titleStyle: normalizeTypographyStyle(
        draft.titleStyle,
        DEFAULT_TITLE_STYLE,
      ),
      descriptionStyle: normalizeTypographyStyle(
        draft.descriptionStyle,
        DEFAULT_DESCRIPTION_STYLE,
      ),
      emailTemplate: {
        ...normalizedEmailTemplate,
        footerButtons: normalizedEmailTemplate.footerButtons || [],
      },
      declarationSettings: {
        ...DEFAULT_DECLARATION_SETTINGS,
        ...(draft.declarationSettings || {}),
        enabled: draft.declarationSettings?.enabled === true,
        text: String(draft.declarationSettings?.text || "").trim(),
        required: draft.declarationSettings?.required !== false,
      },
      status: nextStatus,
      slug: slugify(draft.slug || draft.title),
      expiresAt:
        parsedExpiresAt && !Number.isNaN(parsedExpiresAt.getTime())
          ? parsedExpiresAt.toISOString()
          : null,
      sections: groupedSections.map((section, sectionIndex) => ({
        id: section.id,
        title: String(section.title || "").trim() || "Untitled Section",
        description: String(section.description || "").trim(),
        order: typeof section.order === "number" ? section.order : sectionIndex,
        isActive: section.isActive !== false,
        questions: (section.questions || []).map((question, questionIndex) => ({
          id: question.id,
          label: String(question.label || "").trim(),
          type: question.type,
          placeholder: String(question.placeholder || "").trim(),
          helpText: String(question.helpText || "").trim(),
          required: question.required === true,
          validationEnabled: question.validationEnabled === true,
          allowUserToAddMore: question.allowUserToAddMore === true,
          sectionId: String(question.sectionId || section.id || "").trim(),
          sectionTitle:
            String(question.sectionTitle || section.title || "").trim() ||
            "Form Details",
          sectionDescription: String(
            question.sectionDescription || section.description || "",
          ).trim(),
          sectionOrder:
            typeof question.sectionOrder === "number"
              ? question.sectionOrder
              : typeof section.order === "number"
                ? section.order
                : sectionIndex,
          sectionIsActive:
            question.sectionIsActive !== undefined
              ? question.sectionIsActive === true
              : section.isActive !== false,
          options: Array.isArray(question.options)
            ? question.options.map((option, optionIndex) => ({
                id: String(option.id || crypto.randomUUID()),
                label:
                  option.label !== undefined && option.label !== null
                    ? String(option.label).trim()
                    : "",

                value:
                  option.value !== undefined && option.value !== null
                    ? String(option.value).trim()
                    : "",
                order:
                  typeof option.order === "number" ? option.order : optionIndex,
                conditionalLogic: {
                  enabled: option.conditionalLogic?.enabled === true,
                  resetOnHide: option.conditionalLogic?.resetOnHide !== false,
                  fields: Array.isArray(option.conditionalLogic?.fields)
                    ? option.conditionalLogic.fields.map(
                        (field, fieldIndex) => ({
                          id: String(field.id || crypto.randomUUID()),
                          label: String(field.label || "").trim(),
                          type: String(field.type || "shortAnswer"),
                          placeholder: String(field.placeholder || "").trim(),
                          helpText: String(field.helpText || "").trim(),
                          required: field.required === true,
                          validationEnabled: field.validationEnabled === true,
                          allowUserToAddMore: field.allowUserToAddMore === true,
                          validation: normalizeNumberValidation(
                            field.validation,
                          ),
                          options: Array.isArray(field.options)
                            ? field.options
                                .map((childOption, childIndex) => {
                                  const optionSource =
                                    typeof childOption === "string"
                                      ? {
                                          label: childOption,
                                          value: childOption,
                                        }
                                      : childOption || {};
                                  return {
                                    ...optionSource,
                                    id: String(
                                      optionSource.id || crypto.randomUUID(),
                                    ),
                                    label: String(
                                      optionSource.label ||
                                        optionSource.value ||
                                        "",
                                    ).trim(),
                                    value: String(
                                      optionSource.value ||
                                        optionSource.label ||
                                        "",
                                    ).trim(),
                                    order:
                                      typeof optionSource.order === "number"
                                        ? optionSource.order
                                        : childIndex,
                                  };
                                })
                                .filter((childOption) =>
                                  String(
                                    childOption.label ||
                                      childOption.value ||
                                      "",
                                  ).trim(),
                                )
                                .map((childOption, childIndex) => ({
                                  ...childOption,
                                  order: childIndex,
                                }))
                            : [],
                          uploadConfig: field.uploadConfig || null,
                          order:
                            typeof field.order === "number"
                              ? field.order
                              : fieldIndex,
                          isActive: field.isActive !== false,
                        }),
                      )
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
                allowUserToAddMore: field.allowUserToAddMore === true,
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
                        String(
                          childOption.label || childOption.value || "",
                        ).trim(),
                      )
                      .map((childOption, childIndex) => ({
                        ...childOption,
                        order: childIndex,
                      }))
                  : [],
                uploadConfig: field.uploadConfig || null,
                order:
                  typeof field.order === "number" ? field.order : fieldIndex,
                isActive: field.isActive !== false,
              }))
            : [],
          validation: buildQuestionValidationPayload(question),
          order: questionIndex,
        })),
      })),
      questions: draft.questions.map((question, order) => ({
        id: question.id,
        label: String(question.label || "").trim(),
        type: question.type,
        placeholder: String(question.placeholder || "").trim(),
        helpText: String(question.helpText || "").trim(),
        required: question.required === true,
        validationEnabled: question.validationEnabled === true,
        allowUserToAddMore: question.allowUserToAddMore === true,
        sectionId: String(
          question.sectionId || LEGACY_DEFAULT_SECTION_ID,
        ).trim(),
        sectionTitle:
          String(
            question.sectionTitle || LEGACY_DEFAULT_SECTION_TITLE,
          ).trim() || LEGACY_DEFAULT_SECTION_TITLE,
        sectionDescription: String(question.sectionDescription || "").trim(),
        sectionOrder:
          typeof question.sectionOrder === "number" ? question.sectionOrder : 0,
        sectionIsActive:
          question.sectionIsActive !== undefined
            ? question.sectionIsActive === true
            : true,
        options: Array.isArray(question.options)
          ? question.options.map((option, optionIndex) => ({
              id: String(option.id || crypto.randomUUID()),
              label:
                option.label !== undefined && option.label !== null
                  ? String(option.label).trim()
                  : "",

              value:
                option.value !== undefined && option.value !== null
                  ? String(option.value).trim()
                  : "",
              order:
                typeof option.order === "number" ? option.order : optionIndex,
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
                      allowUserToAddMore: field.allowUserToAddMore === true,
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
                                id: String(
                                  optionSource.id || crypto.randomUUID(),
                                ),
                                label: String(
                                  optionSource.label ||
                                    optionSource.value ||
                                    "",
                                ).trim(),
                                value: String(
                                  optionSource.value ||
                                    optionSource.label ||
                                    "",
                                ).trim(),
                                order:
                                  typeof optionSource.order === "number"
                                    ? optionSource.order
                                    : childIndex,
                              };
                            })
                            .filter((childOption) =>
                              String(
                                childOption.label || childOption.value || "",
                              ).trim(),
                            )
                            .map((childOption, childIndex) => ({
                              ...childOption,
                              order: childIndex,
                            }))
                        : [],
                      uploadConfig: field.uploadConfig || null,
                      order:
                        typeof field.order === "number"
                          ? field.order
                          : fieldIndex,
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
              allowUserToAddMore: field.allowUserToAddMore === true,
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
                      String(
                        childOption.label || childOption.value || "",
                      ).trim(),
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
      const normalizedSavedForm = normalizeForm(saved || payload);
      const savedFormId = saved?._id || selectedFormId;

      lastSavedFormRef.current = normalizedSavedForm;
      setLastSavedFormSnapshot(normalizedSavedForm);

      // Current create/edit draft remove karo
      removeDraft(draftKey);

      // Saved form ke naam se bana stale edit draft bhi remove karo
      if (savedFormId) {
        const savedEditDraftKey = buildDraftKey({
          module: "form-builder",
          mode: "edit",
          recordId: savedFormId,
          userId: draftUserId,
        });

        if (savedEditDraftKey !== draftKey) {
          removeDraft(savedEditDraftKey);
        }
      }

      refreshDrafts();

      toast.success(selectedFormId ? "Form updated" : "Form created");

      await loadForms();

      if (saved?._id) {
        await selectForm(saved);
      } else {
        startNewForm();
      }
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

      const editDraftKey = buildDraftKey({
        module: "form-builder",
        mode: "edit",
        recordId: formId,
        userId: draftUserId,
      });

      removeDraft(editDraftKey);

      if (selectedFormId === formId) {
        removeDraft(draftKey);
        startNewForm();
      }

      refreshDrafts();
      toast.success("Form deleted");

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
    window.open(
      buildPublicFormUrl(draft.slug),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const exportResponses = async (
    params = {},
    filenameSuffix = "responses",
    format = "csv",
  ) => {
    if (!selectedFormId) return;
    const res = await exportAdminFormResponsesByFormat(
      selectedFormId,
      format,
      params,
    );
    const contentType =
      res.headers?.["content-type"] ||
      (format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : format === "pdf"
          ? "application/pdf"
          : format === "json"
            ? "application/json"
            : "text/csv;charset=utf-8;");
    const blob = new Blob([res.data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(draft.slug || draft.title || "form")}-${filenameSuffix}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openResponseExportDialog = () => {
    if (!selectedFormId) {
      toast.error("Save the form first");
      return;
    }
    setResponseExportModalOpen(true);
    setResponseExportFormat("csv");
  };

  const closeResponseExportDialog = () => {
    setResponseExportModalOpen(false);
  };

  const openResponseImportDialog = () => {
    if (!selectedFormId) {
      toast.error("Save the form first");
      return;
    }
    setResponseImportModalOpen(true);
    setResponseImportFile(null);
    setResponseImportPreview(null);
    setResponseImportMappings([]);
    setResponseImportDuplicateStrategy("skip");
    setResponseImportDuplicateField("email");
    setResponseImportSummary(null);
    setResponseImportErrorRows([]);
    setResponseImportBatchId("");
    setResponseImportProgress(0);
  };

  const closeResponseImportDialog = () => {
    if (responseImportLoading) return;
    setResponseImportModalOpen(false);
    setResponseImportFile(null);
    setResponseImportPreview(null);
    setResponseImportMappings([]);
    setResponseImportSummary(null);
    setResponseImportErrorRows([]);
    setResponseImportBatchId("");
    setResponseImportProgress(0);
  };

  const resetResponseImportProgress = () => {
    setResponseImportLoading(false);
    setResponseImportProgress(0);
  };

  const handleResponseImportFileSelect = async (file) => {
    if (!file) return;

    const allowed = [
      ".csv",
      ".xls",
      ".xlsx",
      ".json",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
      "application/octet-stream",
      "text/plain",
    ];
    const fileName = String(file.name || "").toLowerCase();
    const isAllowed = allowed.some(
      (item) => item.startsWith(".") ? fileName.endsWith(item) : file.type === item,
    );

    if (!isAllowed) {
      toast.error("Please upload a CSV, Excel, or JSON file.");
      return;
    }

    setResponseImportFile(file);
    setResponseImportLoading(true);
    setResponseImportProgress(25);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await importAdminFormResponsesPreview(selectedFormId, formData);
      const previewData = response.data?.data?.preview || response.data?.data || {};
      const questionMap = Array.isArray(previewData.questionMap)
        ? previewData.questionMap
        : [];
      const mappings = Array.isArray(previewData.columns)
        ? previewData.columns.map((column) => {
            const match = questionMap.find(
              (item) => item.matchedColumnIndex === column.index,
            );
            return {
              columnIndex: column.index,
              header: column.header,
              questionId: match?.questionId || "",
              label: match?.questionLabel || "",
              fieldPath: "",
            };
          })
        : [];
      setResponseImportPreview(previewData);
      setResponseImportMappings(mappings);
      setResponseImportProgress(100);
      toast.success("Import file analyzed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to analyze import file");
      setResponseImportFile(null);
      setResponseImportPreview(null);
      setResponseImportMappings([]);
      setResponseImportProgress(0);
    } finally {
      resetResponseImportProgress();
    }
  };

  const handleResponseImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleResponseImportFileSelect(file);
    event.target.value = "";
  };

  const updateResponseImportMapping = (index, field, value) => {
    setResponseImportMappings((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleCommitResponseImport = async () => {
    if (!selectedFormId || !responseImportFile || !responseImportPreview) {
      toast.error("Choose a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", responseImportFile);
    formData.append("duplicateStrategy", responseImportDuplicateStrategy);
    formData.append("duplicateField", responseImportDuplicateField);
    formData.append("mapping", JSON.stringify(responseImportMappings));

    setResponseImportLoading(true);
    setResponseImportProgress(35);
    try {
      const response = await importAdminFormResponses(selectedFormId, formData);
      const data = response.data?.data || {};
      setResponseImportSummary(data.summary || null);
      setResponseImportErrorRows(Array.isArray(data.errorRows) ? data.errorRows : []);
      setResponseImportBatchId(data.batchId || "");
      setResponseImportProgress(100);

      const [responsesRes] = await Promise.all([getAdminFormResponses(selectedFormId)]);
      setResponses(normalizeResponsesPayload(responsesRes.data?.data));
      setSelectedResponse(null);
      toast.success("Responses imported successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to import responses");
    } finally {
      resetResponseImportProgress();
    }
  };

  const handleUndoResponseImport = async () => {
    if (!selectedFormId || !responseImportBatchId) return;
    if (!window.confirm("Undo this import batch?")) return;

    try {
      await undoAdminFormResponseImport(selectedFormId, responseImportBatchId);
      const [responsesRes] = await Promise.all([getAdminFormResponses(selectedFormId)]);
      setResponses(normalizeResponsesPayload(responsesRes.data?.data));
      setResponseImportSummary(null);
      setResponseImportErrorRows([]);
      setResponseImportBatchId("");
      toast.success("Import batch undone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to undo import");
    }
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

      const exportData = createFormExportData(
        exportedForm.form || exportedForm,
      );
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
      toast.error(
        error.response?.data?.message ||
          "Unable to export form. Please try again.",
      );
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
    } catch {
      setSelectedResponse(response);
    }
  };

  const clearSecretReveal = useCallback((questionId) => {
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
  }, []);

  const revealSecret = useCallback(
    async (questionId) => {
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
    },
    [clearSecretReveal, selectedFormId, selectedResponse?._id],
  );

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
    const fromTime = responseDateFrom
      ? new Date(responseDateFrom).getTime()
      : null;
    const toTime = responseDateTo ? new Date(responseDateTo).getTime() : null;

    return responses
      .filter((response) => {
        const submittedTime = new Date(
          response.submittedAt || response.createdAt,
        ).getTime();
        if (responseSourceFilter === "imported" && response.imported !== true) {
          return false;
        }
        if (responseSourceFilter === "manual" && response.imported === true) {
          return false;
        }
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
          if (submittedTime < start.getTime() || submittedTime >= end.getTime())
            return false;
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
        if (toTime && submittedTime > toTime + 24 * 60 * 60 * 1000 - 1)
          return false;
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
          answers.find((item) => item.question?.type === "shortAnswer")
            ?.value ||
          answers.find((item) => /name/i.test(item.question?.label || ""))
            ?.value ||
          "";
        return {
          ...response,
          name,
          email,
          phone,
          imported: response.imported === true,
          sourceLabel: response.imported === true ? "Imported" : "Manual",
        };
      });
  }, [
    responseDateFrom,
    responseDateTo,
    responseFilter,
    responseSourceFilter,
    responseSearch,
    responses,
  ]);

  const analysisRows = useMemo(() => {
    return responseTable.filter((response) => {
      const score = Number(response.score || 0);
      const leadCategory = response.leadCategory || getScoreBucket(score);
      const ratingValue = getRatingValue(response);
      const interestAnswer = getInterestAnswer(response);
      const hasYes =
        /^(yes|y|true|interested|available|available to join)$/i.test(
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
    [draft],
  );
  const responseAnswerSections = useMemo(() => {
    if (!selectedResponse) return null;

    const answers = Array.isArray(selectedResponse.answers)
      ? selectedResponse.answers
      : [];
    const submissionRows = Array.isArray(
      selectedResponse.submissionSummary?.rows,
    )
      ? selectedResponse.submissionSummary.rows
      : [];
    const declaration = selectedResponse.declaration || null;
    const isImportedResponse = selectedResponse.imported === true;
    const mainAnswers = answers.filter((answer) => !answer.conditional);
    const conditionalAnswers = answers.filter((answer) => answer.conditional);

    const renderAnswerCard = (answer, keyPrefix) => {
      const questionId =
        answer.question?._id ||
        answer.questionId?._id ||
        answer.questionId ||
        answer._id;

      const originalQuestion = (draft.questions || []).find(
        (question) =>
          String(question._id || question.id) === String(questionId),
      );

      const answerForDisplay = {
        ...answer,
        questionType:
          answer.fieldType ||
          answer.questionType ||
          answer.type ||
          answer.question?.type ||
          originalQuestion?.type ||
          "",
      };

      return (
        <div
          key={`${keyPrefix}-${answer._id || questionId}`}
          className="rounded-3xl border border-white/10 bg-white/5 p-4"
        >
          <div className="text-sm font-semibold">
            {answer.displayLabel ||
              answer.fieldLabel ||
              answer.question?.label ||
              "Question"}
          </div>
          {answer.displayContext ? (
            <div className="mt-1 text-xs text-cyan-200/80">
              {answer.displayContext}
            </div>
          ) : null}
          <div className="mt-2 text-sm text-slate-300">
            {renderAnswerValue(answerForDisplay, {
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
        {declaration && !isImportedResponse && (
          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Declaration
            </div>
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-sm font-semibold text-emerald-100">
                {declaration.accepted === true ? "Accepted" : "Not accepted"}
              </div>
              {declaration.acceptedAt && (
                <div className="mt-1 text-xs text-emerald-200/80">
                  Accepted At:{" "}
                  {new Date(declaration.acceptedAt).toLocaleString()}
                </div>
              )}
            </div>
          </section>
        )}

        {isImportedResponse && (
          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Import Metadata
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm">
              <div className="font-semibold text-cyan-100">Imported</div>
              <div className="mt-2 grid gap-2 text-cyan-50/90 md:grid-cols-2">
                <div>Source File: {selectedResponse.sourceFile || "-"}</div>
                <div>Original Row: {selectedResponse.originalRowNumber || "-"}</div>
                <div>Batch ID: {selectedResponse.importBatchId || "-"}</div>
                <div>
                  Imported At:{" "}
                  {selectedResponse.importedAt
                    ? new Date(selectedResponse.importedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </section>
        )}

        {isImportedResponse && submissionRows.length > 0 && (
          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Imported Fields
            </div>
            <div className="space-y-3">
              {submissionRows.map((row, index) => {
                if (row.kind === "section") {
                  return (
                    <div
                      key={`imported-section-${index}`}
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
                    >
                      {row.label}
                    </div>
                  );
                }

                return (
                  <div
                    key={`imported-row-${index}-${row.questionId || row.fieldId || row.fieldLabel || "row"}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-sm font-semibold">
                      {row.displayLabel ||
                        row.fieldLabel ||
                        row.question?.label ||
                        "Question"}
                    </div>
                    {row.displayContext ? (
                      <div className="mt-1 text-xs text-cyan-200/80">
                        {row.displayContext}
                      </div>
                    ) : null}
                    <div className="mt-2 text-sm text-slate-300">
                      {renderAnswerValue(
                        {
                          ...row,
                          questionType:
                            row.fieldType || row.question?.type || "",
                        },
                        {
                          revealed: Boolean(revealedSecrets[row.questionId]),
                          revealedValue: revealedSecrets[row.questionId],
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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

        {!mainAnswers.length && submissionRows.length > 0 && (
          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Submission Details
            </div>
            <div className="space-y-3">
              {submissionRows.map((row, index) => {
                if (row.kind === "section") {
                  return (
                    <div
                      key={`submission-section-${index}`}
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
                    >
                      {row.label}
                    </div>
                  );
                }

                return (
                  <div
                    key={`submission-row-${index}-${row.questionId || row.fieldId || row.fieldLabel || "row"}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-sm font-semibold">
                      {row.displayLabel || row.fieldLabel || row.question?.label || "Question"}
                    </div>
                    {row.displayContext ? (
                      <div className="mt-1 text-xs text-cyan-200/80">
                        {row.displayContext}
                      </div>
                    ) : null}
                    <div className="mt-2 text-sm text-slate-300">
                      {renderAnswerValue(
                        {
                          ...row,
                          questionType: row.fieldType || row.question?.type || "",
                        },
                        {
                          revealed: Boolean(revealedSecrets[row.questionId]),
                          revealedValue: revealedSecrets[row.questionId],
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {conditionalAnswers.length > 0 && (
          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Conditional Answers
            </div>
            <div className="space-y-3">
              {conditionalAnswers.map((answer) =>
                renderAnswerCard(answer, "conditional"),
              )}
            </div>
          </section>
        )}
      </>
    );
  }, [draft.questions, revealedSecrets, revealSecret, selectedResponse]);
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
    const isChoiceField = CONDITIONAL_FIELD_TYPES_REQUIRING_OPTIONS.has(
      String(field.type || ""),
    );

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
            onClick={() =>
              removeConditionalField(questionIndex, optionId, field.id)
            }
            className="rounded-2xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
          >
            Remove Field
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              Field Label
            </label>
            <input
              value={field.label ?? ""}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "label",
                  e.target.value,
                )
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              Field Type
            </label>
            <select
              value={field.type || "shortAnswer"}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "type",
                  e.target.value,
                )
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
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              Placeholder
            </label>
            <input
              value={field.placeholder ?? ""}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "placeholder",
                  e.target.value,
                )
              }
              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              Help Text
            </label>
            <input
              value={field.helpText ?? ""}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "helpText",
                  e.target.value,
                )
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
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "required",
                  e.target.checked,
                )
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
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.allowUserToAddMore === true}
              onChange={(e) =>
                updateConditionalField(
                  questionIndex,
                  optionId,
                  field.id,
                  "allowUserToAddMore",
                  e.target.checked,
                )
              }
            />
            Allow user to add question
          </label>
        </div>

        {isChoiceField && (
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  {field.type === "dropdown"
                    ? "Dropdown Options"
                    : "Field Options"}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Add one option per row. Each option can open its own
                  conditional branch.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  addConditionalFieldOption(questionIndex, optionId, field.id)
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {fieldOptions.map((fieldOption, fieldOptionIndex) => {
                const panelKey = `${questionId}::${optionId}::${field.id}::${fieldOption.id}`;
                const childFields = Array.isArray(
                  fieldOption.conditionalLogic?.fields,
                )
                  ? fieldOption.conditionalLogic.fields
                  : [];
                const expanded = isConditionalPanelExpanded(panelKey);
                const childBreadcrumb = [
                  ...fieldBreadcrumb,
                  fieldOption.label || `Option ${fieldOptionIndex + 1}`,
                ];

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
                          value={fieldOption.label ?? ""}
                          onChange={(e) =>
                            updateConditionalFieldOption(
                              questionIndex,
                              optionId,
                              field.id,
                              fieldOption.id,
                              "label",
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
                          value={fieldOption.value ?? ""}
                          onChange={(e) =>
                            updateConditionalFieldOption(
                              questionIndex,
                              optionId,
                              field.id,
                              fieldOption.id,
                              "value",
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
                        onClick={() =>
                          addConditionalFieldToOption(
                            questionIndex,
                            fieldOption.id,
                          )
                        }
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
                            onClick={() =>
                              addConditionalFieldToOption(
                                questionIndex,
                                fieldOption.id,
                              )
                            }
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
                              No conditional questions yet. Add one to continue
                              nesting.
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
            Clean Google Forms-style builder for public links and response
            tracking.
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
        <aside
          className={`${theme.card} rounded-3xl border ${theme.border} p-4 space-y-4`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">All Forms</h2>
              <p className={`text-sm ${theme.textSecondary}`}>
                Title, slug, status, responses.
              </p>
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
                        <div className="text-xs text-slate-400">
                          /{form.slug}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${form.status === "live" ? "text-cyan-300" : "text-amber-300"}`}
                      >
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

        <section
          className={`${theme.card} rounded-3xl border ${theme.border} p-6 space-y-6`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {draft.title || "Untitled form"}
              </h2>
              <p className={`text-sm ${theme.textSecondary}`}>
                Public link:{" "}
                {draft.slug
                  ? buildPublicFormUrl(draft.slug)
                  : "Save to generate link"}
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
                disabled={
                  saving ||
                  uploadingBannerImage ||
                  !!uploadingEmailTemplateField
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                <Save size={16} /> Save
              </button>
              <button
                type="button"
                onClick={publishForm}
                disabled={
                  saving ||
                  uploadingBannerImage ||
                  !!uploadingEmailTemplateField
                }
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
              {
                id: "notification-settings",
                label: "Notification Settings",
                icon: Bell,
              },
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
                    active
                      ? "bg-cyan-600 text-white"
                      : "bg-white/5 text-slate-300"
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
                  <label className="mb-2 block text-sm font-semibold">
                    Form Title
                  </label>
                  <input
                    value={draft.title}
                    onChange={(e) => updateDraft("title", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="Internship Application"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Slug / Public Route
                  </label>
                  <input
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateDraft("slug", slugify(e.target.value));
                    }}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="internship-application"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Public URL: /forms/{draft.slug || "slug"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">
                        Title Font Family
                      </label>
                      <select
                        value={draft.titleStyle?.fontFamily || ""}
                        onChange={(e) =>
                          updateTitleStyle("fontFamily", e.target.value)
                        }
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
                      <label className="block text-sm font-semibold">
                        Title Font Size
                      </label>
                      <select
                        value={draft.titleStyle?.fontSize || ""}
                        onChange={(e) =>
                          updateTitleStyle("fontSize", e.target.value)
                        }
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
                      <label className="block text-sm font-semibold">
                        Title Font Weight
                      </label>
                      <select
                        value={draft.titleStyle?.fontWeight || ""}
                        onChange={(e) =>
                          updateTitleStyle("fontWeight", e.target.value)
                        }
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
                      <label className="block text-sm font-semibold">
                        Title Color
                      </label>
                      <input
                        type="color"
                        value={draft.titleStyle?.color || "#ffffff"}
                        onChange={(e) =>
                          updateTitleStyle("color", e.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-transparent px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {ALIGNMENT_OPTIONS.map((alignment) => (
                      <button
                        key={alignment.value}
                        type="button"
                        onClick={() =>
                          updateTitleStyle("textAlign", alignment.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                          (draft.titleStyle?.textAlign || "left") ===
                          alignment.value
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
                          draft.titleStyle?.fontStyle === "italic"
                            ? "normal"
                            : "italic",
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
                          draft.titleStyle?.textDecoration === "underline"
                            ? "none"
                            : "underline",
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
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          titleStyle: { ...DEFAULT_TITLE_STYLE },
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200"
                    >
                      Reset title style
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">
                      Description
                    </label>
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
                      <div className="text-sm font-semibold text-slate-100">
                        Live Preview
                      </div>
                      <div className="text-xs text-slate-400">
                        Matches the public form typography
                      </div>
                    </div>
                    {/* <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                      Public preview
                    </span> */}
                  </div>
                  <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-row items-center gap-4">
                      {draft.logoUrl ? (
                        <img
                          src={getOptimizedImageUrl(
                            draft.logoAsset || draft.logoUrl,
                          )}
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
                          style={{
                            ...resolveTypographyStyle(
                              draft.titleStyle,
                              DEFAULT_TITLE_STYLE,
                            ),

                            color: draft.titleStyle?.color || "#ffffff",

                            // Global gradient heading CSS ko override karega
                            background: "none",
                            backgroundImage: "none",
                            WebkitBackgroundClip: "initial",
                            backgroundClip: "initial",
                            WebkitTextFillColor:
                              draft.titleStyle?.color || "#ffffff",
                          }}
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
                              __html: sanitizeRichTextHtml(
                                draft.description || "",
                              ),
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
                        {draft.titleStyle?.fontFamily ||
                          DEFAULT_TITLE_STYLE.fontFamily}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Description font</div>
                      <div className="mt-1 font-semibold text-slate-100">
                        {draft.descriptionStyle?.fontFamily ||
                          "Inherited / pasted"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">Questions</div>
                  <div className="text-sm text-slate-400">
                    Organize questions into unlimited sections.
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Plus size={16} /> Add Section
                  </button>
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    disabled={importingFormFile}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload size={16} />
                    {importingFormFile
                      ? "Analyzing File..."
                      : "Import Form From File"}
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
                {draftSections.map((section, sectionIndex) => {
                  const sectionQuestions = section.questions || [];
                  const isCollapsed = collapsedSections[section.id] === true;
                  return (
                    <div
                      key={section.id}
                      className="rounded-[2rem] border border-cyan-500/20 bg-slate-950/50 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.04)]"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            <span>Section {sectionIndex + 1}</span>
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] normal-case tracking-normal text-cyan-100">
                              {sectionQuestions.length} question
                              {sectionQuestions.length === 1 ? "" : "s"}
                            </span>
                            {section.isActive === false && (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] normal-case tracking-normal text-amber-200">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold">
                                Section Title
                              </label>
                              <input
                                value={section.title}
                                onChange={(e) =>
                                  updateSection(
                                    section.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="Untitled Section"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">
                                Section Actions
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => moveSection(section.id, -1)}
                                  disabled={sectionIndex === 0}
                                  className="rounded-2xl border border-white/10 p-3 disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Move section up"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection(section.id, 1)}
                                  disabled={
                                    sectionIndex === draftSections.length - 1
                                  }
                                  className="rounded-2xl border border-white/10 p-3 disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Move section down"
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateSection(section.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-3 text-xs font-semibold"
                                >
                                  <Duplicate size={14} /> Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSection(section.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 px-3 py-3 text-xs font-semibold text-red-300"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleSectionCollapsed(section.id)
                                  }
                                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-3 text-xs font-semibold text-cyan-100"
                                >
                                  <ListPlus size={14} />
                                  {isCollapsed ? "Expand" : "Collapse"}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Section Description
                            </label>
                            <textarea
                              value={section.description}
                              onChange={(e) =>
                                updateSection(
                                  section.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                              placeholder="Optional description"
                            />
                          </div>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="mt-5 space-y-4">
                          <div className="text-sm text-slate-400">
                            Use the + button on a question to add another
                            question below it.
                          </div>

                          {sectionQuestions.length ? (
                            <div className="space-y-4">
                              {sectionQuestions.map(
                                (question, sectionQuestionIndex) => {
                                  const questionIndex =
                                    draft.questions.findIndex(
                                      (item) => item.id === question.id,
                                    );
                                  const type = question.type;
                                  const isChoice = [
                                    "dropdown",
                                    "radio",
                                    "checkbox",
                                  ].includes(type);
                                  return (
                                    <div
                                      key={question.id}
                                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <div className="text-sm font-semibold">
                                            Question {sectionQuestionIndex + 1}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            Drag-free reorder within this
                                            section
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addQuestionAfter(
                                                section.id,
                                                question.id,
                                              )
                                            }
                                            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-200 transition hover:bg-cyan-500/20"
                                            title="Add question below"
                                            aria-label="Add question below"
                                          >
                                            <Plus size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              moveQuestion(questionIndex, -1)
                                            }
                                            className="rounded-xl border border-white/10 p-2"
                                            disabled={
                                              sectionQuestionIndex === 0 ||
                                              questionIndex <= 0
                                            }
                                          >
                                            <ArrowUp size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              moveQuestion(questionIndex, 1)
                                            }
                                            className="rounded-xl border border-white/10 p-2"
                                            disabled={
                                              sectionQuestionIndex ===
                                              sectionQuestions.length - 1
                                            }
                                          >
                                            <ArrowDown size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              duplicateQuestion(questionIndex)
                                            }
                                            className="rounded-xl border border-white/10 p-2"
                                          >
                                            <Duplicate size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeQuestion(questionIndex)
                                            }
                                            className="rounded-xl border border-red-500/30 p-2 text-red-300"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold">
                                            Question Label
                                          </label>
                                          <input
                                            value={question.label}
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "label",
                                                e.target.value,
                                              )
                                            }
                                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                            placeholder="Enter question text"
                                          />
                                        </div>
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold">
                                            Question Type
                                          </label>
                                          <select
                                            value={question.type}
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "type",
                                                e.target.value,
                                              )
                                            }
                                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                          >
                                            {QUESTION_TYPES.map((item) => (
                                              <option
                                                key={item.value}
                                                value={item.value}
                                              >
                                                {item.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold">
                                            Placeholder
                                          </label>
                                          <input
                                            value={question.placeholder}
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "placeholder",
                                                e.target.value,
                                              )
                                            }
                                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                          />
                                        </div>
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold">
                                            Help Text
                                          </label>
                                          <input
                                            value={question.helpText}
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "helpText",
                                                e.target.value,
                                              )
                                            }
                                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                          />
                                        </div>
                                      </div>

                                      <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <label className="inline-flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={question.required}
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "required",
                                                e.target.checked,
                                              )
                                            }
                                          />
                                          Required
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={
                                              question.validationEnabled ===
                                              true
                                            }
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "validationEnabled",
                                                e.target.checked,
                                              )
                                            }
                                          />
                                          Enable Validation
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={
                                              question.allowUserToAddMore ===
                                              true
                                            }
                                            onChange={(e) =>
                                              updateQuestion(
                                                questionIndex,
                                                "allowUserToAddMore",
                                                e.target.checked,
                                              )
                                            }
                                          />

                                          <span>
                                            Allow User to Add Question
                                          </span>
                                        </label>
                                        <span className="text-xs text-slate-400">
                                          Type: {question.type}
                                        </span>
                                      </div>

                                      {type === "number" && (
                                        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                                          <div className="mb-4 text-sm font-semibold">
                                            Number Validation
                                          </div>
                                          <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                              <label className="mb-2 block text-sm font-semibold">
                                                Minimum Value
                                              </label>
                                              <input
                                                type="number"
                                                step="1"
                                                value={
                                                  question.validation
                                                    ?.minValue ?? ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionValidation(
                                                    questionIndex,
                                                    "minValue",
                                                    e.target.value,
                                                  )
                                                }
                                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                                placeholder="18"
                                              />
                                            </div>
                                            <div>
                                              <label className="mb-2 block text-sm font-semibold">
                                                Maximum Value
                                              </label>
                                              <input
                                                type="number"
                                                step="1"
                                                value={
                                                  question.validation
                                                    ?.maxValue ?? ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionValidation(
                                                    questionIndex,
                                                    "maxValue",
                                                    e.target.value,
                                                  )
                                                }
                                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                                placeholder="60"
                                              />
                                            </div>
                                            <div>
                                              <label className="mb-2 block text-sm font-semibold">
                                                Minimum Digit Length
                                              </label>
                                              <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={
                                                  question.validation
                                                    ?.minDigits ?? ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionValidation(
                                                    questionIndex,
                                                    "minDigits",
                                                    e.target.value,
                                                  )
                                                }
                                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                                placeholder="2"
                                              />
                                            </div>
                                            <div>
                                              <label className="mb-2 block text-sm font-semibold">
                                                Maximum Digit Length
                                              </label>
                                              <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={
                                                  question.validation
                                                    ?.maxDigits ?? ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionValidation(
                                                    questionIndex,
                                                    "maxDigits",
                                                    e.target.value,
                                                  )
                                                }
                                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                                placeholder="2"
                                              />
                                            </div>
                                            <div className="md:col-span-2">
                                              <label className="mb-2 block text-sm font-semibold">
                                                Custom Error Message
                                              </label>
                                              <textarea
                                                value={
                                                  question.validation
                                                    ?.errorMessage ?? ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionValidation(
                                                    questionIndex,
                                                    "errorMessage",
                                                    e.target.value,
                                                  )
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
                                            <label className="block text-sm font-semibold">
                                              Options
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                addQuestionOption(questionIndex)
                                              }
                                              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                                            >
                                              <Plus size={14} /> Add Option
                                            </button>
                                          </div>

                                          <div className="space-y-3">
                                            {(question.options || []).map(
                                              (option, optionIndex) => (
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
                                                        value={
                                                          option.label ?? ""
                                                        }
                                                        onChange={(e) =>
                                                          updateQuestionOption(
                                                            questionIndex,
                                                            option.id,
                                                            "label",
                                                            e.target.value,
                                                          )
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
                                                        value={
                                                          option.value ?? ""
                                                        }
                                                        onChange={(e) =>
                                                          updateQuestionOption(
                                                            questionIndex,
                                                            option.id,
                                                            "value",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                                                        placeholder="Stable internal value"
                                                      />
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeQuestionOption(
                                                          questionIndex,
                                                          option.id,
                                                        )
                                                      }
                                                      className="mt-7 rounded-2xl border border-red-500/30 px-3 py-2 text-xs text-red-300"
                                                    >
                                                      Remove
                                                    </button>
                                                  </div>

                                                  <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        addConditionalFieldToOption(
                                                          questionIndex,
                                                          option.id,
                                                        )
                                                      }
                                                      className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                                                    >
                                                      <ListPlus size={14} />{" "}
                                                      Configure conditional
                                                      fields
                                                    </button>
                                                    <span className="text-xs text-slate-400">
                                                      Stable ID: {option.id}
                                                    </span>
                                                  </div>

                                                  {option.conditionalLogic
                                                    ?.fields?.length > 0 && (
                                                    <div className="space-y-3 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                                                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                                                        Conditional Fields
                                                      </div>
                                                      {option.conditionalLogic.fields.map(
                                                        (field) =>
                                                          renderConditionalFieldEditor(
                                                            question.id,
                                                            questionIndex,
                                                            option.id,
                                                            field,
                                                            1,
                                                            [
                                                              question.label ||
                                                                "Question",
                                                              option.label ||
                                                                "Option",
                                                            ],
                                                          ),
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : (
                            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
                              <p className="text-sm text-slate-400">
                                This section currently has no questions.
                              </p>

                              <button
                                type="button"
                                onClick={() => addQuestion(section.id)}
                                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100"
                              >
                                <Plus size={16} />
                                Create First Question
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!draftSections.length && (
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                    Add a section to start building.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Status
                  </label>
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
                  <label className="mb-2 block text-sm font-semibold">
                    Theme Color
                  </label>
                  <input
                    value={draft.themeColor}
                    onChange={(e) => updateDraft("themeColor", e.target.value)}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                    placeholder="#16a34a"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Expiry Date & Time
                  </label>
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
                  <label className="mb-2 block text-sm font-semibold">
                    Success Message
                  </label>
                  <textarea
                    value={draft.successMessage}
                    onChange={(e) =>
                      updateDraft("successMessage", e.target.value)
                    }
                    rows={3}
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Declaration</div>
                        <p className="mt-1 text-xs text-slate-400">
                          Show an admin-controlled declaration before
                          submission.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={draft.declarationSettings?.enabled === true}
                          onChange={(e) =>
                            updateDraft("declarationSettings", {
                              ...(draft.declarationSettings || {}),
                              enabled: e.target.checked,
                              text: String(
                                draft.declarationSettings?.text || "",
                              ),
                              required:
                                draft.declarationSettings?.required !== false,
                            })
                          }
                        />
                        Show declaration on this form
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">
                        Declaration Text
                      </label>
                      <textarea
                        value={draft.declarationSettings?.text || ""}
                        onChange={(e) =>
                          updateDraft("declarationSettings", {
                            ...(draft.declarationSettings || {}),
                            enabled:
                              draft.declarationSettings?.enabled === true,
                            text: e.target.value,
                            required:
                              draft.declarationSettings?.required !== false,
                          })
                        }
                        rows={4}
                        placeholder="I hereby declare that the information provided above is true and correct to the best of my knowledge."
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={draft.declarationSettings?.required !== false}
                        onChange={(e) =>
                          updateDraft("declarationSettings", {
                            ...(draft.declarationSettings || {}),
                            enabled:
                              draft.declarationSettings?.enabled === true,
                            text: String(draft.declarationSettings?.text || ""),
                            required: e.target.checked,
                          })
                        }
                      />
                      User must accept declaration before submission
                    </label>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Form Logo
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={formLogoInputRef}
                          id="form-logo-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) =>
                            handleFormLogoFile(e.target.files?.[0] || null)
                          }
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
                            onClick={async () => {
                              await deleteAssetIfExists(draft.logoAsset);
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
                          src={getOptimizedImageUrl(
                            draft.logoAsset || draft.logoUrl,
                          )}
                          alt="Form logo preview"
                          className="block max-h-24 w-auto max-w-full object-contain"
                          onError={() => setFormLogoPreviewFailed(true)}
                        />
                      ) : draft.logoUrl ? (
                        <div className="text-sm text-slate-400">
                          Logo preview unavailable
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400">
                          No logo selected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Form Banner Image
                      </label>
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
                        onChange={(e) =>
                          handleBannerImageFile(e.target.files?.[0] || null)
                        }
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
                          onClick={async () => {
                            await deleteAssetIfExists(draft.bannerImageAsset);
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
                    <label className="mb-2 block text-sm font-semibold">
                      Admin Notification Email
                    </label>
                    <input
                      value={draft.notificationEmail}
                      onChange={(e) =>
                        updateDraft("notificationEmail", e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.confirmationEmailEnabled}
                      onChange={(e) =>
                        updateDraft(
                          "confirmationEmailEnabled",
                          e.target.checked,
                        )
                      }
                    />
                    Send confirmation email to submitter
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowFileUpload}
                      onChange={(e) =>
                        updateDraft("allowFileUpload", e.target.checked)
                      }
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
                <div className="text-lg font-semibold">
                  Notification Settings
                </div>
                <div className="text-sm text-slate-400">
                  Enable the delivery channels you want for this form.
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      draft.notificationSettings?.sendEmailNotification !==
                      false
                    }
                    onChange={(e) =>
                      updateNotificationSettings(
                        "sendEmailNotification",
                        e.target.checked,
                      )
                    }
                  />
                  Email Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      draft.notificationSettings?.sendDashboardNotification ===
                      true
                    }
                    onChange={(e) =>
                      updateNotificationSettings(
                        "sendDashboardNotification",
                        e.target.checked,
                      )
                    }
                  />
                  Send Dashboard Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      draft.notificationSettings?.sendTelegramNotification ===
                      true
                    }
                    onChange={(e) =>
                      updateNotificationSettings(
                        "sendTelegramNotification",
                        e.target.checked,
                      )
                    }
                  />
                  Send Telegram Notification
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      draft.notificationSettings?.sendWhatsAppNotification ===
                      true
                    }
                    onChange={(e) =>
                      updateNotificationSettings(
                        "sendWhatsAppNotification",
                        e.target.checked,
                      )
                    }
                  />
                  Send WhatsApp Notification
                </label>
              </div>

              {draft.notificationSettings?.sendTelegramNotification && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Telegram Bot Token
                    </label>
                    <input
                      value={draft.notificationSettings?.telegramBotToken || ""}
                      onChange={(e) =>
                        updateNotificationSettings(
                          "telegramBotToken",
                          e.target.value,
                        )
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="123456:ABC..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Telegram Chat ID
                    </label>
                    <input
                      value={draft.notificationSettings?.telegramChatId || ""}
                      onChange={(e) =>
                        updateNotificationSettings(
                          "telegramChatId",
                          e.target.value,
                        )
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
                    <label className="mb-2 block text-sm font-semibold">
                      Access Token
                    </label>
                    <input
                      value={
                        draft.notificationSettings?.whatsappAccessToken || ""
                      }
                      onChange={(e) =>
                        updateNotificationSettings(
                          "whatsappAccessToken",
                          e.target.value,
                        )
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="Meta access token"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Phone Number ID
                    </label>
                    <input
                      value={
                        draft.notificationSettings?.whatsappPhoneNumberId || ""
                      }
                      onChange={(e) =>
                        updateNotificationSettings(
                          "whatsappPhoneNumberId",
                          e.target.value,
                        )
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Verify Token (optional)
                    </label>
                    <input
                      value={
                        draft.notificationSettings?.whatsappVerifyToken || ""
                      }
                      onChange={(e) =>
                        updateNotificationSettings(
                          "whatsappVerifyToken",
                          e.target.value,
                        )
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                      placeholder="optional"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Business Number
                    </label>
                    <input
                      value={
                        draft.notificationSettings?.whatsappBusinessNumber || ""
                      }
                      onChange={(e) =>
                        updateNotificationSettings(
                          "whatsappBusinessNumber",
                          e.target.value,
                        )
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
                    Configure confirmation and notification emails for this
                    form.
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Variables: {"{{formName}}"}, {"{{submissionDate}}"},{" "}
                  {"{{userName}}"}, {"{{userEmail}}"}, {"{{responsesTable}}"},{" "}
                  {"{{companyName}}"}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <label className="mb-3 block text-sm font-semibold">
                      Theme Preset
                    </label>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(EMAIL_TEMPLATE_PRESETS).map(
                        ([key, preset]) => {
                          const active =
                            (draft.emailTemplate?.preset ||
                              "green-professional") === key;
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
                              <div className="font-semibold">
                                {preset.label}
                              </div>
                              <div className="mt-2 flex gap-2">
                                {key !== "custom" && (
                                  <>
                                    <span
                                      className="h-4 w-4 rounded-full"
                                      style={{
                                        backgroundColor:
                                          preset.headerBackgroundColor,
                                      }}
                                    />
                                    <span
                                      className="h-4 w-4 rounded-full"
                                      style={{
                                        backgroundColor: preset.accentColor,
                                      }}
                                    />
                                    <span
                                      className="h-4 w-4 rounded-full border border-white/20"
                                      style={{
                                        backgroundColor:
                                          preset.cardBackgroundColor,
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Header Title
                      </label>
                      <input
                        value={draft.emailTemplate?.headerTitle || ""}
                        onChange={(e) =>
                          updateEmailTemplate("headerTitle", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="{{formName}}"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Header Subtitle
                      </label>
                      <input
                        value={draft.emailTemplate?.headerSubtitle || ""}
                        onChange={(e) =>
                          updateEmailTemplate("headerSubtitle", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Thank you for your submission"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Success / Thank-you Message
                      </label>
                      <textarea
                        value={draft.emailTemplate?.successMessage || ""}
                        onChange={(e) =>
                          updateEmailTemplate("successMessage", e.target.value)
                        }
                        rows={3}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                        placeholder="Thank you for your response."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Footer Text
                      </label>
                      <textarea
                        value={draft.emailTemplate?.footerText || ""}
                        onChange={(e) =>
                          updateEmailTemplate("footerText", e.target.value)
                        }
                        rows={3}
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 resize-none`}
                        placeholder="This email was sent automatically."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Company Name
                      </label>
                      <input
                        value={draft.emailTemplate?.companyName || ""}
                        onChange={(e) =>
                          updateEmailTemplate("companyName", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="TechnoSthan"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Website Button Text
                      </label>
                      <input
                        value={draft.emailTemplate?.websiteButtonText || ""}
                        onChange={(e) =>
                          updateEmailTemplate(
                            "websiteButtonText",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="Visit Website"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold">
                        Website Button URL
                      </label>
                      <input
                        value={draft.emailTemplate?.websiteButtonUrl || ""}
                        onChange={(e) =>
                          updateEmailTemplate(
                            "websiteButtonUrl",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                    <label className="mb-2 block text-sm font-semibold">
                      Submission Introduction Text
                    </label>
                    <div className="mb-3 text-xs text-slate-400">
                      This appears above the submission summary in the preview
                      and email.
                    </div>
                    <RichTextEditor
                      value={draft.emailTemplate?.submissionIntroText || ""}
                      onChange={(html) =>
                        updateEmailTemplate("submissionIntroText", html)
                      }
                      placeholder="Add a short introduction before the submitted details..."
                      minHeight="220px"
                    />
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          Footer Buttons
                        </div>
                        <div className="text-xs text-slate-400">
                          Optional buttons rendered in email footers.
                        </div>
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
                        <div
                          key={button.id || index}
                          className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 space-y-4"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold">
                                Button Text
                              </label>
                              <input
                                value={button.text || ""}
                                onChange={(e) =>
                                  updateFooterButton(
                                    index,
                                    "text",
                                    e.target.value,
                                  )
                                }
                                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                                placeholder="Visit Website"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold">
                                Button URL
                              </label>
                              <input
                                value={button.url || ""}
                                onChange={(e) =>
                                  updateFooterButton(
                                    index,
                                    "url",
                                    e.target.value,
                                  )
                                }
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
                        <label className="block text-sm font-semibold">
                          Header Background
                        </label>
                        <p className="mt-1 text-xs text-slate-400">
                          Choose a solid color or a header image with text
                          overlay.
                        </p>
                      </div>
                      <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                        {HEADER_BACKGROUND_TYPE_OPTIONS.map((option) => {
                          const active =
                            (draft.emailTemplate?.headerBackgroundType ||
                              "color") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateEmailTemplate(
                                  "headerBackgroundType",
                                  option.value,
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                active
                                  ? "bg-cyan-500 text-white"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(draft.emailTemplate?.headerBackgroundType || "color") ===
                    "color" ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Header Background Color
                        </label>
                        <input
                          value={
                            draft.emailTemplate?.headerBackgroundColor || ""
                          }
                          onChange={(e) =>
                            updateEmailTemplate(
                              "headerBackgroundColor",
                              e.target.value,
                            )
                          }
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          placeholder="#166534"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Header Background Image URL
                          </label>
                          <input
                            value={
                              draft.emailTemplate?.headerBackgroundImageUrl ||
                              ""
                            }
                            onChange={(e) => {
                              const normalized = normalizeHttpsUrl(
                                e.target.value,
                              );
                              updateEmailTemplate(
                                "headerBackgroundType",
                                normalized ? "image" : "color",
                              );
                              updateEmailTemplate(
                                "headerBackgroundImageUrl",
                                normalized,
                              );
                              updateEmailTemplate(
                                "headerBackgroundImagePublicId",
                                "",
                              );
                              updateEmailTemplate(
                                "headerBackgroundImageAsset",
                                null,
                              );
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
                            onChange={(e) =>
                              handleEmailTemplateImageFile(
                                "headerBackgroundImageUrl",
                                e.target.files?.[0] || null,
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              emailHeaderBackgroundInputRef.current?.click()
                            }
                            disabled={!!uploadingEmailTemplateField}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Upload size={16} />
                            {uploadingEmailTemplateField ===
                            "headerBackgroundImageUrl"
                              ? "Uploading..."
                              : draft.emailTemplate?.headerBackgroundImageUrl
                                ? "Change Image"
                                : "Upload Header Image"}
                          </button>
                          {draft.emailTemplate?.headerBackgroundImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                clearEmailTemplateImage(
                                  "headerBackgroundImageUrl",
                                )
                              }
                              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                            >
                              Clear Image
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Recommended size: 1200 × 500 px. Use a wide image with
                          enough empty space for readable text.
                        </p>
                        {(draft.emailTemplate?.headerBackgroundImageUrl ||
                          draft.emailTemplate?.headerBackgroundImageAsset) &&
                        !headerBackgroundPreviewFailed ? (
                          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                            <img
                              src={getOptimizedImageUrl(
                                draft.emailTemplate
                                  .headerBackgroundImageAsset ||
                                  draft.emailTemplate.headerBackgroundImageUrl,
                              )}
                              alt="Header background preview"
                              onError={() =>
                                setHeaderBackgroundPreviewFailed(true)
                              }
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
                            Header image preview unavailable. The fallback color
                            will be used in the live preview and email.
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Color
                            </label>
                            <input
                              value={
                                draft.emailTemplate?.headerOverlayColor || ""
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerOverlayColor",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#000000"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="0.9"
                              step="0.05"
                              value={
                                draft.emailTemplate?.headerOverlayOpacity ??
                                0.45
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerOverlayOpacity",
                                  e.target.value,
                                )
                              }
                              className="w-full"
                            />
                            <div className="mt-2 text-xs text-slate-400">
                              {Math.round(
                                (Number(
                                  draft.emailTemplate?.headerOverlayOpacity ??
                                    0.45,
                                ) || 0) * 100,
                              )}
                              %
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Header Text Color
                            </label>
                            <input
                              value={draft.emailTemplate?.headerTextColor || ""}
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerTextColor",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#ffffff"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Position
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.headerBackgroundPosition ||
                                "center"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerBackgroundPosition",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_POSITION_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Size
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.headerBackgroundSize ||
                                "cover"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerBackgroundSize",
                                  e.target.value,
                                )
                              }
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
                            <label className="mb-2 block text-sm font-semibold">
                              Text Alignment
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.headerTextAlign || "left"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerTextAlign",
                                  e.target.value,
                                )
                              }
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
                            <label className="mb-2 block text-sm font-semibold">
                              Minimum Header Height
                            </label>
                            <input
                              type="number"
                              min="120"
                              step="10"
                              value={
                                draft.emailTemplate?.headerMinHeight ?? 220
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "headerMinHeight",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="220"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <label className="block text-sm font-semibold">
                          Email Body Background
                        </label>
                        <p className="mt-1 text-xs text-slate-400">
                          Choose a solid color or a full email body image.
                        </p>
                      </div>
                      <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                        {[
                          { value: "color", label: "Color" },
                          { value: "image", label: "Image" },
                        ].map((option) => {
                          const active =
                            (draft.emailTemplate?.emailBodyBackgroundType ||
                              "color") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateEmailTemplate(
                                  "emailBodyBackgroundType",
                                  option.value,
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                active
                                  ? "bg-cyan-500 text-white"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(draft.emailTemplate?.emailBodyBackgroundType ||
                      "color") === "color" ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Email Body Background Color
                        </label>
                        <input
                          value={draft.emailTemplate?.bodyBackgroundColor || ""}
                          onChange={(e) =>
                            updateEmailTemplate(
                              "bodyBackgroundColor",
                              e.target.value,
                            )
                          }
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          placeholder="#f0fdf4"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Email Body Background Image URL
                          </label>
                          <input
                            value={
                              draft.emailTemplate
                                ?.emailBodyBackgroundImageUrl || ""
                            }
                            onChange={(e) => {
                              const normalized = normalizeHttpsUrl(
                                e.target.value,
                              );
                              updateEmailTemplate(
                                "emailBodyBackgroundType",
                                normalized ? "image" : "color",
                              );
                              updateEmailTemplate(
                                "emailBodyBackgroundImageUrl",
                                normalized,
                              );
                              updateEmailTemplate(
                                "emailBodyBackgroundImagePublicId",
                                "",
                              );
                              updateEmailTemplate(
                                "emailBodyBackgroundImageAsset",
                                null,
                              );
                              setBodyBackgroundPreviewFailed(false);
                            }}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            placeholder="https://res.cloudinary.com/..."
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            ref={emailBodyBackgroundInputRef}
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              handleEmailTemplateImageFile(
                                "emailBodyBackgroundImageUrl",
                                e.target.files?.[0] || null,
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              emailBodyBackgroundInputRef.current?.click()
                            }
                            disabled={!!uploadingEmailTemplateField}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Upload size={16} />
                            {uploadingEmailTemplateField ===
                            "emailBodyBackgroundImageUrl"
                              ? "Uploading..."
                              : draft.emailTemplate?.emailBodyBackgroundImageUrl
                                ? "Change Image"
                                : "Upload Body Image"}
                          </button>
                          {draft.emailTemplate?.emailBodyBackgroundImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                clearEmailTemplateImage(
                                  "emailBodyBackgroundImageUrl",
                                )
                              }
                              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                            >
                              Clear Image
                            </button>
                          )}
                        </div>
                        {(draft.emailTemplate?.emailBodyBackgroundImageUrl ||
                          draft.emailTemplate?.emailBodyBackgroundImageAsset) &&
                        !bodyBackgroundPreviewFailed ? (
                          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                            <img
                              src={getOptimizedImageUrl(
                                draft.emailTemplate
                                  .emailBodyBackgroundImageAsset ||
                                  draft.emailTemplate
                                    .emailBodyBackgroundImageUrl,
                              )}
                              alt="Email body background preview"
                              onError={() =>
                                setBodyBackgroundPreviewFailed(true)
                              }
                              className="h-40 w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                            No body image selected
                          </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Color
                            </label>
                            <input
                              value={
                                draft.emailTemplate?.emailBodyOverlayColor || ""
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "emailBodyOverlayColor",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#ffffff"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="0.9"
                              step="0.05"
                              value={
                                draft.emailTemplate?.emailBodyOverlayOpacity ??
                                0.9
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "emailBodyOverlayOpacity",
                                  e.target.value,
                                )
                              }
                              className="w-full"
                            />
                            <div className="mt-2 text-xs text-slate-400">
                              {Math.round(
                                (Number(
                                  draft.emailTemplate
                                    ?.emailBodyOverlayOpacity ?? 0.9,
                                ) || 0) * 100,
                              )}
                              %
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Position
                            </label>
                            <select
                              value={
                                draft.emailTemplate
                                  ?.emailBodyBackgroundPosition || "center"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "emailBodyBackgroundPosition",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_POSITION_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Size
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.emailBodyBackgroundSize ||
                                "cover"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "emailBodyBackgroundSize",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Body Background
                      </label>
                      <input
                        value={draft.emailTemplate?.bodyBackgroundColor || ""}
                        onChange={(e) =>
                          updateEmailTemplate(
                            "bodyBackgroundColor",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#f0fdf4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Card Background
                      </label>
                      <input
                        value={draft.emailTemplate?.cardBackgroundColor || ""}
                        onChange={(e) =>
                          updateEmailTemplate(
                            "cardBackgroundColor",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#ffffff"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Accent Color
                      </label>
                      <input
                        value={draft.emailTemplate?.accentColor || ""}
                        onChange={(e) =>
                          updateEmailTemplate("accentColor", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#16a34a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Text Color
                      </label>
                      <input
                        value={draft.emailTemplate?.textColor || ""}
                        onChange={(e) =>
                          updateEmailTemplate("textColor", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#0f172a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Button Color
                      </label>
                      <input
                        value={draft.emailTemplate?.buttonColor || ""}
                        onChange={(e) =>
                          updateEmailTemplate("buttonColor", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="#16a34a"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Border Radius
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.emailTemplate?.borderRadius ?? ""}
                        onChange={(e) =>
                          updateEmailTemplate("borderRadius", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <label className="block text-sm font-semibold">
                          Footer Background
                        </label>
                        <p className="mt-1 text-xs text-slate-400">
                          Choose a color or image for the footer section.
                        </p>
                      </div>
                      <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                        {[
                          { value: "color", label: "Color" },
                          { value: "image", label: "Image" },
                        ].map((option) => {
                          const active =
                            (draft.emailTemplate?.footerBackgroundType ||
                              "color") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateEmailTemplate(
                                  "footerBackgroundType",
                                  option.value,
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                active
                                  ? "bg-cyan-500 text-white"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(draft.emailTemplate?.footerBackgroundType || "color") ===
                    "color" ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Footer Background Color
                        </label>
                        <input
                          value={
                            draft.emailTemplate?.footerBackgroundColor || ""
                          }
                          onChange={(e) =>
                            updateEmailTemplate(
                              "footerBackgroundColor",
                              e.target.value,
                            )
                          }
                          className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                          placeholder="#166534"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Footer Background Image URL
                          </label>
                          <input
                            value={
                              draft.emailTemplate?.footerBackgroundImageUrl ||
                              ""
                            }
                            onChange={(e) => {
                              const normalized = normalizeHttpsUrl(
                                e.target.value,
                              );
                              updateEmailTemplate(
                                "footerBackgroundType",
                                normalized ? "image" : "color",
                              );
                              updateEmailTemplate(
                                "footerBackgroundImageUrl",
                                normalized,
                              );
                              updateEmailTemplate(
                                "footerBackgroundImagePublicId",
                                "",
                              );
                              updateEmailTemplate(
                                "footerBackgroundImageAsset",
                                null,
                              );
                              setFooterBackgroundPreviewFailed(false);
                            }}
                            className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            placeholder="https://res.cloudinary.com/..."
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            ref={emailFooterBackgroundInputRef}
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              handleEmailTemplateImageFile(
                                "footerBackgroundImageUrl",
                                e.target.files?.[0] || null,
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              emailFooterBackgroundInputRef.current?.click()
                            }
                            disabled={!!uploadingEmailTemplateField}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Upload size={16} />
                            {uploadingEmailTemplateField ===
                            "footerBackgroundImageUrl"
                              ? "Uploading..."
                              : draft.emailTemplate?.footerBackgroundImageUrl
                                ? "Change Image"
                                : "Upload Footer Image"}
                          </button>
                          {draft.emailTemplate?.footerBackgroundImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                clearEmailTemplateImage(
                                  "footerBackgroundImageUrl",
                                )
                              }
                              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                            >
                              Clear Image
                            </button>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Color
                            </label>
                            <input
                              value={
                                draft.emailTemplate?.footerOverlayColor || ""
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerOverlayColor",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#000000"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Overlay Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="0.9"
                              step="0.05"
                              value={
                                draft.emailTemplate?.footerOverlayOpacity ??
                                0.45
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerOverlayOpacity",
                                  e.target.value,
                                )
                              }
                              className="w-full"
                            />
                            <div className="mt-2 text-xs text-slate-400">
                              {Math.round(
                                (Number(
                                  draft.emailTemplate?.footerOverlayOpacity ??
                                    0.45,
                                ) || 0) * 100,
                              )}
                              %
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Footer Text Color
                            </label>
                            <input
                              value={draft.emailTemplate?.footerTextColor || ""}
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerTextColor",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="#ffffff"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Position
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.footerBackgroundPosition ||
                                "center"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerBackgroundPosition",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                            >
                              {HEADER_BACKGROUND_POSITION_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Background Size
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.footerBackgroundSize ||
                                "cover"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerBackgroundSize",
                                  e.target.value,
                                )
                              }
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
                            <label className="mb-2 block text-sm font-semibold">
                              Text Alignment
                            </label>
                            <select
                              value={
                                draft.emailTemplate?.footerTextAlign || "left"
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerTextAlign",
                                  e.target.value,
                                )
                              }
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
                            <label className="mb-2 block text-sm font-semibold">
                              Minimum Footer Height
                            </label>
                            <input
                              type="number"
                              min="120"
                              step="10"
                              value={
                                draft.emailTemplate?.footerMinHeight ?? 220
                              }
                              onChange={(e) =>
                                updateEmailTemplate(
                                  "footerMinHeight",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                              placeholder="220"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Logo URL
                        </label>
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
                          onChange={(e) =>
                            handleEmailTemplateImageFile(
                              "logoUrl",
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => emailLogoInputRef.current?.click()}
                          disabled={!!uploadingEmailTemplateField}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload size={16} />
                          {uploadingEmailTemplateField === "logoUrl"
                            ? "Uploading..."
                            : draft.emailTemplate?.logoUrl
                              ? "Change Logo"
                              : "Upload Logo"}
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
                            src={getOptimizedImageUrl(
                              draft.emailTemplate.logoAsset ||
                                draft.emailTemplate.logoUrl,
                            )}
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
                        <label className="mb-2 block text-sm font-semibold">
                          Banner Image URL
                        </label>
                        <input
                          value={
                            draft.emailTemplate?.bannerUrl ||
                            draft.emailTemplate?.bannerImageUrl ||
                            ""
                          }
                          onChange={(e) => {
                            updateEmailTemplate("bannerUrl", e.target.value);
                            updateEmailTemplate(
                              "bannerImageUrl",
                              e.target.value,
                            );
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
                          onChange={(e) =>
                            handleEmailTemplateImageFile(
                              "bannerImageUrl",
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => emailBannerInputRef.current?.click()}
                          disabled={!!uploadingEmailTemplateField}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload size={16} />
                          {uploadingEmailTemplateField === "bannerImageUrl"
                            ? "Uploading..."
                            : draft.emailTemplate?.bannerImageUrl
                              ? "Change Banner"
                              : "Upload Banner"}
                        </button>
                        {draft.emailTemplate?.bannerImageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              clearEmailTemplateImage("bannerImageUrl")
                            }
                            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                          >
                            Clear Banner
                          </button>
                        )}
                      </div>
                      {(draft.emailTemplate?.bannerUrl ||
                        draft.emailTemplate?.bannerImageUrl) &&
                      !bannerPreviewFailed ? (
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                          <img
                            src={getOptimizedImageUrl(
                              draft.emailTemplate.bannerImageAsset ||
                                draft.emailTemplate.bannerUrl ||
                                draft.emailTemplate.bannerImageUrl,
                            )}
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
                      {bannerPreviewFailed &&
                        (draft.emailTemplate?.bannerUrl ||
                          draft.emailTemplate?.bannerImageUrl) && (
                          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm font-semibold">
                            Banner preview unavailable
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-semibold">
                      Live Preview
                    </div>
                    <div
                      className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
                      style={{
                        backgroundColor:
                          emailTemplatePreview.resolved.bodyBackgroundColor,

                        backgroundImage:
                          emailTemplatePreview.emailBodyBackgroundImageUrl
                            ? `url("${emailTemplatePreview.emailBodyBackgroundImageUrl}")`
                            : "none",

                        backgroundSize:
                          emailTemplatePreview.emailBodyBackgroundSize ||
                          "cover",

                        backgroundPosition:
                          emailTemplatePreview.emailBodyBackgroundPosition ||
                          "center",

                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {emailTemplatePreview.emailBodyBackgroundImageUrl ? (
                        <div
                          className="pointer-events-none absolute inset-0 z-0"
                          style={{
                            backgroundColor: hexToRgba(
                              emailTemplatePreview.emailBodyOverlayColor ||
                                "#ffffff",
                              emailTemplatePreview.emailBodyOverlayOpacity ??
                                0.9,
                            ),
                          }}
                        />
                      ) : null}
                      <div className="relative z-10">
                        <div
                          className="relative overflow-hidden"
                          style={{
                            minHeight: `${emailTemplatePreview.headerMinHeight || 220}px`,
                            backgroundColor:
                              emailTemplatePreview.resolved
                                .headerBackgroundColor,
                            backgroundImage:
                              emailTemplatePreview.headerBackgroundType ===
                                "image" &&
                              emailTemplatePreview.headerBackgroundImageUrl
                                ? `url("${emailTemplatePreview.headerBackgroundImageUrl}")`
                                : "none",
                            backgroundPosition:
                              emailTemplatePreview.headerBackgroundPosition ||
                              "center",
                            backgroundSize:
                              emailTemplatePreview.headerBackgroundSize ||
                              "cover",
                            backgroundRepeat: "no-repeat",
                            color: emailTemplatePreview.headerTextColor,
                          }}
                        >
                          {emailTemplatePreview.headerBackgroundType ===
                            "image" &&
                          emailTemplatePreview.headerBackgroundImageUrl ? (
                            <div
                              className="pointer-events-none absolute inset-0 z-0"
                              style={{
                                backgroundColor: hexToRgba(
                                  emailTemplatePreview.headerOverlayColor,
                                  emailTemplatePreview.headerOverlayOpacity ??
                                    0.45,
                                ),
                              }}
                            />
                          ) : null}
                          <div
                            className="relative z-10 flex h-full min-h-[220px] flex-col justify-center gap-2 p-5"
                            style={{
                              minHeight: `${emailTemplatePreview.headerMinHeight || 220}px`,
                              textAlign:
                                emailTemplatePreview.headerTextAlign || "left",
                              color: emailTemplatePreview.headerTextColor,
                            }}
                          >
                            {emailTemplatePreview.logoUrl &&
                            !logoPreviewFailed ? (
                              <img
                                src={getOptimizedImageUrl(
                                  emailTemplatePreview.logoUrl,
                                )}
                                alt="Email preview logo"
                                onError={() => setLogoPreviewFailed(true)}
                                className={`mb-2 h-12 w-full object-contain ${
                                  emailTemplatePreview.headerTextAlign ===
                                  "center"
                                    ? "object-center"
                                    : emailTemplatePreview.headerTextAlign ===
                                        "right"
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

                        {emailTemplatePreview.bannerUrl &&
                        !bannerPreviewFailed ? (
                          <div className="px-5 pt-5">
                            <img
                              src={getOptimizedImageUrl(
                                emailTemplatePreview.bannerUrl,
                              )}
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

                        <div
                          className="p-5"
                          style={{
                            color: emailTemplatePreview.resolved.textColor,
                          }}
                        >
                          <div
                            className="rounded-3xl border p-4"
                            style={{
                              backgroundColor:
                                emailTemplatePreview.resolved
                                  .bodyBackgroundColor,
                              borderColor:
                                emailTemplatePreview.resolved.accentColor,
                            }}
                          >
                            <div className="text-sm font-bold">
                              {emailTemplatePreview.successMessage}
                            </div>
                            <div className="mt-3 space-y-1 text-xs leading-6 opacity-80">
                              <div>
                                <strong>Form:</strong>{" "}
                                {draft.title || "Sample Form"}
                              </div>
                              <div>
                                <strong>Submitted at:</strong>{" "}
                                {emailTemplatePreview.context.submissionDate}
                              </div>
                            </div>
                          </div>

                          <div
                            className="mt-4 overflow-hidden rounded-3xl border"
                            style={{
                              borderColor: "rgba(148,163,184,0.18)",
                              backgroundColor:
                                emailTemplatePreview.resolved
                                  .cardBackgroundColor,
                            }}
                          >
                            <table className="min-w-full text-left text-sm">
                              <tbody>
                                {emailTemplatePreview.tableRows.map((row) => (
                                  <tr
                                    key={row.question}
                                    className="border-t first:border-t-0"
                                    style={{
                                      borderColor: "rgba(148,163,184,0.18)",
                                    }}
                                  >
                                    <td
                                      className="w-1/3 px-4 py-3 font-semibold"
                                      style={{
                                        color:
                                          emailTemplatePreview.resolved
                                            .textColor,
                                        backgroundColor: "rgba(0,0,0,0.02)",
                                      }}
                                    >
                                      {row.question}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          emailTemplatePreview.resolved
                                            .textColor,
                                      }}
                                    >
                                      {row.answer}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {emailTemplatePreview.submissionIntroText ? (
                            <div
                              className="mt-4 rounded-3xl border p-4"
                              style={{
                                borderColor: "rgba(148,163,184,0.18)",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                color: emailTemplatePreview.resolved.textColor,
                              }}
                              dangerouslySetInnerHTML={{
                                __html: sanitizeRichTextHtml(
                                  emailTemplatePreview.submissionIntroText,
                                ),
                              }}
                            />
                          ) : null}

                          {!(emailTemplatePreview.footerButtons || []).length &&
                          emailTemplatePreview.buttonUrl ? (
                            <div className="mt-4">
                              <a
                                href={emailTemplatePreview.buttonUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                                style={{
                                  backgroundColor:
                                    emailTemplatePreview.resolved.buttonColor ||
                                    emailTemplatePreview.resolved.accentColor,
                                }}
                              >
                                {emailTemplatePreview.buttonText}
                              </a>
                            </div>
                          ) : null}

                          <div
                            className="relative mt-5 overflow-hidden rounded-3xl border"
                            style={{
                              borderColor: "rgba(148,163,184,0.18)",
                              backgroundColor:
                                emailTemplatePreview.resolved
                                  .footerBackgroundColor,
                              backgroundImage:
                                emailTemplatePreview.footerBackgroundType ===
                                  "image" &&
                                emailTemplatePreview.footerBackgroundImageUrl
                                  ? `url("${emailTemplatePreview.footerBackgroundImageUrl}")`
                                  : "none",
                              backgroundPosition:
                                emailTemplatePreview.footerBackgroundPosition ||
                                "center",
                              backgroundSize:
                                emailTemplatePreview.footerBackgroundSize ||
                                "cover",
                              backgroundRepeat: "no-repeat",
                              color: emailTemplatePreview.footerTextColor,
                              minHeight: `${emailTemplatePreview.footerSectionHeight || Math.max(emailTemplatePreview.headerMinHeight || 220, emailTemplatePreview.footerMinHeight || 220)}px`,
                            }}
                          >
                            {emailTemplatePreview.footerBackgroundType ===
                              "image" &&
                            emailTemplatePreview.footerBackgroundImageUrl ? (
                              <div
                                className="pointer-events-none absolute inset-0 z-0"
                                style={{
                                  backgroundColor: hexToRgba(
                                    emailTemplatePreview.footerOverlayColor ||
                                      "#000000",
                                    emailTemplatePreview.footerOverlayOpacity ??
                                      0.45,
                                  ),
                                }}
                              />
                            ) : null}
                            <div
                              className="relative z-10 flex h-full flex-col justify-center gap-3 p-5"
                              style={{
                                textAlign:
                                  emailTemplatePreview.footerTextAlign ||
                                  "left",
                              }}
                            >
                              {emailTemplatePreview.footerText && (
                                <div className="text-xs leading-6 opacity-90">
                                  {emailTemplatePreview.footerText}
                                </div>
                              )}
                              {(emailTemplatePreview.footerButtons || [])
                                .length ? (
                                <div
                                  className="flex flex-wrap gap-2"
                                  style={{
                                    justifyContent:
                                      emailTemplatePreview.footerTextAlign ===
                                      "center"
                                        ? "center"
                                        : emailTemplatePreview.footerTextAlign ===
                                            "right"
                                          ? "flex-end"
                                          : "flex-start",
                                  }}
                                >
                                  {emailTemplatePreview.footerButtons.map(
                                    (button) => (
                                      <a
                                        key={button.id}
                                        href={button.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                                        style={{
                                          backgroundColor:
                                            emailTemplatePreview.resolved
                                              .buttonColor ||
                                            emailTemplatePreview.resolved
                                              .accentColor,
                                        }}
                                      >
                                        {button.text}
                                      </a>
                                    ),
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
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
                  <p className={`text-sm ${theme.textSecondary}`}>
                    {responseTable.length} submissions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openResponseExportDialog}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    <Download size={16} /> Export
                  </button>
                  <button
                    type="button"
                    onClick={openResponseImportDialog}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    <Upload size={16} /> Import
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setResponsesTab((prev) =>
                        prev === "list" ? "analysis" : "list",
                      )
                    }
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  >
                    {responsesTab === "list"
                      ? "Interest Analysis"
                      : "Response List"}
                  </button>
                </div>
              </div>

              {responsesTab === "analysis" ? (
                <div className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Hot Leads",
                        value: "hot",
                        count: analysisStats.hot,
                      },
                      {
                        label: "Warm Leads",
                        value: "warm",
                        count: analysisStats.warm,
                      },
                      {
                        label: "Cold Leads",
                        value: "cold",
                        count: analysisStats.cold,
                      },
                      {
                        label: "5 Star",
                        value: "5",
                        count: analysisStats.ratings[5],
                      },
                      {
                        label: "Interested Yes",
                        value: "interested",
                        count: analysisStats.interestedYes,
                      },
                      {
                        label: "Available to Join",
                        value: "available",
                        count: analysisStats.availableYes,
                      },
                      {
                        label: "Has Phone",
                        value: "phone",
                        count: analysisStats.hasPhone,
                      },
                      {
                        label: "Has Email",
                        value: "email",
                        count: analysisStats.hasEmail,
                      },
                    ].map((card) => {
                      const active =
                        (card.value === "hot" &&
                          analysisLeadFilter === "hot") ||
                        (card.value === "warm" &&
                          analysisLeadFilter === "warm") ||
                        (card.value === "cold" &&
                          analysisLeadFilter === "cold") ||
                        (card.value === "5" && analysisRatingFilter === "5") ||
                        (card.value === "interested" &&
                          analysisInterestFilter === "yes") ||
                        (card.value === "available" &&
                          analysisAvailabilityFilter === "yes") ||
                        (card.value === "phone" &&
                          analysisPhoneFilter === "yes") ||
                        (card.value === "email" &&
                          analysisEmailFilter === "yes");

                      return (
                        <button
                          key={card.label}
                          type="button"
                          onClick={() => {
                            if (
                              card.value === "hot" ||
                              card.value === "warm" ||
                              card.value === "cold"
                            ) {
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
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            {card.label}
                          </div>
                          <div className="mt-2 text-3xl font-black">
                            {card.count}
                          </div>
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
                      onChange={(e) =>
                        setAnalysisInterestFilter(e.target.value)
                      }
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All Interest</option>
                      <option value="yes">Interested Yes</option>
                      <option value="no">Interested No</option>
                    </select>
                    <select
                      value={analysisAvailabilityFilter}
                      onChange={(e) =>
                        setAnalysisAvailabilityFilter(e.target.value)
                      }
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
                            from:
                              responseDateFrom ||
                              getFilterRange(responseFilter).from,
                            to:
                              responseDateTo ||
                              getFilterRange(responseFilter).to,
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
                            from:
                              responseDateFrom ||
                              getFilterRange(responseFilter).from,
                            to:
                              responseDateTo ||
                              getFilterRange(responseFilter).to,
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
                            from:
                              responseDateFrom ||
                              getFilterRange(responseFilter).from,
                            to:
                              responseDateTo ||
                              getFilterRange(responseFilter).to,
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
                          <tr
                            key={response._id}
                            className="border-t border-white/10"
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  (response.leadCategory ||
                                    getScoreBucket(
                                      Number(response.score || 0),
                                    )) === "hot"
                                    ? "bg-red-500/20 text-red-300"
                                    : (response.leadCategory ||
                                          getScoreBucket(
                                            Number(response.score || 0),
                                          )) === "warm"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-slate-500/20 text-slate-300"
                                }`}
                              >
                                {Number(response.score || 0)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {response.name || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {response.email || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {response.phone || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {getRatingValue(response) || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {getInterestAnswer(response) || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {formatSubmittedAt(
                                response.submittedAt || response.createdAt,
                              )}
                            </td>
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
                                      rating:
                                        getRatingValue(response) || undefined,
                                      score:
                                        response.leadCategory ||
                                        getScoreBucket(
                                          Number(response.score || 0),
                                        ),
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
                            <td
                              colSpan={9}
                              className="px-4 py-8 text-center text-slate-400"
                            >
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
                    <select
                      value={responseSourceFilter}
                      onChange={(e) => setResponseSourceFilter(e.target.value)}
                      className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                    >
                      <option value="all">All responses</option>
                      <option value="manual">Manual only</option>
                      <option value="imported">Imported only</option>
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
                        setResponseSourceFilter("all");
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
                          <th className="px-4 py-3">Source</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3">View</th>
                          <th className="px-4 py-3">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseTable.map((response) => (
                          <tr
                            key={response._id}
                            className="border-t border-white/10"
                          >
                            <td className="px-4 py-3">
                              {response.name || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {response.email || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {response.phone || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  response.imported
                                    ? "bg-cyan-500/15 text-cyan-100"
                                    : "bg-white/10 text-slate-200"
                                }`}
                              >
                                {response.sourceLabel || "Manual"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {formatSubmittedAt(
                                response.submittedAt || response.createdAt,
                              )}
                            </td>
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
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-slate-400"
                            >
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

      <input
        ref={responseImportInputRef}
        type="file"
        accept=".csv,.xls,.xlsx,.json,text/csv,application/json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleResponseImportChange}
        className="hidden"
      />

      {responseExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`${theme.card} w-full max-w-xl rounded-3xl border ${theme.border} p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Export Responses</h3>
                <p className={`mt-1 text-sm ${theme.textSecondary}`}>
                  Choose a format for the currently filtered response set.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResponseExportDialog}
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ["xlsx", "Excel (.xlsx)"],
                ["csv", "CSV (.csv)"],
                ["pdf", "PDF (.pdf)"],
                ["json", "JSON (.json)"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                    responseExportFormat === value
                      ? "border-cyan-400/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <input
                    type="radio"
                    name="responseExportFormat"
                    checked={responseExportFormat === value}
                    onChange={() => setResponseExportFormat(value)}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeResponseExportDialog}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await exportResponses(
                      {
                        search: responseSearch,
                        source: responseSourceFilter,
                        ...getFilterRange(responseFilter),
                        from:
                          responseDateFrom ||
                          getFilterRange(responseFilter).from,
                        to:
                          responseDateTo ||
                          getFilterRange(responseFilter).to,
                      },
                      "responses",
                      responseExportFormat,
                    );
                    closeResponseExportDialog();
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || "Failed to export responses",
                    );
                  }
                }}
                className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {responseImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`${theme.card} max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border ${theme.border} p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Import Responses</h3>
                <p className={`mt-1 text-sm ${theme.textSecondary}`}>
                  Upload a CSV, Excel, or JSON file, map columns, and resolve duplicates before importing.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResponseImportDialog}
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            {!responseImportPreview ? (
              <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <button
                  type="button"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files?.[0];
                    if (file) {
                      void handleResponseImportFileSelect(file);
                    }
                  }}
                  onClick={() => responseImportInputRef.current?.click()}
                  className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center"
                >
                  <Upload size={28} className="mb-3 text-cyan-300" />
                  <div className="text-lg font-semibold">Drag & Drop File</div>
                  <div className={`mt-1 text-sm ${theme.textSecondary}`}>or browse</div>
                </button>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold">Supported</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <div>CSV</div>
                    <div>Excel (.xlsx)</div>
                    <div>JSON</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold">File</div>
                    <div className="mt-2 text-sm text-slate-300">
                      {responseImportFile?.name || responseImportPreview.filename || "Selected file"}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      Rows: {responseImportPreview.totalRows || 0}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold">Duplicate Handling</div>
                    <div className="mt-3 space-y-2">
                      {[
                        ["skip", "Skip duplicates"],
                        ["update", "Update existing"],
                        ["import-all", "Import everything"],
                      ].map(([value, label]) => (
                        <label key={value} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm">
                          <span>{label}</span>
                          <input
                            type="radio"
                            checked={responseImportDuplicateStrategy === value}
                            onChange={() => setResponseImportDuplicateStrategy(value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold">Mapping</div>
                    <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-white/10">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-950/95 text-slate-300">
                          <tr>
                            <th className="px-3 py-2">Imported Column</th>
                            <th className="px-3 py-2">Current Question</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(responseImportPreview.columns || []).map((column, index) => {
                            const mapping = responseImportMappings[index] || {};
                            return (
                              <tr key={`${column.index}-${column.header}`} className="border-t border-white/10">
                                <td className="px-3 py-3 text-slate-300">{column.header || `Column ${column.index + 1}`}</td>
                                <td className="px-3 py-3">
                                  <select
                                    value={mapping.questionId || ""}
                                    onChange={(event) =>
                                      updateResponseImportMapping(index, "questionId", event.target.value)
                                    }
                                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-3 py-2 text-sm`}
                                  >
                                    <option value="">Ignore</option>
                                    {(draft.questions || [])
                                      .filter((question) => question.type !== "sectionHeading")
                                      .map((question) => (
                                        <option key={question._id || question.id} value={question._id || question.id}>
                                          {question.label || "Untitled question"}
                                        </option>
                                      ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold">Duplicate Field</div>
                      <select
                        value={responseImportDuplicateField}
                        onChange={(event) => setResponseImportDuplicateField(event.target.value)}
                        className={`${theme.input} mt-3 w-full rounded-2xl border ${theme.border} px-3 py-2 text-sm`}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="submission id">Submission ID</option>
                        {(draft.questions || [])
                          .filter((question) => question.type !== "sectionHeading")
                          .map((question) => (
                            <option key={question._id || question.id} value={question.label || question._id || question.id}>
                              {question.label || "Untitled question"}
                            </option>
                          ))}
                      </select>
                    </div>
                    {responseImportProgress > 0 && (
                      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Importing...</span>
                          <span>{responseImportProgress}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-cyan-400 transition-all"
                            style={{ width: `${responseImportProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {responseImportSummary && (
                      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="text-sm font-semibold text-emerald-100">
                          Import Completed
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>Imported: {responseImportSummary.imported || 0}</div>
                          <div>Updated: {responseImportSummary.updated || 0}</div>
                          <div>Skipped: {responseImportSummary.skipped || 0}</div>
                          <div>Errors: {responseImportSummary.errors || 0}</div>
                        </div>
                        {responseImportBatchId && (
                          <button
                            type="button"
                            onClick={handleUndoResponseImport}
                            className="mt-4 w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100"
                          >
                            Undo Import
                          </button>
                        )}
                        {responseImportErrorRows.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const rows = [
                                ["Row Number", "Error", "Reason"],
                                ...responseImportErrorRows.map((row) => [
                                  row.rowNumber,
                                  row.error,
                                  row.reason,
                                ]),
                              ];
                              const csv = rows
                                .map((row) =>
                                  row
                                    .map((cell) =>
                                      `"${String(cell ?? "").replace(/"/g, '""')}"`,
                                    )
                                    .join(","),
                                )
                                .join("\n");
                              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                              const url = URL.createObjectURL(blob);
                              const anchor = document.createElement("a");
                              anchor.href = url;
                              anchor.download = `${slugify(draft.slug || draft.title || "form")}-import-errors.csv`;
                              anchor.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
                          >
                            Download Error Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeResponseImportDialog}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              {!responseImportPreview ? (
                <button
                  type="button"
                  onClick={() => responseImportInputRef.current?.click()}
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  Browse
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCommitResponseImport}
                  disabled={responseImportLoading}
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Import
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className={`${theme.card} max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border ${theme.border} p-6`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Import Form Preview</h3>
                <p className={`text-sm ${theme.textSecondary}`}>
                  Review and adjust detected fields before applying them.
                </p>
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
                <label className="mb-2 block text-sm font-semibold">
                  Detected Form Title
                </label>
                <input
                  value={importPreview.title || ""}
                  onChange={(e) =>
                    updateImportPreviewField("title", e.target.value)
                  }
                  className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
                  placeholder="Form title"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Detected Description
                </label>
                <RichTextEditor
                  value={importPreview.description || ""}
                  onChange={(html) =>
                    updateImportPreviewField("description", html)
                  }
                  placeholder="Form description"
                  minHeight="220px"
                />
              </div>
            </div>

            {Array.isArray(importPreview.sections) &&
              importPreview.sections.length > 0 && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 text-sm font-semibold">
                    Detected Sections
                  </div>
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
                <div
                  key={question.id || index}
                  className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 space-y-4"
                >
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
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Question Label
                      </label>
                      <input
                        value={question.label || ""}
                        onChange={(e) =>
                          updateImportedQuestion(index, "label", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Question Type
                      </label>
                      <select
                        value={question.type || "shortAnswer"}
                        onChange={(e) =>
                          updateImportedQuestion(index, "type", e.target.value)
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      >
                        {QUESTION_TYPES.map((typeOption) => (
                          <option
                            key={typeOption.value}
                            value={typeOption.value}
                          >
                            {typeOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Placeholder
                      </label>
                      <input
                        value={question.placeholder || ""}
                        onChange={(e) =>
                          updateImportedQuestion(
                            index,
                            "placeholder",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Help Text
                      </label>
                      <input
                        value={question.helpText || ""}
                        onChange={(e) =>
                          updateImportedQuestion(
                            index,
                            "helpText",
                            e.target.value,
                          )
                        }
                        className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 text-sm`}
                      />
                    </div>
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={question.required === true}
                          onChange={(e) =>
                            updateImportedQuestion(
                              index,
                              "required",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded border-white/20 bg-transparent"
                        />
                        Required
                      </label>
                    </div>
                    {["dropdown", "radio", "checkbox"].includes(
                      question.type,
                    ) && (
                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-slate-300">
                          Options
                        </label>
                        <textarea
                          value={question.optionsText || ""}
                          onChange={(e) =>
                            updateImportedQuestion(
                              index,
                              "optionsText",
                              e.target.value,
                            )
                          }
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
          <div
            className={`${theme.card} max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border ${theme.border} p-6`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Response Details</h3>
                <p className={`text-sm ${theme.textSecondary}`}>
                  {selectedResponse.referenceId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedResponse(null);
                  Object.values(secretRevealTimersRef.current).forEach(
                    (timer) => {
                      window.clearTimeout(timer);
                    },
                  );
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

            <div className="space-y-6">{responseAnswerSections}</div>
          </div>
        </div>
      )}

      <DraftsPanel
        open={draftsOpen}
        onClose={() => setDraftsOpen(false)}
        drafts={drafts}
        moduleLabel="Form Builder"
        hasUnsavedChanges={shouldAutoSaveDraft}
        titleResolver={(draftItem) =>
          draftItem.data?.title ||
          draftItem.data?.emailTemplate?.headerTitle ||
          "Untitled Form Draft"
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
          if (!draftItem?.key) return;

          const nextData = {
            ...EMPTY_FORM,
            emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
            notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
            ...(draftItem.data || {}),
          };

          const restoredFormId =
            nextData.selectedFormId || draftItem.recordId || null;

          const normalizedDraft = normalizeForm(nextData);

          draftResolutionRef.current = "restore";

          setSelectedFormId(
            restoredFormId && restoredFormId !== "new" ? restoredFormId : null,
          );

          setDraftKey(draftItem.key);
          setDraft(normalizedDraft);
          setSlugTouched(Boolean(normalizedDraft.slug));
          setDraftsOpen(false);
        }}
        onDelete={(draftItem) => {
          if (!draftItem?.key) return;

          removeDraft(draftItem.key);

          if (draftItem.key === draftKey) {
            startNewForm();
          }
        }}
      />
    </div>
  );
};

export default FormManagement;
