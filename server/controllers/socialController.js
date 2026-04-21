const Social = require("../models/socialModel");

const normalizePhoneNumber = (value = "") => value.replace(/[^0-9+]/g, "").replace(/^\+/, "");

// ================= SAVE SOCIAL DATA =================
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
    res.status(500).json({ msg: err.message });
  }
};

// ================= GET ALL DATA =================
const getSocial = async (req, res) => {
  try {
    const data = await Social.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ================= DELETE =================
const deleteSocial = async (req, res) => {
  try {
    const deleted = await Social.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Data not found" });
    }

    res.json({ msg: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ================= ADD WHATSAPP CONTACT =================
const addWhatsAppContact = async (req, res) => {
  try {
    const { id, name, number } = req.body;

    if (!id || !name || !number) {
      return res.status(400).json({ msg: "ID, Name & Number required" });
    }

    const cleanedNumber = normalizePhoneNumber(number);

    const data = await Social.findById(id);

    if (!data) {
      return res.status(404).json({ msg: "Social data not found" });
    }

    const contacts = data?.socials?.whatsapp_contacts || [];
    const duplicate = contacts.find(
      (contact) => normalizePhoneNumber(contact.number) === cleanedNumber
    );

    if (duplicate) {
      return res.status(409).json({ msg: "This number is already saved" });
    }

    const updated = await Social.findByIdAndUpdate(
      id,
      {
        $push: {
          "socials.whatsapp_contacts": {
            name: name.trim(),
            number: cleanedNumber,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Social data not found" });
    }

    res.json({ msg: "Contact added successfully", data: updated });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ================= DELETE WHATSAPP CONTACT =================
const deleteWhatsAppContact = async (req, res) => {
  try {
    const { id, contactId } = req.params;

    const data = await Social.findById(id);

    if (!data) {
      return res.status(404).json({ msg: "Social data not found" });
    }

    const contacts = data?.socials?.whatsapp_contacts || [];
    const filteredContacts = contacts.filter((contact) => String(contact._id) !== String(contactId));

    if (filteredContacts.length === contacts.length) {
      return res.status(404).json({ msg: "Contact not found" });
    }

    data.socials.whatsapp_contacts = filteredContacts;
    await data.save();

    res.json({ msg: "Contact deleted successfully", data });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ================= GET WHATSAPP CONTACTS =================
const getWhatsAppContacts = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Social.findById(id);

    if (!data) {
      return res.status(404).json({ msg: "Data not found" });
    }

    // ✅ SAFE LINE (important)
    const contacts = data?.socials?.whatsapp_contacts || [];

    res.json(contacts);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ================= SEARCH CONTACT =================
const searchWhatsAppContacts = async (req, res) => {
  try {
    const { id, q } = req.query;

    if (!id || !q) {
      return res.status(400).json({ msg: "ID and search query required" });
    }

    const data = await Social.findById(id);

    if (!data) {
      return res.status(404).json({ msg: "Data not found" });
    }

    // ✅ SAFE LINE (important)
    const contacts = data?.socials?.whatsapp_contacts || [];

    const filtered = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.number.includes(q)
    );

    res.json(filtered);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  saveSocial,
  getSocial,
  deleteSocial,
  addWhatsAppContact,
  getWhatsAppContacts,
  searchWhatsAppContacts,
  deleteWhatsAppContact
};