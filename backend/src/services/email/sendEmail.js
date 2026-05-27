import resend from "./resendClient.js";
import {
  resolveEmailProvider,
  sendEmailWithActiveProvider,
} from "../../features/admin/otpProvider.service.js";

const defaultFrom =
  process.env.EMAIL_FROM || "AgriTech <no-reply@agritech.com>";

const createTextFallback = (html) => {
  if (!html) return "";
  const text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
};

export const sendEmail = async ({ to, subject, html, text, from }) => {
  if (!to) {
    throw new Error("Email recipient (to) is required");
  }

  if (!html && !text) {
    throw new Error("Email content is required");
  }

  const activeProvider = await resolveEmailProvider();
  if (activeProvider) {
    return await sendEmailWithActiveProvider({
      to,
      subject,
      html,
      text: text || createTextFallback(html),
    });
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "No active email provider configured and RESEND_API_KEY is not set",
    );
  }

  if (!resend) {
    throw new Error(
      "Resend email client is not configured. Set RESEND_API_KEY in your environment.",
    );
  }

  const message = {
    from: from || defaultFrom,
    to,
    subject,
    html,
    text: createTextFallback(html),
  };

  try {
    const result = await resend.emails.send(message);
    console.log("Resend email sent:", {
      to,
      subject,
      id: result.id,
      status: result.status,
    });
    return result;
  } catch (error) {
    console.error("Resend email failed:", error?.message || error);
    if (error?.response) {
      console.error("Resend response:", error.response);
    }
    throw error;
  }
};
