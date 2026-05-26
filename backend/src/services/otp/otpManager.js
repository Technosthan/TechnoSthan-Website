import OtpEmailProvider from "../../features/admin/otpEmailProvider.model.js";
import OtpPhoneProvider from "../../features/admin/otpPhoneProvider.model.js";
import { EmailProviderFactory } from "./providers/emailProviderFactory.js";
import { PhoneProviderFactory } from "./providers/phoneProviderFactory.js";
import otpTemplate, {
  otpTextTemplate,
} from "../email/templates/otpTemplate.js";

/**
 * Central OTP Manager
 * Orchestrates OTP delivery through configured providers
 * Handles provider selection, fallback, and error recovery
 */
export class OtpManager {
  /**
   * Get active email provider
   */
  static async getActiveEmailProvider() {
    try {
      const provider = await OtpEmailProvider.findOne({
        status: "active",
        isDeleted: false,
      })
        .sort({ isDefault: -1 })
        .select("+password +apiKey +accessKey +secretKey");

      if (!provider) {
        throw new Error("No active email provider configured");
      }

      return provider;
    } catch (error) {
      throw new Error(`Failed to get active email provider: ${error.message}`);
    }
  }

  /**
   * Get active phone provider
   */
  static async getActivePhoneProvider() {
    try {
      const provider = await OtpPhoneProvider.findOne({
        status: "active",
        isDeleted: false,
      })
        .sort({ isDefault: -1 })
        .select(
          "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +firebaseRecaptchaToken +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
        );

      if (!provider) {
        throw new Error("No active phone provider configured");
      }

      return provider;
    } catch (error) {
      throw new Error(`Failed to get active phone provider: ${error.message}`);
    }
  }

  /**
   * Get all active providers (for fallback/failover)
   */
  static async getAllActiveEmailProviders() {
    try {
      const providers = await OtpEmailProvider.find({
        status: "active",
        isDeleted: false,
      })
        .select("+password +apiKey +accessKey +secretKey")
        .sort({ isDefault: -1 });

      return providers;
    } catch (error) {
      throw new Error(`Failed to get email providers: ${error.message}`);
    }
  }

  /**
   * Get all active phone providers (for fallback/failover)
   */
  static async getAllActivePhoneProviders() {
    try {
      const providers = await OtpPhoneProvider.find({
        status: "active",
        isDeleted: false,
      })
        .select(
          "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +firebaseRecaptchaToken +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
        )
        .sort({ isDefault: -1 });

      return providers;
    } catch (error) {
      throw new Error(`Failed to get phone providers: ${error.message}`);
    }
  }

  /**
   * Send OTP via email with fallback support
   */
  static async sendEmailOTP({ email, otp, senderName = "AgriTech" }) {
    const providers = await this.getAllActiveEmailProviders();

    if (providers.length === 0) {
      throw new Error("No active email providers configured");
    }

    let lastError = null;

    for (const providerDoc of providers) {
      try {
        const provider = EmailProviderFactory.create(
          providerDoc.providerType,
          providerDoc.toObject(),
        );

        const result = await provider.send({
          to: email,
          subject: "Your AgriTech verification code",
          html: otpTemplate({ name: senderName, otp }),
          text: otpTextTemplate({ name: senderName, otp }),
          senderName,
        });

        return { ...result, provider: providerDoc._id };
      } catch (error) {
        lastError = error;
        console.warn(
          `Email provider ${providerDoc.providerType} failed: ${error.message}`,
        );
        // Continue to next provider
      }
    }

    throw new Error(
      `Failed to send OTP via all email providers: ${lastError?.message}`,
    );
  }

  /**
   * Send OTP via SMS/Phone with fallback support
   */
  static async sendPhoneOTP({ phoneNumber, otp }) {
    const providers = await this.getAllActivePhoneProviders();

    if (providers.length === 0) {
      throw new Error("No active phone providers configured");
    }

    let lastError = null;

    for (const providerDoc of providers) {
      try {
        const provider = PhoneProviderFactory.create(
          providerDoc.providerType,
          providerDoc.toObject(),
        );

        const result = await provider.sendOTP({
          phoneNumber,
          otp,
        });

        return { ...result, provider: providerDoc._id };
      } catch (error) {
        lastError = error;
        console.warn(
          `Phone provider ${providerDoc.providerType} failed: ${error.message}`,
        );
        // Continue to next provider
      }
    }

    throw new Error(
      `Failed to send OTP via all phone providers: ${lastError?.message}`,
    );
  }

  /**
   * Test email provider connection
   */
  static async testEmailProvider(providerId) {
    try {
      const providerDoc = await OtpEmailProvider.findById(providerId).select(
        "+password +apiKey +accessKey +secretKey",
      );

      if (!providerDoc) {
        throw new Error("Email provider not found");
      }

      const provider = EmailProviderFactory.create(
        providerDoc.providerType,
        providerDoc.toObject(),
      );

      return await provider.test();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Test phone provider connection
   */
  static async testPhoneProvider(providerId) {
    try {
      const providerDoc = await OtpPhoneProvider.findById(providerId).select(
        "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +firebaseRecaptchaToken +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
      );

      if (!providerDoc) {
        throw new Error("Phone provider not found");
      }

      const provider = PhoneProviderFactory.create(
        providerDoc.providerType,
        providerDoc.toObject(),
      );

      return await provider.test();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default OtpManager;
