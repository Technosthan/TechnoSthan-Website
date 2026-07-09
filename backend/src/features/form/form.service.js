import crypto from "crypto";
import path from "path";
import fs from "fs";
import Form from "./form.model.js";
import FormQuestion from "./formQuestion.model.js";
import FormResponse from "./formResponse.model.js";
import FormResponseAnswer from "./formResponseAnswer.model.js";
import User from "../auth/user.model.js";
import Settings from "../admin/settings.model.js";
import { sendEmail } from "../../services/email/sendEmail.js";
import {
  buildAdminFormSubmissionEmail,
  buildUserConfirmationEmail,
  formatSubmissionRows,
} from "../../services/email/templates/formEmailTemplates.js";

const QUESTION_TYPES = new Set([
  "shortAnswer",
  "paragraph",
  "email",
  "phone",
  "number",
  "date",
  "dropdown",
  "radio",
  "checkbox",
  "fileUpload",
  "imageUpload",
  "rating",
  "address",
  "sectionHeading",
]);

const DEFAULT_THEME_COLOR = "#16a34a";
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const resolved = new Date(expiresAt);
  if (Number.isNaN(resolved.getTime())) return false;
  return resolved.getTime() < Date.now();
};

const createFormExpiredError = () => {
  const error = new Error("This form is no longer accepting responses.");
  error.code = "FORM_EXPIRED";
  return error;
};

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "form";
  let attempt = 0;

  while (
    await Form.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean()
  ) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
};

const getQuestionsPayload = (payload = {}) => {
  if (Array.isArray(payload.questions)) {
    return payload.questions;
  }

  if (Array.isArray(payload.fields)) {
    return payload.fields.map((field, index) => ({
      ...field,
      order: typeof field.order === "number" ? field.order : index,
    }));
  }

  return [];
};

const normalizeQuestion = (question, index) => {
  const type = QUESTION_TYPES.has(question.type)
    ? question.type
    : "shortAnswer";
  const validation =
    type === "number"
      ? {
          minValue: parseOptionalNumber(question.validation?.minValue),
          maxValue: parseOptionalNumber(question.validation?.maxValue),
          minDigits: parseOptionalInteger(question.validation?.minDigits),
          maxDigits: parseOptionalInteger(question.validation?.maxDigits),
          errorMessage: String(question.validation?.errorMessage || "").trim(),
        }
      : undefined;
  return {
    label: String(question.label || "").trim() || "Untitled question",
    type,
    placeholder: String(question.placeholder || "").trim(),
    helpText: String(question.helpText || "").trim(),
    required: question.required === true,
    options: Array.isArray(question.options)
      ? question.options.map((item) => String(item).trim()).filter(Boolean)
      : [],
    ...(validation ? { validation } : {}),
    order: typeof question.order === "number" ? question.order : index,
  };
};

const normalizeFormPayload = async (
  payload,
  excludeId = null,
  existingSlug = "",
) => {
  const title = String(payload.title || "").trim();
  if (!title) {
    throw new Error("Form title is required");
  }

  const requestedSlug = payload.slug
    ? slugify(payload.slug)
    : existingSlug
      ? slugify(existingSlug)
      : slugify(title);
  const slug =
    payload.slug || !excludeId
      ? await ensureUniqueSlug(requestedSlug, excludeId)
      : requestedSlug || "form";

  const status =
    payload.status === "live" || payload.active === true ? "live" : "draft";

  return {
    title,
    description: String(payload.description || "").trim(),
    slug,
    status,
    successMessage:
      String(payload.successMessage || "").trim() ||
      "Thanks for your response.",
    bannerImageUrl: String(payload.bannerImageUrl || "").trim(),
    notificationEmail: String(payload.notificationEmail || "").trim(),
    confirmationEmailEnabled: payload.confirmationEmailEnabled === true,
    allowFileUpload: payload.allowFileUpload === true,
    expiresAt:
      parseDateValue(payload.expiresAt || payload.expiryDate || payload.expiresOn),
    themeColor: String(payload.themeColor || "").trim() || DEFAULT_THEME_COLOR,
  };
};

const parseOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseOptionalInteger = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const getBrandingSettings = async (form = {}) => {
  const settings = await Settings.findOne().lean();
  return {
    companyName: settings?.appName || "Technosthan AgriTech",
    logoUrl: settings?.logoUrl || form?.logoUrl || "",
    brandWebsiteUrl:
      settings?.brandWebsiteUrl ||
      process.env.FRONTEND_URL ||
      process.env.VITE_PUBLIC_URL ||
      "",
    contactEmail: settings?.contactEmail || form?.notificationEmail || "",
    contactPhone: settings?.contactPhone || "",
    contactAddress: settings?.contactAddress || "",
    facebookUrl: settings?.facebookUrl || "",
    instagramUrl: settings?.instagramUrl || "",
    linkedinUrl: settings?.linkedinUrl || "",
    youtubeUrl: settings?.youtubeUrl || "",
    whatsappUrl: settings?.whatsappUrl || "",
    footerText: settings?.footerText || "",
  };
};

const buildFormDto = (form, questions = [], responseCount = 0) => {
  const plainForm = form.toObject ? form.toObject({ virtuals: true }) : form;
  const resolvedSlug =
    plainForm.slug || plainForm.publicSlug || slugify(plainForm.title);
  const resolvedStatus =
    plainForm.status || (plainForm.active === true ? "live" : "draft");
  const sortedQuestions = [...questions]
    .map((question) =>
      question.toObject ? question.toObject({ virtuals: true }) : question,
    )
    .sort((a, b) => a.order - b.order);

  return {
    ...plainForm,
    slug: resolvedSlug,
    publicSlug: resolvedSlug,
    status: resolvedStatus,
    active: resolvedStatus === "live",
    isExpired: isExpired(plainForm.expiresAt),
    questions: sortedQuestions,
    responseCount,
  };
};

