import axios from "axios";
import { getWhatsappRuntimeSettings } from "../admin/authSettings.service.js";

const WHATSAPP_API_BASE_URL = "https://graph.facebook.com/v22.0";

/**
 * Format phone number to international format with country code
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If number starts with 0, replace with country code (assuming India +91)
  if (cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.substring(1);
  }

  // If number doesn't start with country code, add India code
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - Whether phone number is valid
 */
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+91\d{10}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Send WhatsApp OTP using Meta Cloud API
 * @param {string} to - Recipient phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>} - API response
 */
export const sendWhatsappOtp = async (to, otp) => {
  try {
    const whatsappSettings = await getWhatsappRuntimeSettings();

    if (!whatsappSettings.enabled) {
      throw new Error("WhatsApp login is currently disabled");
    }

    if (!whatsappSettings.accessToken || !whatsappSettings.phoneNumberId) {
      throw new Error(
        "WhatsApp Cloud API not configured. Missing ACCESS_TOKEN or PHONE_NUMBER_ID",
      );
    }

    const formattedPhone = formatPhoneNumber(to);

    if (!validatePhoneNumber(formattedPhone)) {
      throw new Error(
        "Invalid phone number format. Must be 10 digits with country code",
      );
    }

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: whatsappSettings.templateName,
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
    };

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/${whatsappSettings.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${whatsappSettings.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      `WhatsApp OTP sent successfully to ${formattedPhone}:`,
      response.data,
    );
    return response.data;
  } catch (error) {
    console.error(
      "WhatsApp OTP send error:",
      error.response?.data || error.message,
    );

    // Handle specific Meta API errors
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      switch (apiError.code) {
        case 100:
          throw new Error("Invalid parameter. Check phone number format");
        case 200:
          throw new Error("Permission denied. Check access token");
        case 130429:
          throw new Error("Rate limit exceeded. Please try again later");
        case 131026:
          throw new Error("Template not approved or not found");
        default:
          throw new Error(`WhatsApp API error: ${apiError.message}`);
      }
    }

    throw new Error("Failed to send WhatsApp OTP. Please try again");
  }
};

/**
 * Verify WhatsApp webhook (for future webhook implementation)
 * @param {string} mode - Hub mode
 * @param {string} token - Hub verify token
 * @param {string} challenge - Hub challenge
 * @returns {string|null} - Challenge if valid, null otherwise
 */
export const verifyWebhook = (mode, token, challenge) => {
  return getWhatsappRuntimeSettings().then((settings) => {
    if (mode === "subscribe" && token === settings.verifyToken) {
      return challenge;
    }
    return null;
  });
};
