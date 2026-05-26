import axios from "axios";

/**
 * WhatsApp OTP Provider Service
 * Handles OTP delivery via WhatsApp Business API
 */
class WhatsAppOtpProvider {
  constructor(config) {
    this.config = config;
    this.name = "WhatsApp OTP";
    this.type = "whatsapp";
    this.baseUrl = `https://graph.instagram.com/v18.0/${config.whatsappPhoneNumberId}`;
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = [
      "whatsappAccessToken",
      "whatsappPhoneNumberId",
      "whatsappBusinessAccountId",
    ];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`WhatsApp configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, "");
    if (!phoneNumber.includes("+")) {
      if (cleaned.startsWith("91")) {
        cleaned = "+" + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = "+91" + cleaned;
      }
    }
    return cleaned;
  }

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP({ phoneNumber, otp }) {
    try {
      this.validate();

      const formattedNumber = this.formatPhoneNumber(phoneNumber).replace(
        "+",
        "",
      );

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "template",
          template: {
            name: "otp_verification",
            language: {
              code: "en",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: otp,
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.whatsappAccessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(
        `WhatsApp OTP send failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();

      const response = await axios.get(
        `https://graph.instagram.com/v18.0/${this.config.whatsappBusinessAccountId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.whatsappAccessToken}`,
          },
        },
      );

      return {
        success: true,
        message: "WhatsApp connection successful",
        provider: this.type,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message,
        provider: this.type,
      };
    }
  }
}

export default WhatsAppOtpProvider;
