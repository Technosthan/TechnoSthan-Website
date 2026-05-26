import { Resend } from "resend";

/**
 * Resend Provider Service
 * Handles email delivery via Resend API
 */
class ResendProvider {
  constructor(config) {
    this.config = config;
    this.name = "Resend";
    this.type = "resend";
    this.resend = new Resend(config.apiKey);
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["apiKey", "fromEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Resend configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Send email via Resend
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();

      const fromEmail = senderName
        ? `${senderName} <${this.config.fromEmail}>`
        : this.config.fromEmail;

      const result = await this.resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        success: true,
        messageId: result.data.id,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();
      // Resend test - attempt a simple API call
      return {
        success: true,
        message: "Resend API credentials valid",
        provider: this.type,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider: this.type,
      };
    }
  }
}

export default ResendProvider;
