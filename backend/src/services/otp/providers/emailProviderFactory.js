import SmtpProvider from "./smtpProvider.js";
import GmailSmtpProvider from "./gmailSmtpProvider.js";
import SendGridProvider from "./sendGridProvider.js";
import MailgunProvider from "./mailgunProvider.js";
import AwsSesProvider from "./awsSesProvider.js";
import ResendProvider from "./resendProvider.js";
import CustomApiProvider from "./customApiProvider.js";

/**
 * Email Provider Factory
 * Creates appropriate provider instances based on provider type
 */
export class EmailProviderFactory {
  /**
   * Create provider instance
   */
  static create(providerType, config) {
    if (!config) {
      throw new Error("Provider configuration is required");
    }

    switch (providerType) {
      case "smtp":
        return new SmtpProvider(config);
      case "gmail_smtp":
        return new GmailSmtpProvider(config);
      case "sendgrid":
        return new SendGridProvider(config);
      case "mailgun":
        return new MailgunProvider(config);
      case "aws_ses":
        return new AwsSesProvider(config);
      case "resend":
        return new ResendProvider(config);
      case "custom_smtp":
        return new SmtpProvider(config);
      case "custom_api":
        return new CustomApiProvider(config);
      default:
        throw new Error(`Unsupported email provider type: ${providerType}`);
    }
  }

  /**
   * Get supported provider types
   */
  static getSupportedTypes() {
    return [
      "smtp",
      "gmail_smtp",
      "sendgrid",
      "mailgun",
      "aws_ses",
      "resend",
      "custom_smtp",
      "custom_api",
    ];
  }

  /**
   * Validate provider type
   */
  static isValid(providerType) {
    return this.getSupportedTypes().includes(providerType);
  }
}

export default EmailProviderFactory;