const getFormWithQuestions = async (filter = {}) => {
  const form = await Form.findOne(filter).lean();
  if (!form) return null;
  const questions = await FormQuestion.find({ formId: form._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  const responseCount = await FormResponse.countDocuments({ formId: form._id });
  return buildFormDto(form, questions, responseCount);
};

const syncQuestions = async (formId, questions = []) => {
  await FormQuestion.deleteMany({ formId });
  if (!questions.length) return [];

  const normalized = questions.map(normalizeQuestion);
  const created = await FormQuestion.insertMany(
    normalized.map((question, index) => ({
      ...question,
      formId,
      order: question.order ?? index,
    })),
  );

  return created;
};

const collectResponses = async (formId) => {
  const [responses, questions] = await Promise.all([
    FormResponse.find({ formId }).sort({ submittedAt: -1 }).lean(),
    FormQuestion.find({ formId }).sort({ order: 1 }).lean(),
  ]);

  const responseIds = responses.map((response) => response._id);
  const relatedAnswers = responseIds.length
    ? await FormResponseAnswer.find({ responseId: { $in: responseIds } })
        .sort({ createdAt: 1 })
        .lean()
    : [];

  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const grouped = new Map();
  for (const answer of relatedAnswers) {
    const key = String(answer.responseId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({
      ...answer,
      question: questionMap.get(String(answer.questionId)) || null,
    });
  }

  return responses.map((response) => {
    const responseAnswers = grouped.get(String(response._id)) || [];
    const summary = extractSummary(responseAnswers);
    return {
      ...response,
      answers: responseAnswers,
      ...buildResponseAnalysis({
        ...response,
        answers: responseAnswers,
        ...summary,
      }),
      ...summary,
    };
  });
};

const extractSummary = (answers = []) => {
  let name = "";
  let email = "";
  let phone = "";

  for (const answer of answers) {
    const questionLabel = String(answer.question?.label || "").toLowerCase();
    const questionType = answer.question?.type;
    const value = Array.isArray(answer.value)
      ? answer.value.join(", ")
      : String(answer.value || "");
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{9}/;

    if (
      !name &&
      (questionType === "shortAnswer" ||
        /name|full name|applicant name|your name/.test(questionLabel))
    ) {
      name = value;
    }
    if (!email && (questionType === "email" || /email/.test(questionLabel))) {
      email = value || "";
    }
    if (!email && emailRegex.test(value)) {
      email = value.match(emailRegex)?.[0] || "";
    }
    if (!phone && (questionType === "phone" || /phone|mobile|contact/.test(questionLabel))) {
      phone = value || "";
    }
    if (!phone && phoneRegex.test(value.replace(/\s+/g, ""))) {
      phone = value.match(phoneRegex)?.[0] || "";
    }
  }

  return { name, email, phone };
};

const normalizeSubmissionDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const matchesResponseSearch = (response, search = "") => {
  const term = normalizeSearchText(search);
  if (!term) return true;

  const answerTexts = (response.answers || [])
    .flatMap((answer) => {
      if (answer.fileName) return [answer.fileName, answer.fileUrl || ""];
      if (Array.isArray(answer.value)) return answer.value;
      return [answer.value ?? ""];
    })
    .map((item) => normalizeSearchText(item))
    .join(" ");

  return [
    response.referenceId,
    response.name,
    response.email,
    response.phone,
    answerTexts,
  ]
    .map((item) => normalizeSearchText(item))
    .some((item) => item.includes(term));
};

const normalizeComparableText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const canonicalYesNo = (value) => {
  const text = normalizeComparableText(value);
  if (!text) return null;
  if (/^(yes|y|true|interested|available|available to join)$/.test(text)) return "yes";
  if (/^(no|n|false)$/.test(text)) return "no";
  return null;
};

const getAnswerText = (answer) => {
  if (!answer) return "";
  if (Array.isArray(answer.value)) {
    return answer.value.map((item) => String(item)).join(", ");
  }
  return String(answer.value ?? "");
};

const detectRatingValue = (answers = []) => {
  for (const answer of answers) {
    const questionLabel = normalizeComparableText(answer.question?.label);
    const questionType = answer.question?.type;
    const value = getAnswerText(answer);
    if (questionType === "rating" || /star|rating/.test(questionLabel)) {
      const rating = Number.parseInt(value, 10);
      if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
        return rating;
      }
    }
  }
  return null;
};

const detectInterestSignals = (answers = []) => {
  let interestedAnswer = "";
  let availableAnswer = "";
  let interestedYes = false;
  let availableYes = false;

  for (const answer of answers) {
    const questionLabel = normalizeComparableText(answer.question?.label);
    const questionType = answer.question?.type;
    const value = getAnswerText(answer);
    const yesNo = canonicalYesNo(value);

    if (!interestedAnswer && (questionType === "radio" || questionType === "dropdown" || /interested/.test(questionLabel))) {
      interestedAnswer = value;
      interestedYes = yesNo === "yes";
    }

    if (!availableAnswer && /available to join|available|join|join us|seminar/.test(questionLabel)) {
      availableAnswer = value;
      availableYes = yesNo === "yes";
    }
  }

  return {
    interestedAnswer,
    availableAnswer,
    interestedYes,
    availableYes,
  };
};

const buildResponseAnalysis = (response) => {
  const answers = Array.isArray(response.answers) ? response.answers : [];
  const ratingValue = detectRatingValue(answers);
  const {
    interestedAnswer,
    availableAnswer,
    interestedYes,
    availableYes,
  } = detectInterestSignals(answers);
  const hasEmail = Boolean(response.email);
  const hasPhone = Boolean(response.phone);

  const score =
    (ratingValue ? { 5: 100, 4: 80, 3: 60, 2: 40, 1: 20 }[ratingValue] || 0 : 0) +
    (interestedYes ? 20 : 0) +
    (availableYes ? 20 : 0) +
    (hasPhone ? 10 : 0) +
    (hasEmail ? 10 : 0);

  const leadCategory =
    score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";

  return {
    ...response,
    ratingValue,
    interestedAnswer,
    availableAnswer,
    interestedYes,
    availableYes,
    hasEmail,
    hasPhone,
    score,
    leadCategory,
  };
};

const matchesAnalysisFilters = (response, options = {}) => {
  const rating = options.rating ? Number.parseInt(options.rating, 10) : null;
  if (rating && response.ratingValue !== rating) {
    return false;
  }

  const interest = normalizeComparableText(options.interest);
  if (interest) {
    if (interest === "yes" || interest === "interested_yes") {
      if (!response.interestedYes) return false;
    } else if (interest === "no" || interest === "interested_no") {
      if (response.interestedYes) return false;
    } else if (interest === "available_yes" || interest === "join_yes") {
      if (!response.availableYes) return false;
    } else if (interest === "available_no" || interest === "join_no") {
      if (response.availableYes) return false;
    }
  }

  const scoreFilter = normalizeComparableText(options.score);
  if (scoreFilter) {
    if (scoreFilter === "hot" && response.leadCategory !== "hot") return false;
    if (scoreFilter === "warm" && response.leadCategory !== "warm") return false;
    if (scoreFilter === "cold" && response.leadCategory !== "cold") return false;
    if (/^\d+\+?$/.test(scoreFilter)) {
      const minScore = Number.parseInt(scoreFilter, 10);
      if (response.score < minScore) return false;
    }
  }

  return true;
};

const paginateArray = (items = [], options = {}) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Number.parseInt(options.limit, 10) || 20);
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const escapeCsv = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const buildCsv = (form, questions, responses) => {
  const headers = [
    "Reference ID",
    "Submitted At",
    "Name",
    "Email",
    "Phone",
    ...questions.map((question) => question.label),
  ];

  const rows = [headers.map(escapeCsv).join(",")];
  const questionIdOrder = questions.map((question) => String(question._id));

  for (const response of responses) {
    const answerMap = new Map();
    for (const answer of response.answers || []) {
      answerMap.set(String(answer.questionId), answer);
    }

    const row = [
      response.referenceId,
      response.submittedAt || response.createdAt,
      response.name || "",
      response.email || "",
      response.phone || "",
      ...questionIdOrder.map((questionId) => {
        const answer = answerMap.get(questionId);
        if (!answer) return "";
        if (answer.fileUrl) {
          return answer.fileName ? `${answer.fileName} (${answer.fileUrl})` : answer.fileUrl;
        }
        if (Array.isArray(answer.value)) {
          return answer.value.join(", ");
        }
        return answer.value ?? "";
      }),
    ];

    rows.push(row.map(escapeCsv).join(","));
  }

  return rows.join("\n");
};

const parseAnswersPayload = (body = {}) => {
  const raw =
    body.answers ??
    body.submittedData ??
    body.values ??
    body.response ??
    body;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }

  return {};
};

