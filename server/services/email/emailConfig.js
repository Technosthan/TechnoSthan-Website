const EMAIL_SERVICE_HOST = "smtp.gmail.com";
const EMAIL_SERVICE_PORT = 587;
let hasLoggedLegacyPasswordWarning = false;

const getTrimmedEnv = (name) => String(process.env[name] || "").trim();

const getEmailCredentials = () => {
  const user = getTrimmedEnv("EMAIL_USER");
  const appPassword = getTrimmedEnv("EMAIL_APP_PASSWORD") || getTrimmedEnv("EMAIL_PASS");

  return {
    user,
    appPassword,
    isLegacyPasswordEnv: !getTrimmedEnv("EMAIL_APP_PASSWORD") && Boolean(getTrimmedEnv("EMAIL_PASS")),
  };
};

const getEmailFromAddress = () =>
  getTrimmedEnv("EMAIL_FROM") ||
  getTrimmedEnv("SMTP_FROM") ||
  getEmailCredentials().user;

const validateEmailEnvironment = () => {
  const { user, appPassword, isLegacyPasswordEnv } = getEmailCredentials();
  const missing = [];

  if (!user) {
    missing.push("EMAIL_USER");
  }

  if (!appPassword) {
    missing.push("EMAIL_APP_PASSWORD");
  }

  if (missing.length > 0) {
    const error = new Error(
      `Missing required email environment variable(s): ${missing.join(", ")}`,
    );
    error.code = "EMAIL_ENV_MISSING";
    error.statusCode = 500;
    throw error;
  }

  if (isLegacyPasswordEnv) {
    if (!hasLoggedLegacyPasswordWarning) {
      console.warn(
        "[email] Using legacy EMAIL_PASS. Prefer EMAIL_APP_PASSWORD for Gmail App Password configuration.",
      );
      hasLoggedLegacyPasswordWarning = true;
    }
  }

  return {
    user,
    appPassword,
    host: EMAIL_SERVICE_HOST,
    port: EMAIL_SERVICE_PORT,
  };
};

module.exports = {
  EMAIL_SERVICE_HOST,
  EMAIL_SERVICE_PORT,
  getEmailCredentials,
  getEmailFromAddress,
  validateEmailEnvironment,
};
