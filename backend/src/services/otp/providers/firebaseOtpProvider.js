import axios from "axios";

/**
 * Firebase OTP Provider Service
 * Handles OTP delivery via Firebase Authentication
 */
class FirebaseOtpProvider {
  constructor(config) {
    this.config = config;
    this.name = "Firebase OTP";
    this.type = "firebase";
  }

  /**
   * Validate provider configuration
   */
  validate() {
    const required = [
      "firebaseApiKey",
      "firebaseAuthDomain",
      "firebaseProjectId",
    ];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Firebase configuration missing: ${field}`);
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
   * Send OTP via Firebase
   */
  async sendOTP({ phoneNumber, otp }) {
    try {
      this.validate();

      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v2/accounts:sendCustomOtp`,
        {
          phoneNumber: formattedNumber,
          customCode: otp,
        },
        {
          params: {
            key: this.config.firebaseApiKey,
          },
        },
      );

      return {
        success: true,
        messageId: response.data?.sessionInfo,
        provider: this.type,
      };
    } catch (error) {
      throw new Error(`Firebase OTP send failed: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      this.validate();
      return {
        success: true,
        message: "Firebase credentials configured",
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

export default FirebaseOtpProvider;
