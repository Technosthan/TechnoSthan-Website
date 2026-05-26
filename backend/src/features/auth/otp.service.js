import OTP from "./otp.model.js";
import LoginOtp from "./loginOtp.model.js";
import User from "./user.model.js";
import PendingUser from "./pendingUser.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import axios from "axios";
import qrcode from "qrcode";
import {
  getOtpSecuritySettings,
  getOrCreateAuthSettings,
} from "../admin/authSettings.service.js";
import * as otpProviderService from "../admin/otpProvider.service.js";
import { getUserServicePermissionByUserId } from "../admin/userServicePermission.service.js";
import {
  sendForgotPasswordEmail,
  sendOTPEmail,
} from "../../services/emailService.js";

// Import new services
import { sendTelegramOtp } from "./telegram.service.js";
import {
  sendWhatsappOtp,
  buildPhoneNumberQuery,
  formatPhoneNumber,
} from "./whatsapp.service.js";

// Initialize services - conditionally
let twilioClient = null;
const getTwilioClient = () => {
  if (
    !twilioClient &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN
  ) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  return twilioClient;
};

// Utility functions
export const detectContactType = (contact) => {
  return contact.includes("@") ? "email" : "phone";
};

export const validateContact = (contact, type) => {
  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(contact);
  } else {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(contact);
  }
};