const normalizeEmailValue = (value = "") =>
  String(value || "").trim().toLowerCase();

const normalizePhoneValue = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  return digits;
};

const extractSubmissionContact = (questions = [], answersPayload = {}) => {
  let email = "";
  let phone = "";

  for (const question of questions) {
    const questionKey = String(question._id);
    const slugKey = slugify(question.label);
    const submittedValue =
      answersPayload[questionKey] ??
      answersPayload[slugKey] ??
      answersPayload[question.label] ??
      null;
    const value = Array.isArray(submittedValue)
      ? submittedValue.join(", ")
      : String(submittedValue || "");
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{9}/;
    const questionLabel = String(question.label || "").toLowerCase();
    const questionType = question.type;

    if (!email && (questionType === "email" || /email/.test(questionLabel))) {
      email = value || "";
    }
    if (!email && emailRegex.test(value)) {
      email = value.match(emailRegex)?.[0] || "";
    }
    if (!phone && (questionType === "phone" || /phone|mobile|contact/.test(questionLabel))) {
      phone = value || "";
    }
    if (!phone && phoneRegex.test(value.replace(/\s+/g, ""))) {
      phone = value.match(phoneRegex)?.[0] || "";
    }
  }

  return {
    email: normalizeEmailValue(email),
    phone: normalizePhoneValue(phone),
  };
};

const findDuplicateFormResponse = async (formId, contact = {}) => {
  const orConditions = [];
  if (contact.email) {
    orConditions.push({ email: contact.email });
  }
  if (contact.phone) {
    orConditions.push({ phone: contact.phone });
  }

  if (!orConditions.length) {
    return null;
  }

  return await FormResponse.findOne({
    formId,
    $or: orConditions,
  }).lean();
};

