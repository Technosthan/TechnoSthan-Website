const dns = require("dns");
const nodemailer = require("nodemailer");
const {
  EMAIL_SERVICE_HOST,
  EMAIL_SERVICE_PORT,
  validateEmailEnvironment,
} = require("./emailConfig");

dns.setDefaultResultOrder("ipv4first");

let cachedTransport = null;
let cachedTransportSignature = "";
let cachedVerifyPromise = null;
let lastVerifyAt = 0;

const buildTransportSignature = (config) =>
  JSON.stringify({
    user: config.user,
    appPassword: config.appPassword,
  });

const logEmailEvent = (level, message, meta = {}) => {
  const safeMeta = { ...meta };
  delete safeMeta.user;
  delete safeMeta.appPassword;
  delete safeMeta.pass;
  delete safeMeta.password;

  const payload = {
    module: "email",
    ...safeMeta,
  };

  // Keep logs concise and free of secrets.
  if (level === "error") {
    console.error(`[email] ${message}`, payload);
  } else if (level === "warn") {
    console.warn(`[email] ${message}`, payload);
  } else {
    console.log(`[email] ${message}`, payload);
  }
};

const createTransport = (config) =>
  nodemailer.createTransport({
    host: EMAIL_SERVICE_HOST,
    port: EMAIL_SERVICE_PORT,
    secure: false,
    family: 4,
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    auth: {
      user: config.user,
      pass: config.appPassword,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

const getTransport = () => {
  const config = validateEmailEnvironment();
  const signature = buildTransportSignature(config);

  if (!cachedTransport || cachedTransportSignature !== signature) {
    cachedTransport = createTransport(config);
    cachedTransportSignature = signature;
    cachedVerifyPromise = null;
    lastVerifyAt = 0;
  }

  return cachedTransport;
};

const isTransientSmtpError = (error) => {
  const retryableCodes = new Set([
    "ETIMEDOUT",
    "ESOCKET",
    "ECONNECTION",
    "ECONNRESET",
    "ECONNREFUSED",
    "EAI_AGAIN",
    "ENETUNREACH",
    "EHOSTUNREACH",
  ]);

  if (retryableCodes.has(error?.code)) {
    return true;
  }

  const responseCode = Number(error?.responseCode || 0);
  if ([421, 450, 451, 452, 454, 455, 471, 472, 500, 502, 503, 504].includes(responseCode)) {
    return true;
  }

  return false;
};

const describeSmtpError = (error) => ({
  code: error?.code || null,
  command: error?.command || null,
  responseCode: error?.responseCode || null,
  response: error?.response || null,
  errno: error?.errno || null,
  syscall: error?.syscall || null,
  address: error?.address || null,
  port: error?.port || null,
});

const verifyTransport = async ({ force = false } = {}) => {
  const transport = getTransport();
  const isFresh = Date.now() - lastVerifyAt < 5 * 60 * 1000;

  if (!force && isFresh && cachedVerifyPromise === null) {
    return true;
  }

  if (cachedVerifyPromise) {
    return cachedVerifyPromise;
  }

  cachedVerifyPromise = transport
    .verify()
    .then(() => {
      lastVerifyAt = Date.now();
      logEmailEvent("info", "Gmail SMTP transport verified");
      return true;
    })
    .catch((error) => {
      logEmailEvent("error", "Gmail SMTP verification failed", {
        ...describeSmtpError(error),
        message: error?.message || "Unknown verification failure",
      });
      throw error;
    })
    .finally(() => {
      cachedVerifyPromise = null;
    });

  return cachedVerifyPromise;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendMailWithRetry = async (mailOptions, { retries = 3, verifyBeforeSend = true } = {}) => {
  const transport = getTransport();

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      if (verifyBeforeSend) {
        try {
          await verifyTransport();
        } catch (verifyError) {
          lastError = verifyError;
          const retryableVerifyError = isTransientSmtpError(verifyError);

          logEmailEvent(retryableVerifyError ? "warn" : "error", "SMTP verification attempt failed", {
            attempt,
            retries,
            retryable: retryableVerifyError,
            ...describeSmtpError(verifyError),
            message: verifyError?.message || "Unknown SMTP verification failure",
          });

          if (!retryableVerifyError || attempt === retries) {
            break;
          }

          const verifyBackoffMs = Math.min(1000 * 2 ** (attempt - 1), 5000);
          await delay(verifyBackoffMs);
          continue;
        }
      }

      const result = await transport.sendMail(mailOptions);
      lastVerifyAt = Date.now();
      return result;
    } catch (error) {
      lastError = error;
      const retryable = isTransientSmtpError(error);

      logEmailEvent(retryable ? "warn" : "error", "SMTP send attempt failed", {
        attempt,
        retries,
        retryable,
        ...describeSmtpError(error),
        message: error?.message || "Unknown SMTP send failure",
      });

      if (!retryable || attempt === retries) {
        break;
      }

      const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 5000);
      await delay(backoffMs);
    }
  }

  throw lastError;
};

const bootstrapEmailTransport = async () => {
  try {
    validateEmailEnvironment();
    await verifyTransport({ force: true });
    return true;
  } catch (error) {
    // Allow the server to continue booting, but keep the failure visible.
    logEmailEvent("error", "Email transport bootstrap failed", {
      ...describeSmtpError(error),
      message: error?.message || "Unknown bootstrap failure",
    });
    return false;
  }
};

module.exports = {
  bootstrapEmailTransport,
  describeSmtpError,
  getTransport,
  isTransientSmtpError,
  logEmailEvent,
  sendMailWithRetry,
  verifyTransport,
};
