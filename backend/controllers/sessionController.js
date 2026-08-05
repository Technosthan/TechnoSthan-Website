const User = require("../models/User");

exports.recordSessionActivity = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activityAt = new Date();
    await User.updateOne(
      { _id: req.user.id },
      { $set: { lastActivityAt: activityAt } },
    );

    return res.status(200).json({
      success: true,
      data: {
        lastActivityAt: activityAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Record session activity error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to record session activity",
    });
  }
};
