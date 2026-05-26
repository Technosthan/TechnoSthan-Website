import axios from "axios";

/**
 * MSG91 SMS Provider Service
 * Handles SMS OTP delivery via MSG91
 */
class Msg91Provider {
  constructor(config) {
    this.config = config;
    this.name = "MSG91";
    this.type = "msg91";
    this.baseUrl = "https://api.msg91.com/api";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = ["msg91AuthKey", "msg91TemplateId"];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`MSG91 configuration missing: ${field}`);
      }
    }
    return true;
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, "");
    if (!cleaned.startsWith("91") && cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }
    return cleaned;
  }

  /**
   * Send SMS via MSG91
   */
  async send({ phoneNumber, message }) {
    try {
      this.validate();

      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const response = await axios.get(`${this.baseUrl}/sendhttp.php`, {
        params: {
          authkey: this.config.msg91AuthKey,
          mobiles: formattedNumber,
          message: message,
          sender: this.config.msg91SenderId || "AGRITECH",
          route: this.config.msg91Route || "4",
          DLT_TE_ID: this.config.msg91TemplateId,
        },
      });

      return {
        success: true,
        messageId: response.data?.request_id,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`MSG91 SMS send failed: ${error.message}`);
    }
  }

  /**
   * Send OTP via MSG91
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
        message: "MSG91 credentials configured",
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

export default Msg91Provider;
