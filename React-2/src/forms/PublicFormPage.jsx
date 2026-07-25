import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import {
  DEFAULT_DESCRIPTION_STYLE,
  DEFAULT_TITLE_STYLE,
  resolveTypographyStyle,
} from "./formTypography";
import { sanitizeRichTextHtml } from "./richTextUtils";

import {
  getPublicFormBySlug,
  sendPublicFormVerification,
  verifyPublicFormVerification,
  sendPublicPhoneVerification,
  verifyPublicPhoneVerification,
  submitPublicForm,
} from "./formsApi";
import {
  CheckCircle2,
  Upload,
  Send,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RefreshCcw,
  X,
} from "lucide-react";
import { getMediaUrl, getOptimizedImageUrl } from "../shared/lib/assetUrl";
import { normalizeHttpUrl } from "./formUtils";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const OPTION_BASED_CONDITIONAL_FIELD_TYPES = new Set([
  "dropdown",
  "radio",
  "checkbox",
  "multipleSelect",
]);

const isOptionBasedConditionalFieldType = (type = "") =>
  OPTION_BASED_CONDITIONAL_FIELD_TYPES.has(String(type || "").trim());

const buildConditionalFieldKey = (...segments) =>
  segments
    .flat()
    .map((segment) => String(segment || "").trim())
    .filter(Boolean)
    .join("::");

const isConditionalFieldKey = (key = "") => String(key || "").includes("::");

const getQuestionId = (question = {}) =>
  String(question?._id || question?.id || "").trim();

const LEGACY_DEFAULT_SECTION_ID = "legacy-default-section";
const LEGACY_DEFAULT_SECTION_TITLE = "Form Details";
const QUESTIONS_PER_PAGE = 4;

const normalizePublicSection = (section = {}, index = 0) => ({
  id:
    String(section.id || section.sectionId || section.key || "").trim() ||
    LEGACY_DEFAULT_SECTION_ID,
  title:
    String(section.title || section.label || "").trim() ||
    LEGACY_DEFAULT_SECTION_TITLE,
  description: String(section.description || section.helpText || "").trim(),
  order: typeof section.order === "number" ? section.order : index,
  isActive: section.isActive !== false,
});

const groupFormSections = (form = {}) => {
  const questions =
    Array.isArray(form.questions) && form.questions.length
      ? form.questions
      : flattenQuestionsFromSections(
          Array.isArray(form.sections) ? form.sections : [],
        );
  const normalizedSections = (Array.isArray(form.sections) ? form.sections : [])
    .map((section, index) => normalizePublicSection(section, index))
    .filter(
      (section, index, list) =>
        list.findIndex((item) => item.id === section.id) === index,
    )
    .sort((left, right) => left.order - right.order);

  const hints = questions
    .map((question) => ({
      id: String(question.sectionId || question.section?.id || "").trim(),
      title: String(
        question.sectionTitle || question.section?.title || "",
      ).trim(),
      description: String(
        question.sectionDescription || question.section?.description || "",
      ).trim(),
      order:
        typeof question.sectionOrder === "number"
          ? question.sectionOrder
          : typeof question.section?.order === "number"
            ? question.section.order
            : 0,
      isActive:
        question.sectionIsActive !== undefined
          ? question.sectionIsActive === true
          : question.section?.isActive !== false,
    }))
    .filter((section) => section.id);

  const hasMeaningfulHints = hints.some(
    (section) => section.id !== LEGACY_DEFAULT_SECTION_ID,
  );

  const sections =
    normalizedSections.length > 0
      ? normalizedSections
      : hasMeaningfulHints
        ? hints
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
            .sort((left, right) => left.order - right.order)
        : [normalizePublicSection({}, 0)];

  const sectionMap = new Map(
    sections.map((section) => [section.id, { ...section, questions: [] }]),
  );
  const defaultSection = sectionMap.get(LEGACY_DEFAULT_SECTION_ID) ||
    sectionMap.values().next().value || {
      ...normalizePublicSection({}, 0),
      questions: [],
    };
  if (!sectionMap.has(defaultSection.id)) {
    sectionMap.set(defaultSection.id, defaultSection);
  }

  questions.forEach((question, index) => {
    const questionSectionId = String(
      question.sectionId || question.section?.id || "",
    ).trim();
    const targetSection = sectionMap.get(questionSectionId) || defaultSection;
    targetSection.questions.push({
      ...question,
      id:
        getQuestionId(question) || String(question.id || question._id || index),
      sectionId: targetSection.id,
      sectionTitle: targetSection.title,
      sectionDescription: targetSection.description,
      sectionOrder: targetSection.order,
      sectionIsActive: targetSection.isActive,
      order:
        typeof question.order === "number"
          ? question.order
          : targetSection.questions.length - 1,
    });
  });

  return Array.from(sectionMap.values())
    .map((section) => ({
      ...section,
      questions: (section.questions || []).sort(
        (left, right) => left.order - right.order,
      ),
    }))
    .sort((left, right) => left.order - right.order);
};

const flattenQuestionsFromSections = (sections = []) =>
  (Array.isArray(sections) ? sections : []).flatMap((section) =>
    Array.isArray(section.questions)
      ? section.questions
      : Array.isArray(section.items)
        ? section.items
        : [],
  );

