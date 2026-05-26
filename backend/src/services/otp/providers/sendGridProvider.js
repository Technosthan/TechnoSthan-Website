import axios from "axios";

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
    const required = ["apiKey", "senderEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`SendGrid configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Send email via SendGrid
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();

      const payload = {
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: this.config.senderEmail,
          name: senderName || "AgriTech",
        },
        subject,
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      };

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
      throw new Error(
        `SendGrid send failed: ${error.response?.data?.errors?.[0]?.message || error.message}`,
      );
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
