const jwt = require("jsonwebtoken");
const User = require("../models/User");
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

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

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
