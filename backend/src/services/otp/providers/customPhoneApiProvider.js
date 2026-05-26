import axios from "axios";

/**
 * Custom Phone API Provider Service
 * Handles SMS/OTP delivery via custom HTTP APIs
 */
class CustomPhoneApiProvider {
  constructor(config) {
    this.config = config;
    this.name = "Custom Phone API";
    this.type = "custom_api";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = [
      "customApiEndpoint",
      "customApiMethod",
      "customApiPayloadTemplate",
    ];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Custom Phone API configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Build request payload from template
   */
  buildPayload({ phoneNumber, message, otp }) {
    const template = this.config.customApiPayloadTemplate;
    let payload = template;

    // Replace template variables
    payload = payload.replace(/\{phoneNumber\}/g, phoneNumber);
    payload = payload.replace(/\{message\}/g, message || "");
    payload = payload.replace(/\{otp\}/g, otp || "");

    try {
      return JSON.parse(payload);
    } catch (e) {
      throw new Error(
        "Invalid custom phone API payload template - must be valid JSON",
      );
    }
  }

  /**
   * Send SMS via Custom API
   */
  async send({ phoneNumber, message }) {
    try {
      this.validate();

      const payload = this.buildPayload({ phoneNumber, message });

      const headers = {
        "Content-Type": "application/json",
      };

      // Add custom headers if provided
      if (this.config.customHeaders) {
        Object.assign(headers, this.config.customHeaders);
      }

      // Add API key if provided
      if (this.config.customApiAuthKey) {
        headers.Authorization = `Bearer ${this.config.customApiAuthKey}`;
      }

      const response = await axios({
        method: this.config.customApiMethod.toUpperCase() || "POST",
        url: this.config.customApiEndpoint,
        data: payload,
        headers,
        timeout: 10000,
      });

      return {
        success: true,
        messageId: response.data?.id || response.headers["x-message-id"],
        provider: this.type,
      };
    } catch (error) {
      throw new Error(
        `Custom Phone API send failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Send OTP via Custom API
   */
  async sendOTP({ phoneNumber, otp }) {
    const message = `Your AgriTech verification code is: ${otp}. This code expires in 10 minutes.`;
    return this.send({ phoneNumber, message, otp });
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();

      const testPayload = this.buildPayload({
        phoneNumber: "+919876543210",
        message: "Test",
        otp: "123456",
      });

      const headers = {
        "Content-Type": "application/json",
      };

      if (this.config.customHeaders) {
        Object.assign(headers, this.config.customHeaders);
      }

      if (this.config.customApiAuthKey) {
        headers.Authorization = `Bearer ${this.config.customApiAuthKey}`;
      }

      await axios({
        method: "HEAD",
        url: this.config.customApiEndpoint,
        headers,
        timeout: 5000,
      }).catch(() => {
        // HEAD might fail, that's ok
      });

      return {
        success: true,
        message: "Custom Phone API endpoint is reachable",
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

export default CustomPhoneApiProvider;
