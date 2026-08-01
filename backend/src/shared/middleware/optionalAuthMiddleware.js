import jwt from "jsonwebtoken";
import User from "../../features/auth/user.model.js";
import { loadPublicAccessControlSnapshot } from "../cache/publicSettingsCache.js";

const getPublicAccessEnabled = async () => {
  try {
    const settings = await loadPublicAccessControlSnapshot();
    if (!settings) {
      console.log(
        "[optionalAuthMiddleware] No settings found, defaulting to public disabled",
      );
      return false;
    }
    const publicWebsiteEnabled =
      typeof settings.publicWebsiteEnabled === "boolean"
        ? settings.publicWebsiteEnabled
        : false;
    const publicAccessEnabled =
      typeof settings.publicAccessEnabled === "boolean"
        ? settings.publicAccessEnabled
        : false;
    const enabled = publicWebsiteEnabled && publicAccessEnabled;
    console.log("[optionalAuthMiddleware] Public access enabled:", {
      publicWebsiteEnabled,
      publicAccessEnabled,
      effectivePublicAccessEnabled: enabled,
    });
    return enabled;
  } catch (error) {
    console.error(
      "[optionalAuthMiddleware] Failed to read public access settings:",
      error,
    );
    return false;
  }
};

const authOptionalMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const publicAccessEnabled = await getPublicAccessEnabled();

  console.log("[optionalAuthMiddleware]", {
    path: req.path,
    hasAuth: !!authHeader,
    publicAccessEnabled,
  });

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (publicAccessEnabled) {
      console.log("[optionalAuthMiddleware] Public access allowed, continuing");
      return next();
    }

    console.log("[optionalAuthMiddleware] Public access disabled, blocking");
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
