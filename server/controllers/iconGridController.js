const {
  Platform,
  UserIconSelection,
  IconShareLog,
} = require("../models/Platform");
const User = require("../models/User");

// ============ UTILITY FUNCTIONS ============
const resolveUserId = (req) => req.user?._id || req.body?.userId || "anonymous";
const getErrorStatus = (err) => err.statusCode || 500;

// ============ PLATFORM MANAGEMENT (HR ONLY) ============

/**
 * Get all available platforms with filtering
 */
const getAllPlatforms = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const { isActive, isCustom, category } = req.query;
    const filter = { deletedAt: null };

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isCustom !== undefined) filter.isCustom = isCustom === "true";
    if (category) filter["metadata.category"] = category;

    const platforms = await Platform.find(filter)
      .populate("addedBy", "name email role")
      .lean();

    res.json({
      success: true,
      count: platforms.length,
      data: platforms,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({
      success: false,
      msg: err.message,
    });
  }
};

/**
 * Get single platform details
 */
const getPlatformById = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const { platformId } = req.params;
    const platform = await Platform.findOne({
      platformId,
      deletedAt: null,
    }).populate("addedBy", "name email");

    if (!platform) {
      return res
        .status(404)
        .json({ success: false, msg: "Platform not found" });
    }

    res.json({ success: true, data: platform });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Add new platform (HR ONLY)
 */
