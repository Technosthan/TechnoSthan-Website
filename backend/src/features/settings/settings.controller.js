import Settings from "../admin/settings.model.js";

export const getPublicSettings = async (req, res) => {
  try {
    const defaultSettings = {
      appName: "Technosthan AgriTech",
      logoUrl: "",
      featureFlags: {
        aiChat: true,
        quiz: true,
        contentVisibility: true,
      },
      dashboardSettings: {
        visibleCards: ["stats", "users", "content", "quiz", "activity"],
        cardOrder: ["stats", "users", "content", "quiz", "activity"],
      },
      publicAccessEnabled: true,
      publicRoutes: [
        "/",
        "/landing",
        "/about",
        "/contact",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/verify-phone",
        "/login/telegram",
        "/login/whatsapp",
      ],
    };

    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }

    settings = {
      ...defaultSettings,
      ...settings,
      featureFlags: {
        ...defaultSettings.featureFlags,
        ...(settings.featureFlags || {}),
      },
      dashboardSettings: {
        ...defaultSettings.dashboardSettings,
        ...(settings.dashboardSettings || {}),
      },
      publicAccessEnabled:
        settings.publicAccessEnabled != null
          ? settings.publicAccessEnabled
          : defaultSettings.publicAccessEnabled,
      publicRoutes:
        settings.publicRoutes != null
          ? settings.publicRoutes
          : defaultSettings.publicRoutes,
    };

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
    const settings = await Settings.findOne().lean();
    const publicAccessEnabled =
      settings?.publicAccessEnabled != null
        ? settings.publicAccessEnabled
        : true;
    const publicRoutes =
      settings?.publicRoutes != null
        ? settings.publicRoutes
        : [
            "/",
            "/landing",
            "/about",
            "/contact",
            "/login",
            "/forgot-password",
            "/reset-password",
            "/verify-email",
            "/verify-phone",
            "/login/telegram",
            "/login/whatsapp",
          ];

    res.json({
      success: true,
      data: {
        publicAccessEnabled,
        publicRoutes,
      },
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
    const { publicAccessEnabled, publicRoutes } = req.body || {};

    if (typeof publicAccessEnabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "publicAccessEnabled must be a boolean",
      });
    }

    if (!Array.isArray(publicRoutes)) {
      return res.status(400).json({
        success: false,
        message: "publicRoutes must be an array of strings",
      });
    }

    const normalizedRoutes = publicRoutes
      .filter((route) => typeof route === "string")
      .map((route) => route.trim())
      .filter(Boolean);

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          publicAccessEnabled,
          publicRoutes: normalizedRoutes,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    res.json({
      success: true,
      message: "Access control settings updated successfully",
      data: {
        publicAccessEnabled: updatedSettings.publicAccessEnabled,
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
