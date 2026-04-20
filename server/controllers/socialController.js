const Social = require("../models/socialModel");

//SAVE SOCIAL DATA
const saveSocial = async (req, res) => {
  try {
    const { socials } = req.body;

    // VALIDATION
    if (!socials || Object.keys(socials).length === 0) {
      return res.status(400).json({ msg: "No social data provided" });
    }

    const data = new Social({ socials });

    await data.save();

    res.json({ msg: "Saved successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET ALL DATA
const getSocial = async (req, res) => {
  try {
    const data = await Social.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching data" });
  }
};

// DELETE
const deleteSocial = async (req, res) => {
  try {
    await Social.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting" });
  }
};

module.exports = { saveSocial, getSocial, deleteSocial };