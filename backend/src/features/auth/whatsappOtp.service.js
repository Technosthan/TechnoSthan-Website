import User from "./user.model.js";
import bcrypt from "bcryptjs";
import {
  sendWhatsappOtp,
  formatPhoneNumber,
  validatePhoneNumber,
  buildPhoneNumberQuery,
} from "./whatsapp.service.js";
import { getOtpSecuritySettings } from "../admin/authSettings.service.js";

/**
 * Generate a 6-digit OTP
 * @returns {string} - Generated OTP
 */
export const generateWhatsappOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - OTP to hash
 * @returns {Promise<string>} - Hashed OTP
 */
export const hashWhatsappOTP = async (otp) => {
  return await bcrypt.hash(otp, 12);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain OTP
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} - Whether OTP matches
 */
export const verifyWhatsappOTPHash = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

/**
 * Send WhatsApp OTP for login - integrated with User model
 * @param {string} phoneNumber - Recipient phone number
 * @returns {Promise<Object>} - Result object
 */
export const sendWhatsappLoginOTP = async (phoneNumber) => {
  try {
    const otpSecurity = await getOtpSecuritySettings();

    // Validate and format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      throw new Error("Invalid phone number format. Must be 10 digits");
    }

    // Check if user exists with this phone number or WhatsApp number
    const user = await User.findOne(buildPhoneNumberQuery(phoneNumber));
    if (!user) {
      throw new Error(
        "No account found with this phone number. Please register first.",
      );
    }

    if (user.status === "blocked") {
      throw new Error("Account is blocked. Please contact support.");
    }

    if (
      user.phoneOtpExpires &&
      user.phoneOtpExpires.getTime() - Date.now() >
        (otpSecurity.expiryMinutes * 60 - otpSecurity.resendCooldown) * 1000
    ) {
      throw new Error("Please wait before requesting another OTP");
    }

    // Generate new OTP
    const otp = generateWhatsappOTP();
    const hashedOtp = await hashWhatsappOTP(otp);

    // Update user with OTP details
    user.phoneOtp = hashedOtp;
    user.phoneOtpExpires = new Date(
      Date.now() + otpSecurity.expiryMinutes * 60 * 1000,
    );
    await user.save();

    // Send OTP via WhatsApp Cloud API
    await sendWhatsappOtp(formattedPhone, otp);

    return {
      success: true,
      message: "OTP sent successfully to your WhatsApp",
      data: {
        phoneNumber: formattedPhone,
        expiresIn: `${otpSecurity.expiryMinutes} minute${otpSecurity.expiryMinutes === 1 ? "" : "s"}`,
        userId: user._id,
      },
    };
  } catch (error) {
    console.error("Send WhatsApp login OTP error:", error);
    throw error;
  }
};

/**
 * Verify WhatsApp OTP for login - integrated with User model
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Promise<Object>} - Verification result with user data
 */
export const verifyWhatsappLoginOTP = async (phoneNumber, otp) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Find user with this phone number or WhatsApp number
    const user = await User.findOne(buildPhoneNumberQuery(phoneNumber));
    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === "blocked") {
      throw new Error("Account is blocked. Please contact support.");
    }

    // Check if OTP exists and is not expired
    if (!user.phoneOtp || !user.phoneOtpExpires) {
      throw new Error("No OTP found. Please request a new one");
    }

    if (user.phoneOtpExpires < new Date()) {
      // Clear expired OTP
      user.phoneOtp = null;
      user.phoneOtpExpires = null;
      await user.save();
      throw new Error("OTP expired. Please request a new one");
    }

    // Verify OTP
    const isValid = await verifyWhatsappOTPHash(otp, user.phoneOtp);

    if (!isValid) {
      throw new Error("Invalid OTP. Please check and try again");
    }

    // OTP verified successfully - update user and clear OTP
    user.phoneVerified = true;
    user.phoneVerifiedAt = new Date();
    user.phoneOtp = null;
    user.phoneOtpExpires = null;
    await user.save();

    // Return user data for login (without sensitive fields)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      picture: user.picture,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        phoneNumber: formattedPhone,
      },
    };
  } catch (error) {
    console.error("Verify WhatsApp login OTP error:", error);
    throw error;
  }
};

/**
 * Resend WhatsApp OTP for login
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} - Result object
 */
export const resendWhatsappLoginOTP = async (phoneNumber) => {
  return await sendWhatsappLoginOTP(phoneNumber);
};
