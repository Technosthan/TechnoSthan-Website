import axios from "axios";
import { parseEmailAddress } from "../../email/emailProviderDefaults.js";

/**
 * SendGrid Provider Service
 * Handles email delivery via SendGrid API
 */
class SendGridProvider {
  constructor(config) {
    this.config = config;
    this.name = "SendGrid";
    this.type = "sendgrid";
    this.apiKey = config.apiKey;
    this.baseUrl = "https://api.sendgrid.com/v3/mail/send";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const senderEmail = this.config.senderEmail || this.config.fromEmail;
    if (!this.config.apiKey || !senderEmail) {
      throw new Error(
        "SendGrid configuration is incomplete. Please configure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL (or senderEmail/fromEmail).",
      );
    }
    return true;
  }

  normalizeRecipients(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : [value];
    return list
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") {
          const parsed = parseEmailAddress(entry);
          return parsed.email
            ? {
                email: parsed.email,
                name: parsed.name || undefined,
              }
            : null;
        }
        if (typeof entry === "object") {
          const email = String(entry.email || entry.address || "").trim();
          if (!email) return null;
          const recipient = { email };
          if (entry.name) {
            recipient.name = String(entry.name).trim();
          }
          return recipient;
        }
        return null;
      })
      .filter(Boolean);
  }

  normalizeAttachments(attachments) {
    if (!Array.isArray(attachments)) return undefined;

    const normalized = attachments
      .map((attachment) => {
        if (!attachment || typeof attachment !== "object") return null;

        const content = attachment.content || attachment.data || attachment.body;
        const filename = attachment.filename || attachment.name;
        if (!content || !filename) return null;

        return {
          content,
          filename,
          type: attachment.type || attachment.contentType,
          disposition: attachment.disposition,
          content_id: attachment.contentId || attachment.cid,
        };
      })
      .filter(Boolean);

    return normalized.length ? normalized : undefined;
  }

  resolveReplyTo(replyTo) {
    const parsedReplyTo = parseEmailAddress(replyTo || this.config.replyTo || "");
    if (!parsedReplyTo.email) {
      return undefined;
    }

    return {
      email: parsedReplyTo.email,
      name: parsedReplyTo.name || undefined,
    };
  }

  /**
   * Send email via SendGrid
   */
  async send({
    to,
    subject,
    html,
    text,
    senderName,
    from,
    cc,
    bcc,
    replyTo,
    attachments,
    headers,
    categories,
    customArgs,
    dynamicTemplateData,
    templateId,
  }) {
    try {
      this.validate();

      const parsedFrom = parseEmailAddress(from);
      const fromAddress = {
        email:
          parsedFrom.email ||
          this.config.senderEmail ||
          this.config.fromEmail ||
          "",
        name: senderName || this.config.fromName || parsedFrom.name || "AgriTech",
      };

      const payload = {
        personalizations: [
          {
            to: this.normalizeRecipients(to),
          },
        ],
        from: fromAddress,
        subject,
        content: [],
      };

      const ccList = this.normalizeRecipients(cc);
      if (ccList.length) {
        payload.personalizations[0].cc = ccList;
      }

      const bccList = this.normalizeRecipients(bcc);
      if (bccList.length) {
        payload.personalizations[0].bcc = bccList;
      }

      if (headers && typeof headers === "object") {
        payload.personalizations[0].headers = headers;
      }

      if (customArgs && typeof customArgs === "object") {
        payload.personalizations[0].custom_args = customArgs;
      }

      if (dynamicTemplateData && typeof dynamicTemplateData === "object") {
        payload.personalizations[0].dynamic_template_data =
          dynamicTemplateData;
      }

      const resolvedReplyTo = this.resolveReplyTo(replyTo);
      if (resolvedReplyTo) {
        payload.reply_to = resolvedReplyTo;
      }

      const normalizedAttachments = this.normalizeAttachments(attachments);
      if (normalizedAttachments) {
        payload.attachments = normalizedAttachments;
      }

      if (categories) {
        payload.categories = Array.isArray(categories)
          ? categories
          : [categories];
      }

      if (templateId) {
        payload.template_id = templateId;
      }

      if (text) {
        payload.content.push({ type: "text/plain", value: text });
      }

      if (html) {
        payload.content.push({ type: "text/html", value: html });
      }

      if (!payload.content.length && !templateId) {
        throw new Error("Email content is required");
      }

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        messageId: response.headers["x-message-id"],
        provider: this.type,
      };
    } catch (error) {
      const sendGridMessage =
        error.response?.data?.errors?.map((item) => item.message).filter(Boolean)
          .join(" ") ||
        error.response?.data?.message ||
        error.message ||
        "SendGrid send failed";

      throw new Error(`SendGrid send failed: ${sendGridMessage}`);
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();

      const response = await axios.get("https://api.sendgrid.com/v3/user", {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        success: true,
        message: "SendGrid connection successful",
        provider: this.type,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || error.message,
        provider: this.type,
      };
    }
  }
}

export default SendGridProvider;
