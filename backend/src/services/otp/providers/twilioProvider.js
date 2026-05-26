import twilio from "twilio";

/**
 * Twilio SMS Provider Service
 * Handles SMS OTP delivery via Twilio
 */
class TwilioProvider {
  constructor(config) {
    this.config = config;
    this.name = "Twilio";
    this.type = "twilio";
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = [
      "twilioAccountSid",
      "twilioAuthToken",
      "twilioPhoneNumber",
    ];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Twilio configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If starts with country code, ensure +
    if (cleaned.startsWith("1")) {
      if (!phoneNumber.startsWith("+")) {
        cleaned = "+" + cleaned;
      }
    } else if (!phoneNumber.startsWith("+")) {
      cleaned = "+91" + cleaned;
    }

    return cleaned;
  }

  /**
   * Send SMS via Twilio
   */
  async send({ phoneNumber, message }) {
    try {
      this.validate();

      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const result = await this.client.messages.create({
        from: this.config.twilioPhoneNumber,
        to: formattedNumber,
        body: message,
      });

      return {
        success: true,
        messageId: result.sid,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`Twilio SMS send failed: ${error.message}`);
    }
  }

  /**
   * Send OTP via Twilio
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
      // Test by fetching account info
      const account = await this.client.api.accounts.list({ limit: 1 });
      return {
        success: true,
        message: "Twilio connection successful",
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

export default TwilioProvider;
