import Settings from "../../features/admin/settings.model.js";

const publicAccessControl = async (req, res, next) => {
  try {
    const publicApiPaths = ["/api/auth", "/api/settings/public"];

    if (publicApiPaths.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    const settings = await Settings.findOne().lean();
    const publicAccessEnabled = settings?.publicAccessEnabled;

    if (publicAccessEnabled === false) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Website is locked. Please log in to continue.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Public access control middleware error:", error);
    next();
  }
};

export default publicAccessControl;
