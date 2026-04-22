const Social = require("../models/socialModel");
const SocialConnection = require("../models/SocialConnection");
const SocialPostLog = require("../models/SocialPostLog");
const axios = require("axios");

const {
  ALLOWED_PLATFORMS,
  normalizePlatform,
  assertSupportedPlatforms,
  dispatchByPlatform
} = require("../services/socialDispatchService");

const normalizePhoneNumber = (value = "") =>
  value.replace(/[^0-9+]/g, "").replace(/^\+/, "");

// simple & safe
const resolveUserId = (req) =>
  req.user?._id || req.body?.userId || "anonymous";

const getErrorStatus = (err) => err.statusCode || 500;

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
        whatsapp_contacts: socials.whatsapp_contacts || []
      }
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
        createdAt: record?.createdAt || null
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
      { new: true, upsert: true }
    );

    res.json({ msg: "Connection updated", connection });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= SEND SOCIAL =================
const sendSocial = async (req, res) => {
  try {
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

    assertSupportedPlatforms(platforms);

    const connectionRecords = await SocialConnection.find({
      userId,
      platform: { $in: platforms }
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
        // 🔥 TELEGRAM (direct)
        if (platform === "telegram") {
          const TELEGRAM_TOKEN = "8775415258:AAEsvqWgo94fYWbhZFK6pbb2MlMRUS5Ktss";
          const CHAT_ID = "1918290844";

          if (!TELEGRAM_TOKEN || !CHAT_ID) {
            throw new Error("Telegram token/chatId missing");
          }

          await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            { chat_id: CHAT_ID, text: message }
          );

          results.push({
            platform,
            success: true,
            detail: "Telegram message sent"
          });
          continue;
        }

        // other platforms
        const outcome = await dispatchByPlatform({
          platform,
          message,
          type,
          token
        });

        results.push({
          platform,
          success: Boolean(outcome.success),
          detail: outcome.detail
        });
      } catch (error) {
        results.push({
          platform,
          success: false,
          detail: error.message
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
      results
    });

    res.status(200).json({
      msg: "Social dispatch completed",
      status,
      results,
      logId: log._id
    });
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
    await Social.findByIdAndDelete(id);
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(getErrorStatus(err)).json({ msg: err.message });
  }
};

// ================= WHATSAPP CONTACTS =================
const addWhatsAppContact = async (req, res) => {
  try {
    const { socialId, contact } = req.body;
    if (!socialId || !contact?.phone) {
      return res.status(400).json({ msg: "socialId and contact.phone required" });
    }
    const social = await Social.findById(socialId);
    if (!social) {
      return res.status(404).json({ msg: "Social record not found" });
    }
    social.socials.whatsapp_contacts = social.socials.whatsapp_contacts || [];
    social.socials.whatsapp_contacts.push({
      ...contact,
      createdAt: new Date()
    });
    await social.save();
    res.json({ msg: "Contact added", contacts: social.socials.whatsapp_contacts });
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
      "socials.whatsapp_contacts": { $elemMatch: { name: regex } }
    }).lean();
    
    const contacts = [];
    for (const record of records) {
      const matches = (record.socials?.whatsapp_contacts || []).filter(
        c => regex.test(c.name) || regex.test(c.phone)
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
    social.socials.whatsapp_contacts = (social.socials.whatsapp_contacts || []).filter(
      c => c._id?.toString() !== contactId
    );
    await social.save();
    res.json({ msg: "Contact deleted", contacts: social.socials.whatsapp_contacts });
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
  sendSocial
};