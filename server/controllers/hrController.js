const HRProfile = require("../models/HRProfile");

const resolveOwnerUserId = (req) =>
  req.user?._id?.toString() || req.query?.userId || req.body?.userId || "anonymous";

const toNormalizedEmail = (value) => String(value || "").trim().toLowerCase();

const getHRProfiles = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const records = await HRProfile.find({ ownerUserId }).sort({ updatedAt: -1 }).lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const createHRProfile = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = toNormalizedEmail(req.body?.email);

    if (!name || !role || !email) {
      return res.status(400).json({ msg: "name, role, and email are required" });
    }

    const existing = await HRProfile.findOne({ ownerUserId, email }).lean();
    if (existing) {
      return res.status(409).json({ msg: "Profile with this email already exists" });
    }

    const profile = await HRProfile.create({
      ownerUserId,
      name,
      role,
      email,
      phone: String(req.body?.phone || "").trim(),
      color: String(req.body?.color || "#6366f1").trim(),
      avatarUrl: String(req.body?.avatarUrl || "")
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateHRProfile = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const { id } = req.params;

    const existing = await HRProfile.findOne({ _id: id, ownerUserId });
    if (!existing) {
      return res.status(404).json({ msg: "HR profile not found" });
    }

    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = toNormalizedEmail(req.body?.email);

    if (!name || !role || !email) {
      return res.status(400).json({ msg: "name, role, and email are required" });
    }

    const duplicate = await HRProfile.findOne({
      ownerUserId,
      email,
      _id: { $ne: existing._id }
    }).lean();

    if (duplicate) {
      return res.status(409).json({ msg: "Another profile already uses this email" });
    }

    existing.name = name;
    existing.role = role;
    existing.email = email;
    existing.phone = String(req.body?.phone || "").trim();
    existing.color = String(req.body?.color || "#6366f1").trim();
    existing.avatarUrl = String(req.body?.avatarUrl || "");

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteHRProfile = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const { id } = req.params;

    const deleted = await HRProfile.findOneAndDelete({ _id: id, ownerUserId });
    if (!deleted) {
      return res.status(404).json({ msg: "HR profile not found" });
    }

    res.json({ msg: "HR profile deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getHRProfiles,
  createHRProfile,
  updateHRProfile,
  deleteHRProfile
};
