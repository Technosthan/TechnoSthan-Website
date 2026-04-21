const express = require("express");
const router = express.Router();

const {
  saveSocial,
  getSocial,
  deleteSocial,
  addWhatsAppContact,
  getWhatsAppContacts,
  searchWhatsAppContacts,
  deleteWhatsAppContact
} = require("../controllers/socialController");

// ================= EXISTING ROUTES =================
router.post("/", saveSocial);
router.get("/", getSocial);
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

// Legacy aliases for older clients
router.post("/social", saveSocial);
router.get("/social", getSocial);
router.delete("/social/:id", deleteSocial);
router.post("/social/add-contact", addWhatsAppContact);
router.get("/social/contacts/:id", getWhatsAppContacts);
router.delete("/social/contacts/:id/:contactId", deleteWhatsAppContact);
router.get("/social/search", searchWhatsAppContacts);

module.exports = router;