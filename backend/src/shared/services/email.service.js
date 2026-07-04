import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  enquiryAdminEmailTemplate,
  enquiryThankYouEmailTemplate,
} from "../templates/enquiryEmailTemplate.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendEnquiryNotificationEmails = async (enquiry) => {
  const {
    fullName,
    email,
    phone,
    category,
    interestedArea,
    message,
    createdAt,
  } = enquiry;

  const adminHtml = enquiryAdminEmailTemplate({
    fullName,
    email,
    phone,
    category,
    interestedArea,
    message,
    createdAt,
  });

  const thankYouHtml = enquiryThankYouEmailTemplate({ fullName });

  const adminSent = await sendMail({
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    subject: "🚀 New Enquiry - TechnoSthan Innovation Hub",
    html: adminHtml,
  });

  const thankYouSent = await sendMail({
    to: email,
    subject: "Thank You for Contacting TechnoSthan Innovation Hub",
    html: thankYouHtml,
  });

  return { adminSent, thankYouSent };
};
