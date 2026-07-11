const nodemailer = require("nodemailer");

let cachedTransport = null;
let cachedTransportKey = "";

const buildTransportKey = () => {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  return JSON.stringify({
    host: host || "",
    port,
    secure,
    smtpUser: smtpUser || "",
    smtpPass: smtpPass || "",
    emailUser: emailUser || "",
    emailPass: emailPass || "",
  });
};

const buildTransport = () => {
  const transportKey = buildTransportKey();
  if (cachedTransport && cachedTransportKey === transportKey) {
    return cachedTransport;
  }

  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const user = smtpUser || emailUser;
  const pass = smtpPass || emailPass;

  if (!host || !user || !pass) {
    if (!user || !pass) {
      throw new Error("Email configuration is missing");
    }

    cachedTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
    cachedTransportKey = transportKey;
    return cachedTransport;
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
  cachedTransportKey = transportKey;

  return cachedTransport;
};

const sendEmail = async ({ to, subject, html, text = "" }) => {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;
  if (!from) {
    throw new Error("Email sender is not configured");
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