const chunkQuestions = (questions = [], pageSize = QUESTIONS_PER_PAGE) => {
  const size = Math.max(1, Number(pageSize) || QUESTIONS_PER_PAGE);
  const list = Array.isArray(questions) ? questions : [];
  const pages = [];
  for (let index = 0; index < list.length; index += size) {
    pages.push(list.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
};

const getQuestionOptions = (question = {}) =>
  (Array.isArray(question.options) ? question.options : []).map(
    (option, index) => {
      if (typeof option === "string") {
        const value = String(option).trim();
        return {
          id: value || `option-${index}`,
          label: value,
          value,
          conditionalLogic: { enabled: false, resetOnHide: true, fields: [] },
        };
      }

      return {
        id: String(option?.id || option?.value || `option-${index}`),
        label: String(option?.label || option?.value || "").trim(),
        value: String(option?.value || option?.label || "").trim(),
        conditionalLogic: {
          enabled: option?.conditionalLogic?.enabled === true,
          resetOnHide: option?.conditionalLogic?.resetOnHide !== false,
          fields: Array.isArray(option?.conditionalLogic?.fields)
            ? option.conditionalLogic.fields
            : [],
        },
      };
    },
  );

const getConditionalBranchFields = (option = {}) =>
  Array.isArray(option?.conditionalLogic?.fields)
    ? option.conditionalLogic.fields
    : [];

const getConditionalFieldBreadcrumb = (segments = []) =>
  (Array.isArray(segments) ? segments : [segments])
    .filter(Boolean)
    .join(" \u2192 ");

const getSelectedOptionIds = (question = {}, value) => {
  const options = getQuestionOptions(question);
  const selectedValues = Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ""
      ? []
      : [value];

  return selectedValues
    .map((selected) =>
      String(selected || "")
        .trim()
        .toLowerCase(),
    )
    .flatMap((selected) =>
      options
        .filter((option) => {
          const id = String(option.id || "")
            .trim()
            .toLowerCase();
          const optionValue = String(option.value || "")
            .trim()
            .toLowerCase();
          const label = String(option.label || "")
            .trim()
            .toLowerCase();
          return selected && [id, optionValue, label].includes(selected);
        })
        .map((option) => option.id),
    )
    .filter(Boolean);
};

const collectConditionalDescriptorsFromOption = ({
  question,
  questionId,
  option,
  pathSegments = [],
  breadcrumbSegments = [],
  values = {},
  conditionalAnswers = {},
}) => {
  if (!option || option.isActive === false) return [];

  const descriptors = [];
  const childFields = getConditionalBranchFields(option);

  childFields.forEach((field) => {
    if (!field || field.isActive === false) return;

    const fieldPathSegments = [...pathSegments, field.id];
    const fieldKey = buildConditionalFieldKey(fieldPathSegments);
    const fieldBreadcrumb = [...breadcrumbSegments, field.label].filter(
      Boolean,
    );
    const payloadEntry = conditionalAnswers[fieldKey] || null;

    descriptors.push({
      question,
      questionId,
      option,
      field,
      key: fieldKey,
      pathSegments: fieldPathSegments,
      breadcrumb: getConditionalFieldBreadcrumb(fieldBreadcrumb),
    });

    if (!isOptionBasedConditionalFieldType(field.type)) {
      return;
    }

    const fieldValue =
      payloadEntry?.value ??
      payloadEntry?.answer ??
      payloadEntry?.response ??
      values[fieldKey] ??
      null;
    const selectedChildOptionIds = getSelectedOptionIds(field, fieldValue);
    const fieldOptions = getQuestionOptions(field);

    selectedChildOptionIds.forEach((childOptionId) => {
      const childOption = fieldOptions.find(
        (item) => item.id === childOptionId,
      );
      if (!childOption || childOption.isActive === false) return;
      descriptors.push(
        ...collectConditionalDescriptorsFromOption({
          question,
          questionId,
          option: childOption,
          pathSegments: [...fieldPathSegments, childOption.id],
          breadcrumbSegments: [...fieldBreadcrumb, childOption.label],
          values,
          conditionalAnswers,
        }),
      );
    });
  });

  return descriptors;
};

const getActiveConditionalFieldDescriptors = (questions = [], values = {}) => {
  const descriptors = [];

  questions.forEach((question) => {
    const questionId = getQuestionId(question);
    if (!questionId) return;
    const questionValue = values[questionId];
    const selectedOptionIds = getSelectedOptionIds(question, questionValue);
    const options = getQuestionOptions(question);

    selectedOptionIds.forEach((optionId) => {
      const option = options.find((item) => item.id === optionId);
      if (!option) return;
      descriptors.push(
        ...collectConditionalDescriptorsFromOption({
          question,
          questionId,
          option,
          pathSegments: [questionId, option.id],
          breadcrumbSegments: [question.label || "Question", option.label],
          values,
          conditionalAnswers: values,
        }),
      );
    });
  });

  return descriptors;
};

const pruneConditionalState = (source = {}, activeKeys = []) => {
  const keep = new Set(activeKeys);
  const entries = Object.entries(source || {});
  const next = {};
  entries.forEach(([key, value]) => {
    if (!isConditionalFieldKey(key) || keep.has(key)) {
      next[key] = value;
    }
  });
  return next;
};

const shallowEqualObject = (left = {}, right = {}) => {
  const leftKeys = Object.keys(left || {});
  const rightKeys = Object.keys(right || {});
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => Object.is(left[key], right[key]));
};

const isImageMimeType = (mimeType = "") =>
  String(mimeType || "")
    .toLowerCase()
    .startsWith("image/");

const getSelectedFileEntries = (selection) =>
  Array.isArray(selection) ? selection : selection ? [selection] : [];

const createSelectedFileEntry = (file) => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  file,
  previewUrl: isImageMimeType(file?.type) ? URL.createObjectURL(file) : "",
});

const revokeSelectedFileEntries = (selection) => {
  getSelectedFileEntries(selection).forEach((entry) => {
    if (entry?.previewUrl) {
      URL.revokeObjectURL(entry.previewUrl);
    }
  });
};

const getConditionalFieldAccept = (field = {}) => {
  const uploadConfig = field.uploadConfig || {};
  if (
    Array.isArray(uploadConfig.allowedMimeTypes) &&
    uploadConfig.allowedMimeTypes.length
  ) {
    return uploadConfig.allowedMimeTypes.join(",");
  }
  if (field.type === "imageUpload") {
    return IMAGE_MIME_TYPES.join(",");
  }
  if (field.type === "fileUpload" || field.type === "pdfUpload") {
    return FILE_MIME_TYPES.join(",");
  }
  return "";
};

const SafeMediaImage = ({
  asset,
  alt,
  className = "",
  fallbackClassName = "",
  fallbackContent = null,
  optimize = true,
  loading = "lazy",
}) => {
  const rawUrl = getMediaUrl(asset);
  const optimizedUrl = optimize ? getOptimizedImageUrl(asset) : rawUrl;
  const [src, setSrc] = useState(optimizedUrl || rawUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(optimizedUrl || rawUrl);
    setFailed(false);
  }, [optimizedUrl, rawUrl]);

  if (!src || failed) {
    return <div className={fallbackClassName}>{fallbackContent}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (optimize && src !== rawUrl && rawUrl) {
          setSrc(rawUrl);
          return;
        }
        setFailed(true);
      }}
    />
  );
};

const EXPIRY_COPY = {
  en: {
    headline: "This form is no longer accepting responses.",
    label: "Form expired on:",
  },
  hi: {
    headline:
      "\u092f\u0939 \u092b\u093c\u0949\u0930\u094d\u092e \u0905\u092c \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901 \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u0964",
    label:
      "\u092b\u093c\u0949\u0930\u094d\u092e \u0938\u092e\u093e\u092a\u094d\u0924 \u0939\u0941\u0906:",
  },
  rj: {
    headline:
      "\u0908 \u092b\u0949\u0930\u094d\u092e \u0905\u092c \u091c\u0935\u093e\u092c \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u094b\u0928\u0940 \u0915\u0930\u0948\u0964",
    label:
      "\u092b\u0949\u0930\u094d\u092e \u0916\u0924\u094d\u092e \u092d\u094d\u092f\u094b:",
  },
};

