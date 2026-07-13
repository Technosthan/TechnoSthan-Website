import { loadPublicAccessControlSnapshot } from "../cache/publicSettingsCache.js";

const publicAccessControl = async (req, res, next) => {
  try {
    const publicApiPaths = [
      "/api/auth",
      "/api/settings/public",
      "/api/homepage-services/public",
      "/api/health",
      "/api/forms",
      "/api/admin/forms/banner-image",
      "/uploads",
    ];

    if (publicApiPaths.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    const settings = await loadPublicAccessControlSnapshot();
    const publicWebsiteEnabled = settings?.publicWebsiteEnabled;
    const publicAccessSetting = settings?.publicAccessEnabled;
    const publicAccessEnabled =
      publicWebsiteEnabled === false || publicAccessSetting === false
        ? false
        : typeof publicWebsiteEnabled === "boolean"
          ? publicWebsiteEnabled
          : typeof publicAccessSetting === "boolean"
            ? publicAccessSetting
            : true; // Default to public access enabled

    console.log("[publicAccessControl]", {
      path: req.path,
      publicWebsiteEnabled,
      publicAccessSetting,
      effectivePublicAccessEnabled: publicAccessEnabled,
      hasAuth: !!req.headers.authorization,
    });

    if (publicAccessEnabled === false) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("[publicAccessControl] Blocking unauthenticated access");
        return res.status(401).json({
          success: false,
          message: "Website is locked. Please log in to continue.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("[publicAccessControl] Middleware error:", error);
    next();
  }
};

export default publicAccessControl;
