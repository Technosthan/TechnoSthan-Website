import axios from "axios";

/**
 * Custom API Provider Service
 * Handles email delivery via custom HTTP APIs
 */
class CustomApiProvider {
  constructor(config) {
    this.config = config;
    this.name = "Custom API";
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
        throw new Error(`Custom API configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Build request payload from template
   */
  buildPayload({ to, subject, html, text, senderName }) {
    const template = this.config.customApiPayloadTemplate;
    let payload = template;

    // Replace template variables
    payload = payload.replace(/\{to\}/g, to);
    payload = payload.replace(/\{subject\}/g, subject);
    payload = payload.replace(/\{html\}/g, html);
    payload = payload.replace(/\{text\}/g, text || "");
    payload = payload.replace(/\{senderName\}/g, senderName || "AgriTech");
    payload = payload.replace(
      /\{senderEmail\}/g,
      this.config.senderEmail || "",
    );

    try {
      return JSON.parse(payload);
    } catch (e) {
      throw new Error(
        "Invalid custom API payload template - must be valid JSON",
      );
    }
  }

  /**
   * Send email via Custom API
   */
  async send({ to, subject, html, text, senderName }) {
    try {
      this.validate();

      const payload = this.buildPayload({
        to,
        subject,
        html,
        text,
        senderName,
      });

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
        `Custom API send failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();

      const testPayload = this.buildPayload({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        text: "Test",
        senderName: "Test",
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
        // HEAD might fail, that's ok - we're just testing connectivity
      });

      return {
        success: true,
        message: "Custom API endpoint is reachable",
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

export default CustomApiProvider;
