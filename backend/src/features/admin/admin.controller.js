import User from "../auth/user.model.js";
import Content from "../content/content.model.js";
import Question from "../quiz/question.model.js";
import QuizResult from "../quiz/quizResult.model.js";
import Settings from "./settings.model.js";
import Announcement from "./announcement.model.js";

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
    // Temporary test - return static data
    const settings = {
      appName: "Test App",
      theme: "default",
      aiSettings: { temperature: 0.7 },
    };
    console.log("Returning settings:", settings);
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

export const updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, {
        new: true,
      });
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
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

    const announcement = await Announcement.create(announcementData);

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

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

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
