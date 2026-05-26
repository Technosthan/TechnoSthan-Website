import { Vonage } from "@vonage/server-sdk";

/**
 * Vonage SMS Provider Service
 * Handles SMS OTP delivery via Vonage (Nexmo)
 */
class VonageProvider {
  constructor(config) {
    this.config = config;
    this.name = "Vonage";
    this.type = "vonage";
    this.client = new Vonage({
      apiKey: config.vonageApiKey,
      apiSecret: config.vonageApiSecret,
    });
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["vonageApiKey", "vonageApiSecret", "vonageFromNumber"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Vonage configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, "");
    if (!cleaned.startsWith("91")) {
      if (cleaned.length === 10) {
        cleaned = "91" + cleaned;
      }
    }
    return cleaned;
  }

  /**
   * Send SMS via Vonage
   */
  async send({ phoneNumber, message }) {
    try {
      this.validate();

      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const result = await this.client.sms.sendSms(
        this.config.vonageFromNumber,
        formattedNumber,
        message,
      );

      return {
        success: true,
        messageId: result.messages[0].messageId,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`Vonage SMS send failed: ${error.message}`);
    }
  }

  /**
   * Send OTP via Vonage
   */
  async sendOTP({ phoneNumber, otp }) {
    const message = `Your AgriTech verification code is: ${otp}. This code expires in 10 minutes.`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();
      return {
        success: true,
        message: "Vonage credentials configured",
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

export default VonageProvider;
