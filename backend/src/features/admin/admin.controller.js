import User from "../auth/user.model.js";
import Content from "../content/content.model.js";
import Question from "../quiz/question.model.js";
import QuizResult from "../quiz/quizResult.model.js";
import Settings from "./settings.model.js";
import AuthSettings from "./authSettings.model.js";
import Announcement from "./announcement.model.js";
import { sendBulkAnnouncementEmails } from "./announcement.service.js";
import {
  buildAuthSettingsUpdate,
  getOrCreateAuthSettings,
  sanitizeAuthSettings,
  validateAuthSettingsPayload,
} from "./authSettings.service.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import * as otpProviderService from "./otpProvider.service.js";
import * as userServicePermissionService from "./userServicePermission.service.js";

const maskSensitiveProviderPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const masked = { ...payload };
  [
    "password",
    "apiKey",
    "accessKey",
    "secretKey",
    "twilioAuthToken",
    "whatsappAccessToken",
    "whatsappVerifyToken",
    "vonageApiSecret",
    "customApiAuthKey",
    "firebaseApiKey",
    "firebaseRecaptchaToken",
  ].forEach((key) => {
    if (masked[key]) {
      masked[key] = "***";
    }
  });
  return masked;
};

export const getAdminStats = async (req, res) => {
  try {
    // Clean up old invalid data (one-time operation)
    await QuizResult.deleteMany({ userId: null });

    // Get total counts
    const [totalUsers, totalContent, totalQuestions, totalQuizResults] =
      await Promise.all([
        User.countDocuments(),
        Content.countDocuments(),
        Question.countDocuments(),
        QuizResult.countDocuments(),
      ]);

    // Get user role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get recent quiz results with user info
    const recentQuizResults = await QuizResult.find()
      .populate({
        path: "userId",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("score total createdAt userId");

    // Debug logging
    console.log("Quiz Results:", JSON.stringify(recentQuizResults, null, 2));

    // Get quiz performance stats
    const quizStats = await QuizResult.aggregate([
      {
        $group: {
          _id: null,
          averageScore: {
            $avg: {
              $multiply: [{ $divide: ["$score", "$total"] }, 100],
            },
          },
          totalAttempts: { $sum: 1 },
          highestScore: {
            $max: {
              $multiply: [{ $divide: ["$score", "$total"] }, 100],
            },
          },
          lowestScore: {
            $min: {
              $multiply: [{ $divide: ["$score", "$total"] }, 100],
            },
          },
        },
      },
    ]);

    const stats = {
      totalUsers,
      totalContent,
      totalQuestions,
      totalQuizAttempts: totalQuizResults,
      userRoles: userRoles.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      quizPerformance: quizStats[0] || {
        averageScore: 0,
        totalAttempts: 0,
        highestScore: 0,
        lowestScore: 0,
      },
      recentActivity: recentQuizResults.map((result) => ({
        userName: result.userId?.name ?? "Deleted User",
        userEmail: result.userId?.email ?? "No Email",
        score: result.score,
        totalQuestions: result.total,
        percentage:
          result.total > 0
            ? Math.round((result.score / result.total) * 100)
            : 0,
        date: result.createdAt,
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
    });
  }
};

// ================= OTP PROVIDER MANAGEMENT =================

// Email Providers
export const getEmailProviders = async (req, res) => {
  try {
    const providers = await otpProviderService.getEmailProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error("[admin.controller] getEmailProviders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmailProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.createEmailProvider(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    console.error("[admin.controller] createEmailProvider error:", {
      error: error.message,
      providerType: req.body?.providerType,
      requestBody: maskSensitiveProviderPayload(req.body),
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEmailProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.updateEmailProvider(
      req.params.providerId,
      req.body,
    );
    res.json({ success: true, data: provider });
  } catch (error) {
    console.error("[admin.controller] updateEmailProvider error:", {
      providerId: req.params.providerId,
      error: error.message,
      requestBody: maskSensitiveProviderPayload(req.body),
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEmailProvider = async (req, res) => {
  try {
    await otpProviderService.deleteEmailProvider(req.params.providerId);
    res.json({ success: true, message: "Email provider deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setDefaultEmailProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.setDefaultEmailProvider(
      req.params.providerId,
    );
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const testEmailProviderConnection = async (req, res) => {
  try {
    await otpProviderService.testEmailProviderConnection(req.params.providerId);
    res.json({ success: true, message: "Connection test successful" });
  } catch (error) {
    console.error("[admin.controller] testEmailProviderConnection error:", {
      providerId: req.params.providerId,
      error: error.message,
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

// Phone Providers
export const getPhoneProviders = async (req, res) => {
  try {
    const providers = await otpProviderService.getPhoneProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error("[admin.controller] getPhoneProviders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPhoneProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.createPhoneProvider(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePhoneProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.updatePhoneProvider(
      req.params.providerId,
      req.body,
    );
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePhoneProvider = async (req, res) => {
  try {
    await otpProviderService.deletePhoneProvider(req.params.providerId);
    res.json({ success: true, message: "Phone provider deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setDefaultPhoneProvider = async (req, res) => {
  try {
    const provider = await otpProviderService.setDefaultPhoneProvider(
      req.params.providerId,
    );
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const testPhoneProviderConnection = async (req, res) => {
  try {
    await otpProviderService.testPhoneProviderConnection(req.params.providerId);
    res.json({ success: true, message: "Connection test successful" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= USER SERVICE PERMISSIONS =================

export const getUserServicePermissions = async (req, res) => {
  try {
    console.log(
      "[admin.controller] getUserServicePermissions params:",
      req.query,
    );
    const result = await userServicePermissionService.getUserServicePermissions(
      req.query,
    );
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    console.error("[admin.controller] getUserServicePermissions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserServicePermissionByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const permission =
      await userServicePermissionService.getUserServicePermissionByUserId(
        userId,
      );
    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserServicePermissions = async (req, res) => {
  try {
    const permission =
      await userServicePermissionService.updateUserServicePermissions(
        req.params.userId,
        req.body,
      );
    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkUpdateUserServicePermissions = async (req, res) => {
  try {
    const { userIds, updates } = req.body;
    await userServicePermissionService.bulkUpdateUserServicePermissions(
      userIds,
      updates,
    );
    res.json({ success: true, message: "Bulk update successful" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMonitoringStats = async (req, res) => {
  console.log("Monitoring API HIT - getMonitoringStats called");

  try {
    // Get total counts for monitoring
    const [totalUsers, totalContent, totalQuizzes, totalQuizAttempts] =
      await Promise.all([
        User.countDocuments(),
        Content.countDocuments(),
        Question.countDocuments(), // Assuming Question is the quiz model
        QuizResult.countDocuments(),
      ]);

    console.log("Monitoring stats counts:", {
      totalUsers,
      totalContent,
      totalQuizzes,
      totalQuizAttempts,
    });

    // Get recent quiz activities with user data
    const recentQuizResults = await QuizResult.find()
      .populate({
        path: "userId",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log("Recent quiz results found:", recentQuizResults.length);

    // Clean up any results with null userId
    const validRecentActivities = recentQuizResults
      .filter((result) => result.userId)
      .map((result) => ({
        type: "quiz_completed",
        userName: result.userId.name || "Unknown",
        userEmail: result.userId.email || "",
        score: result.score,
        timestamp: result.createdAt,
      }));

    console.log("Valid recent activities:", validRecentActivities.length);

    const stats = {
      totalUsers,
      totalContent,
      totalQuizzes,
      totalQuizAttempts,
      recentActivities: validRecentActivities,
    };

    console.log("Sending monitoring stats response");

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Monitoring stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monitoring statistics",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Validate role
    const validRoles = ["admin", "editor", "viewer", "student"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: admin, editor, viewer, student",
      });
    }

    // Validate status
    const validStatuses = ["active", "blocked"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'blocked'",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "student",
      status: status || "active",
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'student'",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'blocked'",
      });
    }

    // Prevent blocking self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot block your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User ${status === "active" ? "activated" : "blocked"} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Settings Management
export const getSettings = async (req, res) => {
  console.log("getSettings called for user:", req.user?.email);
  try {
    const defaultSettings = {
      appName: "Technosthan AgriTech",
      logoUrl: "",
      aiSettings: {
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 3000,
      },
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
      aiSettings: {
        ...defaultSettings.aiSettings,
        ...(settings.aiSettings || {}),
      },
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
          : publicAccessEnabledValue != null
            ? publicAccessEnabledValue
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
          : publicAccessEnabledValue != null
            ? publicAccessEnabledValue
            : defaultSettings.hideLoginButton,
    };

    console.log("Returning settings:", {
      id: settings._id,
      hasFeatureFlags: !!settings.featureFlags,
      hasDashboardSettings: !!settings.dashboardSettings,
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// AI config endpoints
export const getAIConfig = async (req, res) => {
  try {
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }

    const ai = settings.aiSettings || {};

    // Mask API key for safety before returning
    const maskedApiKey = ai.apiKey ? "********" + ai.apiKey.slice(-4) : "";

    const response = {
      provider: ai.provider || "gemini",
      model: ai.model || "gemini-2.5-pro",
      apiKeyMasked: maskedApiKey,
      apiUrl: ai.apiUrl || "",
      systemPrompt: ai.systemPrompt || "",
      temperature: ai.temperature != null ? ai.temperature : 0.7,
      maxTokens: ai.maxTokens != null ? ai.maxTokens : 3000,
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Get AI config error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch AI config" });
  }
};

export const updateAIConfig = async (req, res) => {
  try {
    const aiUpdate = req.body || {};

    // Remove apiKeyMasked field if present (it's only for UI display)
    delete aiUpdate.apiKeyMasked;

    // Basic validation
    if (
      aiUpdate.provider &&
      !["gemini", "openai", "custom"].includes(aiUpdate.provider)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid provider" });
    }

    // If provider is custom, apiUrl must be provided
    if (aiUpdate.provider === "custom" && !aiUpdate.apiUrl) {
      return res.status(400).json({
        success: false,
        message: "apiUrl is required for custom provider",
      });
    }

    // Build update object for nested aiSettings
    const updateObj = {};
    Object.keys(aiUpdate).forEach((k) => {
      updateObj[`aiSettings.${k}`] = aiUpdate[k];
    });

    // Handle apiKey: if not provided or it's a masked value, do not overwrite stored key
    if (Object.prototype.hasOwnProperty.call(aiUpdate, "apiKey")) {
      const v = aiUpdate.apiKey;
      if (
        !v ||
        typeof v !== "string" ||
        v.startsWith("***") ||
        v.startsWith("********")
      ) {
        // remove from updateObj so we don't overwrite actual stored key
        delete updateObj[`aiSettings.apiKey`];
      } else {
        // set real apiKey
        updateObj[`aiSettings.apiKey`] = v;
      }
    }

    await Settings.findOneAndUpdate(
      {},
      { $set: updateObj },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    // Re-read settings including apiKey to be able to mask it for response
    const fresh = await Settings.findOne().select("+aiSettings.apiKey").lean();
    const ai = (fresh && fresh.aiSettings) || {};
    const maskedApiKey = ai.apiKey ? "********" + ai.apiKey.slice(-4) : "";

    const response = {
      provider: ai.provider || "gemini",
      model: ai.model || "gemini-2.5-pro",
      apiKeyMasked: maskedApiKey,
      apiUrl: ai.apiUrl || "",
      systemPrompt: ai.systemPrompt || "",
      temperature: ai.temperature != null ? ai.temperature : 0.7,
      maxTokens: ai.maxTokens != null ? ai.maxTokens : 3000,
    };

    res.json({
      success: true,
      message: "AI settings updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Update AI config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI config: " + error.message,
    });
  }
};

// ===== AI PROVIDER MANAGEMENT =====

// Get all AI providers
export const getAIProviders = async (req, res) => {
  try {
    const settings = await Settings.findOne()
      .select("+aiSettings.providers.apiKey")
      .lean();

    if (!settings || !settings.aiSettings) {
      return res.json({
        success: true,
        data: {
          mode: "single",
          providers: [],
        },
      });
    }

    const { mode, providers = [] } = settings.aiSettings;

    // Mask API keys for security
    const maskedProviders = providers.map((provider) => ({
      ...provider,
      apiKey: provider.apiKey ? "********" + provider.apiKey.slice(-4) : "",
    }));

    res.json({
      success: true,
      data: {
        mode,
        providers: maskedProviders,
      },
    });
  } catch (error) {
    console.error("Get AI providers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI providers",
    });
  }
};

// Add new AI provider
export const addAIProvider = async (req, res) => {
  try {
    const providerData = req.body;

    // Validation
    if (
      !providerData.providerType ||
      !["gemini", "openai", "custom", "token-only"].includes(
        providerData.providerType,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider type",
      });
    }

    if (providerData.providerType === "custom" && !providerData.customName) {
      return res.status(400).json({
        success: false,
        message: "Custom name is required for custom providers",
      });
    }

    // Generate unique provider ID
    const providerId = `${providerData.providerType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newProvider = {
      providerId,
      providerType: providerData.providerType,
      customName: providerData.customName || "",
      apiKey: providerData.apiKey || "",
      modelName: providerData.modelName || "",
      apiUrl: providerData.apiUrl || "",
      configFile: providerData.configFile || "",
      isActive:
        providerData.isActive !== undefined ? providerData.isActive : true,
      isPaused: false,
      priority: providerData.priority || 0,
      createdAt: new Date(),
      failureCount: 0,
    };

    // Add to providers array
    await Settings.findOneAndUpdate(
      {},
      {
        $push: { "aiSettings.providers": newProvider },
        $setOnInsert: { "aiSettings.mode": "single" },
      },
      { upsert: true, new: true },
    );

    // Return masked provider
    const maskedProvider = {
      ...newProvider,
      apiKey: newProvider.apiKey
        ? "********" + newProvider.apiKey.slice(-4)
        : "",
    };

    res.json({
      success: true,
      message: "AI provider added successfully",
      data: maskedProvider,
    });
  } catch (error) {
    console.error("Add AI provider error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add AI provider: " + error.message,
    });
  }
};

// Update AI provider
export const updateAIProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const updateData = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    // Build update object
    const updateObj = {};
    Object.keys(updateData).forEach((key) => {
      if (key !== "providerId" && key !== "createdAt") {
        updateObj[`aiSettings.providers.$.${key}`] = updateData[key];
      }
    });

    const result = await Settings.findOneAndUpdate(
      { "aiSettings.providers.providerId": providerId },
      { $set: updateObj },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.json({
      success: true,
      message: "AI provider updated successfully",
    });
  } catch (error) {
    console.error("Update AI provider error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI provider: " + error.message,
    });
  }
};

// Delete AI provider
export const deleteAIProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    const result = await Settings.findOneAndUpdate(
      { "aiSettings.providers.providerId": providerId },
      { $pull: { "aiSettings.providers": { providerId } } },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.json({
      success: true,
      message: "AI provider deleted successfully",
    });
  } catch (error) {
    console.error("Delete AI provider error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete AI provider: " + error.message,
    });
  }
};

// Update AI mode (single/fallback)
export const updateAIMode = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!mode || !["single", "fallback"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mode. Must be 'single' or 'fallback'",
      });
    }

    await Settings.findOneAndUpdate(
      {},
      { $set: { "aiSettings.mode": mode } },
      { upsert: true, new: true },
    );

    res.json({
      success: true,
      message: `AI mode updated to ${mode}`,
    });
  } catch (error) {
    console.error("Update AI mode error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI mode: " + error.message,
    });
  }
};

// Update provider priority
export const updateProviderPriority = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { priority } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    if (typeof priority !== "number") {
      return res.status(400).json({
        success: false,
        message: "Priority must be a number",
      });
    }

    const result = await Settings.findOneAndUpdate(
      { "aiSettings.providers.providerId": providerId },
      { $set: { "aiSettings.providers.$.priority": priority } },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.json({
      success: true,
      message: "Provider priority updated successfully",
    });
  } catch (error) {
    console.error("Update provider priority error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update provider priority: " + error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    console.log(
      "updateSettings called with body:",
      JSON.stringify(req.body, null, 2),
    );

    const updateData = req.body;

    // Basic validation
    if (!updateData || typeof updateData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid request body. Expected an object.",
      });
    }

    // Validate required fields if provided
    if (updateData.appName && typeof updateData.appName !== "string") {
      return res.status(400).json({
        success: false,
        message: "appName must be a string",
      });
    }

    if (
      updateData.publicAccessEnabled != null &&
      typeof updateData.publicAccessEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "publicAccessEnabled must be a boolean",
      });
    }

    if (
      updateData.publicWebsiteEnabled != null &&
      typeof updateData.publicWebsiteEnabled !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "publicWebsiteEnabled must be a boolean",
      });
    }

    if (
      updateData.hideLoginButton != null &&
      typeof updateData.hideLoginButton !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "hideLoginButton must be a boolean",
      });
    }

    if (
      updateData.publicRoutes != null &&
      !Array.isArray(updateData.publicRoutes)
    ) {
      return res.status(400).json({
        success: false,
        message: "publicRoutes must be an array of strings",
      });
    }

    const publicRoutes = Array.isArray(updateData.publicRoutes)
      ? updateData.publicRoutes.filter((route) => typeof route === "string")
      : undefined;

    const normalizedUpdateData = {
      ...updateData,
    };

    if (publicRoutes) {
      normalizedUpdateData.publicRoutes = publicRoutes
        .map((route) => route.trim())
        .filter(Boolean);
    }

    if (
      normalizedUpdateData.publicWebsiteEnabled == null &&
      normalizedUpdateData.publicAccessEnabled != null
    ) {
      normalizedUpdateData.publicWebsiteEnabled =
        normalizedUpdateData.publicAccessEnabled;
    }

    if (
      normalizedUpdateData.hideLoginButton == null &&
      normalizedUpdateData.publicWebsiteEnabled != null
    ) {
      normalizedUpdateData.hideLoginButton =
        normalizedUpdateData.publicWebsiteEnabled;
    }

    console.log("Validation passed, looking for existing settings...");

    // Merge into a single settings document so nested sections persist cleanly.
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: normalizedUpdateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log("Settings updated successfully:", settings._id);

    console.log("Returning success response");
    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings: " + error.message,
    });
  }
};

// Role and Permission Management
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    const validRoles = ["admin", "editor", "viewer", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role, permissions },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User permissions updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user permissions",
    });
  }
};

// Announcement Management
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Validate delivery channel
    if (!announcementData.deliveryChannel) {
      announcementData.deliveryChannel = "dashboard";
    }

    const announcement = await Announcement.create(announcementData);

    // Handle email sending if delivery channel includes email
    if (
      announcementData.deliveryChannel === "email" ||
      announcementData.deliveryChannel === "both"
    ) {
      try {
        // Update status to pending
        await Announcement.findByIdAndUpdate(announcement._id, {
          emailStatus: "pending",
        });

        // Get target users
        let userQuery = { email: { $exists: true, $ne: null } }; // Only users with email

        if (announcementData.targetAudience !== "all") {
          userQuery.role = announcementData.targetAudience;
        }

        const targetUsers = await User.find(userQuery).select("name email");

        if (targetUsers.length > 0) {
          // Send emails asynchronously
          setImmediate(async () => {
            try {
              const emailResults = await sendBulkAnnouncementEmails(
                targetUsers,
                announcement,
              );

              // Update email status based on results
              const finalStatus =
                emailResults.failed === 0
                  ? "sent"
                  : emailResults.sent > 0
                    ? "sent"
                    : "failed";
              await Announcement.findByIdAndUpdate(announcement._id, {
                emailStatus: finalStatus,
              });

              console.log(
                `Announcement emails sent: ${emailResults.sent} successful, ${emailResults.failed} failed`,
              );
            } catch (emailError) {
              console.error("Bulk email sending error:", emailError);
              await Announcement.findByIdAndUpdate(announcement._id, {
                emailStatus: "failed",
              });
            }
          });
        } else {
          // No users to send emails to
          await Announcement.findByIdAndUpdate(announcement._id, {
            emailStatus: "sent",
          });
        }
      } catch (emailSetupError) {
        console.error("Email setup error:", emailSetupError);
        // Don't fail the announcement creation, just mark email as failed
        await Announcement.findByIdAndUpdate(announcement._id, {
          emailStatus: "failed",
        });
      }
    }

    res.json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      req.body,
      { new: true },
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

// Global Search
export const globalSearch = async (req, res) => {
  try {
    const { query, type } = req.query;

    const searchRegex = new RegExp(query, "i");
    let results = {};

    if (!type || type === "users") {
      const users = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select("name email role status createdAt");
      results.users = users;
    }

    if (!type || type === "content") {
      const content = await Content.find({
        $or: [{ title: searchRegex }, { description: searchRegex }],
      }).select("title description createdAt");
      results.content = content;
    }

    if (!type || type === "quizzes") {
      const quizzes = await Question.find({
        question: searchRegex,
      }).select("question contentId createdAt");
      results.quizzes = quizzes;
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

// Authentication Settings Management
export const getAuthSettings = async (req, res) => {
  try {
    console.log("getAuthSettings called for user:", req.user?.email);
    const authSettings = await getOrCreateAuthSettings({
      includeSensitive: true,
    });
    const safeSettings = sanitizeAuthSettings(authSettings);

    console.log("Returning auth settings (sanitized)");
    res.json({
      success: true,
      data: safeSettings,
    });
  } catch (error) {
    console.error("Get auth settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load authentication settings",
    });
  }
};

export const updateAuthSettings = async (req, res) => {
  try {
    console.log(
      "updateAuthSettings called with body:",
      JSON.stringify(req.body, null, 2),
    );

    const updateData = req.body;
    const existingSettings = await getOrCreateAuthSettings({
      includeSensitive: true,
    });

    const validationError = validateAuthSettingsPayload(
      updateData,
      existingSettings,
    );
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    console.log("Validation passed, updating auth settings...");

    const nextSettings = buildAuthSettingsUpdate(updateData, existingSettings);

    const authSettings = await AuthSettings.findOneAndUpdate(
      {},
      { $set: nextSettings },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log("Auth settings updated successfully:", authSettings._id);

    const safeSettings = sanitizeAuthSettings(authSettings.toObject());

    res.json({
      success: true,
      message: "Authentication settings updated successfully",
      data: safeSettings,
    });
  } catch (error) {
    console.error("Update auth settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update authentication settings: " + error.message,
    });
  }
};

export const testWhatsappConnection = async (req, res) => {
  try {
    console.log("Testing WhatsApp connection");

    const authSettings = await AuthSettings.findOne().select(
      "+whatsapp.accessToken +whatsapp.verifyToken",
    );

    if (!authSettings?.whatsapp?.enabled) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp login is disabled",
      });
    }

    if (
      !authSettings.whatsapp.accessToken ||
      !authSettings.whatsapp.phoneNumberId
    ) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp access token and phone number ID are required",
      });
    }

    // Test connection by getting phone number info
    const testUrl = `https://graph.facebook.com/v22.0/${authSettings.whatsapp.phoneNumberId}`;
    const response = await axios.get(testUrl, {
      headers: {
        Authorization: `Bearer ${authSettings.whatsapp.accessToken}`,
      },
    });

    if (response.data && response.data.id) {
      res.json({
        success: true,
        message: "WhatsApp connection successful",
        data: {
          phoneNumberId: response.data.id,
          displayPhoneNumber: response.data.display_phone_number,
        },
      });
    } else {
      return res.status(502).json({
        success: false,
        message: "Invalid response from WhatsApp API",
      });
    }
  } catch (error) {
    console.error(
      "WhatsApp test connection error:",
      error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message: "WhatsApp connection test failed",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

export const testTelegramConnection = async (req, res) => {
  try {
    console.log("Testing Telegram connection");

    const authSettings =
      await AuthSettings.findOne().select("+telegram.botToken");

    if (!authSettings?.telegram?.enabled) {
      return res.status(400).json({
        success: false,
        message: "Telegram login is disabled",
      });
    }

    if (!authSettings.telegram.botToken) {
      return res.status(400).json({
        success: false,
        message: "Telegram bot token is required",
      });
    }

    // Test connection by getting bot info
    const testUrl = `https://api.telegram.org/bot${authSettings.telegram.botToken}/getMe`;
    const response = await axios.get(testUrl);

    if (response.data && response.data.ok && response.data.result) {
      res.json({
        success: true,
        message: "Telegram connection successful",
        data: {
          botId: response.data.result.id,
          botUsername: response.data.result.username,
          botName: response.data.result.first_name,
        },
      });
    } else {
      return res.status(502).json({
        success: false,
        message: "Invalid response from Telegram API",
      });
    }
  } catch (error) {
    console.error(
      "Telegram test connection error:",
      error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Telegram connection test failed",
      error: error.response?.data?.description || error.message,
    });
  }
};
