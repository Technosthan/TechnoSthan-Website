const sgMail = require("@sendgrid/mail");
const {
  validateEmailEnvironment,
  getEmailFromAddress,
  getEmailFromName,
  getEmailReplyToAddress,
} = require("./emailConfig");

const MAX_ATTACHMENT_SIZE_BYTES = 7.5 * 1024 * 1024;

let cachedApiKey = "";
let initializationLogged = false;

const escapeForLog = (value = "") =>
  String(value || "").replace(/[\r\n\t]+/g, " ").trim();

const logEmailEvent = (level, message, meta = {}) => {
  const payload = {
    module: "email",
    provider: "sendgrid",
    status: meta.status || null,
    recipientCount: Number.isFinite(meta.recipientCount) ? meta.recipientCount : null,
    ...meta,
  };

  delete payload.recipients;
  delete payload.emailBody;
  delete payload.html;
  delete payload.text;
  delete payload.subject;
  delete payload.to;
  delete payload.cc;
  delete payload.bcc;
  delete payload.attachments;

  if (payload.errorMessage) {
    payload.errorMessage = escapeForLog(payload.errorMessage);
  }

  if (level === "error") {
    console.error(`[email] ${message}`, payload);
  } else if (level === "warn") {
    console.warn(`[email] ${message}`, payload);
  } else {
    console.log(`[email] ${message}`, payload);
  }
};

const stripHtmlToText = (html = "") =>
  String(html || "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*div\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const normalizeEmailAddress = (value) => {
  if (value == null) return "";

  const raw = String(Array.isArray(value) ? value.join(",") : value)
    .replace(/[\r\n\t]+/g, " ")
    .trim();

  if (!raw) return "";

  const extracted = raw.match(/<([^<>]+)>$/);
  const candidate = String(extracted ? extracted[1] : raw)
    .replace(/^mailto:/i, "")
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
    return "";
  }

  return candidate;
};

const normalizeRecipientList = (value, fieldName) => {
  const values = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : String(value || "").split(",");
  const recipients = values
    .map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return normalizeEmailAddress(item.email || item.address || item.value || "");
      }

      return normalizeEmailAddress(item);
    })
    .filter(Boolean);

  if (!recipients.length && fieldName === "to") {
    const error = new Error("Recipient email is required");
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  return Array.from(new Set(recipients));
};

const getAttachmentSizeBytes = (attachment = {}) => {
  if (Buffer.isBuffer(attachment.content)) {
    return attachment.content.length;
  }

  if (Buffer.isBuffer(attachment.buffer)) {
    return attachment.buffer.length;
  }

  if (typeof attachment.size === "number" && Number.isFinite(attachment.size)) {
    return attachment.size;
  }

  const content = attachment.content ?? attachment.buffer ?? "";
  if (typeof content === "string") {
    const cleaned = content.replace(/\s+/g, "");
    if (cleaned && /^[A-Za-z0-9+/=]+$/.test(cleaned)) {
      try {
        return Buffer.from(cleaned, "base64").length;
      } catch {
        return Buffer.byteLength(cleaned, "utf8");
      }
    }

    return Buffer.byteLength(content, "utf8");
  }

  return 0;
};

