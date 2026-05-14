import jwt from "jsonwebtoken";
import User from "../../features/auth/user.model.js";
import Settings from "../../features/admin/settings.model.js";

const getPublicAccessEnabled = async () => {
  try {
    const settings = await Settings.findOne().lean();
    if (!settings) {
      // Default to public access enabled if no settings exist
      return true;
    }
    return settings.publicWebsiteEnabled != null
      ? settings.publicWebsiteEnabled
      : settings.publicAccessEnabled != null
        ? settings.publicAccessEnabled
        : true;
  } catch (error) {
    console.error("Failed to read public access settings:", error);
    // Default to allowing public access on error
    return true;
  }
};

const authOptionalMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const publicAccessEnabled = await getPublicAccessEnabled();

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (publicAccessEnabled) {
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      if (publicAccessEnabled) {
        return next();
      }
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(401).json({
        success: false,
        message: "Your account has been blocked. Please contact administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (publicAccessEnabled) {
      return next();
    }

    console.error("Optional auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authOptionalMiddleware;
