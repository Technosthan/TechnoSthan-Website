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
} from "./otp.service.js";

export const register = async (req, res) => {
  try {
    const { name, contact, password } = req.body;

    if (!name || !contact || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, contact, and password are required",
      });
    }

    const result = await registerUser({ name, contact, password });

    // Start verification process
    const contactType = result.contactType;
    const method = contactType === "email" ? "email" : "sms";
    const purpose = contactType === "email" ? "verify-email" : "verify-phone";

    const otpResult = await sendOTP(
      contact,
      contactType,
      method,
      purpose,
      result.pendingUserId,
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

// OTP-based authentication
export const sendOTPController = async (req, res) => {
  try {
    const { contact, method, purpose, pendingUserId } = req.body;

    if (!contact || !method || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Contact, method, and purpose are required",
      });
    }

    const contactType = detectContactType(contact);

    const result = await sendOTP(
      contact,
      contactType,
      method,
      purpose,
      pendingUserId || null,
    );

    res.json({
      success: true,
      message: `OTP sent successfully via ${method}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { otp, pendingUserId, method } = req.body;

    if (!otp || !pendingUserId || !method) {
      return res.status(400).json({
        success: false,
        message: "OTP, pendingUserId, and method are required",
      });
    }

    const result = await verifyOTPForPending(pendingUserId, otp, method);

    // Check if this completes registration
    let registrationComplete = false;
    let userData = null;
    let token = null;

    const pendingUser = await PendingUser.findById(pendingUserId);
    if (pendingUser && pendingUser.emailVerified && pendingUser.phoneVerified) {
      // Finalize registration
      const finalResult = await finalizeRegistration(pendingUserId);
      registrationComplete = true;
      userData = finalResult.user;
      token = finalResult.token;
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: {
        ...result,
        registrationComplete,
        ...(registrationComplete && { token, user: userData }),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const registerOTP = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (!name || (!email && !phone)) {
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

export const verifyLoginOTPController = async (req, res) => {
  try {
    const { contact, otp, method } = req.body;

    if (!contact || !otp || !method) {
      return res.status(400).json({
        success: false,
        message: "Contact, OTP, and method are required",
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

    // Send reset email
    const resetLink = `http://localhost:5173/reset-password?token=${result.resetToken}`;
    await sendResetEmail(result.user.email, result.user.name, resetLink);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

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

export const getMe = (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};