const findLegacyDuplicateFormResponse = async (formId, contact = {}) => {
  if (!contact.email && !contact.phone) {
    return null;
  }

  const responses = await collectResponses(formId);
  return (
    responses.find((response) => {
      const responseEmail = normalizeEmailValue(response.email);
      const responsePhone = normalizePhoneValue(response.phone);
      return (
        (contact.email && responseEmail === contact.email) ||
        (contact.phone && responsePhone === contact.phone)
      );
    }) || null
  );
};

const getFileUrl = (file, baseUrl = "") => {
  const apiUrl =
    baseUrl ||
    process.env.API_URL ||
    process.env.VITE_API_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";
  const publicPath = `/uploads/${file.filename}`;
  return apiUrl ? `${apiUrl}${publicPath}` : publicPath;
};

const validateQuestionValue = (question, value, fileList = []) => {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  const hasFile = Array.isArray(fileList) && fileList.length > 0;

  if (question.required && !hasFile && isEmpty && question.type !== "sectionHeading") {
    throw new Error(`Question "${question.label}" is required`);
  }

  if (isEmpty && !hasFile) {
    return;
  }

  const stringValue = Array.isArray(value) ? value.join(", ") : String(value || "");

  if (question.type === "number") {
    const validation = question.validation || {};
    const errorMessage =
      String(validation.errorMessage || "").trim() ||
      `Question "${question.label}" must be a valid number`;
    const normalizedValue = stringValue.trim();
    if (!/^-?\d+$/.test(normalizedValue)) {
      const error = new Error(errorMessage);
      error.code = "NUMBER_VALIDATION";
      error.statusCode = 400;
      throw error;
    }

    const digitCount = normalizedValue.replace(/^-/, "").length;
    const numericValue = Number(normalizedValue);

    if (
      Number.isFinite(validation.minValue) &&
      numericValue < Number(validation.minValue)
    ) {
      const error = new Error(errorMessage);
      error.code = "NUMBER_VALIDATION";
      error.statusCode = 400;
      throw error;
    }

    if (
      Number.isFinite(validation.maxValue) &&
      numericValue > Number(validation.maxValue)
    ) {
      const error = new Error(errorMessage);
      error.code = "NUMBER_VALIDATION";
      error.statusCode = 400;
      throw error;
    }

    if (
      Number.isInteger(validation.minDigits) &&
      digitCount < validation.minDigits
    ) {
      const error = new Error(errorMessage);
      error.code = "NUMBER_VALIDATION";
      error.statusCode = 400;
      throw error;
    }

    if (
      Number.isInteger(validation.maxDigits) &&
      digitCount > validation.maxDigits
    ) {
      const error = new Error(errorMessage);
      error.code = "NUMBER_VALIDATION";
      error.statusCode = 400;
      throw error;
    }
  }

  if (question.type === "email" && stringValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stringValue)) {
      throw new Error(`Question "${question.label}" must be a valid email`);
    }
  }

  if (question.type === "phone" && stringValue) {
    const phoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
    if (!phoneRegex.test(stringValue)) {
      throw new Error(
        `Question "${question.label}" must be a valid Indian mobile number`,
      );
    }
  }
};

const validateUploadedFiles = (question, fileEntries = []) => {
  if (!fileEntries.length) return;

  for (const file of fileEntries) {
    if (file.size && file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error("Maximum file size allowed is 5 MB.");
    }

    if (question.type === "imageUpload") {
      if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
        throw new Error(
          `Question "${question.label}" only accepts JPG, PNG, or WEBP images`,
        );
      }
    }

    if (question.type === "fileUpload") {
      if (!FILE_MIME_TYPES.has(file.mimetype)) {
        throw new Error(
          `Question "${question.label}" only accepts PDF, DOC, DOCX, JPG, JPEG, PNG, or WEBP files`,
        );
      }
    }
  }
};

const getFileEntriesByQuestion = (files = []) => {
  const map = new Map();
  for (const file of files) {
    const key = file.fieldname;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(file);
  }
  return map;
};