const initialValuesFromQuestions = (questions = []) =>
  questions.reduce((acc, question) => {
    const questionId = getQuestionId(question);
    if (!questionId) return acc;
    if (question.type === "checkbox") {
      acc[questionId] = [];
    } else if (question.type === "rating") {
      acc[questionId] = 0;
    } else {
      acc[questionId] = "";
    }
    return acc;
  }, {});

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const validatePhone = (value) =>
  /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(String(value || "").trim());

const getNumberValidationMessage = (question, value) => {
  const validation = question?.validation || {};
  const customMessage =
    String(validation.errorMessage || "").trim() ||
    `Question "${question.label}" must be a valid number`;
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) return null;
  if (!/^-?\d+$/.test(normalizedValue)) return customMessage;

  const digitCount = normalizedValue.replace(/^-/, "").length;
  const numericValue = Number(normalizedValue);

  if (
    Number.isFinite(validation.minValue) &&
    numericValue < validation.minValue
  ) {
    return customMessage;
  }

  if (
    Number.isFinite(validation.maxValue) &&
    numericValue > validation.maxValue
  ) {
    return customMessage;
  }

  if (
    Number.isInteger(validation.minDigits) &&
    digitCount < validation.minDigits
  ) {
    return customMessage;
  }

  if (
    Number.isInteger(validation.maxDigits) &&
    digitCount > validation.maxDigits
  ) {
    return customMessage;
  }

  return null;
};

const sanitizeNumberInput = (value = "") =>
  String(value)
    .replace(/[^\d-]/g, "")
    .replace(/(?!^)-/g, "");

const sanitizePhoneInput = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 10);

const formatDateTime = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
};

const getExpiryCopy = (language = "en") =>
  EXPIRY_COPY[language] || EXPIRY_COPY.en;

const validateSelectedFile = (questionType, file, uploadConfig = {}) => {
  if (!file) return null;

  const normalizeMaxSizeBytes = (value) => {
    const raw = Number(value);
    if (!Number.isFinite(raw) || raw <= 0) {
      return MAX_UPLOAD_SIZE_BYTES;
    }
    return raw < 1024 * 1024 ? raw * 1024 * 1024 : raw;
  };
  const maxSize = normalizeMaxSizeBytes(uploadConfig.maxFileSize);

  if (file.size > maxSize) {
    return `File size must not exceed ${Math.max(1, Math.round(maxSize / (1024 * 1024)))} MB.`;
  }

  const allowedMimeTypes = Array.isArray(uploadConfig.allowedMimeTypes)
    ? uploadConfig.allowedMimeTypes
    : [];
  const allowedExtensions = Array.isArray(uploadConfig.allowedExtensions)
    ? uploadConfig.allowedExtensions
    : [];
  const hasCustomMimeRule = allowedMimeTypes.length > 0;
  const hasCustomExtRule = allowedExtensions.length > 0;

  if (
    questionType === "imageUpload" &&
    !hasCustomMimeRule &&
    !IMAGE_MIME_TYPES.includes(file.type)
  ) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (
    (questionType === "fileUpload" || questionType === "pdfUpload") &&
    !hasCustomMimeRule &&
    !FILE_MIME_TYPES.includes(file.type) &&
    !(questionType === "pdfUpload" && file.type === "application/pdf")
  ) {
    return "Only PDF, DOC, DOCX, MP4, WEBM, MOV, JPG, JPEG, PNG, and WEBP files are allowed.";
  }

  if (hasCustomMimeRule && !allowedMimeTypes.includes(file.type)) {
    return "This file type is not allowed.";
  }

  if (
    hasCustomExtRule &&
    !allowedExtensions.some((extension) =>
      String(file.name || "")
        .toLowerCase()
        .endsWith(String(extension).toLowerCase()),
    )
  ) {
    return "This file extension is not allowed.";
  }

  return null;
};

const getSuccessMessage = (form = {}, submitted = null) =>
  String(submitted?.successMessage || form?.successMessage || "").trim() ||
  "Form submitted successfully.";

