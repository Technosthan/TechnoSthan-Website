const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../services/email/sendEmail");
const {
  ROLES,
  getRolePermissions,
  normalizeRole,
} = require("../constants/rbac");
const {
  isWorkspaceFeatureEnabled,
} = require("../services/workspaceSettingsService");

const ADMIN_SECRET_CODE =
  process.env.ADMIN_SECRET_CODE || "technosthanadmin2026";

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL ||
  process.env.CORS_ORIGIN?.split(",")[0]?.trim() ||
  "http://localhost:5173";

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

const hashResetToken = (token = "") =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const createResetToken = () => crypto.randomBytes(32).toString("hex");

const buildSafeUser = (user) => {
  const role = normalizeRole(user.role);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role,
    permissions: getRolePermissions(role),
    isActive: Boolean(user.isActive),
    avatar: user.avatar || null,
  };
};

const buildTokenPayload = (user) => {
  const role = normalizeRole(user.role);
  return {
    userId: user._id.toString(),
    id: user._id.toString(),
    role,
    email: user.email,
    permissions: getRolePermissions(role),
  };
};

const signAuthToken = (user) =>
  jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const sendAuthResponse = (res, statusCode, message, user) =>
  res.status(statusCode).json({
    success: true,
    message,
    data: {
      token: signAuthToken(user),
      user: buildSafeUser(user),
    },
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    const settings = req.workspaceSettings?.settings;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const role = adminCode === ADMIN_SECRET_CODE ? ROLES.ADMIN : ROLES.USER;
    if (
      role === ROLES.USER &&
      !isWorkspaceFeatureEnabled("allowUserRegistration", settings)
    ) {
      return res.status(403).json({
        success: false,
        message: "User registration is currently disabled",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      lastActivityAt: new Date(),
    });

    // Log registration
    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "REGISTER",
          module: "AUTH",
          description: `User registered: ${normalizedEmail}`,
          entityId: user._id?.toString(),
          entityType: "User",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return sendAuthResponse(
      res,
      201,
      role === ROLES.ADMIN
        ? "Admin registered successfully!"
        : "User registered successfully",
      user,
    );
  } catch (err) {
    console.error("Registration error:", {
      message: err.message,
      body: {
        ...req.body,
        password: req.body?.password ? "[REDACTED]" : undefined,
        adminCode: req.body?.adminCode ? "[REDACTED]" : undefined,
      },
    });

    return res.status(500).json({
      success: false,
      message: "Unable to register right now. Please try again.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Login error: JWT_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured correctly",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const normalizedRole = normalizeRole(user.role);
    const expectedPermissions = getRolePermissions(normalizedRole);
    const shouldSyncRole =
      user.role !== normalizedRole ||
      JSON.stringify(user.permissions || []) !==
        JSON.stringify(expectedPermissions);
    if (shouldSyncRole) {
      user.role = normalizedRole;
      user.permissions = expectedPermissions;
      await user.save();
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently suspended",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message: "Account is not configured for password login",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Log failed login attempt
      try {
        if (req && typeof req.logActivity === "function") {
          req.logActivity({
            action: "FAILED_LOGIN",
            module: "AUTH",
            description: `Failed login attempt for ${email}`,
            entityId: user._id?.toString(),
            entityType: "User",
          });
        }
      } catch (err) {
        console.error("Activity log failed:", err);
      }

      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    user.lastActivityAt = new Date();
    await user.save();

    // Log successful login
    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "LOGIN",
          module: "AUTH",
          description: `User logged in: ${email}`,
          entityId: user._id?.toString(),
          entityType: "User",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return sendAuthResponse(res, 200, "Login successful", user);
  } catch (err) {
    console.error("Login error:", {
      message: err.message,
      body: {
        email: req.body?.email,
        password: req.body?.password ? "[REDACTED]" : undefined,
      },
    });

    return res.status(500).json({
      success: false,
      message: "Unable to login right now. Please try again.",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req && typeof req.logActivity === "function") {
      req.logActivity({
        action: "LOGOUT",
        module: "AUTH",
        description: `User logged out: ${req.user?.email || "unknown"}`,
        entityId: req.user?.id || null,
        entityType: "User",
      });
    }

    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to logout right now" });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = createResetToken();
      const passwordResetTokenHash = hashResetToken(resetToken);
      const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      user.passwordResetTokenHash = passwordResetTokenHash;
      user.passwordResetExpiresAt = passwordResetExpiresAt;
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${getFrontendBaseUrl()}/reset-password/${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your TechnoSthan password",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
            <h2 style="margin:0 0 16px;">Reset your TechnoSthan password</h2>
            <p style="margin:0 0 16px;">We received a request to reset your password. This link expires in 1 hour.</p>
            <p style="margin:0 0 24px;">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0ea5e9;color:#fff;text-decoration:none;font-weight:700;">Reset Password</a>
            </p>
            <p style="margin:0;color:#475569;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
        text: `Reset your TechnoSthan password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, reset instructions have been sent.",
    });
  } catch (err) {
    console.error("Password reset request error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to send reset instructions right now. Please try again.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const rawToken = String(req.params?.token || "").trim();
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is missing or invalid",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmation are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const passwordResetTokenHash = hashResetToken(rawToken);
    const user = await User.findOne({
      passwordResetTokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.lastActivityAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password right now. Please try again.",
    });
  }
};
