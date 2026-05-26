import { sendEmail } from "./email/sendEmail.js";
import forgotPasswordTemplate from "./email/templates/forgotPasswordTemplate.js";
import otpTemplate, { otpTextTemplate } from "./email/templates/otpTemplate.js";
import welcomeTemplate from "./email/templates/welcomeTemplate.js";
import verificationTemplate from "./email/templates/verificationTemplate.js";
import notificationTemplate from "./email/templates/notificationTemplate.js";

const fromAddress =
  process.env.EMAIL_FROM || "AgriTech <no-reply@agritech.com>";

export const sendForgotPasswordEmail = async ({ email, name, resetLink }) => {
  return sendEmail({
    to: email,
    from: fromAddress,
    subject: "Reset your AgriTech password",
    html: forgotPasswordTemplate({ name, resetLink }),
  });
};

export const sendOTPEmail = async ({ email, name, otp }) => {
  return sendEmail({
    to: email,
    from: fromAddress,
    subject: "Your AgriTech verification code",
    html: otpTemplate({ name, otp }),
    text: otpTextTemplate({ name, otp }),
  });
};

export const sendWelcomeEmail = async ({ email, name }) => {
  return sendEmail({
    to: email,
    from: fromAddress,
    subject: "Welcome to AgriTech — Let's grow together",
    html: welcomeTemplate({ name }),
  });
};

export const sendVerificationEmail = async ({ email, name, otp }) => {
  return sendEmail({
    to: email,
    from: fromAddress,
    subject: "Verify your AgriTech account",
    html: verificationTemplate({ name, otp }),
  });
};

export const sendNotificationEmail = async ({
  email,
  name,
  title,
  message,
  ctaUrl,
}) => {
  return sendEmail({
    to: email,
    from: fromAddress,
    subject: title || "AgriTech notification",
    html: notificationTemplate({ name, title, message, ctaUrl }),
  });
};
