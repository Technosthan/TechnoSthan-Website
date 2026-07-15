const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const zlib = require("zlib");
const Form = require("./form.model.js");
const FormQuestion = require("./formQuestion.model.js");
const FormResponse = require("./formResponse.model.js");
const FormResponseAnswer = require("./formResponseAnswer.model.js");
const FormVerification = require("./formVerification.model.js");
const FormNotification = require("./formNotification.model.js");
const User = require("../auth/user.model.js");
const Settings = require("../admin/settings.model.js");
const { createLog } = require("../services/activityLogService.js");
const { sendEmail } = require("../services/email/sendEmail.js");
const {
  buildAdminFormSubmissionEmail,
  buildUserConfirmationEmail,
  formatSubmissionRows,
} = require("../services/email/templates/formEmailTemplates.js");
const {
  deleteCloudinaryAsset,
  getCloudinaryFolder,
  getCloudinaryResourceType,
  normalizeStoredAsset,
  resolveStoredAssetUrl,
  uploadBufferToCloudinary,
} = require("../shared/services/cloudinary.service.js");

const importZipEntry = async (buffer, entryName) => {
  const LOCAL_FILE_SIGNATURE = 0x04034b50;
  let offset = 0;

  while (offset + 30 < buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== LOCAL_FILE_SIGNATURE) {
      offset += 1;
      continue;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const name = buffer
      .slice(offset + 30, offset + 30 + fileNameLength)
      .toString("utf8");
    const dataStart = offset + 30 + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;

    if (name === entryName) {
      const slice = buffer.slice(dataStart, Math.min(dataEnd, buffer.length));
      if (compressionMethod === 0) {
        return slice.toString("utf8");
      }
      if (compressionMethod === 8) {
        return zlib.inflateRawSync(slice).toString("utf8");
      }
      return "";
    }

    offset = dataEnd > offset ? dataEnd : offset + 1;
  }

  return "";
};

