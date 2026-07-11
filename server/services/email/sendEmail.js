const nodemailer = require("nodemailer");

let cachedTransport = null;

const buildTransport = () => {
  if (cachedTransport) {
    return cachedTransport;
  }

  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing");
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransport;
};

const sendEmail = async ({ to, subject, html, text = "" }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM is not configured");
  }

  const transport = buildTransport();
  return transport.sendMail({
    from,
    to,
    subject,
    html,
    text: text || undefined,
  });
};

module.exports = { sendEmail };