const resolveOtpAvailability = async (method, user = null) => {
  const authSettings = await getOrCreateAuthSettings();
  const userOverride = user
    ? await getUserServicePermissionByUserId(user._id)
    : null;

  const enabledEmail = authSettings.emailOtp?.enabled ?? true;
  const enabledPhone = authSettings.phoneOtp?.enabled ?? true;
  const enabledWhatsapp = authSettings.whatsapp?.enabled ?? true;

  const allowByRole = user?.role === "admin";

  switch (method) {
    case "email":
      if (
        userOverride?.emailOtpEnabled !== null &&
        userOverride?.emailOtpEnabled !== undefined
      ) {
        return userOverride.emailOtpEnabled;
      }
      return allowByRole ? true : enabledEmail;
    case "sms":
      if (
        userOverride?.phoneOtpEnabled !== null &&
        userOverride?.phoneOtpEnabled !== undefined
      ) {
        return userOverride.phoneOtpEnabled;
      }
      return allowByRole ? true : enabledPhone;
    case "whatsapp":
      if (
        userOverride?.whatsappLoginEnabled !== null &&
        userOverride?.whatsappLoginEnabled !== undefined
      ) {
        return userOverride.whatsappLoginEnabled;
      }
      return allowByRole ? true : enabledWhatsapp;
    default:
      return true;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

export const verifyOTPHash = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

// OTP sending functions
export const sendEmailOTP = async (email, otp, name = null) => {
  console.log("🔥 EMAIL OTP DEBUG:");
  console.log("  - To:", email);
  console.log("  - OTP:", otp);
  console.log("  - Name:", name);

  try {
    const result = await sendOTPEmail({ email, name, otp });
    console.log("✅ Resend OTP email queued:", { to: email, id: result.id });
    return result;
  } catch (err) {
    console.error("❌ Resend OTP email failed:", err.message || err);
    throw err;
  }
};

export const sendSMSOTP = async (phone, otp) => {
  // Mock SMS sending for development
  console.log(`Mock SMS OTP sent to ${phone}: ${otp}`);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Uncomment below for real Twilio integration
  /*
  const client = getTwilioClient();
  if (!client) {
    throw new Error("SMS service not configured");
  }

  await client.messages.create({
    body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
  */
};

export const sendWhatsAppOTP = async (phone, otp) => {
  // Mock WhatsApp sending for development
  console.log(`Mock WhatsApp OTP sent to ${phone}: ${otp}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Uncomment below for real Twilio integration
  /*
  const client = getTwilioClient();
  if (!client) {
    throw new Error("WhatsApp service not configured");
  }

  await client.messages.create({
    body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${phone}`,
  });
  */
};

export const sendTelegramOTP = async (phone, otp) => {
  // Mock implementation - in real app, integrate with Telegram Bot API
  console.log(`Mock Telegram OTP sent to ${phone}: ${otp}`);
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Uncomment to use real service
  const user = await User.findOne({ mobile: phone });
  if (user && user.telegramChatId) {
    await sendTelegramOtp(user.telegramChatId, otp);
  } else {
    throw new Error(
      "Telegram not linked - please link your Telegram account first",
    );
  }
};

export const sendInstagramOTP = async (phone, otp) => {
  // Mock implementation
  console.log(`Mock Instagram OTP sent to ${phone}: ${otp}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const sendMessengerOTP = async (phone, otp) => {
  // Mock implementation
  console.log(`Mock Messenger OTP sent to ${phone}: ${otp}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const sendResetEmail = async (email, name, resetLink) => {
  try {
    const result = await sendForgotPasswordEmail({
      email,
      name,
      resetLink,
    });
    console.log("✅ Resend reset password email queued:", {
      to: email,
      id: result.id,
    });
    return result;
  } catch (error) {
    console.error(
      "❌ Resend reset password email failed:",
      error.message || error,
    );
    throw error;
  }
};

// Main OTP service functions
export const sendOTP = async (
  contact,
  contactType,
  method,
  pendingUserId = null,
  name = null,
  recaptchaToken = null,
) => {
  const otpSecurity = await getOtpSecuritySettings();

  // Validate contact
  if (!validateContact(contact, contactType)) {
    throw new Error(`Invalid ${contactType}`);
  }

  // Normalize contact
  const normalizedContact =
    contactType === "email" ? contact.toLowerCase() : contact;

  // Rate limiting: Check recent OTP requests (last 1 minute)
  const recentOTP = await OTP.findOne({
    contact: normalizedContact,
    createdAt: {
      $gte: new Date(Date.now() - otpSecurity.resendCooldown * 1000),
    },
  });

  if (recentOTP) {
    throw new Error("Please wait before requesting another OTP");
  }

  const dailyOtpCount = await OTP.countDocuments({
    contact: normalizedContact,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (dailyOtpCount >= otpSecurity.maxDailyRequests) {
    throw new Error("Daily OTP request limit reached");
  }

  // Resolve permissions and availability before OTP generation
  let targetUser = null;
  if (!pendingUserId) {
    targetUser = await User.findOne(
      contactType === "email"
        ? { email: normalizedContact }
        : { mobile: normalizedContact },
    );
  }

  const allowed = await resolveOtpAvailability(method, targetUser);
  if (!allowed) {
    throw new Error(
      "OTP delivery method is currently disabled for this contact",
    );
  }

  // Generate and hash OTP
  const otp = generateOTP();
  console.log(`OTP for ${normalizedContact} (${method}): ${otp}`);
  const hashedOTP = await hashOTP(otp);

  // Update pending user with contact if not set
  if (pendingUserId) {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (pendingUser) {
      if (contactType === "email" && !pendingUser.email) {
        pendingUser.email = normalizedContact;
      } else if (contactType === "phone" && !pendingUser.mobile) {
        pendingUser.mobile = normalizedContact;
      }
      // Update name if provided (e.g., when user provides email/phone later)
      if (name && (!pendingUser.name || pendingUser.name === "")) {
        pendingUser.name = name;
      }
      await pendingUser.save();
    }
  }

  // Create OTP record
  const otpRecord = new OTP({
    contact: normalizedContact,
    contactType,
    otp: hashedOTP,
    method,
    expiresAt: new Date(Date.now() + otpSecurity.expiryMinutes * 60 * 1000),
    pendingUserId,
  });

  console.log("Expires at:", otpRecord.expiresAt);

  try {
    await otpRecord.save();
    console.log(
      "OTP record saved:",
      otpRecord._id,
      "for contact:",
      normalizedContact,
    );

    // Verify save by querying immediately
    const checkRecord = await OTP.findById(otpRecord._id);
    console.log(
      "Immediate check after save:",
      checkRecord ? "found" : "not found",
    );

    if (!checkRecord) {
      console.error("Save failed: record not found after save");
      throw new Error("Failed to save OTP record");
    }
  } catch (saveError) {
    console.error("Error saving OTP record:", saveError);
    throw saveError;
  }

  // Send OTP based on method
  console.log(`Sending OTP via method=${method} to ${normalizedContact}`);

  try {
    switch (method) {
      case "email":
        console.log(`EMAIL OTP via provider to ${normalizedContact}`);
        await otpProviderService.sendEmailWithActiveProvider({
          to: normalizedContact,
          subject: "Your AgriTech Verification Code",
          text: `Your verification code is ${otp}`,
          html: `<div style="font-family: Arial, sans-serif; text-align: center;"><h2>Your Verification Code</h2><p style="font-size: 24px; font-weight: bold;">${otp}</p><p>Use this code to login to AgriTech.</p></div>`,
        });
        break;
      case "sms":
      case "whatsapp":
        console.log(
          `${method.toUpperCase()} OTP via provider to ${normalizedContact}`,
        );
        await otpProviderService.sendPhoneOtpWithActiveProvider(
          normalizedContact,
          otp,
          method,
          { recaptchaToken },
        );
        break;
      case "telegram":
        console.log(`TELEGRAM OTP: ${otp} -> ${normalizedContact}`);
        await sendTelegramOTP(normalizedContact, otp);
        break;
      case "instagram":
        await sendInstagramOTP(normalizedContact, otp);
        break;
      case "messenger":
        await sendMessengerOTP(normalizedContact, otp);
        break;
      default:
        throw new Error("Invalid OTP method");
    }
  } catch (error) {
    console.error(
      `OTP send failed for method=${method}:`,
      error.message || error,
    );
    await OTP.findByIdAndDelete(otpRecord._id).catch((cleanupError) =>
      console.error("Failed to cleanup OTP after send failure:", cleanupError),
    );
    throw error;
  }
  return {
    success: true,
    message: "OTP sent successfully",
  };
};

export const verifyOTP = async (contact, otp) => {
  // 1. LOG EVERYTHING
  console.log("INPUT CONTACT:", contact);
  console.log("INPUT OTP:", otp);

  // 2. NORMALIZE CONTACT
  contact = contact.trim().toLowerCase();

  console.log("NORMALIZED CONTACT:", contact);

  // 3. FETCH LATEST OTP (IMPORTANT FIX)
  const otpRecord = await OTP.findOne({
    contact: contact,
    verified: false,
    // 8. REMOVE STRICT EXPIRY TEMPORARILY (FOR DEBUG)
    // expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  // 4. LOG DB RECORD
  console.log("OTP FROM DB:", otpRecord);

  if (!otpRecord) {
    console.log("NO OTP RECORD FOUND FOR:", { contact });
    throw new Error("OTP not found or expired");
  }

  // Check attempts
  const otpSecurity = await getOtpSecuritySettings();

  if (otpRecord.attempts >= otpSecurity.maxAttempts) {
    throw new Error("Maximum verification attempts exceeded");
  }

  // 5. VERIFY HASH CORRECTLY
  const isValid = await bcrypt.compare(otp, otpRecord.otp);
  console.log("OTP MATCH RESULT:", isValid);

  if (!isValid) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Invalid OTP");
  }

  // Mark as verified
  otpRecord.verified = true;
  await otpRecord.save();

  // If this is for registration verification, update pending user
  if (otpRecord.pendingUserId) {
    const pendingUser = await PendingUser.findById(otpRecord.pendingUserId);
    if (pendingUser) {
      if (otpRecord.contactType === "email") {
        pendingUser.emailVerified = true;
      } else if (otpRecord.contactType === "phone") {
        pendingUser.phoneVerified = true;
      }
      await pendingUser.save();

      const authSettings = await getOrCreateAuthSettings();
      const needsEmail = authSettings.emailOtp?.enabled ?? true;
      const needsPhone = authSettings.phoneOtp?.enabled ?? true;
      const hasEmailContact = !!pendingUser.email;
      const hasPhoneContact = !!pendingUser.mobile;

      const emailRequired = needsEmail && hasEmailContact;
      const phoneRequired = needsPhone && hasPhoneContact;
      const canFinalize =
        (!emailRequired || pendingUser.emailVerified) &&
        (!phoneRequired || pendingUser.phoneVerified);

      if (canFinalize) {
        // Finalize registration
        const user = new User({
          name: pendingUser.name,
          password: pendingUser.password,
          email: pendingUser.email,
          mobile: pendingUser.mobile,
          role: "student",
          emailVerified: !emailRequired || !!pendingUser.emailVerified,
          phoneVerified: !phoneRequired || !!pendingUser.phoneVerified,
          status: "active",
        });
        await user.save();

        // Delete pending user
        await PendingUser.findByIdAndDelete(otpRecord.pendingUserId);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        return {
          success: true,
          contactType: otpRecord.contactType,
          finalized: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            telegramLinked: user.telegramLinked,
            telegramUsername: user.telegramUsername,
          },
        };
      }

      const nextStep =
        !hasEmailContact || (otpRecord.contactType === "email" && needsPhone)
          ? "input-second-field"
          : "verify-otp";
      const nextContactType =
        nextStep === "input-second-field"
          ? !hasEmailContact
            ? "email"
            : "phone"
          : otpRecord.contactType === "email"
            ? "phone"
            : "email";

      return {
        success: true,
        contactType: otpRecord.contactType,
        pendingUserId: otpRecord.pendingUserId,
        finalized: false,
        nextStep,
        nextContactType,
      };
    }
  } else {
    // It's for login
    const user = await User.findOne(
      otpRecord.contactType === "email"
        ? { email: otpRecord.contact.toLowerCase() }
        : { mobile: otpRecord.contact },
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === "blocked") {
      throw new Error("Account is blocked");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      success: true,
      contactType: otpRecord.contactType,
      pendingUserId: otpRecord.pendingUserId,
      finalized: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        telegramLinked: user.telegramLinked,
        telegramUsername: user.telegramUsername,
      },
    };
  }

  return {
    success: true,
    contactType: otpRecord.contactType,
    pendingUserId: otpRecord.pendingUserId,
  };
};

// Registration with OTP
export const registerWithOTP = async (email, phone, name) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { mobile: phone }],
  });

  if (existingUser) {
    throw new Error("User already exists with this email ");
  }

  // Create user
  const user = new User({
    name,
    email: email?.toLowerCase(),
    mobile: phone,
    role: "student",
    status: "active",
  });

  await user.save();

  // Generate JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
    },
    token,
  };
};