const PublicFormPage = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { loading: settingsLoading, settings: websiteSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [verificationStates, setVerificationStates] = useState({});
  const [verificationTokens, setVerificationTokens] = useState({});
  const [now, setNow] = useState(Date.now());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const submitLockRef = useRef(false);
  const sectionTopRef = useRef(null);
  const fileInputRefs = useRef({});
  const sections = useMemo(() => groupFormSections(form || {}), [form]);
  const allQuestions = useMemo(
    () =>
      flattenQuestionsFromSections(sections).filter(
        (question) => question.isActive !== false,
      ),
    [sections],
  );
  const publicSections = useMemo(
    () =>
      sections
        .filter(
          (section) =>
            section.isActive !== false &&
            Array.isArray(section.questions) &&
            section.questions.length > 0,
        )
        .map((section) => ({
          ...section,
          questions: [...section.questions]
            .sort((left, right) => (left.order || 0) - (right.order || 0))
            .filter((question) => question.isActive !== false),
        }))
        .filter(
          (section) =>
            Array.isArray(section.questions) && section.questions.length > 0,
        ),
    [sections],
  );
  const currentSection =
    publicSections[currentSectionIndex] || publicSections[0] || null;
  const currentSectionQuestions = currentSection?.questions || [];
  const currentSectionPages = useMemo(
    () => chunkQuestions(currentSectionQuestions, QUESTIONS_PER_PAGE),
    [currentSectionQuestions],
  );
  const currentPageQuestions =
    currentSectionPages[currentPageIndex] || currentSectionPages[0] || [];
  const currentSectionTotalPages = currentSectionPages.length;
  const hasPublicQuestions = publicSections.length > 0;
  const totalPages = useMemo(
    () =>
      publicSections.reduce(
        (count, section) =>
          count +
          chunkQuestions(section.questions || [], QUESTIONS_PER_PAGE).length,
        0,
      ),
    [publicSections],
  );
  const overallStep = useMemo(() => {
    let step = 1;
    for (let i = 0; i < publicSections.length; i += 1) {
      const section = publicSections[i];
      const pages = chunkQuestions(section.questions || [], QUESTIONS_PER_PAGE);
      if (i < currentSectionIndex) {
        step += pages.length;
        continue;
      }
      if (i === currentSectionIndex) {
        step += Math.min(currentPageIndex, Math.max(0, pages.length - 1));
        break;
      }
    }
    return step;
  }, [currentPageIndex, currentSectionIndex, publicSections]);
  const activeConditionalDescriptors = useMemo(
    () => getActiveConditionalFieldDescriptors(allQuestions, values),
    [allQuestions, values],
  );

  useEffect(() => {
    return () => {
      Object.values(files).forEach((selection) =>
        revokeSelectedFileEntries(selection),
      );
    };
  }, [files]);

  useEffect(() => {
    const activeKeys = activeConditionalDescriptors.map(
      (descriptor) => descriptor.key,
    );
    setValues((prev) => {
      const next = pruneConditionalState(prev, activeKeys);
      return shallowEqualObject(prev, next) ? prev : next;
    });
    setFiles((prev) => {
      const next = pruneConditionalState(prev, activeKeys);
      return shallowEqualObject(prev, next) ? prev : next;
    });
  }, [activeConditionalDescriptors]);

  useEffect(() => {
    if (
      publicSections.length > 0 &&
      currentSectionIndex >= publicSections.length
    ) {
      setCurrentSectionIndex(0);
    }
    if (currentPageIndex >= currentSectionPages.length) {
      setCurrentPageIndex(Math.max(0, currentSectionPages.length - 1));
    }
  }, [
    currentPageIndex,
    currentSectionIndex,
    currentSectionPages.length,
    publicSections.length,
  ]);

  useEffect(() => {
    let mounted = true;
    const loadForm = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPublicFormBySlug(slug);
        if (!mounted) return;
        const nextForm = response.data?.data;
        setForm(nextForm);
        const nextSections = groupFormSections(nextForm || {});
        setCurrentSectionIndex(0);
        setCurrentPageIndex(0);
        setValues(
          initialValuesFromQuestions(
            flattenQuestionsFromSections(nextSections),
          ),
        );
        setVisiblePasswords({});
        setVerificationStates({});
        setVerificationTokens({});
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Form not found.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadForm();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const handleAnswer = (questionId, value) => {
    const normalizedQuestionId = String(questionId || "").trim();
    setValues((prev) => ({ ...prev, [normalizedQuestionId]: value }));
  };

  const resetVerification = (questionId) => {
    setVerificationStates((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setVerificationTokens((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleVerifiedInputChange = (
    question,
    value,
    sanitizer = (input) => input,
  ) => {
    const nextValue = sanitizer(value);
    const questionId = getQuestionId(question);
    handleAnswer(questionId, nextValue);
    const currentVerification = verificationStates[questionId];
    if (
      currentVerification?.destination &&
      currentVerification.destination !== String(nextValue || "").trim()
    ) {
      resetVerification(questionId);
    }
  };

  const togglePasswordVisibility = (questionId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const sendVerificationCode = async (question) => {
    const questionId = getQuestionId(question);
    const destination = String(values[questionId] || "").trim();
    if (!destination) {
      toast.error(
        question.type === "email"
          ? "Please enter a valid email."
          : "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          status: "sending",
          destination,
        },
      }));

      const payload = {
        questionId,
        destination,
        type: question.type,
      };
      const response =
        question.type === "email"
          ? await sendPublicFormVerification(form.slug, payload)
          : await sendPublicPhoneVerification(form.slug, payload);

      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          status: "otp",
          destination,
          resendAvailableAt: response.data?.data?.resendAvailableAt || null,
        },
      }));
      toast.success("Verification code sent");
    } catch (error) {
      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          status: "idle",
          destination,
        },
      }));
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send verification code",
      );
    }
  };

  const verifyOtp = async (question) => {
    const questionId = getQuestionId(question);
    const state = verificationStates[questionId] || {};
    const destination = String(values[questionId] || "").trim();
    if (!state.otp) {
      toast.error("Enter the OTP first.");
      return;
    }

    try {
      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...state,
          status: "verifying",
        },
      }));

      const payload = {
        questionId,
        destination,
        type: question.type,
        otp: state.otp,
      };
      const response =
        question.type === "email"
          ? await verifyPublicFormVerification(form.slug, payload)
          : await verifyPublicPhoneVerification(form.slug, payload);

      const token = response.data?.data?.token || "";
      setVerificationTokens((prev) => ({
        ...prev,
        [questionId]: token,
      }));
      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...state,
          status: "verified",
          destination,
          verifiedAt:
            response.data?.data?.verifiedAt || new Date().toISOString(),
        },
      }));
      toast.success("Verified");
    } catch (error) {
      setVerificationStates((prev) => ({
        ...prev,
        [questionId]: {
          ...state,
          status: "otp",
          destination,
        },
      }));
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "OTP verification failed",
      );
    }
  };

  const handleCheckbox = (questionId, option, keyOverride = questionId) => {
    setValues((prev) => {
      const current = Array.isArray(prev[keyOverride]) ? prev[keyOverride] : [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [keyOverride]: next };
    });
  };

  const handlePhonePaste = (questionId, event) => {
    event.preventDefault();
    const pasted = event.clipboardData?.getData("text") || "";
    handleAnswer(questionId, sanitizePhoneInput(pasted));
  };

  const clearSelectedFiles = (keyOverride, inputEl = null) => {
    const normalizedKey = String(keyOverride || "").trim();
    setFiles((prev) => ({ ...prev, [normalizedKey]: null }));
    if (inputEl) {
      inputEl.value = "";
    }
  };

  const removeSelectedFile = (keyOverride, fileId = null, inputEl = null) => {
    const normalizedKey = String(keyOverride || "").trim();
    setFiles((prev) => {
      const current = getSelectedFileEntries(prev[normalizedKey]);
      if (!current.length) {
        return prev;
      }

      const next = fileId ? current.filter((entry) => entry.id !== fileId) : [];

      if (!next.length) {
        return { ...prev, [normalizedKey]: null };
      }

      return { ...prev, [normalizedKey]: next };
    });

    if (inputEl) {
      inputEl.value = "";
    }
  };

  const handleFile = (
    question,
    fileList,
    keyOverride = getQuestionId(question),
    inputEl = null,
  ) => {
    const selectedFiles = Array.from(fileList || []);
    const normalizedKey = String(keyOverride || "").trim();
    if (!selectedFiles.length) {
      clearSelectedFiles(normalizedKey, inputEl);
      return;
    }

    const uploadConfig = question.uploadConfig || {};
    const multipleAllowed = uploadConfig.multiple === true;
    const maxFiles = multipleAllowed
      ? Math.max(
          1,
          Number.parseInt(uploadConfig.maxFiles, 10) || selectedFiles.length,
        )
      : 1;
    const selected = multipleAllowed
      ? selectedFiles.slice(0, maxFiles)
      : [selectedFiles[0]];

    if (selectedFiles.length > maxFiles) {
      const message = `You can upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`;
      setError(message);
      toast.error(message);
      clearSelectedFiles(normalizedKey, inputEl);
      return;
    }

    const validationMessage = selected
      .map((file) => validateSelectedFile(question.type, file, uploadConfig))
      .find(Boolean);
    if (validationMessage) {
      setError(validationMessage);
      toast.error(validationMessage);
      clearSelectedFiles(normalizedKey, inputEl);
      return;
    }

    setError("");
    setFiles((prev) => ({
      ...prev,
      [normalizedKey]: selected.map((file) => createSelectedFileEntry(file)),
    }));
  };

  const getSelectionList = (selection) => getSelectedFileEntries(selection);

  const getSelectionLabel = (selection) => {
    const entries = getSelectionList(selection);
    if (!entries.length) return "";
    if (entries.length === 1) {
      return entries[0]?.file?.name || entries[0]?.fileName || "Selected file";
    }
    return `${entries.length} files selected`;
  };

  const resetAllFileInputs = () => {
    Object.values(fileInputRefs.current || {}).forEach((input) => {
      if (input) {
        input.value = "";
      }
    });
  };

  const renderSelectedFileList = (
    selection,
    keyOverride,
    inputEl,
    fieldType = "",
  ) => {
    const entries = getSelectionList(selection);
    if (!entries.length) return null;

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const file = entry?.file;
          const fileName =
            file?.name || entry?.fileName || `Selected file ${index + 1}`;
          const isImage = isImageMimeType(file?.type);
          return (
            <div
              key={entry?.id || `${keyOverride}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
            >
              {isImage && entry?.previewUrl ? (
                <img
                  src={entry.previewUrl}
                  alt={fileName}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold uppercase text-slate-300">
                  {String(fieldType || file?.type || "file").slice(0, 3)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {fileName}
                </div>
                <div className="text-xs text-slate-400">
                  {isImage ? "Image selected" : "Selected file"}
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove selected file"
                onClick={() =>
                  removeSelectedFile(keyOverride, entry?.id || null, inputEl)
                }
                className="rounded-full border border-red-500/30 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConditionalFieldsList = (
    fields = [],
    parentPath = "",
    level = 1,
  ) => {
    if (!Array.isArray(fields) || !fields.length) return null;

    return (
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={buildConditionalFieldKey(parentPath, field.id)}>
            {renderConditionalField(
              field,
              buildConditionalFieldKey(parentPath, field.id),
              level,
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderConditionalField = (field, fieldKey, level = 1) => {
    const commonProps = {
      className: `${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`,
    };

    const value =
      values[fieldKey] ||
      (field.type === "checkbox" || field.type === "multipleSelect" ? [] : "");

    const file = files[fieldKey];
    const fieldLabel = field.label || field.title || "Conditional field";
    const fieldHelpText = field.helpText || field.description || "";
    const fieldOptions = getQuestionOptions(field);
    const optionBasedField = isOptionBasedConditionalFieldType(field.type);

    const selectedOptionIds = optionBasedField
      ? getSelectedOptionIds(field, value)
      : [];

    const selectedOptions = selectedOptionIds
      .map((optionId) => fieldOptions.find((option) => option.id === optionId))
      .filter(Boolean);

    return (
      <>
        {/* Current conditional question card */}
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <label className="text-base font-semibold">
              {fieldLabel}
              {field.required && <span className="ml-1 text-red-400">*</span>}
            </label>
          </div>

          {field.type === "paragraph" ||
          field.type === "address" ||
          field.type === "longText" ? (
            <textarea
              rows={4}
              value={value}
              onChange={(e) => handleAnswer(fieldKey, e.target.value)}
              placeholder={field.placeholder}
              {...commonProps}
              className={`${commonProps.className} resize-none`}
            />
          ) : field.type === "dropdown" ? (
            <select
              value={value}
              onChange={(e) => handleAnswer(fieldKey, e.target.value)}
              {...commonProps}
            >
              <option value="">Select an option</option>

              {fieldOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === "radio" ? (
            <div className="space-y-2">
              {fieldOptions.map((option) => (
                <label
                  key={option.id}
                  dir="ltr"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left"
                >
                  <input
                    type="radio"
                    className="h-4 w-4 shrink-0 accent-cyan-500"
                    name={fieldKey}
                    checked={value === option.value}
                    onChange={() => handleAnswer(fieldKey, option.value)}
                  />

                  <span className="min-w-0 flex-1 break-words">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" || field.type === "multipleSelect" ? (
            <div className="space-y-2">
              {fieldOptions.map((option) => (
                <label
                  key={option.id}
                  dir="ltr"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-cyan-500"
                    checked={(Array.isArray(value) ? value : []).includes(
                      option.value,
                    )}
                    onChange={() =>
                      handleCheckbox(fieldKey, option.value, fieldKey)
                    }
                  />

                  <span className="min-w-0 flex-1 break-words">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          ) : field.type === "fileUpload" ||
            field.type === "imageUpload" ||
            field.type === "pdfUpload" ? (
            <div className="space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">
                <Upload size={16} />

                <input
                  type="file"
                  hidden
                  accept={getConditionalFieldAccept(field)}
                  multiple={field.uploadConfig?.multiple === true}
                  ref={(node) => {
                    fileInputRefs.current[fieldKey] = node;
                  }}
                  onChange={(e) =>
                    handleFile(field, e.target.files, fieldKey, e.currentTarget)
                  }
                />

                {getSelectionLabel(file) ||
                  field.uploadConfig?.label ||
                  "Choose file"}
              </label>

              {renderSelectedFileList(
                file,
                fieldKey,
                fileInputRefs.current[fieldKey],
                field.type,
              )}
            </div>
          ) : field.type === "rating" ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleAnswer(fieldKey, rating)}
                  className={`h-11 w-11 rounded-2xl border ${
                    value === rating
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          ) : field.type === "password" ? (
            <div className="relative">
              <input
                type={visiblePasswords[fieldKey] ? "text" : "password"}
                value={value}
                onChange={(e) => handleAnswer(fieldKey, e.target.value)}
                placeholder={field.placeholder}
                autoComplete="new-password"
                spellCheck={false}
                {...commonProps}
                className={`${commonProps.className} pr-12`}
              />

              <button
                type="button"
                onClick={() => togglePasswordVisibility(fieldKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300"
                aria-label={
                  visiblePasswords[fieldKey] ? "Hide secret" : "Show secret"
                }
              >
                {visiblePasswords[fieldKey] ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          ) : (
            <input
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "phone"
                    ? "tel"
                    : field.type === "link"
                      ? "url"
                      : field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : field.type === "time"
                            ? "time"
                            : "text"
              }
              value={value}
              onChange={(e) => handleAnswer(fieldKey, e.target.value)}
              placeholder={field.placeholder}
              {...commonProps}
            />
          )}

          {fieldHelpText && (
            <p className="text-xs text-slate-400">{fieldHelpText}</p>
          )}
        </div>

        {/* Child conditional questions outside current card */}
        {optionBasedField &&
          selectedOptions.map((option) => {
            const childFields = getConditionalBranchFields(option);

            if (!childFields.length) return null;

            const branchPath = buildConditionalFieldKey(fieldKey, option.id);

            return (
              <div key={branchPath} className="mt-5">
                {renderConditionalFieldsList(
                  childFields,
                  branchPath,
                  level + 1,
                )}
              </div>
            );
          })}
      </>
    );
  };

  const renderConditionalBlocks = (question) => {
    const questionId = getQuestionId(question);
    const selectedOptionIds = getSelectedOptionIds(
      question,
      values[questionId],
    );
    const options = getQuestionOptions(question);

    return selectedOptionIds
      .map((optionId) => options.find((item) => item.id === optionId))
      .filter(Boolean)
      .flatMap((option) => {
        const childFields = getConditionalBranchFields(option);
        if (!childFields.length) return [];
        const branchPath = buildConditionalFieldKey(questionId, option.id);
        return [
          <div key={branchPath} className="mt-5">
            {renderConditionalFieldsList(childFields, branchPath, 1)}
          </div>,
        ];
      });
  };

  const renderQuestion = (question) => {
    const questionId = getQuestionId(question);
    const commonProps = {
      className: `${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`,
    };

    if (question.type === "sectionHeading") {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-2xl font-bold">{question.label}</h2>
          {question.helpText && (
            <p className={`mt-2 text-sm ${theme.textSecondary}`}>
              {question.helpText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <label className="text-base font-semibold">
            {question.label}
            {question.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        </div>

        {question.type === "paragraph" || question.type === "address" ? (
          <textarea
            rows={4}
            value={values[questionId] || ""}
            onChange={(e) => handleAnswer(questionId, e.target.value)}
            placeholder={question.placeholder}
            {...commonProps}
            className={`${commonProps.className} resize-none`}
          />
        ) : question.type === "dropdown" ? (
          <select
            value={values[questionId] || ""}
            onChange={(e) => handleAnswer(questionId, e.target.value)}
            {...commonProps}
          >
            <option value="">Select an option</option>
            {getQuestionOptions(question).map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : question.type === "radio" ? (
          <div className="space-y-2">
            {getQuestionOptions(question).map((option) => (
              <label
                key={option.id}
                dir="ltr"
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left"
              >
                <input
                  type="radio"
                  className="h-4 w-4 shrink-0 accent-cyan-500"
                  name={questionId}
                  checked={values[questionId] === option.value}
                  onChange={() => handleAnswer(questionId, option.value)}
                />
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        ) : question.type === "checkbox" ? (
          <div className="space-y-2">
            {getQuestionOptions(question).map((option) => (
              <label
                key={option.id}
                dir="ltr"
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-cyan-500"
                  checked={(values[questionId] || []).includes(option.value)}
                  onChange={() => handleCheckbox(questionId, option.value)}
                />
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        ) : question.type === "fileUpload" ||
          question.type === "imageUpload" ? (
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">
              <Upload size={16} />
              <input
                type="file"
                hidden
                disabled={!form?.allowFileUpload}
                accept={
                  question.type === "imageUpload"
                    ? IMAGE_MIME_TYPES.join(",")
                    : FILE_MIME_TYPES.join(",")
                }
                multiple={question.uploadConfig?.multiple === true}
                ref={(node) => {
                  fileInputRefs.current[questionId] = node;
                }}
                onChange={(e) =>
                  handleFile(
                    question,
                    e.target.files,
                    questionId,
                    e.currentTarget,
                  )
                }
              />
              {form?.allowFileUpload
                ? getSelectionLabel(files[questionId]) || "Choose file"
                : "Uploads disabled"}
            </label>
            {renderSelectedFileList(
              files[questionId],
              questionId,
              fileInputRefs.current[questionId],
              question.type,
            )}
            {!form?.allowFileUpload && (
              <p className="text-xs text-amber-300">
                File uploads are currently disabled for this form.
              </p>
            )}
          </div>
        ) : question.type === "rating" ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswer(questionId, rating)}
                className={`h-11 w-11 rounded-2xl border ${
                  values[questionId] === rating
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        ) : question.type === "password" ? (
          <div className="relative">
            <input
              type={visiblePasswords[questionId] ? "text" : "password"}
              autoComplete="new-password"
              spellCheck={false}
              value={values[questionId] || ""}
              onChange={(e) => handleAnswer(questionId, e.target.value)}
              placeholder={question.placeholder}
              {...commonProps}
              className={`${commonProps.className} pr-12`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(questionId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300"
              aria-label={
                visiblePasswords[questionId] ? "Hide secret" : "Show secret"
              }
            >
              {visiblePasswords[questionId] ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        ) : question.type === "email" || question.type === "phone" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type={question.type === "phone" ? "tel" : "email"}
                inputMode={question.type === "phone" ? "numeric" : undefined}
                pattern={question.type === "phone" ? "[0-9]*" : undefined}
                maxLength={question.type === "phone" ? 10 : undefined}
                autoComplete={question.type === "phone" ? "tel" : "email"}
                value={values[questionId] || ""}
                onChange={(e) =>
                  handleVerifiedInputChange(
                    question,
                    e.target.value,
                    question.type === "phone"
                      ? sanitizePhoneInput
                      : (input) => input,
                  )
                }
                placeholder={question.placeholder}
                {...commonProps}
                className={`${commonProps.className} sm:flex-1`}
              />
              {question.validationEnabled === true ? (
                <button
                  type="button"
                  onClick={() => {
                    const current = values[questionId] || "";
                    if (question.type === "email" && !validateEmail(current)) {
                      toast.error("Please enter a valid email.");
                      return;
                    }
                    if (question.type === "phone" && !validatePhone(current)) {
                      toast.error(
                        "Please enter a valid 10-digit mobile number.",
                      );
                      return;
                    }
                    if (
                      (verificationStates[questionId]?.status || "idle") ===
                      "verified"
                    ) {
                      resetVerification(questionId);
                    } else {
                      sendVerificationCode(question);
                    }
                  }}
                  disabled={
                    (verificationStates[questionId]?.status || "idle") ===
                    "sending"
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-60 sm:w-40"
                >
                  {(verificationStates[questionId]?.status || "idle") ===
                  "sending" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending
                      OTP...
                    </>
                  ) : (verificationStates[questionId]?.status || "idle") ===
                    "verified" ? (
                    <>
                      <ShieldCheck size={16} /> Verified
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Verify Now
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {question.validationEnabled === true &&
              (verificationStates[questionId]?.status || "idle") === "otp" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={verificationStates[questionId]?.otp || ""}
                    onChange={(e) =>
                      setVerificationStates((prev) => ({
                        ...prev,
                        [questionId]: {
                          ...(prev[questionId] || {}),
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          status: "otp",
                        },
                      }))
                    }
                    placeholder="Enter OTP"
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 sm:flex-1`}
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => verifyOtp(question)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white sm:w-40"
                  >
                    <ShieldCheck size={16} /> Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => sendVerificationCode(question)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold sm:w-40"
                  >
                    <RefreshCcw size={16} /> Resend OTP
                  </button>
                </div>
              )}

            {question.validationEnabled === true &&
              (verificationStates[questionId]?.status || "idle") ===
                "verified" && (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 size={14} /> Verified
                </div>
              )}
          </div>
        ) : (
          <input
            type={
              question.type === "email"
                ? "email"
                : question.type === "phone"
                  ? "tel"
                  : question.type === "link"
                    ? "url"
                    : question.type === "number"
                      ? "number"
                      : question.type === "date"
                        ? "date"
                        : question.type === "time"
                          ? "time"
                          : "text"
            }
            step={question.type === "number" ? "1" : undefined}
            inputMode={
              question.type === "number" || question.type === "phone"
                ? "numeric"
                : undefined
            }
            pattern={question.type === "phone" ? "[0-9]*" : undefined}
            maxLength={question.type === "phone" ? 10 : undefined}
            min={
              question.type === "number" &&
              Number.isFinite(question.validation?.minValue)
                ? question.validation.minValue
                : undefined
            }
            max={
              question.type === "number" &&
              Number.isFinite(question.validation?.maxValue)
                ? question.validation.maxValue
                : undefined
            }
            value={values[questionId] || ""}
            onChange={(e) =>
              handleAnswer(
                questionId,
                question.type === "number"
                  ? sanitizeNumberInput(e.target.value)
                  : question.type === "phone"
                    ? sanitizePhoneInput(e.target.value)
                    : e.target.value,
              )
            }
            onPaste={
              question.type === "phone"
                ? (e) => handlePhonePaste(questionId, e)
                : undefined
            }
            placeholder={
              question.type === "date"
                ? undefined
                : question.type === "link"
                  ? question.placeholder || "https://example.com"
                  : question.placeholder
            }
            onBlur={
              question.type === "link"
                ? (e) => {
                    const normalized = normalizeHttpUrl(e.target.value);
                    if (normalized) {
                      handleAnswer(questionId, normalized);
                    }
                  }
                : undefined
            }
            {...commonProps}
          />
        )}

        {question.helpText && (
          <p className="text-xs text-slate-400">{question.helpText}</p>
        )}
      </div>
    );
  };

  const validateQuestionSet = (
    questionsToValidate = [],
    conditionalDescriptors = [],
  ) => {
    for (const question of questionsToValidate || []) {
      if (question.type === "sectionHeading") continue;
      const questionId = getQuestionId(question);
      const value = values[questionId];
      const file = files[questionId];
      const selectedFiles = getSelectionList(file);
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (question.required && empty && !selectedFiles.length) {
        throw new Error(`${question.label} is required`);
      }

      if (question.type === "email" && value && !validateEmail(value)) {
        throw new Error(`${question.label} must be a valid email`);
      }
      if (question.type === "phone" && value && !validatePhone(value)) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      if (
        question.validationEnabled === true &&
        (question.type === "email" || question.type === "phone") &&
        !verificationTokens[questionId]
      ) {
        throw new Error(`Please verify ${question.label} before submitting.`);
      }
      if (question.type === "number") {
        const validationMessage = getNumberValidationMessage(question, value);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
      if (question.type === "link" && value) {
        const normalized = normalizeHttpUrl(value);
        if (!normalized) {
          throw new Error("Please enter a valid link.");
        }
      }

      if (selectedFiles.length) {
        const validationMessage = selectedFiles
          .map((entry) =>
            validateSelectedFile(
              question.type,
              entry.file,
              question.uploadConfig || {},
            ),
          )
          .find(Boolean);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
    }

    for (const descriptor of conditionalDescriptors || []) {
      const field = descriptor.field || {};
      const value = values[descriptor.key];
      const file = files[descriptor.key];
      const selectedFiles = getSelectionList(file);
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (field.required && empty && !selectedFiles.length) {
        throw new Error(`${field.label || "Conditional field"} is required`);
      }

      if (field.type === "email" && value && !validateEmail(value)) {
        throw new Error(
          `${field.label || "Conditional field"} must be a valid email`,
        );
      }
      if (field.type === "phone" && value && !validatePhone(value)) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      if (field.type === "number") {
        const validationMessage = getNumberValidationMessage(field, value);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
      if (field.type === "link" && value) {
        const normalized = normalizeHttpUrl(value);
        if (!normalized) {
          throw new Error("Please enter a valid link.");
        }
      }

      if (selectedFiles.length) {
        const validationMessage = selectedFiles
          .map((entry) =>
            validateSelectedFile(
              field.type,
              entry.file,
              field.uploadConfig || {},
            ),
          )
          .find(Boolean);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
    }
  };

  const validateCurrentPage = () => {
    const currentIds = new Set(
      (currentPageQuestions || []).map((question) => getQuestionId(question)),
    );
    const sectionDescriptors = activeConditionalDescriptors.filter(
      (descriptor) => currentIds.has(descriptor.questionId),
    );
    validateQuestionSet(currentPageQuestions, sectionDescriptors);
  };

  const validateAllSections = () => {
    validateQuestionSet(allQuestions, activeConditionalDescriptors);
  };

  const goToSectionTop = () => {
    sectionTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      window.requestAnimationFrame(() => goToSectionTop());
      return;
    }

    if (currentSectionIndex > 0) {
      const previousSectionIndex = currentSectionIndex - 1;
      const previousSection = publicSections[previousSectionIndex];
      const previousPages = chunkQuestions(
        previousSection?.questions || [],
        QUESTIONS_PER_PAGE,
      );
      setCurrentSectionIndex(previousSectionIndex);
      setCurrentPageIndex(Math.max(0, previousPages.length - 1));
    }
    window.requestAnimationFrame(() => goToSectionTop());
  };

  const handleNextPage = () => {
    try {
      validateCurrentPage();
      setError("");

      if (currentPageIndex < currentSectionTotalPages - 1) {
        setCurrentPageIndex((prev) => prev + 1);
      } else if (currentSectionIndex < publicSections.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
        setCurrentPageIndex(0);
      }

      window.requestAnimationFrame(() => goToSectionTop());
      return true;
    } catch (validationError) {
      const message =
        validationError?.message || "Please complete the current page.";
      setError(message);
      toast.error(message);
      window.requestAnimationFrame(() => goToSectionTop());
      return false;
    }
  };

  const isFinalPage =
    currentSectionIndex === publicSections.length - 1 &&
    currentPageIndex === currentSectionTotalPages - 1;
  const hasNextPageInSection = currentPageIndex < currentSectionTotalPages - 1;
  const hasNextSection = currentSectionIndex < publicSections.length - 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form ||
      !hasPublicQuestions ||
      submitLockRef.current ||
      submitting ||
      submitted
    )
      return;

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      validateAllSections();
      setError("");
      const payload = new FormData();
      const topLevelAnswers = {};
      const conditionalAnswers = {};
      Object.entries(values).forEach(([key, value]) => {
        if (isConditionalFieldKey(key)) {
          conditionalAnswers[key] = { value };
        } else {
          topLevelAnswers[key] = value;
        }
      });

      payload.append("answers", JSON.stringify(topLevelAnswers));
      payload.append("conditionalAnswers", JSON.stringify(conditionalAnswers));
      payload.append("verificationTokens", JSON.stringify(verificationTokens));
      Object.entries(files).forEach(([questionId, selection]) => {
        getSelectionList(selection).forEach((entry) => {
          if (entry?.file) {
            payload.append(questionId, entry.file);
          }
        });
      });

      const response = await submitPublicForm(form.slug, payload);
      setSubmitted(response.data?.data || response.data);
      setValues(initialValuesFromQuestions(allQuestions));
      setFiles({});
      resetAllFileInputs();
      setVisiblePasswords({});
      setVerificationStates({});
      setVerificationTokens({});
      setCurrentSectionIndex(0);
      setSubmitting(false);
      toast.success(
        getSuccessMessage(form, response.data?.data || response.data),
      );
    } catch (err) {
      const status = err.response?.status;
      const responseMessage = err.response?.data?.message || "";
      const duplicateMessage = "You have already filled this form.";
      const validationMessage =
        responseMessage || err.message || "Failed to submit form";
      const serverMessage = "Something went wrong. Please try again.";
      const isClientValidationError =
        !status && err.message && !/Network Error/i.test(err.message);
      const nextMessage =
        status === 409
          ? duplicateMessage
          : status && status < 500
            ? validationMessage
            : isClientValidationError
              ? validationMessage
              : serverMessage;

      setError(nextMessage);
      toast.error(nextMessage);
      setSubmitting(false);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const loadingState = loading || settingsLoading;
  const language = websiteSettings?.websiteLanguage || "en";
  const expiryCopy = getExpiryCopy(language);
  const expiresAt = form?.expiresAt ? new Date(form.expiresAt) : null;
  const isExpired =
    Boolean(form?.isExpired) ||
    Boolean(
      expiresAt &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt.getTime() < now,
    );
  const titleStyle = resolveTypographyStyle(
    form?.titleStyle,
    DEFAULT_TITLE_STYLE,
  );
  const descriptionStyle = resolveTypographyStyle(
    form?.descriptionStyle,
    DEFAULT_DESCRIPTION_STYLE,
  );

  if (loadingState) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text} p-6`}>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-20 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text} p-6`}>
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-cyan-300"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="text-3xl font-black">Form unavailable</h1>
          <p className={theme.textSecondary}>{error}</p>
        </div>
      </div>
    );
  }

  if (!form) return <Navigate to="/" replace />;

  if (isExpired) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-cyan-300"
            >
              <ArrowLeft size={16} /> Home
            </Link>
          </div>

          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8">
            <h1 className="text-3xl font-black">{expiryCopy.headline}</h1>
            {expiresAt && !Number.isNaN(expiresAt.getTime()) && (
              <p className="mt-3 text-sm text-slate-300">
                {expiryCopy.label}{" "}
                <span className="font-semibold">
                  {formatDateTime(expiresAt)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-cyan-300"
          >
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          {(form.bannerImage || form.bannerImageUrl) && (
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-3 sm:p-4">
              <SafeMediaImage
                asset={
                  form.bannerImageAsset ||
                  form.bannerImage ||
                  form.bannerImageUrl
                }
                alt={form.title ? `${form.title} banner` : "Form banner"}
                className="block h-auto w-full object-contain"
                fallbackClassName="flex min-h-[180px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 text-sm text-slate-400"
                fallbackContent="Banner preview unavailable"
              />
            </div>
          )}
          <div className="flex flex-row items-center gap-4">
            {form.logoUrl ? (
              <SafeMediaImage
                asset={form.logoAsset || form.logoUrl}
                alt={form.title ? `${form.title} logo` : "Form logo"}
                className="h-16 w-16 shrink-0 rounded-2xl bg-white/5 object-contain p-2"
                fallbackClassName="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white"
                fallbackContent={<CheckCircle2 size={28} />}
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                <CheckCircle2 size={28} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1
                className="mt-1 break-words"
                style={{
                  ...titleStyle,

                  color:
                    form?.titleStyle?.color || titleStyle?.color || "#ffffff",

                  background: "none",
                  backgroundImage: "none",
                  WebkitBackgroundClip: "initial",
                  backgroundClip: "initial",
                  WebkitTextFillColor:
                    form?.titleStyle?.color || titleStyle?.color || "#ffffff",
                }}
              >
                {form.title}
              </h1>
              {form.description && (
                <div
                  className={`public-form-description mt-2 max-w-3xl break-words ${theme.textSecondary}`}
                  style={{
                    ...descriptionStyle,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichTextHtml(form.description || ""),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <CheckCircle2 className="mb-4 text-cyan-300" size={36} />
            <h2 className="text-3xl font-black">
              {getSuccessMessage(form, submitted)}
            </h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {!hasPublicQuestions ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                This form currently has no questions.
              </div>
            ) : (
              <>
                <div
                  ref={sectionTopRef}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                        Section {currentSectionIndex + 1} of{" "}
                        {publicSections.length}
                      </div>
                      <h2 className="text-2xl font-black break-words">
                        {currentSection?.title || LEGACY_DEFAULT_SECTION_TITLE}
                      </h2>
                      {currentSection?.description ? (
                        <div
                          className={`max-w-3xl whitespace-pre-wrap break-words text-sm ${theme.textSecondary}`}
                        >
                          {currentSection.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full max-w-sm space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                          Page {currentPageIndex + 1} of{" "}
                          {currentSectionTotalPages}
                        </span>
                        <span>
                          Step {overallStep} of {totalPages}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                          style={{
                            width: `${totalPages > 0 ? (overallStep / totalPages) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {publicSections.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {publicSections.map((section, index) => (
                        <span
                          key={section.id}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            index === currentSectionIndex
                              ? "bg-cyan-500 text-white"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {section.title || `Section ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {currentPageQuestions.map((question, index) => {
                    const questionKey =
                      question._id || question.id || `question-${index}`;

                    return (
                      <div key={questionKey} className="space-y-5">
                        {renderQuestion(question)}

                        {question.type !== "sectionHeading" &&
                          renderConditionalBlocks(question)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {error && (
              <div className="rounded-3xl bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {currentSection && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {currentSectionIndex > 0 || currentPageIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    className="inline-flex items-center bg-cyan-600  justify-center gap-2 rounded-2xl border border-white/10 px-6 py-4 text-sm font-semibold sm:min-w-36"
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>
                ) : (
                  <div />
                )}

                {hasNextPageInSection ? (
                  <button
                    type="button"
                    onClick={handleNextPage}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl sm:min-w-36"
                  >
                    Next
                    <Send size={16} />
                  </button>
                ) : hasNextSection ? (
                  <button
                    type="button"
                    onClick={handleNextPage}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl sm:min-w-40"
                  >
                    Next Section
                    <Send size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl disabled:opacity-60 sm:min-w-44"
                  >
                    <Send size={16} />
                    {submitting ? "Submitting..." : "Submit Response"}
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicFormPage;
