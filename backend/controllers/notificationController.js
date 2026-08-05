const Notification = require("../models/Notification");

const buildNotificationFilter = (req) => {
  const filter = {
    userId: req.user.id,
  };

  if (req.query.type) {
    filter.type = String(req.query.type).trim();
  }

  if (req.query.deliveryChannel) {
    filter.deliveryChannels = String(req.query.deliveryChannel).trim();
  }

  if (req.query.relatedTaskInstanceId) {
    filter.relatedTaskInstanceId = req.query.relatedTaskInstanceId;
  }

  return filter;
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find(buildNotificationFilter(req))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notifications.map((notification) => ({
        ...notification,
        id: notification._id?.toString?.() || notification.id,
        isRead: Boolean(notification.isRead ?? notification.read),
        read: Boolean(notification.read ?? notification.isRead),
      })),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        $set: {
          read: true,
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};

exports.markDailyTaskNotificationsRead = async (req, res) => {
  try {
    const filter = buildNotificationFilter(req);
    const result = await Notification.updateMany(
      {
        ...filter,
        isRead: false,
      },
      {
        $set: {
          read: true,
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount || 0,
      },
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      ...buildNotificationFilter(req),
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    console.error("Unread notification count error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load unread notification count.",
    });
  }
};
