const {
  getWorkspaceSettings,
  getPublicSettings,
  updateWorkspaceSettings,
} = require("../services/workspaceSettingsService");

exports.getWorkspaceSettings = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    return res.status(200).json({
      success: true,
      data: workspaceSettings.settings,
      meta: {
        updatedBy: workspaceSettings.updatedBy,
        updatedAt: workspaceSettings.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace settings",
    });
  }
};

exports.getWorkspaceSettingsHistory = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    return res.status(200).json({
      success: true,
      data: workspaceSettings.history || [],
    });
  } catch (err) {
    console.error("Get workspace settings history error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace settings history",
    });
  }
};

exports.updateWorkspaceSettings = async (req, res) => {
  try {
    const updates = req.body || {};
    const workspaceSettings = await updateWorkspaceSettings(updates, {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    });

    return res.status(200).json({
      success: true,
      message: "Workspace settings updated successfully",
      data: workspaceSettings.settings,
      meta: {
        updatedBy: workspaceSettings.updatedBy,
        updatedAt: workspaceSettings.updatedAt,
      },
    });
  } catch (err) {
    console.error("Update workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to update workspace settings",
    });
  }
};

exports.getPublicWorkspaceSettings = async (req, res) => {
  try {
    const settings = await getPublicSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("Get public workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load public workspace settings",
    });
  }
};
