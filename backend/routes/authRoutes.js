const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");

const {
  register,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const {
  ROLES,
  getRolePermissions,
  normalizeRole,
} = require("../constants/rbac");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL ||
  process.env.CORS_ORIGIN?.split(",")[0]?.trim() ||
  "http://localhost:5173";

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", require("../middleware/authMiddleware").protect, logout);
router.post("/forgot-password", authLimiter, requestPasswordReset);
router.post("/reset-password/:token", authLimiter, resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const role = normalizeRole(req.user.role);
      const token = jwt.sign(
        {
          userId: req.user._id.toString(),
          id: req.user._id.toString(),
          role,
          email: req.user.email,
          permissions: getRolePermissions(role),
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      await User.updateOne(
        { _id: req.user._id },
        { $set: { lastActivityAt: new Date() } },
      );

      const userData = {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role,
        permissions: getRolePermissions(role),
        isActive: Boolean(req.user.isActive),
      };

      const redirect =
        role === ROLES.ADMIN
          ? "/admin"
          : role === ROLES.HR
            ? "/hr"
            : "/dashboard";

      res.redirect(
        `${getFrontendBaseUrl()}/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}&redirect=${encodeURIComponent(redirect)}`,
      );
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.redirect("/login");
    }
  },
);

module.exports = router;
