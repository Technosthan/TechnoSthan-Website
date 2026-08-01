import {
  invalidatePublicSettingsCache,
  loadPublicAccessControlSnapshot,
  loadPublicSettingsSnapshot,
} from "../../shared/cache/publicSettingsCache.js";
import Settings from "../admin/settings.model.js";

const publicCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export const getPublicSettings = async (req, res) => {
  try {
    const settings = await loadPublicSettingsSnapshot();

    res.set(publicCacheHeaders);
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Get public settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public settings",
    });
  }
};

export const getAccessControlSettings = async (req, res) => {
  try {
    const settings = await loadPublicAccessControlSnapshot();

    res.set(publicCacheHeaders);
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get access control settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch access control settings",
    });
  }
};

export const updateAccessControlSettings = async (req, res) => {
  try {
    console.log("Incoming settings update:", JSON.stringify(req.body, null, 2));

    const {
      publicAccessEnabled,
      publicWebsiteEnabled,
      hideLoginButton,
      publicRoutes,
    } = req.body || {};

    if (
      publicAccessEnabled != null &&
      typeof publicAccessEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "publicAccessEnabled must be a boolean",
      });
    }

    if (
      publicWebsiteEnabled != null &&
      typeof publicWebsiteEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "publicWebsiteEnabled must be a boolean",
      });
    }

    if (publicRoutes != null && !Array.isArray(publicRoutes)) {
      return res.status(400).json({
        success: false,
        message: "publicRoutes must be an array of strings",
      });
    }

    const normalizedRoutes = Array.isArray(publicRoutes)
      ? publicRoutes
          .filter((route) => typeof route === "string")
          .map((route) => route.trim())
          .filter(Boolean)
      : undefined;

    const updatePayload = {
      ...(publicAccessEnabled != null && {
        publicAccessEnabled,
      }),
      ...(publicWebsiteEnabled != null && {
        publicWebsiteEnabled,
      }),
      ...(typeof hideLoginButton === "boolean" && {
        hideLoginButton,
      }),
      ...(normalizedRoutes != null && {
        publicRoutes: normalizedRoutes,
      }),
    };

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        $set: updatePayload,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    invalidatePublicSettingsCache();

    res.json({
      success: true,
      message: "Access control settings updated successfully",
      data: {
        publicAccessEnabled: updatedSettings.publicAccessEnabled,
        publicWebsiteEnabled: updatedSettings.publicWebsiteEnabled,
        publicRoutes: updatedSettings.publicRoutes,
      },
    });
  } catch (error) {
    console.error("Update access control settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update access control settings",
    });
  }
};
