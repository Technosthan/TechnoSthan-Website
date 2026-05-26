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
      publicWebsiteEnabled: true,
      hideLoginButton: true,
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
        "/AgriTech Wiki",
        "/chat",
        "/quiz/:contentId",
      ],
    };

    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }

    const publicAccessEnabledValue =
      settings.publicWebsiteEnabled != null
        ? settings.publicWebsiteEnabled
        : settings.publicAccessEnabled;

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
      publicWebsiteEnabled:
        settings.publicWebsiteEnabled != null
          ? settings.publicWebsiteEnabled
          : publicAccessEnabledValue != null
            ? publicAccessEnabledValue
            : defaultSettings.publicWebsiteEnabled,
      hideLoginButton:
        settings.hideLoginButton != null
          ? settings.hideLoginButton
          : settings.publicWebsiteEnabled != null
            ? settings.publicWebsiteEnabled
            : settings.publicAccessEnabled != null
              ? settings.publicAccessEnabled
              : defaultSettings.hideLoginButton,
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
    const publicWebsiteEnabled =
      settings?.publicWebsiteEnabled != null
        ? settings.publicWebsiteEnabled
        : publicAccessEnabled;
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
            "/AgriTech Wiki",
            "/chat",
            "/quiz/:contentId",
          ];
    const hideLoginButton =
      settings?.hideLoginButton != null
        ? settings.hideLoginButton
        : publicWebsiteEnabled;

    res.json({
      success: true,
      data: {
        publicAccessEnabled,
        publicWebsiteEnabled,
        hideLoginButton,
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
