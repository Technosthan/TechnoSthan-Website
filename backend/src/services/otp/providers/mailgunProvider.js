import axios from "axios";

/**
 * Mailgun Provider Service
 * Handles email delivery via Mailgun API
 */
class MailgunProvider {
  constructor(config) {
    this.config = config;
    this.name = "Mailgun";
    this.type = "mailgun";
    this.apiKey = config.apiKey;
    this.domain = config.domain;
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["apiKey", "domain", "senderEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Mailgun configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Send email via Mailgun
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();

      const senderEmail = senderName
        ? `${senderName} <${this.config.senderEmail}>`
        : this.config.senderEmail;

      const formData = new URLSearchParams({
        from: senderEmail,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, " "),
      });

      const response = await axios.post(
        `https://api.mailgun.net/v3/${this.domain}/messages`,
        formData,
        {
          auth: {
            username: "api",
            password: this.apiKey,
          },
        },
      );

      return {
        success: true,
        messageId: response.data.id,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(
        `Mailgun send failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();

      await axios.get(`https://api.mailgun.net/v3/${this.domain}`, {
        auth: {
          username: "api",
          password: this.apiKey,
        },
      });

      return {
        success: true,
        message: "Mailgun connection successful",
        provider: this.type,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        provider: this.type,
      };
    }
  }
}

export default MailgunProvider;
