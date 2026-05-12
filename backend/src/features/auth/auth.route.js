import express from "express";
import passport from "passport";
import {
  login,
  register,
  authenticate,
  sendOTPController,
  verifyOTPController,
  registerOTP,
  loginOTP,
  generateQRLoginController,
  verifyQRLoginController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  sendLoginOtpController,
  verifyLoginOtpController,
  linkTelegramController,
  linkWhatsappController,
  sendEmailUpdateOTPController,
  verifyEmailUpdateOTPController,
  generateTelegramLinkingCodeController,
  verifyAndLinkTelegramController,
  generateTelegramProfileLinkingCodeController,
  getTelegramStatusController,
  unlinkTelegramProfileController,
  sendProfileEmailVerificationOTPController,
  verifyProfileEmailOTPController,
  sendProfilePhoneVerificationOTPController,
  verifyProfilePhoneOTPController,
  sendWhatsappLoginOTPController,
  verifyWhatsappLoginOTPController,
  resendWhatsappLoginOTPController,
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
router.post("/register-otp", registerOTP);
router.post("/login-otp", loginRateLimit, loginOTP);

// Password reset routes
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/change-password", authMiddleware, changePasswordController);

// Social login OTP routes
router.post("/send-login-otp", otpRateLimit, sendLoginOtpController);
router.post("/verify-login-otp", loginRateLimit, verifyLoginOtpController);
router.get("/link-telegram", linkTelegramController);
router.post("/link-whatsapp", linkWhatsappController);

// WhatsApp Login routes (integrated with User model)
router.post(
  "/send-whatsapp-login-otp",
  otpRateLimit,
  sendWhatsappLoginOTPController,
);
router.post(
  "/verify-whatsapp-login-otp",
  loginRateLimit,
  verifyWhatsappLoginOTPController,
);
router.post(
  "/resend-whatsapp-login-otp",
  otpRateLimit,
  resendWhatsappLoginOTPController,
);

// Telegram linking routes
router.post("/telegram/generate-code", generateTelegramLinkingCodeController);
router.post("/telegram/verify-link", verifyAndLinkTelegramController);
router.post(
  "/telegram/profile/generate-code",
  authMiddleware,
  otpRateLimit,
  generateTelegramProfileLinkingCodeController,
);
router.get("/telegram/status", authMiddleware, getTelegramStatusController);
router.post(
  "/telegram/unlink",
  authMiddleware,
  unlinkTelegramProfileController,
);

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
  passport.authenticate(
    "google",
    {
      failureRedirect:
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
    },
  ),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const { token, user } = req.user;
    const needsVerification =
      user.requiresVerification || !user.emailVerified || !user.phoneVerified;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(
      `${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}${needsVerification ? "&verification=required" : ""}`,
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
router.post(
  "/profile/send-email-verification-otp",
  authMiddleware,
  otpRateLimit,
  sendProfileEmailVerificationOTPController,
);
router.post(
  "/profile/verify-email-otp",
  authMiddleware,
  loginRateLimit,
  verifyProfileEmailOTPController,
);
router.post(
  "/profile/send-phone-verification-otp",
  authMiddleware,
  otpRateLimit,
  sendProfilePhoneVerificationOTPController,
);
router.post(
  "/profile/verify-phone-otp",
  authMiddleware,
  loginRateLimit,
  verifyProfilePhoneOTPController,
);

export default router;