const prepareAnswerRecord = (
  question,
  submittedValue,
  fileEntries = [],
  baseUrl = "",
) => {
  if (fileEntries.length > 0) {
    const file = fileEntries[0];
    return {
      value: submittedValue ?? file.originalname,
      fileUrl: getFileUrl(file, baseUrl),
      fileName: file.originalname,
      fileType: file.mimetype,
    };
  }

  if (question.type === "checkbox" && !Array.isArray(submittedValue)) {
    if (typeof submittedValue === "string" && submittedValue.includes(",")) {
      return {
        value: submittedValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
    }
  }

  return {
    value: Array.isArray(submittedValue)
      ? submittedValue.map((item) => String(item))
      : submittedValue,
  };
};

const sendSubmissionNotifications = async ({
  form,
  response,
  answers,
  adminUrl,
}) => {
  const branding = await getBrandingSettings(form);
  const rows = formatSubmissionRows(answers);
  const submittedAtText = new Date(
    response.submittedAt || response.createdAt,
  ).toLocaleString();

  const createdByUser = form.createdBy
    ? await User.findById(form.createdBy).select("email").lean()
    : null;
  const notificationRecipient =
    form.notificationEmail || createdByUser?.email || "";

  if (notificationRecipient) {
    await sendEmail({
      to: notificationRecipient,
      subject: `New Form Submission - ${form.title} - ${response.referenceId}`,
      html: buildAdminFormSubmissionEmail({
        formTitle: form.title,
        submittedAt: submittedAtText,
        referenceId: response.referenceId,
        rows,
        adminUrl,
        branding,
      }),
    });
  }

  const emailAnswer =
    answers.find((answer) => answer.question?.type === "email") ||
    answers.find((answer) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(answer.value || "")));
  if (form.confirmationEmailEnabled && emailAnswer?.value) {
    await sendEmail({
      to: String(emailAnswer.value),
      subject: `Thank you for your submission - ${form.title}`,
      html: buildUserConfirmationEmail({
        formTitle: form.title,
        submittedAt: submittedAtText,
        referenceId: response.referenceId,
        successMessage: form.successMessage,
        rows,
        publicUrl:
          branding.brandWebsiteUrl ||
          process.env.FRONTEND_URL ||
          process.env.VITE_PUBLIC_URL ||
          "",
        branding,
      }),
    });
  }
};

export const createForm = async (payload, userId) => {
  const formPayload = await normalizeFormPayload(payload);
  const questionsPayload = getQuestionsPayload(payload);

  const form = await Form.create({
    ...formPayload,
    createdBy: userId,
  });

  const questions = await syncQuestions(form._id, questionsPayload);
  return buildFormDto(form, questions, 0);
};