const decodeXmlEntities = (value = "") =>
  String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripXmlText = (value = "") =>
  decodeXmlEntities(
    String(value || "")
      .replace(/<\s*\/?\s*w:tab\s*\/?>/gi, "\t")
      .replace(/<\s*\/?\s*w:br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

const extractTextFromPdfBuffer = (buffer) => {
  const source = buffer.toString("latin1");
  const matches = [];
  const textPattern = /\((?:\\.|[^()])*\)\s*Tj/g;
  let match;

  const unescapePdfString = (value) =>
    String(value || "")
      .replace(/\\([nrtbf()\\])/g, (_, escaped) => {
        if (escaped === "n") return "\n";
        if (escaped === "r") return "\r";
        if (escaped === "t") return "\t";
        if (escaped === "b") return "\b";
        if (escaped === "f") return "\f";
        return escaped;
      })
      .replace(/\\([0-7]{1,3})/g, (_, octal) =>
        String.fromCharCode(Number.parseInt(octal, 8) || 32),
      );

  while ((match = textPattern.exec(source)) !== null) {
    const raw = match[0].match(/\(((?:\\.|[^()])*)\)\s*Tj/);
    if (raw?.[1]) {
      matches.push(unescapePdfString(raw[1]));
    }
  }

  const arrayPattern = /\[((?:.|\n)*?)\]\s*TJ/g;
  while ((match = arrayPattern.exec(source)) !== null) {
    const inner = match[1];
    const stringMatches = inner.match(/\(((?:\\.|[^()])*)\)/g) || [];
    stringMatches.forEach((part) => {
      const raw = part.match(/\(((?:\\.|[^()])*)\)/);
      if (raw?.[1]) {
        matches.push(unescapePdfString(raw[1]));
      }
    });
  }

  const fallbackSegments = source
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, " ")
    .match(/[A-Za-z0-9][A-Za-z0-9\s,.;:'"()@&\/\-]{16,}/g) || [];
  matches.push(...fallbackSegments);

  return matches
    .map((value) => String(value || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
};

const extractTextFromImportBuffer = async (file) => {
  const mimeType = String(file.mimetype || "").toLowerCase();
  const originalName = String(file.originalname || "").toLowerCase();
  const buffer = file.buffer || Buffer.alloc(0);

  if (!buffer.length) {
    return "";
  }

  if (mimeType === "text/plain" || originalName.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalName.endsWith(".docx")
  ) {
    try {
      const documentXml = await importZipEntry(buffer, "word/document.xml");
      if (documentXml) {
        return stripXmlText(documentXml);
      }
    } catch (error) {
      console.warn("Failed to extract DOCX text:", error.message);
    }
  }

  if (mimeType === "application/pdf" || originalName.endsWith(".pdf")) {
    return extractTextFromPdfBuffer(buffer);
  }

  return buffer.toString("utf8");
};

const normalizeImportText = (value = "") =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const cleanImportLabel = (value = "") =>
  String(value || "")
    .replace(/^\s*[\-*\u2022]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

const stripTrailingHint = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(.*?)[\s-]*\(([^()]{3,})\)\s*$/);
  if (!match) return { label: raw, hint: "" };
  return { label: match[1].trim(), hint: match[2].trim() };
};

const isSectionHeadingLine = (line = "") => {
  const raw = String(line || "").trim();
  if (!raw) return false;
  if (raw.length > 80) return false;
  if (/[:?]$/.test(raw)) return false;
  return (
    /^(section|part|chapter|heading|group)\b/i.test(raw) ||
    /^[A-Z0-9][A-Z0-9\s&/.-]+$/.test(raw)
  );
};

const isOptionsLine = (line = "") =>
  /^\s*(?:[-*\u2022]|\d+[.)]|[a-zA-Z][.)])\s+/.test(String(line || "").trim());

const normalizeChoiceValue = (line = "") => cleanImportLabel(line);

const detectImportedQuestionType = ({ label = "", options = [] } = {}) => {
  const lower = String(label || "").toLowerCase();
  const normalizedOptions = options.map((option) => String(option).toLowerCase().trim()).filter(Boolean);

  if (/section|heading/.test(lower)) {
    return "sectionHeading";
  }
  if (/email/.test(lower)) return "email";
  if (/phone|mobile|contact number|whatsapp/.test(lower)) return "phone";
  if (/website|portfolio|linkedin|github|url|link/.test(lower)) return "link";
  if (/date of birth|\bdob\b|\bdate\b/.test(lower)) return "date";
  if (/address|location/.test(lower)) return "address";
  if (/upload|resume|cv|portfolio file|attachment|document/.test(lower)) return "fileUpload";
  if (/rating|star/.test(lower)) return "rating";
  if (/paragraph|describe|explain|details|tell us|why/.test(lower)) return "paragraph";
  if (/number|age|quantity|count|years|salary|experience/.test(lower)) return "number";

  if (normalizedOptions.includes("yes") && normalizedOptions.includes("no")) {
    return "radio";
  }
  if (normalizedOptions.length > 4) {
    return "dropdown";
  }
  if (normalizedOptions.length > 1) {
    return lower.includes("select all") || lower.includes("multiple") || lower.includes("choose all")
      ? "checkbox"
      : "radio";
  }

  return "shortAnswer";
};

const parseImportedQuestions = (text = "") => {
  const lines = normalizeImportText(text);
  if (!lines.length) {
    return { title: "", description: "", sections: [], questions: [] };
  }

  const title = lines[0] || "";
  const descriptionLines = [];
  const sections = [];
  const questions = [];

  let index = 1;
  while (index < lines.length) {
    const rawLine = lines[index];
    const line = cleanImportLabel(rawLine);
    if (!line) {
      index += 1;
      continue;
    }

    if (descriptionLines.length < 4 && !isSectionHeadingLine(line) && !/[?:]$/.test(line) && line.length <= 140) {
      const nextLine = lines[index + 1] || "";
      if (!isOptionsLine(nextLine) && !/[?:]$/.test(nextLine) && descriptionLines.length < 2 && index < 5) {
        descriptionLines.push(line);
        index += 1;
        continue;
      }
    }

    break;
  }

  const remainingLines = lines.slice(index);
  let pendingQuestion = null;

  const flushPending = () => {
    if (!pendingQuestion) return;
    const { label, hint, required, options } = pendingQuestion;
    const stripped = stripTrailingHint(label);
    const questionLabel = stripped.label || label;
    const mergedHint = hint || stripped.hint || "";
    const detectedType = detectImportedQuestionType({
      label: questionLabel,
      options,
    });
    questions.push({
      label: questionLabel,
      type: detectedType,
      required,
      placeholder:
        detectedType === "email"
          ? "name@example.com"
          : detectedType === "phone"
            ? "9876543210"
            : detectedType === "link"
              ? "https://example.com"
              : "",
      helpText: mergedHint,
      options: options.filter(Boolean),
      order: questions.length,
    });
    pendingQuestion = null;
  };

  for (let i = 0; i < remainingLines.length; i += 1) {
    const rawLine = remainingLines[i];
    const line = cleanImportLabel(rawLine);
    if (!line) {
      continue;
    }

    if (isSectionHeadingLine(line)) {
      flushPending();
      sections.push({ label: line, order: sections.length });
      questions.push({
        label: line,
        type: "sectionHeading",
        required: false,
        placeholder: "",
        helpText: "",
        options: [],
        order: questions.length,
      });
      continue;
    }

    if (pendingQuestion) {
      if (isOptionsLine(rawLine)) {
        pendingQuestion.options.push(normalizeChoiceValue(rawLine));
        continue;
      }

      const nextRaw = remainingLines[i + 1] || "";
      if (
        /^(yes\s*\/\s*no|yes no)$/i.test(line) ||
        /^[^?.]{3,120}\?$/.test(line) ||
        line.length <= 120
      ) {
        flushPending();
      } else if (!isOptionsLine(nextRaw) && !/[?:]$/.test(nextRaw) && line.length <= 120) {
        flushPending();
      }
    }

    if (!pendingQuestion) {
      const { label, hint } = stripTrailingHint(line);
      const isRequired = /\b(required|mandatory|must)\b|\*/i.test(line);
      const candidateLabel = cleanImportLabel(label.replace(/\*+$/g, ""));
      const likelyQuestion =
        candidateLabel.length <= 160 &&
        (
          /[?]$/.test(candidateLabel) ||
          /\b(email|phone|mobile|website|portfolio|linkedin|github|date|dob|address|resume|upload|name|company|city|state|country|gender|age|choice|select|choose|interest|available|rating|comment|feedback|details|description|password|secret)\b/i.test(candidateLabel) ||
          candidateLabel.length <= 60
        );

      if (!likelyQuestion) {
        continue;
      }

      pendingQuestion = {
        label: candidateLabel,
        hint,
        required: isRequired,
        options: [],
      };

      if (candidateLabel.endsWith("?")) {
        pendingQuestion.label = candidateLabel.replace(/\?+$/, "").trim();
      }
    }
  }

  flushPending();

  const description = descriptionLines.join(" ");
  return {
    title,
    description,
    sections,
    questions,
  };
};

const importFormFile = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("No file uploaded");
  }

  const mimeType = String(file.mimetype || "").toLowerCase();
  const originalName = String(file.originalname || "").toLowerCase();
  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
  const hasAllowedExtension = allowedExtensions.some((extension) =>
    originalName.endsWith(extension),
  );
  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]);

  if (!hasAllowedExtension || !allowedMimeTypes.has(mimeType)) {
    throw new Error("Only PDF, DOC, DOCX, and TXT files are allowed");
  }

  const extractedText = await extractTextFromImportBuffer(file);
  const parsed = parseImportedQuestions(extractedText);

  if (!parsed.title && !parsed.description && !parsed.questions.length) {
    throw new Error("Could not detect form content from the uploaded file");
  }

  return {
    title: parsed.title,
    description: parsed.description,
    sections: parsed.sections,
    questions: parsed.questions,
  };
};

const QUESTION_TYPES = new Set([
  "shortAnswer",
  "One line Text",
  "One Line Text",
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
  "link",
  "password",
  "rating",
  "address",
  "sectionHeading",
]);

