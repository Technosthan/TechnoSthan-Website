const {
  bootstrapEmailTransport,
  sendMailWithRetry,
  verifyTransport,
} = require("./gmailTransport");
const {
  getEmailFromAddress,
  validateEmailEnvironment,
} = require("./emailConfig");

const sendEmail = async ({ to, subject, html, text = "", retries = 3 }) => {
  validateEmailEnvironment();

  const from = getEmailFromAddress();
  if (!from) {
    const error = new Error("Email sender is not configured");
    error.code = "EMAIL_FROM_MISSING";
    error.statusCode = 500;
    throw error;
  }

  return sendMailWithRetry(
    {
      from,
      to,
      subject,
      html,
      text: text || undefined,
    },
    {
      retries,
      verifyBeforeSend: true,
    },
  );
};

module.exports = {
  bootstrapEmailTransport,
  sendEmail,
  validateEmailEnvironment,
  verifyTransport,
};
