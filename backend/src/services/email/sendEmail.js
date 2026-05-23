import resend from "./resendClient.js";

const defaultFrom =
  process.env.EMAIL_FROM || "AgriTech <no-reply@agritech.com>";

const createTextFallback = (html) => {
  if (!html) return "";
  const text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
};

export const sendEmail = async ({ to, subject, html, from }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send email");
  }

  if (!to) {
    throw new Error("Email recipient (to) is required");
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
