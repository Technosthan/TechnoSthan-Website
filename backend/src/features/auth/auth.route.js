import express from "express";
import passport from "passport";
import {
  login,
  register,
  authenticate,
  sendOTPController,
  verifyOTPController,
  verifyLoginOTPController,
  registerOTP,
  loginOTP,
  generateQRLoginController,
  verifyQRLoginController,
  forgotPasswordController,
  resetPasswordController,
  sendLoginOtpController,
  verifyLoginOtpController,
  // TEMPORARILY DISABLED: Phone authentication system
  // linkTelegramController,
  // linkWhatsappController,
  sendEmailUpdateOTPController,
  verifyEmailUpdateOTPController,
} from "./auth.controller.js";
import { getMe } from "./auth.controller.js";
import { setupGoogleStrategy } from "./auth.service.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import User from "./user.model.js";
import {
  otpRateLimit,
  loginRateLimit,
} from "../../shared/middleware/rateLimitMiddleware.js";

const router = express.Router();

// Setup Google Strategy
setupGoogleStrategy();

// Traditional auth routes (keep for backward compatibility)
router.post("/register", register);
router.post("/login", loginRateLimit, login);
router.post("/authenticate", loginRateLimit, authenticate);

// OTP-based auth routes
router.post("/send-otp", otpRateLimit, sendOTPController);
router.post("/verify-otp", loginRateLimit, verifyOTPController);
router.post("/verify-login-otp", loginRateLimit, verifyLoginOTPController);
router.post("/register-otp", registerOTP);
router.post("/login-otp", loginRateLimit, loginOTP);

// Password reset routes
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

// Social login OTP routes
router.post("/send-login-otp", sendLoginOtpController);
router.post("/verify-login-otp", verifyLoginOtpController);
// TEMPORARILY DISABLED: Phone authentication system
// router.get("/link-telegram", linkTelegramController);
// router.post("/link-whatsapp", linkWhatsappController);

// QR Login routes
router.post("/qr-login/generate", authMiddleware, generateQRLoginController);
router.post("/qr-login/verify", authMiddleware, verifyQRLoginController);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const { token, user } = req.user;
    res.redirect(
      `http://localhost:5173/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`,
    );
  },
);

router.get("/me", authMiddleware, getMe);
// routes/user.js

router.put("/update", authMiddleware, async (req, res) => {
  const { name } = req.body;

  try {
    const updateData = {};
    if (typeof name === "string" && name.trim()) updateData.name = name.trim();

    if (!Object.keys(updateData).length) {
      return res.status(400).json({
        success: false,
        message: "At least one valid field (name) is required",
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    if (err?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

// Email Update OTP routes
router.post(
  "/send-email-update-otp",
  authMiddleware,
  sendEmailUpdateOTPController,
);
router.post(
  "/verify-email-update-otp",
  authMiddleware,
  verifyEmailUpdateOTPController,
);

export default router;
