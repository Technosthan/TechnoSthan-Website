const Social = require("../models/socialModel");
const { Platform } = require("../models/Platform");
const SocialConnection = require("../models/SocialConnection");
const SocialPostLog = require("../models/SocialPostLog");
const axios = require("axios");

const {
  ALLOWED_PLATFORMS,
  normalizePlatform,
  assertSupportedPlatforms,
  dispatchByPlatform,
} = require("../services/socialDispatchService");
const {
  resolveWorkspaceFeatureAccess,
} = require("../services/workspaceSettingsService");

const normalizePhoneNumber = (value = "") =>
  value.replace(/[^0-9+]/g, "").replace(/^\+/, "");

// simple & safe
const resolveUserId = (req) => req.user?._id || req.body?.userId || "anonymous";

const getErrorStatus = (err) => err.statusCode || 500;
const canAccessFeature = (featureKey, settings, user) =>
  resolveWorkspaceFeatureAccess(featureKey, settings, user).allowed;

const defaultPlatformSeed = [
  {
    platformId: "facebook",
    name: "Facebook",
    icon: "Facebook",
    color: "#1877F2",
    charLimit: 63206,
    category: "social",
  },
  {
    platformId: "instagram",
    name: "Instagram",
    icon: "Instagram",
    color: "#E4405F",
    charLimit: 2200,
    category: "social",
  },
  {
    platformId: "linkedin",
    name: "LinkedIn",
    icon: "LinkedIn",
    color: "#0A66C2",
    charLimit: 3000,
    category: "professional",
  },
  {
    platformId: "twitter",
    name: "Twitter/X",
    icon: "Twitter",
    color: "#1DA1F2",
    charLimit: 280,
    category: "social",
  },
  {
    platformId: "whatsapp",
    name: "WhatsApp",
    icon: "WhatsApp",
    color: "#25D366",
    charLimit: 65536,
    category: "messaging",
  },
  {
    platformId: "telegram",
    name: "Telegram",
    icon: "Telegram",
    color: "#0088CC",
    charLimit: 4096,
    category: "messaging",
  },
  {
    platformId: "youtube",
    name: "YouTube",
    icon: "YouTube",
    color: "#FF0000",
    charLimit: 5000,
    category: "content",
  },
];

const ensureDefaultPlatforms = async () => {
  const count = await Platform.countDocuments({ deletedAt: null });
  if (count > 0) return;

  const docs = defaultPlatformSeed.map((platform, index) => ({
    ...platform,
    isActive: true,
    isVisibleToUsers: true,
    isCustom: false,
    gridPosition: index,
    metadata: {
      category: platform.category,
      features: ["copy", "share", "delete"],
      requiresAuth: false,
      description: `${platform.name} publishing channel`,
    },
  }));

  await Platform.insertMany(docs, { ordered: false });
};

const toPlatformDTO = (record) => ({
  _id: record._id,
  id: record.platformId,
  name: record.name,
  icon: record.icon,
  color: record.color,
  charLimit: record.charLimit,
});

