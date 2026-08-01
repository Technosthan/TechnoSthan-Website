import { loadPublicAccessControlSnapshot } from "../cache/publicSettingsCache.js";

const publicAccessControl = async (req, res, next) => {
  try {
    const publicApiPaths = [
      "/api/auth",
      "/api/settings/public",
      "/api/homepage-services/public",
      "/api/empowering-cards/public",
      "/api/public/homepage-cta-sections",
      "/api/health",
      "/api/forms",
      "/api/admin/forms/banner-image",
      "/uploads",
    ];

    if (publicApiPaths.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    const settings = await loadPublicAccessControlSnapshot();
    const publicWebsiteEnabled =
      typeof settings?.publicWebsiteEnabled === "boolean"
        ? settings.publicWebsiteEnabled
        : false;
    const publicAccessEnabled =
      typeof settings?.publicAccessEnabled === "boolean"
        ? settings.publicAccessEnabled
        : false;
    const effectivePublicAccessEnabled =
      publicWebsiteEnabled && publicAccessEnabled;

    console.log("[publicAccessControl]", {
      path: req.path,
      publicWebsiteEnabled,
      publicAccessEnabled,
      effectivePublicAccessEnabled,
      hasAuth: !!req.headers.authorization,
    });

    if (!effectivePublicAccessEnabled) {
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
