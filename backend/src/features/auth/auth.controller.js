import {
  registerUser,
  loginUser,
  finalizeRegistration,
  forgotPassword,
  resetPassword,
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
} from "./otp.service.js";

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
    const purpose = contactType === "email" ? "verify-email" : "verify-phone";

    await sendOTP(
      contactValue,
      contactType,
      method,
      purpose,
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

// ================= SEND OTP =================
export const sendOTPController = async (req, res) => {
  try {
    const { contact, method, purpose, pendingUserId, name } = req.body;

    if (!contact || !method || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Contact, method, and purpose are required",
      });
    }

    const contactType = detectContactType(contact);

    await sendOTP(
      contact,
      contactType,
      method,
      purpose,
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
    const { contact, otp, purpose } = req.body;

    if (!contact || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Contact, OTP, and purpose are required",
      });
    }

    const result = await verifyOTP(contact, otp, purpose);

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
        message: "Name and either email or phone are required",
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

    const result = await verifyOTP(contact, otp, "login");

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
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${result.resetToken}`;

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

    await resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
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
