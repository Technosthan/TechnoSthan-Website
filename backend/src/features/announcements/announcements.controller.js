import Announcement from "../admin/announcement.model.js";
import AnnouncementDismissal from "./announcementDismissal.model.js";

// Public announcements endpoint
export const getPublicAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    // Determine audience based on authenticated user (if present)
    const userRole = req.user?.role || null;

    const audienceFilter =
      userRole === "admin"
        ? {} // admins see all
        : { targetAudience: { $in: ["all", userRole || "all"] } };

    let announcementsQuery = Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      $or: [
        { deliveryChannel: { $in: ["dashboard", "both"] } },
        { deliveryChannel: { $exists: false } }, // For backward compatibility
      ],
      ...audienceFilter,
    }).sort({ createdAt: -1 });

    let announcements = await announcementsQuery.lean();

    // If user authenticated, filter out dismissed announcements
    if (req.user) {
      const dismissed = await AnnouncementDismissal.find({ user: req.user._id })
        .select("announcement")
        .lean();
      const dismissedIds = new Set(
        dismissed.map((d) => String(d.announcement)),
      );
      announcements = announcements.filter(
        (a) => !dismissedIds.has(String(a._id)),
      );
    }

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get public announcements error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch announcements" });
  }
};

export const dismissAnnouncement = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const { id } = req.params;
    const existing = await AnnouncementDismissal.findOne({
      user: req.user._id,
      announcement: id,
    });
    if (existing)
      return res.json({ success: true, message: "Already dismissed" });
    await AnnouncementDismissal.create({
      user: req.user._id,
      announcement: id,
    });
    res.json({ success: true, message: "Announcement dismissed" });
  } catch (error) {
    console.error("Dismiss announcement error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to dismiss announcement" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    if (!req.user)
      return res.status(200).json({ success: true, data: { count: 0 } });
    const now = new Date();

    const userRole = req.user?.role || null;

    const audienceFilter =
      userRole === "admin"
        ? {}
        : { targetAudience: { $in: ["all", userRole || "all"] } };

    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      ...audienceFilter,
    })
      .select("_id")
      .lean();

    const announcementIds = announcements.map((a) => a._id);
    const dismissed = await AnnouncementDismissal.find({
      user: req.user._id,
      announcement: { $in: announcementIds },
    })
      .select("announcement")
      .lean();
    const dismissedSet = new Set(dismissed.map((d) => String(d.announcement)));
    const unreadCount = announcements.filter(
      (a) => !dismissedSet.has(String(a._id)),
    ).length;

    res.json({ success: true, data: { count: unreadCount } });
  } catch (error) {
    console.error("Get unread count error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get unread count" });
  }
};

export default { getPublicAnnouncements, dismissAnnouncement, getUnreadCount };
