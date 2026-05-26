import nodemailer from "nodemailer";

/**
 * Gmail SMTP Provider Service
 * Handles email delivery via Gmail SMTP with app passwords
 */
class GmailSmtpProvider {
  constructor(config) {
    this.config = config;
    this.name = "Gmail SMTP";
    this.type = "gmail_smtp";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["username", "password", "senderEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Gmail SMTP configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Create transporter for sending emails
   */
  async createTransporter() {
    try {
      const transporterConfig = {
        service: "gmail",
        auth: {
          user: this.config.username,
          pass: this.config.password,
        },
      };

      const transporter = nodemailer.createTransport(transporterConfig);

      // Verify connection
      await transporter.verify();
      return transporter;
    } catch (error) {
      throw new Error(`Gmail SMTP connection failed: ${error.message}`);
    }
  }

  /**
   * Send email via Gmail SMTP
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();
      const transporter = await this.createTransporter();

      const senderEmail = senderName
        ? `${senderName} <${this.config.senderEmail}>`
        : this.config.senderEmail;

      const result = await transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        html,
        text,
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`Gmail SMTP send failed: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();
      const transporter = await this.createTransporter();
      return {
        success: true,
        message: "Gmail SMTP connection successful",
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

export default GmailSmtpProvider;
