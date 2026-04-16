const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const { register, login } = require("../controllers/authController");

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: "Too many authentication attempts, please try again later.",
});

// Normal Auth Routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Google OAuth Start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      // 🔍 CHECK USER DATA (IMPORTANT)
      console.log("Google User Data:", req.user);

      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Send data to frontend (SECURE)
      const userData = {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      };

      res.redirect(
        `http://localhost:5173/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(
          JSON.stringify(userData)
        )}`
      );
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.redirect("/login");
    }
  }
);

module.exports = router;