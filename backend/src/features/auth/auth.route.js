import express from "express";
import passport from "passport";
import { login, register } from "./auth.controller.js";
import { getMe } from "./auth.controller.js";
import { setupGoogleStrategy } from "./auth.service.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Setup Google Strategy
setupGoogleStrategy();

router.post("/register", register);
router.post("/login", login);

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
