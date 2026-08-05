const {
  bootstrapEmailTransport,
  sendMailWithRetry,
  verifyTransport,
} = require("./sendgridTransport");
const {
  getEmailFromAddress,
  validateEmailEnvironment,
} = require("./emailConfig");

const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  replyTo,
  cc,
  bcc,
  attachments,
  retries = 3,
  }) => {
  validateEmailEnvironment();
  if (!getEmailFromAddress()) {
    const error = new Error("Email sender is not configured");
    error.code = "EMAIL_FROM_MISSING";
    error.statusCode = 500;
    throw error;
  }

  return sendMailWithRetry(
    {
      to,
      subject,
      html,
      text: text || undefined,
      replyTo,
      cc,
      bcc,
      attachments,
    },
    {
      retries,
    },
  );
};

module.exports = {
  bootstrapEmailTransport,
  sendEmail,
  validateEmailEnvironment,
  verifyTransport,
};
