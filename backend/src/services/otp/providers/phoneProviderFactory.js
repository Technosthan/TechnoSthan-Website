import TwilioProvider from "./twilioProvider.js";
import Msg91Provider from "./msg91Provider.js";
import FirebaseOtpProvider from "./firebaseOtpProvider.js";
import WhatsAppOtpProvider from "./whatsappOtpProvider.js";
import VonageProvider from "./vonageProvider.js";
import CustomPhoneApiProvider from "./customPhoneApiProvider.js";

/**
 * Phone Provider Factory
 * Creates appropriate phone/SMS provider instances based on provider type
 */
export class PhoneProviderFactory {
  /**
   * Create provider instance
   */
  static create(providerType, config) {
    if (!config) {
      throw new Error("Provider configuration is required");
    }

    switch (providerType) {
      case "twilio":
        return new TwilioProvider(config);
      case "msg91":
        return new Msg91Provider(config);
      case "firebase":
        return new FirebaseOtpProvider(config);
      case "whatsapp":
        return new WhatsAppOtpProvider(config);
      case "vonage":
        return new VonageProvider(config);
      case "custom_api":
        return new CustomPhoneApiProvider(config);
      default:
        throw new Error(`Unsupported phone provider type: ${providerType}`);
    }
  }

  /**
   * Get supported provider types
   */
  static getSupportedTypes() {
    return ["twilio", "msg91", "firebase", "whatsapp", "vonage", "custom_api"];
  }

  /**
   * Validate provider type
   */
  static isValid(providerType) {
    return this.getSupportedTypes().includes(providerType);
  }
}

export default PhoneProviderFactory;