const DEFAULT_THEME_COLOR = "#16a34a";
const DEFAULT_EMAIL_TEMPLATE = {
  preset: "green-professional",
  headerTitle: "",
  headerSubtitle: "",
  successMessage: "",
  footerText: "",
  companyName: "",
  websiteButtonText: "",
  websiteButtonUrl: "",
  headerBackgroundColor: "#16a34a",
  bodyBackgroundColor: "#f3f4f6",
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
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
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

const toAssetPayload = (asset = null, fallbackUrl = "") => {
  if (!asset && !fallbackUrl) {
    return null;
  }

  const normalized = normalizeStoredAsset(asset, fallbackUrl);
  if (!normalized || typeof normalized === "string") {
    return null;
  }

  return {
    ...normalized,
    url: normalized.url || fallbackUrl || "",
    secureUrl: normalized.secureUrl || normalized.url || fallbackUrl || "",
  };
};

const resolveAssetUrl = (assetOrUrl = "") => {
  const value =
    typeof assetOrUrl === "object"
      ? assetOrUrl?.secureUrl || assetOrUrl?.url || assetOrUrl?.fileUrl || ""
      : assetOrUrl;
  return resolveStoredAssetUrl(value);
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeHttpUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(javascript:|data:|file:)/i.test(raw)) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.href;
  } catch {
    return "";
  }
};

const getSecretEncryptionKey = () => {
  const secret = String(process.env.FORM_SECRET_ENCRYPTION_KEY || "").trim();
  if (!secret) {
    throw new Error("FORM_SECRET_ENCRYPTION_KEY is not configured");
  }
  return crypto.createHash("sha256").update(secret).digest();
};

const encryptSecretValue = (value = "") => {
  const plaintext = String(value ?? "");
  if (!plaintext) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecretEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
};

