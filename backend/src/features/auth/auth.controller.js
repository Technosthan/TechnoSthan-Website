import {
  registerUser,
  loginUser,
  finalizeRegistration,
  forgotPassword,
  resetPassword,
  authenticateUser,
  changePassword,
  sendProfileEmailVerificationOTP,
  verifyProfileEmailOTP,
  sendProfilePhoneVerificationOTP,
  verifyProfilePhoneOTP,
} from "./auth.service.js";

import {
  sendOTP,
  verifyOTP,
  registerWithOTP,
  loginWithOTP,
  generateQRLogin,
  verifyQRLogin,
  detectContactType,
  sendResetEmail,
  sendLoginOtp,
  verifyLoginOtp,
} from "./otp.service.js";

import {
  generateLinkingCode,
  verifyAndLinkAccount,
  unlinkTelegramAccount,
} from "./telegramLinking.service.js";

import {
  sendWhatsappLoginOTP,
  verifyWhatsappLoginOTP,
  resendWhatsappLoginOTP,
} from "./whatsappOtp.service.js";
import { buildPhoneNumberQuery } from "./whatsapp.service.js";
import { getTelegramRuntimeSettings } from "../admin/authSettings.service.js";

import User from "./user.model.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;

    // Allow either email or contact
    const contactValue = contact || email;

    if (!name || !name.trim() || !contactValue || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, contact/email, and password are required",
      });
    }

    const result = await registerUser({
      name,
      contact: contactValue,
      password,
    });

    const contactType = result.contactType;
    const method = contactType === "email" ? "email" : "sms";

    await sendOTP(
      contactValue,
      contactType,
      method,
      result.pendingUserId,
      name,
    );

    res.status(201).json({
      success: true,
      message: `Registration started. OTP sent to ${contactType}`,
      data: {
        pendingUserId: result.pendingUserId,
        contactType,
        nextStep: "verify-otp",
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      message: result.requiresVerification
        ? "Login successful. Complete your account verification to continue."
        : "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UNIFIED AUTHENTICATE =================
export const authenticate = async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({
        success: false,
        message: "Contact and password are required",
      });
    }

    // Use the new service function
    const result = await authenticateUser({ contact, password });

    if (result.isExistingUser) {
      // User exists - return login token
      return res.json({
        success: true,
        message: result.requiresVerification
          ? "Login successful. Complete your account verification to continue."
          : "Login successful",
        data: {
          token: result.token,
          user: result.user,
          flow: "login",
          requiresVerification: result.requiresVerification,
          emailVerified: result.emailVerified,
          phoneVerified: result.phoneVerified,
        },
      });
    } else {
      // User doesn't exist - start registration
      return res.json({
        success: true,
        message: `Registration started. OTP sent to ${result.contactType}`,
        data: {
          pendingUserId: result.pendingUserId,
          contactType: result.contactType,
          flow: "registration",
          nextStep: "verify-otp",
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND OTP =================
export const sendOTPController = async (req, res) => {
  try {
    const { contact, method, pendingUserId, name } = req.body;

    if (!contact || !method) {
      return res.status(400).json({
        success: false,
        message: "Contact and method are required",
      });
    }

    const contactType = detectContactType(contact);

    await sendOTP(
      contact,
      contactType,
      method,
      pendingUserId || null,
      name || "User",
    );

    res.json({
      success: true,
      message: `OTP sent successfully via ${method}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY OTP =================
export const verifyOTPController = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({
        success: false,
        message: "Contact and OTP are required",
      });
    }

    const result = await verifyOTP(contact, otp);

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= REGISTER OTP =================
export const registerOTP = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (!name || !name.trim() || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Name and either email  are required",
      });
    }

    const result = await registerWithOTP(email, phone, name);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN OTP =================
export const loginOTP = async (req, res) => {
  try {
    const { contact } = req.body;

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: "Contact is required",
      });
    }

    const contactType = detectContactType(contact);
    const result = await loginWithOTP(contact, contactType);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY LOGIN OTP =================
export const verifyLoginOTPController = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({
        success: false,
        message: "Contact and OTP are required",
      });
    }

    const result = await verifyOTP(contact, otp);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= QR LOGIN =================
export const generateQRLoginController = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await generateQRLogin(userId);

    res.json({
      success: true,
      message: "QR login generated",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyQRLoginController = async (req, res) => {
  try {
    const { qrData } = req.body;
    const targetUserId = req.user._id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR data is required",
      });
    }

    const result = await verifyQRLogin(qrData, targetUserId);

    res.json({
      success: true,
      message: "QR login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const result = await resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= FORGOT PASSWORD =================
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPassword(email);
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${result.resetToken}`;

    await sendResetEmail(email, result.user.name, resetLink);

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND LOGIN OTP =================
export const sendLoginOtpController = async (req, res) => {
  const { phone, method } = req.body; // method: 'telegram' or 'whatsapp'

  try {
    if (!phone || !method) {
      return res.status(400).json({
        success: false,
        message: "Phone and method are required",
      });
    }
    const result = await sendLoginOtp(phone, method);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    // Handle Telegram not linked case
    if (error.isNotLinked || error.message === "TELEGRAM_NOT_LINKED") {
      try {
        const telegramSettings = await getTelegramRuntimeSettings();
        const code = await generateLinkingCode(phone);
        return res.status(200).json({
          success: true,
          telegramNotLinked: true,
          linkCode: code,
          botLink: telegramSettings.botUsername
            ? `https://t.me/${telegramSettings.botUsername.replace(/^@/, "")}`
            : null,
          message: "Telegram account not connected",
        });
      } catch (linkError) {
        return res.status(500).json({
          success: false,
          message: linkError.message,
        });
      }
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY LOGIN OTP =================
export const verifyLoginOtpController = async (req, res) => {
  try {
    const { phone, otp, method } = req.body;
    if (!phone || !otp || !method) {
      return res.status(400).json({
        success: false,
        message: "Phone, OTP, and method are required",
      });
    }
    const result = await verifyLoginOtp(phone, otp, method);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LINK TELEGRAM =================
export const linkTelegramController = async (req, res) => {
  try {
    const { phone, chatId } = req.query;
    if (!phone || !chatId) {
      return res.status(400).json({
        success: false,
        message: "Phone and chatId are required",
      });
    }
    const user = await User.findOne({ mobile: phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.telegramChatId = chatId;
    await user.save();
    res.json({
      success: true,
      message: "Telegram linked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LINK WHATSAPP =================
export const linkWhatsappController = async (req, res) => {
  try {
    const { phone, whatsappNumber } = req.body;
    if (!phone || !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone and whatsappNumber are required",
      });
    }
    const user = await User.findOne(buildPhoneNumberQuery(phone));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.whatsappNumber = whatsappNumber;
    await user.save();
    res.json({
      success: true,
      message: "WhatsApp linked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      picture: user.picture,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
      telegramChatId: user.telegramChatId,
      telegramLinkCode: user.telegramLinkCode,
      telegramLinkCodeExpires: user.telegramLinkCodeExpires,
      hasPassword:
        typeof user.password === "string" && user.password.length > 0,
    },
  });
};

// ================= SEND EMAIL UPDATE OTP =================
export const sendEmailUpdateOTPController = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    const { sendEmailUpdateOTP } = await import("./auth.service.js");
    const result = await sendEmailUpdateOTP(req.user.id, newEmail);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY EMAIL UPDATE OTP =================
export const verifyEmailUpdateOTPController = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const { verifyEmailUpdateOTP } = await import("./auth.service.js");
    const result = await verifyEmailUpdateOTP(req.user.id, otp);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GENERATE TELEGRAM LINKING CODE =================
export const generateTelegramLinkingCodeController = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const code = await generateLinkingCode(phone);
    res.json({
      success: true,
      message: "Linking code generated successfully",
      data: {
        code,
        expiresIn: "15 minutes",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await changePassword(req.user.id, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateTelegramProfileLinkingCodeController = async (
  req,
  res,
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mobile) {
      return res.status(400).json({
        success: false,
        message: "Add and verify your phone number before linking Telegram",
      });
    }

    if (!user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify your phone number before linking Telegram",
      });
    }

    const code = await generateLinkingCode(user.mobile);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const telegramSettings = await getTelegramRuntimeSettings();

    user.telegramLinkCode = code;
    user.telegramLinkCodeExpires = expiresAt;
    await user.save();

    res.json({
      success: true,
      message: "Telegram linking code generated successfully",
      data: {
        code,
        expiresIn: "15 minutes",
        botLink: telegramSettings.botUsername
          ? `https://t.me/${telegramSettings.botUsername.replace(/^@/, "")}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTelegramStatusController = async (req, res) => {
  res.json({
    success: true,
    data: {
      telegramLinked: !!req.user.telegramLinked,
      telegramUsername: req.user.telegramUsername,
      telegramChatId: req.user.telegramChatId,
      telegramLinkCode: req.user.telegramLinkCode,
      telegramLinkCodeExpires: req.user.telegramLinkCodeExpires,
    },
  });
};

export const unlinkTelegramProfileController = async (req, res) => {
  try {
    const result = await unlinkTelegramAccount(req.user.mobile);
    const user = await User.findById(req.user.id);
    user.telegramLinkCode = null;
    user.telegramLinkCodeExpires = null;
    await user.save();

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= WHATSAPP LOGIN CONTROLLERS =================

export const sendProfileEmailVerificationOTPController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await sendProfileEmailVerificationOTP(req.user.id, email);
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyProfileEmailOTPController = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await verifyProfileEmailOTP(req.user.id, otp);
    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendProfilePhoneVerificationOTPController = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await sendProfilePhoneVerificationOTP(req.user.id, phone);
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyProfilePhoneOTPController = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await verifyProfilePhoneOTP(req.user.id, otp);
    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY AND LINK TELEGRAM ACCOUNT =================
export const verifyAndLinkTelegramController = async (req, res) => {
  try {
    const { chatId, code, telegramUsername } = req.body;

    if (!chatId || !code) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and code are required",
      });
    }

    const result = await verifyAndLinkAccount(chatId, code, telegramUsername);

    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= WHATSAPP LOGIN CONTROLLERS =================

// ================= SEND WHATSAPP LOGIN OTP =================
export const sendWhatsappLoginOTPController = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await sendWhatsappLoginOTP(phone);

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Send WhatsApp login OTP controller error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY WHATSAPP LOGIN OTP =================
export const verifyWhatsappLoginOTPController = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const result = await verifyWhatsappLoginOTP(phone, otp);

    // Generate JWT token using existing auth service
    const { generateToken } = await import("./auth.service.js");
    const token = generateToken(result.data.user);

    res.json({
      success: true,
      message: result.message,
      data: {
        token,
        user: result.data.user,
        phoneNumber: result.data.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Verify WhatsApp login OTP controller error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RESEND WHATSAPP LOGIN OTP =================
export const resendWhatsappLoginOTPController = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await resendWhatsappLoginOTP(phone);

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Resend WhatsApp login OTP controller error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
