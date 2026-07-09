import FormNotification from "../form/formNotification.model.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await FormNotification.find({
      recipientUserId: userId,
      channel: "dashboard",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load notifications",
    });
  }
};

export const getMyNotificationCount = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const count = await FormNotification.countDocuments({
      recipientUserId: userId,
      channel: "dashboard",
      readAt: null,
      status: "sent",
    });

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load notification count",
    });
  }
};

export const markMyNotificationRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notification = await FormNotification.findOne({
      _id: req.params.notificationId,
      recipientUserId: userId,
      channel: "dashboard",
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      data: notification.toObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update notification",
    });
  }
};
