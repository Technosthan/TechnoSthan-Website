const getTrimmedEnv = (name) => String(process.env[name] || "").trim();

const getEmailProvider = () => {
  const provider = getTrimmedEnv("EMAIL_PROVIDER") || "sendgrid";
  return provider.toLowerCase();
};

const getEmailFromAddress = () =>
  getTrimmedEnv("EMAIL_FROM");

const getEmailFromName = () => getTrimmedEnv("EMAIL_FROM_NAME") || "TechnoSthan";

const getEmailReplyToAddress = () => getTrimmedEnv("EMAIL_REPLY_TO");

const getSendGridApiKey = () => getTrimmedEnv("SENDGRID_API_KEY");

const validateEmailEnvironment = () => {
  const provider = getEmailProvider();
  const missing = [];

  if (provider && provider !== "sendgrid") {
    const error = new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
    error.code = "EMAIL_PROVIDER_UNSUPPORTED";
    error.statusCode = 500;
    throw error;
  }

  const sendgridApiKey = getSendGridApiKey();
  const emailFrom = getEmailFromAddress();

  if (!sendgridApiKey) {
    missing.push("SENDGRID_API_KEY");
  }

  if (!emailFrom) {
    missing.push("EMAIL_FROM");
  }

  if (missing.length > 0) {
    const error = new Error(
      `Missing required email environment variable(s): ${missing.join(", ")}`,
    );
    error.code = "EMAIL_ENV_MISSING";
    error.statusCode = 500;
    throw error;
  }

  const replyTo = getEmailReplyToAddress();
  if (replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    const error = new Error("EMAIL_REPLY_TO is not a valid email address");
    error.code = "EMAIL_ENV_INVALID";
    error.statusCode = 500;
    throw error;
  }

  return {
    provider: "sendgrid",
    sendgridApiKey,
    from: emailFrom,
    fromName: getEmailFromName(),
    replyTo: replyTo || "",
  };
};

module.exports = {
  getEmailFromName,
  getEmailFromAddress,
  getEmailProvider,
  getEmailReplyToAddress,
  getSendGridApiKey,
  validateEmailEnvironment,
};