// ================= SAVE =================
const saveSocial = async (req, res) => {
  try {
    const { socials } = req.body;
    if (!socials || Object.keys(socials).length === 0) {
      return res.status(400).json({ msg: "No social data provided" });
    }

    const data = new Social({
      socials: {
        ...socials,
        whatsapp_contacts: socials.whatsapp_contacts || [],
      },
    });

    await data.save();
    res.json({ msg: "Saved successfully", data });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= GET CONNECTION =================
const getPlatformConnections = async (req, res) => {
  try {
    const userId = req.query.userId || "anonymous";
    const records = await SocialConnection.find({ userId }).lean();

    const statusMap = ALLOWED_PLATFORMS.reduce((acc, platform) => {
      const record = records.find((r) => r.platform === platform);
      acc[platform] = {
        connected: Boolean(record?.connected),
        createdAt: record?.createdAt || null,
      };
      return acc;
    }, {});

    res.json({ userId, connections: statusMap });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= UPSERT =================
const upsertPlatformConnection = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const platform = normalizePlatform(req.body.platform);
    const accessToken = String(req.body.accessToken || "").trim();

    assertSupportedPlatforms([platform]);

    const connection = await SocialConnection.findOneAndUpdate(
      { userId, platform },
      { $set: { accessToken, connected: Boolean(accessToken) } },
      { new: true, upsert: true },
    );

    res.json({ msg: "Connection updated", connection });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= SEND SOCIAL =================
const sendSocial = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    if (!canAccessFeature("socialPostingEnabled", settings, req.user)) {
      return res.status(403).json({
        success: false,
        msg: "Social posting is currently disabled",
      });
    }

    const userId = resolveUserId(req);
    const message = String(req.body.message || "").trim();
    const type = req.body.type;

    const requestedPlatforms = Array.isArray(req.body.platforms)
      ? req.body.platforms
      : [];

    const platforms = requestedPlatforms.map(normalizePlatform).filter(Boolean);

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }
    if (platforms.length === 0) {
      return res.status(400).json({ msg: "At least one platform is required" });
    }
    if (!["post", "message"].includes(type)) {
      return res.status(400).json({ msg: "Type must be 'post' or 'message'" });
    }

    if (!canAccessFeature("platformDispatchEnabled", settings, req.user)) {
      return res.status(403).json({
        success: false,
        msg: "Platform dispatch is currently disabled",
      });
    }

    if (
      req.body.scheduledAt &&
      !canAccessFeature("scheduledPostsEnabled", settings, req.user)
    ) {
      return res.status(403).json({
        success: false,
        msg: "Scheduled posts are currently disabled",
      });
    }

    const disallowed = platforms.filter((platform) => {
      if (
        platform === "whatsapp" &&
        !canAccessFeature("whatsappEnabled", settings, req.user)
      )
        return true;
      if (
        platform === "linkedin" &&
        !canAccessFeature("linkedinEnabled", settings, req.user)
      )
        return true;
      if (
        platform === "instagram" &&
        !canAccessFeature("instagramEnabled", settings, req.user)
      )
        return true;
      return false;
    });

    if (disallowed.length > 0) {
      return res.status(403).json({
        success: false,
        msg: `Social dispatch is disabled for: ${disallowed.join(", ")}`,
      });
    }

    assertSupportedPlatforms(platforms);

    const connectionRecords = await SocialConnection.find({
      userId,
      platform: { $in: platforms },
    }).lean();

    const connectionMap = connectionRecords.reduce((acc, rec) => {
      acc[rec.platform] = rec;
      return acc;
    }, {});

    const results = [];

    for (const platform of platforms) {
      const connection = connectionMap[platform];
      const token = connection?.connected ? connection.accessToken : "";

      try {
        const outcome = await dispatchByPlatform({
          platform,
          message,
          type,
          token,
        });

        results.push({
          platform,
          success: Boolean(outcome.success),
          detail: outcome.detail,
        });
      } catch (error) {
        results.push({
          platform,
          success: false,
          detail: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const status =
      successCount === results.length
        ? "success"
        : successCount > 0
          ? "partial"
          : "failed";

    const log = await SocialPostLog.create({
      userId,
      message,
      platforms,
      type,
      status,
      timestamp: new Date(),
      results,
    });

    res.status(200).json({
      msg: "Social dispatch completed",
      status,
      results,
      logId: log._id,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= PLATFORM GRID =================
const getSocialPlatforms = async (req, res) => {
  try {
    const settings = req.workspaceSettings?.settings || {};
    await ensureDefaultPlatforms();

    const platforms = await Platform.find({
      deletedAt: null,
      isVisibleToUsers: true,
      isActive: true,
    })
      .sort({ gridPosition: 1, createdAt: 1 })
      .lean();

    const filtered = platforms.filter((record) => {
      if (!canAccessFeature("socialPostingEnabled", settings, req.user))
        return false;
      if (
        record.platformId === "whatsapp" &&
        !canAccessFeature("whatsappEnabled", settings, req.user)
      )
        return false;
      if (
        record.platformId === "linkedin" &&
        !canAccessFeature("linkedinEnabled", settings, req.user)
      )
        return false;
      if (
        record.platformId === "instagram" &&
        !canAccessFeature("instagramEnabled", settings, req.user)
      )
        return false;
      return true;
    });

    res.json(filtered.map(toPlatformDTO));
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

const addSocialPlatform = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const incomingId = String(req.body?.id || req.body?.platformId || name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    if (!name || !incomingId) {
      return res.status(400).json({ msg: "name and id are required" });
    }

    const existing = await Platform.findOne({
      platformId: incomingId,
      deletedAt: null,
    }).lean();
    if (existing) {
      return res.status(409).json({ msg: "Platform already exists" });
    }

    const maxGrid = await Platform.findOne({ deletedAt: null })
      .sort({ gridPosition: -1 })
      .lean();

    const platform = await Platform.create({
      platformId: incomingId,
      name,
      icon: String(req.body?.icon || "Link"),
      color: String(req.body?.color || "#1DA1F2"),
      charLimit: Number(req.body?.charLimit) || 5000,
      isActive: true,
      isVisibleToUsers: true,
      isCustom: true,
      gridPosition: Number(maxGrid?.gridPosition || 0) + 1,
      metadata: {
        category: "custom",
        features: ["copy", "share", "delete"],
        requiresAuth: false,
        description: `${name} custom platform`,
      },
    });

    res.status(201).json(toPlatformDTO(platform));
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= GET =================
const getSocial = async (req, res) => {
  try {
    const userId = req.query.userId || "anonymous";
    const data = await Social.find({}).lean();
    res.json(data);
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= DELETE =================
const deleteSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const platformDeleted = await Platform.findOneAndDelete({ _id: id });
    if (platformDeleted) {
      return res.json({
        msg: "Platform deleted successfully",
        entity: "platform",
      });
    }

    await Social.findByIdAndDelete(id);
    res.json({ msg: "Deleted successfully", entity: "social" });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= WHATSAPP CONTACTS =================
const addWhatsAppContact = async (req, res) => {
  try {
    const { socialId, contact } = req.body;
    if (!socialId || !contact?.phone) {
      return res
        .status(400)
        .json({ msg: "socialId and contact.phone required" });
    }
    const social = await Social.findById(socialId);
    if (!social) {
      return res.status(404).json({ msg: "Social record not found" });
    }
    social.socials.whatsapp_contacts = social.socials.whatsapp_contacts || [];
    social.socials.whatsapp_contacts.push({
      ...contact,
      createdAt: new Date(),
    });
    await social.save();
    res.json({
      msg: "Contact added",
      contacts: social.socials.whatsapp_contacts,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

const getWhatsAppContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const social = await Social.findById(id).lean();
    if (!social) {
      return res.status(404).json({ msg: "Social record not found" });
    }
    res.json(social.socials?.whatsapp_contacts || []);
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

const searchWhatsAppContacts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const regex = new RegExp(q, "i");
    const records = await Social.find({
      "socials.whatsapp_contacts": { $elemMatch: { name: regex } },
    }).lean();

    const contacts = [];
    for (const record of records) {
      const matches = (record.socials?.whatsapp_contacts || []).filter(
        (c) => regex.test(c.name) || regex.test(c.phone),
      );
      contacts.push(...matches);
    }
    res.json(contacts);
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

const deleteWhatsAppContact = async (req, res) => {
  try {
    const { id, contactId } = req.params;
    const social = await Social.findById(id);
    if (!social) {
      return res.status(404).json({ msg: "Social record not found" });
    }
    social.socials.whatsapp_contacts = (
      social.socials.whatsapp_contacts || []
    ).filter((c) => c._id?.toString() !== contactId);
    await social.save();
    res.json({
      msg: "Contact deleted",
      contacts: social.socials.whatsapp_contacts,
    });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

module.exports = {
  saveSocial,
  getSocial,
  deleteSocial,
  addWhatsAppContact,
  getWhatsAppContacts,
  searchWhatsAppContacts,
  deleteWhatsAppContact,
  getPlatformConnections,
  upsertPlatformConnection,
  sendSocial,
  getSocialPlatforms,
  addSocialPlatform,
};
