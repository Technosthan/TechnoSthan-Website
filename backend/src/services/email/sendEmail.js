import {
  sendEmailWithActiveProvider,
} from "../../features/admin/otpProvider.service.js";
import { getSendGridConfigurationError } from "./emailProviderDefaults.js";

const createTextFallback = (html) => {
  if (!html) return "";
  const text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from,
  cc,
  bcc,
  replyTo,
  attachments,
  headers,
  dynamicTemplateData,
  templateId,
  categories,
  customArgs,
  ...rest
}) => {
  if (!to) {
    throw new Error("Email recipient (to) is required");
  }

  if (!html && !text && !templateId) {
    throw new Error("Email content is required");
  }

  const payload = {
    to,
    subject,
    html,
    text: text || createTextFallback(html),
    from,
    cc,
    bcc,
    replyTo,
    attachments,
    headers,
    dynamicTemplateData,
    templateId,
    categories,
    customArgs,
    ...rest,
  };

  try {
    return await sendEmailWithActiveProvider(payload);
  } catch (error) {
    if (!error?.message && !error?.response) {
      throw new Error(getSendGridConfigurationError());
    }
    throw error;
  }
};