const decryptSecretValue = (secret = {}) => {
  if (!secret || !secret.ciphertext || !secret.iv || !secret.authTag) {
    return "";
  }

  const decipher = crypto.createDecipheriv(
    secret.algorithm || "aes-256-gcm",
    getSecretEncryptionKey(),
    Buffer.from(secret.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

const getVerificationSecret = () =>
  String(process.env.FORM_VERIFICATION_TOKEN_SECRET || process.env.JWT_SECRET || "")
    .trim();

const hashVerificationOtp = (otp = "") =>
  crypto.createHash("sha256").update(String(otp || "")).digest("hex");

const generateOtp = () =>
  String(crypto.randomInt(100000, 1000000));

const generateVerificationToken = ({ formId, questionId, destination, type }) => {
  const secret = getVerificationSecret();
  if (!secret) {
    throw new Error("Verification token secret is not configured");
  }
  return jwt.sign(
    {
      formId: String(formId),
      questionId: String(questionId),
      destination,
      type,
    },
    secret,
    { expiresIn: "15m" },
  );
};

const verifyVerificationToken = ({ token, formId, questionId, destination, type }) => {
  const secret = getVerificationSecret();
  if (!secret || !token) return false;
  try {
    const decoded = jwt.verify(token, secret);
    return (
      String(decoded.formId) === String(formId) &&
      String(decoded.questionId) === String(questionId) &&
      String(decoded.destination) === String(destination) &&
      String(decoded.type) === String(type)
    );
  } catch {
    return false;
  }
};

const sendOtpEmail = async ({ to, otp, form, question }) => {
  await sendEmail({
    to,
    subject: `${form.title} verification code`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px;">Verification Code</h2>
        <p style="margin:0 0 16px;">Use the code below to verify <strong>${escapeHtml(question.label)}</strong>.</p>
        <div style="display:inline-block;padding:14px 18px;border-radius:14px;background:#e0f2fe;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:0.2em;">${escapeHtml(otp)}</div>
        <p style="margin:16px 0 0;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
};

const sendOtpSms = async ({ to, otp }) => {
  const sid = String(process.env.TWILIO_ACCOUNT_SID || "").trim();
  const token = String(process.env.TWILIO_AUTH_TOKEN || "").trim();
  const from = String(process.env.TWILIO_FROM_NUMBER || "").trim();
  if (!sid || !token || !from) {
    throw new Error("SMS provider is not configured");
  }

  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: `Your verification code is ${otp}. It expires in 5 minutes.`,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to send SMS verification code");
  }
};

const normalizeVerificationDestination = (type, value = "") => {
  if (type === "email") {
    return String(value || "").trim().toLowerCase();
  }
  if (type === "phone") {
    return normalizePhoneValue(value);
  }
  return String(value || "").trim();
};

const createOrRefreshVerification = async ({ form, question, type, destination }) => {
  const normalizedDestination = normalizeVerificationDestination(type, destination);
  if (!normalizedDestination) {
    throw new Error(type === "email" ? "Please enter a valid email." : "Please enter a valid 10-digit mobile number.");
  }

  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedDestination)) {
      throw new Error("Please enter a valid email.");
    }
  }

  if (type === "phone") {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalizedDestination)) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
  }

  const now = new Date();
  const existing = await FormVerification.findOne({
    formId: form._id,
    questionId: question._id,
    type,
    destination: normalizedDestination,
  }).lean();
  if (existing?.resendAvailableAt && new Date(existing.resendAvailableAt).getTime() > now.getTime()) {
    const error = new Error("Please wait before requesting another code.");
    error.statusCode = 429;
    throw error;
  }

  const resendAvailableAt = new Date(now.getTime() + 30 * 1000);
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  const otp = generateOtp();
  const otpHash = hashVerificationOtp(otp);

  await FormVerification.findOneAndUpdate(
    {
      formId: form._id,
      questionId: question._id,
      type,
      destination: normalizedDestination,
    },
    {
      formId: form._id,
      questionId: question._id,
      type,
      destination: normalizedDestination,
      otpHash,
      attempts: 0,
      resendAvailableAt,
      expiresAt,
      verifiedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (type === "email") {
    await sendOtpEmail({ to: normalizedDestination, otp, form, question });
  } else {
    await sendOtpSms({ to: `+91${normalizedDestination}`, otp });
  }

  return {
    message: "Verification code sent",
    resendAvailableAt: resendAvailableAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
};

const verifyChallengeOtp = async ({ form, question, type, destination, otp }) => {
  const normalizedDestination = normalizeVerificationDestination(type, destination);
  const record = await FormVerification.findOne({
    formId: form._id,
    questionId: question._id,
    type,
    destination: normalizedDestination,
  });
  if (!record) {
    throw new Error("Verification code not found");
  }
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    throw new Error("Verification code expired");
  }
  if (record.attempts >= 5) {
    throw new Error("Too many verification attempts");
  }

  record.attempts += 1;
  if (hashVerificationOtp(otp) !== record.otpHash) {
    await record.save();
    throw new Error("Invalid verification code");
  }

  record.verifiedAt = new Date();
  await record.save();
  const token = generateVerificationToken({
    formId: form._id,
    questionId: question._id,
    destination: normalizedDestination,
    type,
  });

  return {
    token,
    verifiedAt: record.verifiedAt.toISOString(),
    destination: normalizedDestination,
  };
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
    ? question.type === "One line Text" || question.type === "One Line Text"
      ? "shortAnswer"
      : question.type
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
    validationEnabled: question.validationEnabled === true,
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
    logoUrl: String(
      payload.logoUrl !== undefined
        ? payload.logoUrl
        : payload.emailTemplate?.logoUrl || "",
    ).trim(),
    logoAsset: toAssetPayload(
      payload.logoAsset !== undefined
        ? payload.logoAsset
        : payload.emailTemplate?.logoAsset,
      payload.logoUrl !== undefined
        ? payload.logoUrl
        : payload.emailTemplate?.logoUrl,
    ),
    bannerImage: String(payload.bannerImage || payload.bannerImageUrl || "").trim(),
    bannerImageUrl: String(
      payload.bannerImageUrl || payload.bannerImage || "",
    ).trim(),
    bannerImageAsset: toAssetPayload(
      payload.bannerImageAsset,
      payload.bannerImageUrl || payload.bannerImage,
    ),
    emailTemplate: normalizeEmailTemplate(payload.emailTemplate, payload),
    notificationSettings: normalizeNotificationSettings(
      payload.notificationSettings,
      payload,
    ),
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

const normalizeEmailTemplate = (template = {}, fallback = {}) => {
  const source = template && typeof template === "object" ? template : {};
  const legacy = fallback && typeof fallback === "object" ? fallback : {};
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(source, key);
  const pick = (key, ...values) =>
    hasOwn(key) ? source[key] : values.find((value) => value !== undefined);
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
  const legacyFooterButtons = Array.isArray(source.footerButtons)
    ? source.footerButtons
    : Array.isArray(legacy.emailTemplate?.footerButtons)
      ? legacy.emailTemplate.footerButtons
      : [];
  return {
    preset: String(pick("preset", legacy.preset, DEFAULT_EMAIL_TEMPLATE.preset)).trim(),
    headerTitle: String(pick("headerTitle", legacy.headerTitle, "")).trim(),
    headerSubtitle: String(pick("headerSubtitle", legacy.headerSubtitle, "")).trim(),
    successMessage: String(
      pick(
        "successMessage",
        legacy.emailTemplate?.successMessage ||
        legacy.successMessage ||
          "",
      ),
    ).trim(),
    footerText: String(pick("footerText", legacy.footerText, "")).trim(),
    companyName: String(
      pick(
        "companyName",
        legacy.companyName ||
        legacy.emailTemplate?.companyName ||
          "",
      ),
    ).trim(),
    websiteButtonText: String(pick("websiteButtonText", legacy.websiteButtonText, "")).trim(),
    websiteButtonUrl: normalizeHttpUrl(
      String(pick("websiteButtonUrl", legacy.websiteButtonUrl, "")).trim(),
    ),
    footerButtons: normalizeFooterButtons(
      pick(
        "footerButtons",
        legacy.footerButtons,
        legacy.emailTemplate?.footerButtons,
        legacy.websiteButtonText && legacy.websiteButtonUrl
          ? [
              {
                id: crypto.randomUUID(),
                text: legacy.websiteButtonText,
                url: legacy.websiteButtonUrl,
                order: 0,
              },
            ]
          : [],
      ) || legacyFooterButtons,
    ),
    headerBackgroundColor:
      String(pick("headerBackgroundColor", legacy.headerBackgroundColor, DEFAULT_EMAIL_TEMPLATE.headerBackgroundColor)).trim(),
    bodyBackgroundColor:
      String(pick("bodyBackgroundColor", legacy.bodyBackgroundColor, DEFAULT_EMAIL_TEMPLATE.bodyBackgroundColor)).trim(),
    cardBackgroundColor:
      String(pick("cardBackgroundColor", legacy.cardBackgroundColor, DEFAULT_EMAIL_TEMPLATE.cardBackgroundColor)).trim(),
    accentColor:
      String(pick("accentColor", legacy.accentColor, DEFAULT_EMAIL_TEMPLATE.accentColor)).trim(),
    textColor:
      String(pick("textColor", legacy.textColor, DEFAULT_EMAIL_TEMPLATE.textColor)).trim(),
    buttonColor:
      String(pick("buttonColor", legacy.buttonColor, DEFAULT_EMAIL_TEMPLATE.buttonColor)).trim(),
    borderRadius:
      parseOptionalInteger(source.borderRadius ?? legacy.borderRadius) ??
      DEFAULT_EMAIL_TEMPLATE.borderRadius,
    logoUrl: String(pick("logoUrl", legacy.emailTemplate?.logoUrl, "")).trim(),
    logoAsset: toAssetPayload(
      pick("logoAsset", legacy.emailTemplate?.logoAsset, null),
      pick("logoUrl", legacy.emailTemplate?.logoUrl, ""),
    ),
    bannerImageUrl: String(
      pick(
        "bannerImageUrl",
        legacy.bannerImageUrl ||
        legacy.emailTemplate?.bannerImageUrl ||
          "",
      ),
    ).trim(),
    bannerImageAsset: toAssetPayload(
      pick(
        "bannerImageAsset",
        legacy.bannerImageAsset,
        legacy.emailTemplate?.bannerImageAsset,
        null,
      ),
      pick(
        "bannerImageUrl",
        legacy.bannerImageUrl ||
          legacy.emailTemplate?.bannerImageUrl ||
          "",
      ),
    ),
  };
};

const normalizeNotificationSettings = (settings = {}, fallback = {}) => {
  const source = settings && typeof settings === "object" ? settings : {};
  const legacy = fallback && typeof fallback === "object" ? fallback : {};
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(source, key);
  const pick = (key, ...values) =>
    hasOwn(key) ? source[key] : values.find((value) => value !== undefined);
  return {
    sendEmailNotification:
      pick("sendEmailNotification", legacy.sendEmailNotification, DEFAULT_NOTIFICATION_SETTINGS.sendEmailNotification) === true,
    sendDashboardNotification:
      pick("sendDashboardNotification", legacy.sendDashboardNotification, DEFAULT_NOTIFICATION_SETTINGS.sendDashboardNotification) === true,
    sendTelegramNotification:
      pick("sendTelegramNotification", legacy.sendTelegramNotification, DEFAULT_NOTIFICATION_SETTINGS.sendTelegramNotification) === true,
    telegramBotToken: String(pick("telegramBotToken", legacy.telegramBotToken, "")).trim(),
    telegramChatId: String(pick("telegramChatId", legacy.telegramChatId, "")).trim(),
    sendWhatsAppNotification:
      pick("sendWhatsAppNotification", legacy.sendWhatsAppNotification, DEFAULT_NOTIFICATION_SETTINGS.sendWhatsAppNotification) === true,
    whatsappAccessToken: String(pick("whatsappAccessToken", legacy.whatsappAccessToken, "")).trim(),
    whatsappPhoneNumberId: String(pick("whatsappPhoneNumberId", legacy.whatsappPhoneNumberId, "")).trim(),
    whatsappVerifyToken: String(pick("whatsappVerifyToken", legacy.whatsappVerifyToken, "")).trim(),
    whatsappBusinessNumber: String(pick("whatsappBusinessNumber", legacy.whatsappBusinessNumber, "")).trim(),
  };
};

const getBrandingSettings = async (form = {}) => {
  const settingsDoc = await Settings.findOne().lean();
  const settings = settingsDoc?.settings || settingsDoc || {};
  return {
    companyName: settings?.appName || settings?.companyName || "TechnoSthan",
    logoUrl:
      resolveAssetUrl(settings?.logoAsset || settings?.logoUrl || form?.logoAsset || form?.logoUrl || ""),
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
    logoUrl: resolveAssetUrl(
      plainForm.logoAsset ||
        plainForm.logoUrl ||
        plainForm.emailTemplate?.logoAsset ||
        plainForm.emailTemplate?.logoUrl ||
        "",
    ),
    logoAsset:
      normalizeStoredAsset(
        plainForm.logoAsset ||
          plainForm.emailTemplate?.logoAsset ||
          null,
        plainForm.logoUrl || plainForm.emailTemplate?.logoUrl || "",
      ) || null,
    emailTemplate: normalizeEmailTemplate(plainForm.emailTemplate, plainForm),
    notificationSettings: normalizeNotificationSettings(
      plainForm.notificationSettings,
      plainForm,
    ),
    questions: sortedQuestions,
    responseCount,
  };
};

const buildQuestionExportDto = (question, index = 0) => ({
  type: question.type || "shortAnswer",
  label: question.label || "",
  description: question.helpText || "",
  placeholder: question.placeholder || "",
  required: question.required === true,
  validationEnabled: question.validationEnabled === true,
  options: Array.isArray(question.options) ? question.options : [],
  validation: {
    minValue:
      question.validation?.minValue === undefined
        ? null
        : question.validation?.minValue,
    maxValue:
      question.validation?.maxValue === undefined
        ? null
        : question.validation?.maxValue,
    minDigits:
      question.validation?.minDigits === undefined
        ? null
        : question.validation?.minDigits,
    maxDigits:
      question.validation?.maxDigits === undefined
        ? null
        : question.validation?.maxDigits,
    errorMessage: question.validation?.errorMessage || "",
  },
  order: typeof question.order === "number" ? question.order : index,
});

const buildFormExportDto = (form, questions = []) => {
  const plainForm = form.toObject ? form.toObject({ virtuals: true }) : form;
  const sortedQuestions = [...questions]
    .map((question, index) =>
      buildQuestionExportDto(
        question.toObject ? question.toObject({ virtuals: true }) : question,
        index,
      ),
    )
    .sort((a, b) => a.order - b.order);

  return {
    exportVersion: "1.0",
    exportedAt: new Date().toISOString(),
    form: {
      title: plainForm.title || "",
      description: plainForm.description || "",
      slug: plainForm.slug || plainForm.publicSlug || slugify(plainForm.title),
      status: plainForm.status || (plainForm.active === true ? "live" : "draft"),
      successMessage: plainForm.successMessage || "",
      expiresAt: plainForm.expiresAt ? new Date(plainForm.expiresAt).toISOString() : null,
      themeColor: plainForm.themeColor || "",
      logoUrl: plainForm.logoUrl || plainForm.emailTemplate?.logoUrl || "",
      bannerImage: plainForm.bannerImage || plainForm.bannerImageUrl || "",
      questions: sortedQuestions,
    },
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

const getFormExportById = async (formId) => {
  const form = await Form.findById(formId).lean();
  if (!form) return null;
  const questions = await FormQuestion.find({ formId })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return buildFormExportDto(form, questions);
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

const sanitizeAnswerForApi = (answer) => {
  const questionType = answer.question?.type;
  return {
    ...answer,
    questionId: String(answer.questionId?._id || answer.questionId || ""),
    value: questionType === "password" ? null : answer.value,
    secretCiphertext: undefined,
    secretIv: undefined,
    secretAuthTag: undefined,
    secretAlgorithm: undefined,
  };
};

const sanitizeResponseForApi = (response) => ({
  ...response,
  answers: Array.isArray(response.answers)
    ? response.answers.map(sanitizeAnswerForApi)
    : [],
});

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
        if (answer.question?.type === "password") {
          return "";
        }
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

const parseVerificationTokensPayload = (body = {}) => {
  const raw =
    body.verificationTokens ??
    body.verificationToken ??
    body.verifications ??
    {};

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
    const digits = normalizePhoneValue(stringValue);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(digits)) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
  }

  if (question.type === "link" && stringValue) {
    if (!normalizeHttpUrl(stringValue)) {
      throw new Error("Please enter a valid link.");
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
          `Question "${question.label}" only accepts PDF, DOC, DOCX, MP4, WEBM, MOV, JPG, JPEG, PNG, or WEBP files`,
        );
      }
    }
  }
};

const validateQuestionVerification = (question, submittedValue, verificationTokens = {}, form = {}) => {
  if (!question.validationEnabled) {
    return;
  }

  if (question.type !== "email" && question.type !== "phone") {
    return;
  }

  const token = verificationTokens[String(question._id)] || verificationTokens[question.label] || "";
  if (!token) {
    throw new Error(`Please verify ${question.label} before submitting.`);
  }

  const destination =
    question.type === "email"
      ? normalizeEmailValue(submittedValue)
      : normalizePhoneValue(submittedValue);

  if (
    !verifyVerificationToken({
      token,
      formId: form._id,
      questionId: question._id,
      destination,
      type: question.type,
    })
  ) {
    throw new Error(`Please verify ${question.label} before submitting.`);
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

const prepareAnswerRecord = async (
  question,
  submittedValue,
  fileEntries = [],
  uploadContext = {},
) => {
  if (fileEntries.length > 0) {
    const file = fileEntries[0];
    const folder = getCloudinaryFolder(
      "forms",
      "responses",
      uploadContext.formSlug || uploadContext.formId || "general",
    );
    const resourceType = getCloudinaryResourceType(file);
    const asset = await uploadBufferToCloudinary({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder,
      resourceType,
    });

    return {
      value: submittedValue ?? file.originalname,
      fileUrl: asset.secureUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileAsset: asset,
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

  if (question.type === "link") {
    const normalized = normalizeHttpUrl(submittedValue);
    return {
      value: normalized,
    };
  }

  if (question.type === "password") {
    const encrypted = encryptSecretValue(submittedValue);
    return {
      value: null,
      secretCiphertext: encrypted?.ciphertext || "",
      secretIv: encrypted?.iv || "",
      secretAuthTag: encrypted?.authTag || "",
      secretAlgorithm: encrypted?.algorithm || "aes-256-gcm",
    };
  }

  return {
    value:
      question.type === "phone"
        ? normalizePhoneValue(submittedValue)
        : Array.isArray(submittedValue)
          ? submittedValue.map((item) => String(item))
          : submittedValue,
  };
};

const stripTags = (value = "") => String(value || "").replace(/<[^>]*>/g, " ");

const buildResponseSummary = (rows = []) =>
  rows
    .slice(0, 4)
    .map((row) => `${row.question}: ${stripTags(row.answer)}`.trim())
    .filter(Boolean)
    .join(" | ");

const formatWhatsappNumber = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
};

const findRegisteredUserForContact = async (contact = {}) => {
  const orConditions = [];
  if (contact.email) {
    orConditions.push({ email: contact.email });
  }
  if (contact.phone) {
    orConditions.push({ mobile: contact.phone });
    orConditions.push({ whatsappNumber: contact.phone });
    orConditions.push({ mobile: `+91${contact.phone}` });
    orConditions.push({ whatsappNumber: `+91${contact.phone}` });
  }

  if (!orConditions.length) {
    return null;
  }

  return await User.findOne({ $or: orConditions }).lean();
};

const logNotification = async ({
  formId,
  responseId,
  recipientUserId = null,
  channel,
  title = "",
  summary = "",
  actionUrl = "",
  status = "sent",
  error = "",
}) => {
  try {
    await FormNotification.create({
      formId,
      responseId,
      recipientUserId,
      channel,
      title,
      summary,
      actionUrl,
      status,
      error,
      sentAt: status === "sent" ? new Date() : null,
    });
  } catch (logError) {
    console.error("Failed to log form notification:", logError);
  }
};

const sendSubmissionNotifications = async ({
  form,
  response,
  answers,
  adminUrl,
  contact = {},
}) => {
  const branding = await getBrandingSettings(form);
  const emailTemplate = normalizeEmailTemplate(form.emailTemplate, form);
  const notificationSettings = normalizeNotificationSettings(
    form.notificationSettings,
    form,
  );
  const rows = formatSubmissionRows(answers);
  const answerContact = extractSummary(answers);
  const submittedAt = new Date(response.submittedAt || response.createdAt);
  const submittedAtText = submittedAt.toLocaleString();
  const submittedDateText = submittedAt.toLocaleDateString();
  const submittedTimeText = submittedAt.toLocaleTimeString();
  const responseSummary = buildResponseSummary(rows);

  const createdByUser = form.createdBy
    ? await User.findById(form.createdBy).select("email").lean()
    : null;
  const notificationRecipient =
    form.notificationEmail || createdByUser?.email || "";

  if (notificationRecipient && notificationSettings.sendEmailNotification) {
    try {
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
          emailTemplate,
        }),
      });
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "email",
        title: `Email notification sent for ${form.title}`,
        summary: responseSummary,
        actionUrl: adminUrl,
        status: "sent",
      });
    } catch (error) {
      console.error("Failed to send admin email notification:", error);
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "email",
        title: `Email notification failed for ${form.title}`,
        summary: responseSummary,
        actionUrl: adminUrl,
        status: "failed",
        error: error?.message || String(error),
      });
    }
  }

  const emailAnswer =
    answers.find((answer) => answer.question?.type === "email") ||
    answers.find((answer) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(answer.value || "")));
  if (form.confirmationEmailEnabled && emailAnswer?.value) {
    try {
      await sendEmail({
        to: String(emailAnswer.value),
        subject: `Thank you for your submission - ${form.title}`,
        html: buildUserConfirmationEmail({
          formTitle: form.title,
          submittedAt: submittedAtText,
          successMessage: form.successMessage,
          rows,
          publicUrl:
            branding.brandWebsiteUrl ||
            process.env.FRONTEND_URL ||
            process.env.VITE_PUBLIC_URL ||
            "",
          branding,
          emailTemplate,
        }),
      });
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "email",
        title: `Confirmation email sent for ${form.title}`,
        summary: responseSummary,
        status: "sent",
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "email",
        title: `Confirmation email failed for ${form.title}`,
        summary: responseSummary,
        status: "failed",
        error: error?.message || String(error),
      });
    }
  }

  const matchedUser = await findRegisteredUserForContact({
    email: notificationSettings.sendDashboardNotification ? contact.email : "",
    phone: notificationSettings.sendDashboardNotification ? contact.phone : "",
  });
  if (notificationSettings.sendDashboardNotification && matchedUser?._id) {
    try {
      await logNotification({
        formId: form._id,
        responseId: response._id,
        recipientUserId: matchedUser._id,
        channel: "dashboard",
        title: `New form submission: ${form.title}`,
        summary: responseSummary,
        actionUrl: adminUrl,
        status: "sent",
      });
    } catch (error) {
      console.error("Failed to store dashboard notification:", error);
    }
  }

  if (
    notificationSettings.sendTelegramNotification &&
    notificationSettings.telegramBotToken &&
    notificationSettings.telegramChatId
  ) {
    const telegramMessage = [
      `Form Name: ${form.title}`,
      `Submitter Name: ${answerContact.name || "-"}`,
      `Email: ${contact.email || "-"}`,
      `Phone: ${contact.phone || "-"}`,
      `Submitted Date: ${submittedDateText}`,
      `Submitted Time: ${submittedTimeText}`,
      `Response Summary: ${responseSummary || "-"}`,
    ].join("\n");

    try {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${notificationSettings.telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: notificationSettings.telegramChatId,
            text: telegramMessage,
          }),
        },
      );
      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramResponse.status}`);
      }
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "telegram",
        title: `Telegram notification sent for ${form.title}`,
        summary: responseSummary,
        status: "sent",
      });
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "telegram",
        title: `Telegram notification failed for ${form.title}`,
        summary: responseSummary,
        status: "failed",
        error: error?.message || String(error),
      });
    }
  }

  if (notificationSettings.sendWhatsAppNotification) {
    const whatsappNumber = formatWhatsappNumber(contact.phone);
    if (
      !whatsappNumber ||
      !notificationSettings.whatsappAccessToken ||
      !notificationSettings.whatsappPhoneNumberId
    ) {
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "whatsapp",
        title: `WhatsApp notification skipped for ${form.title}`,
        summary: responseSummary,
        status: "skipped",
        error: !whatsappNumber
          ? "Phone number missing"
          : "WhatsApp configuration missing",
      });
      return;
    }

    const whatsappMessage = [
      `Thank you for your submission`,
      `Form Name: ${form.title}`,
      `Submitted Date: ${submittedDateText}`,
      `Submitted Time: ${submittedTimeText}`,
      `Success Message: ${form.successMessage || ""}`,
      `Response Summary: ${responseSummary || "-"}`,
    ].join("\n");

    try {
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v22.0/${notificationSettings.whatsappPhoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${notificationSettings.whatsappAccessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: whatsappNumber.replace(/^\+/, ""),
            type: "text",
            text: { body: whatsappMessage },
          }),
        },
      );
      if (!whatsappResponse.ok) {
        throw new Error(`WhatsApp API error: ${whatsappResponse.status}`);
      }
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "whatsapp",
        title: `WhatsApp notification sent for ${form.title}`,
        summary: responseSummary,
        status: "sent",
      });
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
      await logNotification({
        formId: form._id,
        responseId: response._id,
        channel: "whatsapp",
        title: `WhatsApp notification failed for ${form.title}`,
        summary: responseSummary,
        status: "failed",
        error: error?.message || String(error),
      });
    }
  }
};

const createForm = async (payload, userId) => {
  const formPayload = await normalizeFormPayload(payload);
  const questionsPayload = getQuestionsPayload(payload);

  const form = await Form.create({
    ...formPayload,
    createdBy: userId,
  });

  const questions = await syncQuestions(form._id, questionsPayload);
  return buildFormDto(form, questions, 0);
};

const getAdminForms = async () => {
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
    emailTemplate: normalizeEmailTemplate(form.emailTemplate, form),
    responseCount: countMap.get(String(form._id)) || 0,
    questionCount: questionCountMap.get(String(form._id)) || 0,
  }));
};

const getFormById = async (formId) => {
  return await getFormWithQuestions({ _id: formId });
};

const updateForm = async (formId, payload) => {
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
  existing.logoUrl = formPayload.logoUrl;
  existing.logoAsset = formPayload.logoAsset;
  existing.bannerImage = formPayload.bannerImage;
  existing.bannerImageUrl = formPayload.bannerImageUrl;
  existing.bannerImageAsset = formPayload.bannerImageAsset;
  existing.emailTemplate = formPayload.emailTemplate;
  existing.notificationSettings = formPayload.notificationSettings;
  existing.notificationEmail = formPayload.notificationEmail;
  existing.confirmationEmailEnabled = formPayload.confirmationEmailEnabled;
  existing.allowFileUpload = formPayload.allowFileUpload;
  existing.expiresAt = formPayload.expiresAt;
  existing.themeColor = formPayload.themeColor;

  await existing.save();
  const questions = await syncQuestions(existing._id, getQuestionsPayload(payload));
  return buildFormDto(existing, questions, await FormResponse.countDocuments({ formId: existing._id }));
};

const deleteForm = async (formId) => {
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

const getFormResponses = async (formId, options = {}) => {
  const responses = await collectResponses(formId);
  const hasFilters =
    options.search ||
    options.from ||
    options.to ||
    options.page ||
    options.limit;

  if (!hasFilters) {
    return responses.map(sanitizeResponseForApi);
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
  const items = filtered.slice(start, start + limit).map(sanitizeResponseForApi);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const getFormResponseAnalysis = async (formId, options = {}) => {
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
    items: pageResult.items.map(sanitizeResponseForApi),
    stats,
  };
};

const getFormResponseById = async (formId, responseId) => {
  const response = await FormResponse.findOne({ _id: responseId, formId }).lean();
  if (!response) return null;
  const answers = await FormResponseAnswer.find({ responseId })
    .sort({ createdAt: 1 })
    .populate("questionId")
    .lean();
  return {
    ...response,
    answers: answers.map((answer) =>
      sanitizeAnswerForApi({
        ...answer,
        question: answer.questionId,
      }),
    ),
  };
};

const deleteFormResponse = async (formId, responseId) => {
  const response = await FormResponse.findOne({ _id: responseId, formId });
  if (!response) {
    throw new Error("Response not found");
  }

  await FormResponseAnswer.deleteMany({ responseId });
  await response.deleteOne();
  return true;
};

const exportFormResponses = async (formId, options = {}) => {
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

const getFormBySlug = async (slug) => {
  const normalizedSlug = String(slug).toLowerCase();
  const form = await Form.findOne({
    $or: [{ slug: normalizedSlug }, { publicSlug: normalizedSlug }],
  }).lean();
  if (!form || form.status !== "live" || isExpired(form.expiresAt)) {
    return null;
  }

  const questions = await FormQuestion.find({ formId: form._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return buildFormDto(form, questions, await FormResponse.countDocuments({ formId: form._id }));
};

const getFormAndQuestionBySlug = async (slug, questionId) => {
  const normalizedSlug = String(slug).toLowerCase();
  const form = await Form.findOne({
    $or: [{ slug: normalizedSlug }, { publicSlug: normalizedSlug }],
  }).lean();
  if (!form || form.status !== "live" || isExpired(form.expiresAt)) {
    return null;
  }

  const question = await FormQuestion.findOne({
    formId: form._id,
    _id: questionId,
  }).lean();
  if (!question) {
    return null;
  }

  return { form, question };
};

const sendFormVerification = async ({ slug, questionId, destination, type }) => {
  const pair = await getFormAndQuestionBySlug(slug, questionId);
  if (!pair) {
    throw new Error("Form or question not found");
  }
  return await createOrRefreshVerification({
    form: pair.form,
    question: pair.question,
    type,
    destination,
  });
};

const verifyFormVerification = async ({ slug, questionId, destination, type, otp }) => {
  const pair = await getFormAndQuestionBySlug(slug, questionId);
  if (!pair) {
    throw new Error("Form or question not found");
  }
  return await verifyChallengeOtp({
    form: pair.form,
    question: pair.question,
    type,
    destination,
    otp,
  });
};

const revealFormResponseSecret = async ({
  formId,
  responseId,
  questionId,
  adminUser = null,
  ipAddress = "",
  userAgent = "",
}) => {
  const response = await FormResponse.findOne({ _id: responseId, formId }).lean();
  if (!response) {
    throw new Error("Response not found");
  }

  const answer = await FormResponseAnswer.findOne({
    responseId,
    questionId,
  })
    .populate("questionId")
    .lean();

  if (!answer || answer.questionId?.type !== "password") {
    throw new Error("Secret not found");
  }

  const value = decryptSecretValue({
    ciphertext: answer.secretCiphertext,
    iv: answer.secretIv,
    authTag: answer.secretAuthTag,
    algorithm: answer.secretAlgorithm,
  });

  await createLog({
    userId: adminUser?.id || adminUser?.userId || null,
    userName: adminUser?.name || "",
    email: adminUser?.email || "",
    role: adminUser?.role || null,
    action: "form_secret_revealed",
    module: "forms",
    description: `Revealed secret for form response ${response.referenceId || responseId}`,
    entityId: String(responseId),
    entityType: "FormResponse",
    metadata: {
      adminId: adminUser?.id || adminUser?.userId || null,
      responseId: String(responseId),
      questionId: String(questionId),
      revealedAt: new Date().toISOString(),
    },
    ipAddress: ipAddress || "",
    userAgent: userAgent || "",
  });

  return {
    responseId: String(responseId),
    questionId: String(questionId),
    value,
    revealedAt: new Date().toISOString(),
  };
};

const submitForm = async ({
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
  const verificationTokens = parseVerificationTokensPayload(body);
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
    validateQuestionVerification(question, submittedValue, verificationTokens, form);
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

  const uploadedAssets = [];
  const createdAnswerIds = [];
  let response = null;

  try {
    response = await FormResponse.create({
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
      const payload = await prepareAnswerRecord(
        item.question,
        item.submittedValue,
        item.fileEntries,
        {
          formId: String(form._id),
          formSlug: form.slug || form.publicSlug || slugify(form.title),
        },
      );

      if (payload.fileAsset?.publicId) {
        uploadedAssets.push(payload.fileAsset);
      }

      const answerDoc = await FormResponseAnswer.create({
        responseId: response._id,
        questionId: item.question._id,
        ...payload,
      });
      createdAnswerIds.push(answerDoc._id);
      insertedAnswers.push(answerDoc);
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
      contact,
      adminUrl:
        adminUrl ||
        `${process.env.FRONTEND_URL || process.env.VITE_PUBLIC_URL || ""}/admin/forms`,
    }).catch((error) => {
      console.error("Failed to send form submission notifications:", error);
    });

    return {
      ...response.toObject(),
      answers: populatedAnswers,
      successMessage: form.successMessage,
    };
  } catch (error) {
    await Promise.all(
      uploadedAssets.map((asset) =>
        deleteCloudinaryAsset(
          asset.publicId,
          asset.resourceType || "raw",
        ).catch((cleanupError) => {
          console.warn(
            "[submitForm] Failed to delete uploaded asset after error:",
            cleanupError.message,
          );
        }),
      ),
    );

    if (createdAnswerIds.length) {
      await FormResponseAnswer.deleteMany({ _id: { $in: createdAnswerIds } }).catch(
        (cleanupError) => {
          console.warn(
            "[submitForm] Failed to clean up partial answers after error:",
            cleanupError.message,
          );
        },
      );
    }

    if (response?._id) {
      await FormResponse.deleteOne({ _id: response._id }).catch((cleanupError) => {
        console.warn(
          "[submitForm] Failed to clean up partial response after error:",
          cleanupError.message,
        );
      });
    }

    throw error;
  }
};

const createPublicFileEntry = (file) => ({
  fileUrl: resolveStoredAssetUrl(file?.secureUrl || file?.url || ""),
  fileName: file.originalname,
  fileType: file.mimetype,
});

module.exports = {
  createForm,
  getAdminForms,
  getFormById,
  getFormExportById,
  updateForm,
  deleteForm,
  getFormResponses,
  getFormResponseAnalysis,
  getFormResponseById,
  deleteFormResponse,
  exportFormResponses,
  getFormBySlug,
  sendFormVerification,
  verifyFormVerification,
  submitForm,
  revealFormResponseSecret,
  createPublicFileEntry,
  importFormFile,
};
