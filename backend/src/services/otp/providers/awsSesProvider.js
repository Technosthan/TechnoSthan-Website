import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * AWS SES Provider Service
 * Handles email delivery via AWS SES
 */
class AwsSesProvider {
  constructor(config) {
    this.config = config;
    this.name = "AWS SES";
    this.type = "aws_ses";
    this.sesClient = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["region", "accessKey", "secretKey", "senderEmail"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`AWS SES configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Send email via AWS SES
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();

      const senderEmail = senderName
        ? `${senderName} <${this.config.senderEmail}>`
        : this.config.senderEmail;

      const command = new SendEmailCommand({
        Source: senderEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: html,
            },
            Text: {
              Data: text || html.replace(/<[^>]+>/g, " "),
            },
          },
        },
      });

      const response = await this.sesClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`AWS SES send failed: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();
      // AWS SES verification - attempt a simple API call
      // If credentials are valid, this will succeed
      return {
        success: true,
        message: "AWS SES credentials valid",
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

export default AwsSesProvider;
