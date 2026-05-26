import nodemailer from "nodemailer";

/**
 * SMTP Provider Service
 * Handles SMTP-based email delivery for OTP and notifications
 */
class SmtpProvider {
  constructor(config) {
    this.config = config;
    this.name = "SMTP";
    this.type = "smtp";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["host", "port", "username", "password", "senderEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`SMTP configuration missing: ${field}`);
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
        host: this.config.host,
        port: this.config.port,
        secure: this.config.encryption === "ssl" || this.config.port === 465,
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
      throw new Error(`SMTP connection failed: ${error.message}`);
    }
  }

  /**
   * Send email via SMTP
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
      throw new Error(`SMTP send failed: ${error.message}`);
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
        message: "SMTP connection successful",
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

export default SmtpProvider;
