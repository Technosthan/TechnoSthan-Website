import User from "../auth/user.model.js";
import Content from "../content/content.model.js";
import Question from "../quiz/question.model.js";
import QuizResult from "../quiz/quizResult.model.js";

export const getAdminStats = async (req, res) => {
  try {
    // Get total counts
    const [totalUsers, totalContent, totalQuestions, totalQuizResults] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Question.countDocuments(),
      QuizResult.countDocuments()
    ]);

    // Get user role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Get recent quiz results with user info
    const recentQuizResults = await QuizResult.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('score totalQuestions createdAt userId');

    // Get quiz performance stats
    const quizStats = await QuizResult.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } },
          totalAttempts: { $sum: 1 },
          highestScore: { $max: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } },
          lowestScore: { $min: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } }
        }
      }
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
        lowestScore: 0
      },
      recentActivity: recentQuizResults.map(result => ({
        userName: result.userId?.name || 'Unknown',
        userEmail: result.userId?.email || 'Unknown',
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: Math.round((result.score / result.totalQuestions) * 100),
        date: result.createdAt
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics"
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'student'"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role"
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
        message: "Cannot delete your own account"
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
};