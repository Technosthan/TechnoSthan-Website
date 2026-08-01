const SUPPORTED_EMAIL_PROVIDER_TYPES = [
  "smtp",
  "gmail_smtp",
  "sendgrid",
  "resend",
  "mailgun",
  "aws_ses",
  "custom_smtp",
  "custom_api",
];

const DEFAULT_EMAIL_PROVIDER_TYPE = "sendgrid";

const normalizeValue = (value = "") => String(value || "").trim();

export const normalizeEmailProviderType = (value) =>
  normalizeValue(value).toLowerCase();

export const isSupportedEmailProviderType = (value) =>
  SUPPORTED_EMAIL_PROVIDER_TYPES.includes(normalizeEmailProviderType(value));

export const getConfiguredDefaultEmailProviderType = () => {
  const configuredType = normalizeEmailProviderType(
    process.env.DEFAULT_EMAIL_PROVIDER,
  );

  return isSupportedEmailProviderType(configuredType)
    ? configuredType
    : DEFAULT_EMAIL_PROVIDER_TYPE;
};

export const hasSendGridRuntimeConfig = () =>
  Boolean(
    normalizeValue(process.env.SENDGRID_API_KEY) &&
      (normalizeValue(process.env.SENDGRID_FROM_EMAIL) ||
        normalizeValue(process.env.EMAIL_FROM)),
  );

export const getSendGridConfigurationError = () =>
  "SendGrid configuration is incomplete. Please configure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL (or EMAIL_FROM).";

export const parseEmailAddress = (value) => {
  if (!value) {
    return { email: "", name: "" };
  }

  if (typeof value === "object") {
    return {
      email: normalizeValue(value.email || value.address || ""),
      name: normalizeValue(value.name || ""),
    };
  }

  const rawValue = normalizeValue(value);
  const parsed = rawValue.match(/^(.*)<([^>]+)>$/);
  if (parsed) {
    return {
      name: normalizeValue(parsed[1]).replace(/^"|"$/g, ""),
      email: normalizeValue(parsed[2]),
    };
  }

  return {
    email: rawValue,
    name: "",
  };
};

export const getSendGridRuntimeProvider = () => {
  if (!hasSendGridRuntimeConfig()) {
    return null;
  }

  const apiKey = normalizeValue(process.env.SENDGRID_API_KEY);
  const fromEmail =
    normalizeValue(process.env.EMAIL_FROM) ||
    normalizeValue(process.env.SENDGRID_FROM_EMAIL);
  const fromName = normalizeValue(process.env.SENDGRID_FROM_NAME) || "TechnoSthan";
  const replyTo = normalizeValue(process.env.SENDGRID_REPLY_TO_EMAIL);

  return {
    providerType: "sendgrid",
    providerName: "SendGrid",
    status: "active",
    isDefault: true,
    apiKey,
    senderEmail: fromEmail,
    fromEmail,
    fromName,
    replyTo: replyTo || "",
    runtimeSource: "environment",
  };
};

export const getRuntimeDefaultEmailProvider = () => {
  const configuredDefaultType = getConfiguredDefaultEmailProviderType();

  if (configuredDefaultType !== "sendgrid") {
    return getSendGridRuntimeProvider();
  }

  return getSendGridRuntimeProvider();
};