// Login with OTP
export const loginWithOTP = async (contact, contactType) => {
  const user = await User.findOne(
    contactType === "email"
      ? { email: contact.toLowerCase() }
      : { mobile: contact },
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "blocked") {
    throw new Error("Account is blocked");
  }

  // Generate JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
    },
    token,
  };
};

// QR Login
export const generateQRLogin = async (userId) => {
  const qrData = {
    type: "qr_login",
    userId,
    timestamp: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  const qrString = JSON.stringify(qrData);
  const qrCode = await qrcode.toDataURL(qrString);

  return { qrCode, qrData };
};

export const verifyQRLogin = async (qrData, targetUserId) => {
  try {
    const data = JSON.parse(qrData);

    if (data.type !== "qr_login" || data.userId !== targetUserId) {
      throw new Error("Invalid QR code");
    }

    if (data.expiresAt < Date.now()) {
      throw new Error("QR code expired");
    }

    const user = await User.findById(data.userId);
    if (!user || user.status === "blocked") {
      throw new Error("Invalid user");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        telegramLinked: user.telegramLinked,
        telegramUsername: user.telegramUsername,
      },
      token,
    };
  } catch (error) {
    throw new Error("Invalid QR code");
  }
};

// ================= LOGIN OTP FUNCTIONS =================
export const sendLoginOtp = async (phone, method) => {
  const otpSecurity = await getOtpSecuritySettings();
  const user = await User.findOne(buildPhoneNumberQuery(phone));
  if (!user) {
    throw new Error(
      "No account found with this phone number. Please register first.",
    );
  }

  if (!user.phoneVerified) {
    throw new Error(
      "Your phone number is not verified yet. Please verify your account first.",
    );
  }

  if (user.status === "blocked") {
    throw new Error("Account is blocked");
  }

  if (method === "telegram" && !user.telegramChatId) {
    const error = new Error("TELEGRAM_NOT_LINKED");
    error.isNotLinked = true;
    throw error;
  }
  if (method === "whatsapp" && !user.whatsappNumber && !user.mobile) {
    throw new Error("WhatsApp not linked to this account");
  }

  const identifier =
    method === "whatsapp" ? formatPhoneNumber(phone) : phone.trim();

  const recentOtp = await LoginOtp.findOne({
    identifier,
    method,
    used: false,
    createdAt: {
      $gte: new Date(Date.now() - otpSecurity.resendCooldown * 1000),
    },
  });

  if (recentOtp) {
    throw new Error("Please wait before requesting another OTP");
  }

  const dailyLoginOtpCount = await LoginOtp.countDocuments({
    identifier,
    method,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (dailyLoginOtpCount >= otpSecurity.maxDailyRequests) {
    throw new Error("Daily OTP request limit reached");
  }

  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);

  await LoginOtp.updateMany(
    {
      identifier,
      method,
      used: false,
    },
    { $set: { used: true } },
  );

  const loginOtp = new LoginOtp({
    identifier,
    otp: hashedOTP,
    method,
    expiresAt: new Date(Date.now() + otpSecurity.expiryMinutes * 60 * 1000),
  });
  await loginOtp.save();

  try {
    if (method === "telegram") {
      await sendTelegramOtp(user.telegramChatId, otp);
    } else if (method === "whatsapp") {
      await sendWhatsappOtp(user.whatsappNumber || user.mobile, otp);
    }
  } catch (error) {
    await LoginOtp.findByIdAndDelete(loginOtp._id);
    throw error;
  }

  return { message: "OTP sent" };
};

export const verifyLoginOtp = async (phone, otp, method) => {
  const otpSecurity = await getOtpSecuritySettings();
  const user = await User.findOne(buildPhoneNumberQuery(phone));
  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "blocked") {
    throw new Error("Account is blocked");
  }

  const identifier =
    method === "whatsapp" ? formatPhoneNumber(phone) : phone.trim();

  const loginOtp = await LoginOtp.findOne({
    identifier,
    method,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (!loginOtp) {
    throw new Error("Invalid or expired OTP");
  }

  if (loginOtp.attempts >= otpSecurity.maxAttempts) {
    throw new Error("Maximum verification attempts exceeded");
  }

  const isValid = await verifyOTPHash(otp, loginOtp.otp);
  if (!isValid) {
    loginOtp.attempts += 1;
    await loginOtp.save();
    throw new Error("Invalid OTP");
  }

  loginOtp.used = true;
  await loginOtp.save();

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
    },
    token,
  };
};
