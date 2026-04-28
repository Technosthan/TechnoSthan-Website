import express from "express";
import passport from "passport";
import {
  login,
  register,
  sendOTPController,
  verifyOTPController,
  verifyLoginOTPController,
  registerOTP,
  loginOTP,
  generateQRLoginController,
  verifyQRLoginController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller.js";
import { getMe } from "./auth.controller.js";
import { setupGoogleStrategy } from "./auth.service.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
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

// OTP-based auth routes
router.post("/send-otp", otpRateLimit, sendOTPController);
router.post("/verify-otp", loginRateLimit, verifyOTPController);
router.post("/verify-login-otp", loginRateLimit, verifyLoginOTPController);
router.post("/register-otp", registerOTP);
router.post("/login-otp", loginRateLimit, loginOTP);

// Password reset routes
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

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

export default router;