const addPlatform = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    // Check HR role
    const user = await User.findById(req.user._id);
    if (user.role !== "hr" && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Only HR can add platforms" });
    }

    const {
      platformId,
      name,
      icon,
      color,
      charLimit,
      category,
      features,
      baseUrl,
      communityUrl,
      description,
    } = req.body;

    // Validate required fields
    if (!platformId || !name || !icon) {
      return res.status(400).json({
        success: false,
        msg: "platformId, name, and icon are required",
      });
    }

    // Check if platformId already exists
    const existing = await Platform.findOne({ platformId, deletedAt: null });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Platform with this ID already exists",
      });
    }

    const platform = new Platform({
      platformId,
      name,
      icon,
      color: color || "#000000",
      charLimit: charLimit || 280,
      isCustom: true,
      addedBy: req.user._id,
      baseUrl,
      communityUrl,
      metadata: {
        description,
        category: category || "custom",
        features: features || [],
        requiresAuth: true,
      },
    });

    await platform.save();

    res.status(201).json({
      success: true,
      msg: "Platform added successfully",
      data: platform,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Update platform (HR ONLY)
 */
const updatePlatform = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const user = await User.findById(req.user._id);
    if (user.role !== "hr" && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Only HR can update platforms" });
    }

    const { platformId } = req.params;
    const updateData = req.body;

    // Remove protected fields
    delete updateData.platformId;
    delete updateData.addedBy;
    delete updateData.createdAt;

    const platform = await Platform.findOneAndUpdate(
      { platformId, deletedAt: null },
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!platform) {
      return res
        .status(404)
        .json({ success: false, msg: "Platform not found" });
    }

    res.json({
      success: true,
      msg: "Platform updated successfully",
      data: platform,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Toggle platform visibility
 */
const togglePlatformVisibility = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const user = await User.findById(req.user._id);
    if (user.role !== "hr" && user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          msg: "Only HR can manage platform visibility",
        });
    }

    const { platformId } = req.params;
    const { isActive, isVisibleToUsers } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVisibleToUsers !== undefined)
      updateData.isVisibleToUsers = isVisibleToUsers;

    const platform = await Platform.findOneAndUpdate(
      { platformId, deletedAt: null },
      updateData,
      { new: true },
    );

    if (!platform) {
      return res
        .status(404)
        .json({ success: false, msg: "Platform not found" });
    }

    res.json({
      success: true,
      msg: `Platform ${isActive !== undefined ? "status" : "visibility"} updated`,
      data: platform,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Delete platform (soft delete - HR ONLY)
 */
const deletePlatform = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const user = await User.findById(req.user._id);
    if (user.role !== "hr" && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Only HR can delete platforms" });
    }

    const { platformId } = req.params;

    const platform = await Platform.findOneAndUpdate(
      { platformId, deletedAt: null },
      { deletedAt: Date.now() },
      { new: true },
    );

    if (!platform) {
      return res
        .status(404)
        .json({ success: false, msg: "Platform not found" });
    }

    res.json({ success: true, msg: "Platform deleted successfully" });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

// ============ USER ICON SELECTION ============

/**
 * Get user's icon selection preferences
 */
const getUserIconSelection = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformGridEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform grid functionality is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    let selection = await UserIconSelection.findOne({ userId });

    if (!selection) {
      // Create default selection with all active platforms
      const activePlatforms = await Platform.find({
        isActive: true,
        isVisibleToUsers: true,
        deletedAt: null,
      });

      selection = new UserIconSelection({
        userId,
        selectedPlatforms: activePlatforms.map((p, idx) => ({
          platformId: p.platformId,
          isSelected: true,
          position: idx,
        })),
      });

      await selection.save();
    }

    res.json({
      success: true,
      data: selection,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Update user's icon selection
 */
const updateUserIconSelection = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.userGridEditingEnabled) {
      return res.status(403).json({
        success: false,
        msg: "User grid editing is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    const {
      selectedPlatforms,
      theme,
      gridLayout,
      showLabels,
      enableCopyButton,
      enableShareButton,
    } = req.body;

    let selection = await UserIconSelection.findOne({ userId });

    if (!selection) {
      selection = new UserIconSelection({ userId });
    }

    if (selectedPlatforms) selection.selectedPlatforms = selectedPlatforms;
    if (theme) selection.theme = theme;
    if (gridLayout) selection.gridLayout = gridLayout;
    if (showLabels !== undefined) selection.showLabels = showLabels;
    if (enableCopyButton !== undefined)
      selection.enableCopyButton = enableCopyButton;
    if (enableShareButton !== undefined)
      selection.enableShareButton = enableShareButton;

    selection.updatedAt = Date.now();
    await selection.save();

    res.json({
      success: true,
      msg: "Icon selection updated successfully",
      data: selection,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Toggle icon selection for a platform
 */
const toggleIconSelection = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.userGridEditingEnabled) {
      return res.status(403).json({
        success: false,
        msg: "User grid editing is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    const { platformId } = req.params;

    let selection = await UserIconSelection.findOne({ userId });

    if (!selection) {
      selection = new UserIconSelection({ userId });
    }

    const platformIndex = selection.selectedPlatforms.findIndex(
      (p) => p.platformId === platformId,
    );

    if (platformIndex > -1) {
      selection.selectedPlatforms[platformIndex].isSelected =
        !selection.selectedPlatforms[platformIndex].isSelected;
    } else {
      selection.selectedPlatforms.push({
        platformId,
        isSelected: true,
        position: selection.selectedPlatforms.length,
      });
    }

    await selection.save();

    res.json({
      success: true,
      msg: "Icon selection toggled",
      data: selection,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

// ============ COPY & SHARE TRACKING ============

/**
 * Log copy/share action
 */
const logIconAction = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.usageTrackingEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Usage tracking is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    const { platformId, actionType, copiedText, sharedTo } = req.body;
    const normalizedAction = (actionType || "click").toLowerCase();

    if (normalizedAction === "share" && !settings.shareTrackingEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Share tracking is currently disabled",
      });
    }

    if (normalizedAction === "copy" && !settings.copyTrackingEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Copy tracking is currently disabled",
      });
    }

    const log = new IconShareLog({
      userId,
      platformId,
      actionType: normalizedAction,
      copiedText,
      sharedTo,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    await log.save();

    res.json({ success: true, msg: "Action logged successfully" });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

/**
 * Get icon usage analytics
 */
const getIconAnalytics = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!settings.platformAnalyticsEnabled) {
      return res.status(403).json({
        success: false,
        msg: "Platform analytics is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    const { platformId, actionType, days = 30 } = req.query;

    const filter = { userId };
    if (platformId) filter.platformId = platformId;
    if (actionType) filter.actionType = actionType;

    filter.createdAt = {
      $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    };

    const logs = await IconShareLog.find(filter).lean();

    // Aggregate data
    const analytics = {
      totalActions: logs.length,
      byPlatform: {},
      byAction: {},
      timeline: {},
    };

    logs.forEach((log) => {
      // By platform
      if (!analytics.byPlatform[log.platformId]) {
        analytics.byPlatform[log.platformId] = 0;
      }
      analytics.byPlatform[log.platformId]++;

      // By action
      if (!analytics.byAction[log.actionType]) {
        analytics.byAction[log.actionType] = 0;
      }
      analytics.byAction[log.actionType]++;

      // Timeline
      const date = log.createdAt.toISOString().split("T")[0];
      if (!analytics.timeline[date]) {
        analytics.timeline[date] = 0;
      }
      analytics.timeline[date]++;
    });

    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ success: false, msg: err.message });
  }
};

module.exports = {
  // Platform management
  getAllPlatforms,
  getPlatformById,
  addPlatform,
  updatePlatform,
  togglePlatformVisibility,
  deletePlatform,

  // User icon selection
  getUserIconSelection,
  updateUserIconSelection,
  toggleIconSelection,

  // Analytics & tracking
  logIconAction,
  getIconAnalytics,
};
