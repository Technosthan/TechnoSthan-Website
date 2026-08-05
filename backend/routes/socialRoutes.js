const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  saveSocial,
  getSocial,
  deleteSocial,
  getSocialPlatforms,
  addSocialPlatform,
  addWhatsAppContact,
  getWhatsAppContacts,
  searchWhatsAppContacts,
  deleteWhatsAppContact,
  getPlatformConnections,
  upsertPlatformConnection,
  sendSocial,
} = require("../controllers/socialController");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

router.use(protect);

// ================= EXISTING ROUTES =================
router.post("/", saveSocial);
router.get("/", getSocial);
router.get(
  "/platforms",
  requireWorkspaceFeature("socialPostingEnabled"),
  getSocialPlatforms,
);
router.post("/platforms", addSocialPlatform);
router.delete("/:id", deleteSocial);

// ================= NEW WHATSAPP CONTACT ROUTES =================

// ➕ Add contact
router.post("/add-contact", addWhatsAppContact);

// 📋 Get all contacts (by social id)
router.get("/contacts/:id", getWhatsAppContacts);

// 🗑️ Delete contact
router.delete("/contacts/:id/:contactId", deleteWhatsAppContact);

// 🔍 Search contact
router.get("/search", searchWhatsAppContacts);

// ================= SOCIAL PLATFORM DISPATCH ROUTES =================
router.get(
  "/connections",
  requireWorkspaceFeature("socialPostingEnabled"),
  getPlatformConnections,
);
router.post(
  "/connections",
  requireWorkspaceFeature("socialPostingEnabled"),
  upsertPlatformConnection,
);
router.post(
  "/send",
  requireWorkspaceFeature("socialPostingEnabled"),
  sendSocial,
);

// Legacy aliases for older clients
router.post("/social", saveSocial);
router.get("/social", getSocial);
router.delete("/social/:id", deleteSocial);
router.post("/social/add-contact", addWhatsAppContact);
router.get("/social/contacts/:id", getWhatsAppContacts);
router.delete("/social/contacts/:id/:contactId", deleteWhatsAppContact);
router.get("/social/search", searchWhatsAppContacts);
router.get(
  "/social/connections",
  requireWorkspaceFeature("socialPostingEnabled"),
  getPlatformConnections,
);
router.post(
  "/social/connections",
  requireWorkspaceFeature("socialPostingEnabled"),
  upsertPlatformConnection,
);
router.post(
  "/social/send",
  requireWorkspaceFeature("socialPostingEnabled"),
  sendSocial,
);

module.exports = router;