export const getAdminForms = async () => {
  const forms = await Form.find().sort({ createdAt: -1 }).lean();
  const responseCounts = await FormResponse.aggregate([
    { $group: { _id: "$formId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(
    responseCounts.map((item) => [String(item._id), item.count]),
  );

  const formIds = forms.map((form) => form._id);
  const questionCounts = formIds.length
    ? await FormQuestion.aggregate([
        { $match: { formId: { $in: formIds } } },
        { $group: { _id: "$formId", count: { $sum: 1 } } },
      ])
    : [];
  const questionCountMap = new Map(
    questionCounts.map((item) => [String(item._id), item.count]),
  );

  return forms.map((form) => ({
    ...form,
    slug: form.slug || form.publicSlug || slugify(form.title),
    publicSlug: form.slug || form.publicSlug || slugify(form.title),
    status: form.status || (form.active ? "live" : "draft"),
    active:
      (form.status || (form.active ? "live" : "draft")) === "live",
    responseCount: countMap.get(String(form._id)) || 0,
    questionCount: questionCountMap.get(String(form._id)) || 0,
  }));
};

export const getFormById = async (formId) => {
  return await getFormWithQuestions({ _id: formId });
};

export const updateForm = async (formId, payload) => {
  const existing = await Form.findById(formId);
  if (!existing) {
    throw new Error("Form not found");
  }

  const formPayload = await normalizeFormPayload(
    payload,
    formId,
    existing.slug || existing.publicSlug || slugify(existing.title),
  );
  existing.title = formPayload.title;
  existing.description = formPayload.description;
  existing.slug = formPayload.slug;
  existing.status = formPayload.status;
  existing.successMessage = formPayload.successMessage;
  existing.bannerImageUrl = formPayload.bannerImageUrl;
  existing.notificationEmail = formPayload.notificationEmail;
  existing.confirmationEmailEnabled = formPayload.confirmationEmailEnabled;
  existing.allowFileUpload = formPayload.allowFileUpload;
  existing.expiresAt = formPayload.expiresAt;
  existing.themeColor = formPayload.themeColor;

  await existing.save();
  const questions = await syncQuestions(existing._id, getQuestionsPayload(payload));
  return buildFormDto(existing, questions, await FormResponse.countDocuments({ formId: existing._id }));
};

export const deleteForm = async (formId) => {
  await Promise.all([
    FormQuestion.deleteMany({ formId }),
    FormResponseAnswer.deleteMany({
      responseId: {
        $in: await FormResponse.find({ formId }).distinct("_id"),
      },
    }),
    FormResponse.deleteMany({ formId }),
  ]);

  return await Form.findByIdAndDelete(formId);
};

export const getFormResponses = async (formId, options = {}) => {
  const responses = await collectResponses(formId);
  const hasFilters =
    options.search ||
    options.from ||
    options.to ||
    options.page ||
    options.limit;

  if (!hasFilters) {
    return responses;
  }

  const fromTime = options.from ? new Date(options.from).getTime() : null;
  const toTime = options.to ? new Date(options.to).getTime() : null;
  const filtered = responses.filter((response) => {
    const submittedTime = normalizeSubmissionDate(
      response.submittedAt || response.createdAt,
    );
    if (fromTime && submittedTime < fromTime) return false;
    if (toTime && submittedTime > toTime + 24 * 60 * 60 * 1000 - 1) return false;
    return matchesResponseSearch(response, options.search);
  });

  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Number.parseInt(options.limit, 10) || 20);
  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getFormResponseAnalysis = async (formId, options = {}) => {
  const responses = await collectResponses(formId);
  const filtered = responses.filter((response) => {
    if (!matchesResponseSearch(response, options.search)) {
      return false;
    }

    const submittedTime = normalizeSubmissionDate(
      response.submittedAt || response.createdAt,
    );
    const fromTime = options.from ? new Date(options.from).getTime() : null;
    const toTime = options.to ? new Date(options.to).getTime() : null;
    if (fromTime && submittedTime < fromTime) return false;
    if (toTime && submittedTime > toTime + 24 * 60 * 60 * 1000 - 1) return false;
    return matchesAnalysisFilters(response, options);
  });

  const stats = filtered.reduce(
    (acc, response) => {
      acc.total += 1;
      acc.ratings[response.ratingValue || 0] =
        (acc.ratings[response.ratingValue || 0] || 0) + 1;
      if (response.leadCategory === "hot") acc.hot += 1;
      if (response.leadCategory === "warm") acc.warm += 1;
      if (response.leadCategory === "cold") acc.cold += 1;
      if (response.interestedYes) acc.interestedYes += 1;
      if (response.availableYes) acc.availableYes += 1;
      if (response.hasEmail) acc.hasEmail += 1;
      if (response.hasPhone) acc.hasPhone += 1;
      return acc;
    },
    {
      total: 0,
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

  const pageResult = paginateArray(filtered, options);
  return {
    ...pageResult,
    stats,
  };
};

export const getFormResponseById = async (formId, responseId) => {
  const response = await FormResponse.findOne({ _id: responseId, formId }).lean();
  if (!response) return null;
  const answers = await FormResponseAnswer.find({ responseId })
    .sort({ createdAt: 1 })
    .populate("questionId")
    .lean();
  return {
    ...response,
    answers: answers.map((answer) => ({
      ...answer,
      question: answer.questionId,
    })),
  };
};

export const deleteFormResponse = async (formId, responseId) => {
  const response = await FormResponse.findOne({ _id: responseId, formId });
  if (!response) {
    throw new Error("Response not found");
  }

  await FormResponseAnswer.deleteMany({ responseId });
  await response.deleteOne();
  return true;
};

export const exportFormResponses = async (formId, options = {}) => {
  const form = await Form.findById(formId).lean();
  if (!form) {
    throw new Error("Form not found");
  }

  const questions = await FormQuestion.find({ formId })
    .sort({ order: 1 })
    .lean();
  const usesAnalysisFilters =
    options.rating != null ||
    options.interest != null ||
    options.score != null;
  const responses = usesAnalysisFilters
    ? await getFormResponseAnalysis(formId, options)
    : await getFormResponses(formId, options);
  const exportRows = Array.isArray(responses) ? responses : responses.items || [];
  return buildCsv(form, questions, exportRows);
};

export const getFormBySlug = async (slug) => {
  const normalizedSlug = String(slug).toLowerCase();
  const form = await Form.findOne({
    $or: [{ slug: normalizedSlug }, { publicSlug: normalizedSlug }],
  }).lean();
  if (!form || form.status !== "live") {
    return null;
  }

  const questions = await FormQuestion.find({ formId: form._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return buildFormDto(form, questions, await FormResponse.countDocuments({ formId: form._id }));
};

export const submitForm = async ({
  slug,
  body,
  files = [],
  ipAddress = "",
  userAgent = "",
  adminUrl = "",
  publicBaseUrl = "",
}) => {
  const normalizedSlug = String(slug).toLowerCase();
  const form = await Form.findOne({
    $or: [{ slug: normalizedSlug }, { publicSlug: normalizedSlug }],
  }).lean();
  if (!form) {
    throw new Error("Form not found");
  }

  if (form.status !== "live") {
    throw new Error("This form is not live yet");
  }

  if (isExpired(form.expiresAt)) {
    throw createFormExpiredError();
  }

  const questions = await FormQuestion.find({ formId: form._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  const answersPayload = parseAnswersPayload(body);
  const fileEntriesByKey = getFileEntriesByQuestion(files);
  const contact = extractSubmissionContact(questions, answersPayload);

  if (!form.allowFileUpload && files.length > 0) {
    throw new Error("File uploads are disabled for this form");
  }

  const answersToInsert = [];
  for (const question of questions) {
    const questionKey = String(question._id);
    const slugKey = slugify(question.label);
    const submittedValue =
      answersPayload[questionKey] ??
      answersPayload[slugKey] ??
      answersPayload[question.label] ??
      null;
    const fileEntries =
      fileEntriesByKey.get(questionKey) ||
      fileEntriesByKey.get(slugKey) ||
      [];

    validateUploadedFiles(question, fileEntries);
    validateQuestionValue(question, submittedValue, fileEntries);
    answersToInsert.push({
      question,
      submittedValue,
      fileEntries,
    });
  }

  const duplicateSubmission = await findDuplicateFormResponse(form._id, contact);
  const legacyDuplicateSubmission = duplicateSubmission
    ? null
    : await findLegacyDuplicateFormResponse(form._id, contact);
  if (duplicateSubmission || legacyDuplicateSubmission) {
    const error = new Error("You have already filled this form.");
    error.code = "DUPLICATE_SUBMISSION";
    error.statusCode = 409;
    throw error;
  }

  const response = await FormResponse.create({
    formId: form._id,
    referenceId: `FRM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    email: contact.email,
    phone: contact.phone,
    submittedAt: new Date(),
    ipAddress,
    userAgent,
  });

  const insertedAnswers = [];
  for (const item of answersToInsert) {
    const payload = prepareAnswerRecord(
      item.question,
      item.submittedValue,
      item.fileEntries,
      publicBaseUrl,
    );
    insertedAnswers.push(
      await FormResponseAnswer.create({
        responseId: response._id,
        questionId: item.question._id,
        ...payload,
      }),
    );
  }

  const populatedAnswers = insertedAnswers.map((answer) => ({
    ...answer.toObject(),
    question: questions.find(
      (question) => String(question._id) === String(answer.questionId),
    ),
  }));

  void sendSubmissionNotifications({
    form,
    response,
    answers: populatedAnswers,
    adminUrl:
      adminUrl ||
      `${process.env.FRONTEND_URL || process.env.VITE_PUBLIC_URL || ""}/admin/dashboard/forms`,
  }).catch((error) => {
    console.error("Failed to send form submission notifications:", error);
  });

  return {
    ...response.toObject(),
    answers: populatedAnswers,
    successMessage: form.successMessage,
  };
};

export const createPublicFileEntry = (file) => ({
  fileUrl: getFileUrl(file),
  fileName: file.originalname,
  fileType: file.mimetype,
});