const normalizeAttachment = (attachment, index = 0) => {
  if (!attachment || typeof attachment !== "object" || Array.isArray(attachment)) {
    const error = new Error(`Invalid attachment at index ${index}`);
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  const filename = String(attachment.filename || attachment.fileName || "").trim();
  if (!filename) {
    const error = new Error(`Attachment filename is required at index ${index}`);
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  const contentValue = attachment.content ?? attachment.buffer ?? attachment.data;
  if (contentValue == null || contentValue === "") {
    const error = new Error(`Attachment content is required at index ${index}`);
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  const sizeBytes = getAttachmentSizeBytes({
    ...attachment,
    content: contentValue,
  });

  if (sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
    const error = new Error(
      `Attachment at index ${index} exceeds the maximum allowed size`,
    );
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  let content = contentValue;
  if (Buffer.isBuffer(contentValue)) {
    content = contentValue.toString("base64");
  } else if (typeof contentValue === "string") {
    const cleaned = contentValue.replace(/\s+/g, "");
    content = cleaned;
  } else {
    content = Buffer.from(String(contentValue)).toString("base64");
  }

  return {
    content,
    filename,
    type: String(attachment.type || attachment.mimeType || "application/octet-stream").trim(),
    disposition: String(attachment.disposition || "attachment").trim() || "attachment",
    contentId: attachment.contentId || attachment.cid || undefined,
  };
};

const normalizeAttachments = (attachments = []) => {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return [];
  }

  return attachments.map((attachment, index) => normalizeAttachment(attachment, index));
};

const countRecipients = ({ to, cc, bcc }) =>
  normalizeRecipientList(to, "to").length +
  (cc ? normalizeRecipientList(cc, "cc").length : 0) +
  (bcc ? normalizeRecipientList(bcc, "bcc").length : 0);

const ensureSendGridInitialized = () => {
  const config = validateEmailEnvironment();
  const apiKey = config.sendgridApiKey;

  if (cachedApiKey !== apiKey) {
    sgMail.setApiKey(apiKey);
    cachedApiKey = apiKey;
  }

  if (!initializationLogged) {
    logEmailEvent("info", "SendGrid initialized successfully.", {
      status: "ready",
      recipientCount: 0,
    });
    initializationLogged = true;
  }

  return true;
};

const describeSendGridError = (error) => ({
  code: error?.code || null,
  message: error?.message || "Unknown SendGrid failure",
  statusCode: error?.code || error?.response?.statusCode || null,
});

const buildMailMessage = (options = {}) => {
  validateEmailEnvironment();
  const to = normalizeRecipientList(options.to, "to");
  const cc = options.cc ? normalizeRecipientList(options.cc, "cc") : [];
  const bcc = options.bcc ? normalizeRecipientList(options.bcc, "bcc") : [];
  const replyTo = normalizeEmailAddress(options.replyTo || getEmailReplyToAddress());
  const subject = String(options.subject || "").trim();
  const html = String(options.html || "").trim();
  const textInput = String(options.text || "").trim();
  const text = textInput || (html ? stripHtmlToText(html) : "");
  const attachments = normalizeAttachments(options.attachments);

  if (!subject) {
    const error = new Error("Email subject is required");
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  if (!html && !text) {
    const error = new Error("Email body is required");
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  if (options.replyTo && !replyTo) {
    const error = new Error("Invalid reply-to email address");
    error.code = "EMAIL_VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }

  return {
    to,
    cc: cc.length ? cc : undefined,
    bcc: bcc.length ? bcc : undefined,
    replyTo: replyTo || undefined,
    from: {
      email: getEmailFromAddress(),
      name: getEmailFromName(),
    },
    subject,
    text: text || undefined,
    html: html || undefined,
    attachments: attachments.length ? attachments : undefined,
  };
};

const sendMailWithRetry = async (mailOptions) => {
  ensureSendGridInitialized();
  const message = buildMailMessage(mailOptions);
  const recipientCount = countRecipients(message);

  try {
    const response = await sgMail.send(message);
    logEmailEvent("info", "Email sent successfully.", {
      status: "sent",
      recipientCount,
    });
    return response;
  } catch (error) {
    const describe = describeSendGridError(error);
    logEmailEvent("error", "SendGrid send failed.", {
      status: "failed",
      recipientCount,
      errorMessage: describe.message,
      errorCode: describe.code,
      errorStatusCode: describe.statusCode,
    });

    const controlledError = new Error("Failed to send email");
    controlledError.code = "EMAIL_SEND_FAILED";
    controlledError.statusCode = 502;
    controlledError.provider = "sendgrid";
    controlledError.errorCode = describe.code || null;
    controlledError.errorStatusCode = describe.statusCode || null;
    controlledError.cause = error;
    throw controlledError;
  }
};

const bootstrapEmailTransport = async () => {
  try {
    ensureSendGridInitialized();
    return true;
  } catch (error) {
    const message = error?.code === "EMAIL_ENV_MISSING"
      ? "[email] SendGrid is not configured."
      : "[email] SendGrid is not configured.";
    console.warn(message);
    return false;
  }
};

const verifyTransport = async () => {
  ensureSendGridInitialized();
  return true;
};

module.exports = {
  bootstrapEmailTransport,
  describeSendGridError,
  ensureSendGridInitialized,
  logEmailEvent,
  sendMailWithRetry,
  verifyTransport,
};
