import OTP from "./otp.model.js";
import User from "./user.model.js";
import PendingUser from "./pendingUser.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import twilio from "twilio";
import axios from "axios";
import qrcode from "qrcode";

// Import new services
import { sendTelegramOtp } from "./telegram.service.js";
import { sendWhatsappOtp } from "./whatsapp.service.js";

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

let emailTransporter = null;
const getEmailTransporter = () => {
  if (!emailTransporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return emailTransporter;
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
  console.log("EMAIL OTP:", otp); // debug
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const greeting = name ? `Hi ${name},` : "Hi there,";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Account - AgriTech",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">AgriTech</h1>
            <p style="color: #6c757d; margin: 5px 0;">Smart Agriculture Solutions</p>
          </div>

          <h2 style="color: #343a40; text-align: center; margin-bottom: 20px;">Account Verification</h2>

          <p style="color: #495057; line-height: 1.6; margin-bottom: 20px;">${greeting}</p>

          <p style="color: #495057; line-height: 1.6; margin-bottom: 30px;">
            Welcome to AgriTech! To complete your account setup, please verify your email address using the code below:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #007bff; padding: 20px; border: 3px solid #007bff; border-radius: 10px; display: inline-block; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>

          <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            This verification code will expire in 5 minutes. Please enter it in the application to complete your registration.
          </p>

          <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
            If you didn't create an account with AgriTech, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err);
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
  // const user = await User.findOne({ mobile: phone });
  // if (user && user.telegramChatId) {
  //   await sendTelegramOtp(user.telegramChatId, otp);
  // } else {
  //   throw new Error('Telegram not linked');
  // }
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
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const greeting = name ? `Hi ${name},` : "Hi User,";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - AgriTech",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">AgriTech</h1>
            <p style="color: #6c757d; margin: 5px 0;">Smart Agriculture Solutions</p>
          </div>

          <h2 style="color: #343a40; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>

          <p style="color: #495057; line-height: 1.6; margin-bottom: 20px;">${greeting}</p>

          <p style="color: #495057; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password for your AgriTech account. Click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>

          <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 15 minutes for security reasons. If you didn't request this password reset, please ignore this email.
          </p>

          <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${resetLink}</span>
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Main OTP service functions
export const sendOTP = async (
  contact,
  contactType,
  method,
  pendingUserId = null,
  name = null,
) => {
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
    createdAt: { $gte: new Date(Date.now() - 60000) },
  });

  if (recentOTP) {
    throw new Error("Please wait before requesting another OTP");
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
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
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
  try {
    console.log(`Sending OTP via method=${method} to ${normalizedContact}`);
    switch (method) {
      case "email":
        await sendEmailOTP(normalizedContact, otp, name);
        break;
      // TEMPORARILY DISABLED: Phone authentication system
      // case "sms":
      //   console.log(`PHONE OTP: ${otp} -> ${normalizedContact}`);
      //   await sendSMSOTP(normalizedContact, otp);
      //   break;
      // case "whatsapp":
      //   console.log(`WHATSAPP OTP: ${otp} -> ${normalizedContact}`);
      //   await sendWhatsAppOTP(normalizedContact, otp);
      //   break;
      // case "telegram":
      //   console.log(`TELEGRAM OTP: ${otp} -> ${normalizedContact}`);
      //   await sendTelegramOTP(normalizedContact, otp);
      //   break;
      // case "instagram":
      //   await sendInstagramOTP(normalizedContact, otp);
      //   break;
      // case "messenger":
      //   await sendMessengerOTP(normalizedContact, otp);
      //   break;
      default:
        throw new Error("Invalid OTP method");
    }
  } catch (error) {
    // If sending fails, delete the OTP record to prevent clutter
    await OTP.findByIdAndDelete(otpRecord._id);
    throw error;
  }
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
  if (otpRecord.attempts >= 3) {
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

      // Check if both email and phone are verified for finalization
      if (pendingUser.emailVerified && pendingUser.phoneVerified) {
        // Finalize registration
        const user = new User({
          name: pendingUser.name,
          password: pendingUser.password,
          email: pendingUser.email,
          mobile: pendingUser.mobile,
          role: "student",
          emailVerified: true,
          phoneVerified: true,
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
          },
        };
      } else {
        return {
          success: true,
          contactType: otpRecord.contactType,
          pendingUserId: otpRecord.pendingUserId,
          finalized: false,
        };
      }
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
    throw new Error("User already exists with this email or phone");
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
      },
      token,
    };
  } catch (error) {
    throw new Error("Invalid QR code");
  }
};

// ================= LOGIN OTP FUNCTIONS =================
export const sendLoginOtp = async (phone, method) => {
  // Find user by phone
  const user = await User.findOne({ mobile: phone });
  if (!user) {
    throw new Error("User not found with this phone number");
  }

  // Check if user has the required field
  if (method === "telegram" && !user.telegramChatId) {
    throw new Error("Telegram not linked to this account");
  }
  if (method === "whatsapp" && !user.whatsappNumber && !user.mobile) {
    throw new Error("WhatsApp not linked to this account");
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);

  // Save to LoginOtp
  const loginOtp = new LoginOtp({
    identifier: phone,
    otp: hashedOTP,
    method,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });
  await loginOtp.save();

  // Send OTP
  if (method === "telegram") {
    await sendTelegramOtp(user.telegramChatId, otp);
  } else if (method === "whatsapp") {
    await sendWhatsappOtp(user.whatsappNumber || user.mobile, otp);
  }

  return { message: "OTP sent" };
};

export const verifyLoginOtp = async (phone, otp, method) => {
  // Find user
  const user = await User.findOne({ mobile: phone });
  if (!user) {
    throw new Error("User not found");
  }

  // Find OTP record
  const loginOtp = await LoginOtp.findOne({
    identifier: phone,
    method,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!loginOtp) {
    throw new Error("Invalid or expired OTP");
  }

  // Verify OTP
  const isValid = await verifyOTPHash(otp, loginOtp.otp);
  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  // Mark as used
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
    },
    token,
  };
};
