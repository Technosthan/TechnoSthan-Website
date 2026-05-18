const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  ROLES,
  getRolePermissions,
  hasRole,
  normalizeRole,
} = require("../constants/rbac");

const buildAuthUser = (user) => {
  const role = normalizeRole(user.role);
  return {
    id: user._id.toString(),
    userId: user._id.toString(),
    role,
    email: user.email,
    permissions: getRolePermissions(role),
    isActive: Boolean(user.isActive),
    name: user.name,
    avatar: user.avatar || null,
  };
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.split(" ")[1];
  }

  if (req.headers["x-access-token"]) {
    return String(req.headers["x-access-token"]).trim();
  }

  return null;
};

exports.protect = async (req, res, next) => {
  try {
    if (req.user?._id) {
      req.user = buildAuthUser(req.user);
      return next();
    }

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, access denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Account suspended" });
    }

    req.user = buildAuthUser(user);
    return next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    if (req.user?._id) {
      req.user = buildAuthUser(req.user);
      return next();
    }

    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).lean();

    if (user && user.isActive !== false) {
      req.user = buildAuthUser(user);
    }

    return next();
  } catch (err) {
    return next();
  }
};

exports.authorize =
  (...acceptedRoles) =>
  (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!hasRole(req.user.role, acceptedRoles)) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this resource",
        });
      }

      return next();
    } catch (err) {
      console.error("Authorization Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

exports.admin = exports.authorize(ROLES.ADMIN);
exports.hr = exports.authorize(ROLES.HR);
exports.hrOrAdmin = exports.authorize(ROLES.ADMIN, ROLES.HR);

exports.withPermission =
  (permission) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "Missing required permission",
      });
    }

    return next();
  };
