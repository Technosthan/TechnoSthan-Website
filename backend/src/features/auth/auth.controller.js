import {
  registerUser,
  loginUser,
  finalizeRegistration,
  forgotPassword,
  resetPassword,
  authenticateUser,
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
} from "./telegramLinking.service.js";

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
        message: "Login successful",
        data: {
          token: result.token,
          user: result.user,
          flow: "login",
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
  try {
    const { phone, method } = req.body; // method: 'telegram' or 'whatsapp'
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
      return res.status(200).json({
        success: true,
        telegramNotLinked: true,
        botLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || "AgritectBot"}`,
        message: "Telegram account not connected",
      });
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
    const user = await User.findOne({ mobile: phone });
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
export const getMe = (req, res) => {
  res.json({
    success: true,
    data: req.user,
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
    const code = await generateLinkingCode();
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

// ================= VERIFY AND LINK TELEGRAM ACCOUNT =================
export const verifyAndLinkTelegramController = async (req, res) => {
  try {
    const { chatId, code, phoneNumber } = req.body;

    if (!chatId || !code || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Chat ID, code, and phone number are required",
      });
    }

    const result = await verifyAndLinkAccount(chatId, code, phoneNumber);

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
