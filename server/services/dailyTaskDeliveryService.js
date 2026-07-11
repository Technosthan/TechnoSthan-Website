const nodemailer = require("nodemailer");
const User = require("../models/User");
const HRProfile = require("../models/HRProfile");
const { sendWhatsAppMessage } = require("./whatsapp");

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getMailer = (() => {
  let transporter = null;

  return () => {
    if (!hasEmailConfig) {
      return null;
    }

    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        family: 4,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    return transporter;
  };
})();

const buildDailyTaskMessage = (instance, template) => {
  const timeLabel = template?.notificationTime || "09:00";
  const priority = String(template?.priority || "medium").toUpperCase();

  return [
    `Task: ${instance.title}`,
    `Priority: ${priority}`,
    `Time: ${timeLabel}`,
    instance.description ? `Details: ${instance.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");
};

const sendDailyTaskEmail = async ({ recipient, instance, template }) => {
  const transporter = getMailer();
  if (!transporter) {
    return { delivered: false, skipped: true, reason: "email_not_configured" };
  }

  if (!recipient?.email) {
    return { delivered: false, skipped: true, reason: "missing_email" };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipient.email,
    subject: `Daily Task: ${instance.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">${instance.title}</h2>
        <p style="margin: 0 0 12px;">${instance.description || ""}</p>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>Priority:</strong> ${String(template?.priority || "medium").toUpperCase()}</li>
          <li><strong>Time:</strong> ${template?.notificationTime || "09:00"}</li>
          <li><strong>Role:</strong> ${recipient.role || "USER"}</li>
        </ul>
      </div>
    `,
  });

  return { delivered: true, channel: "email" };
};

const resolveWhatsAppPhone = async (recipient) => {
  if (!recipient) {
    return "";
  }

  if (recipient.phone) {
    return String(recipient.phone).trim();
  }

  const hrProfile = await HRProfile.findOne({ ownerUserId: recipient._id.toString() })
    .select("phone")
    .lean();

  if (hrProfile?.phone) {
    return String(hrProfile.phone).trim();
  }

  return "";
};

const sendDailyTaskWhatsApp = async ({ recipient, instance, template }) => {
  const phone = await resolveWhatsAppPhone(recipient);
  if (!phone) {
    return { delivered: false, skipped: true, reason: "missing_phone" };
  }

  await sendWhatsAppMessage(phone, buildDailyTaskMessage(instance, template));

  return { delivered: true, channel: "whatsapp" };
};

const sendDailyTaskDelivery = async ({ recipient, instance, template, channels = [] }) => {
  const normalizedChannels = Array.from(
    new Set(
      (Array.isArray(channels) ? channels : [])
        .map((channel) => String(channel || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  const results = [];

  if (normalizedChannels.includes("email")) {
    results.push(await sendDailyTaskEmail({ recipient, instance, template }));
  }

  if (normalizedChannels.includes("whatsapp")) {
    results.push(await sendDailyTaskWhatsApp({ recipient, instance, template }));
  }

  return results;
};

module.exports = {
  sendDailyTaskDelivery,
  buildDailyTaskMessage,
};
