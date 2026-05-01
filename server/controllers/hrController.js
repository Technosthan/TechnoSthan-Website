const HRProfile = require("../models/HRProfile");
const fs = require("fs");
const path = require("path");

const resolveOwnerUserId = (req) =>
  req.user?._id?.toString() || req.query?.userId || req.body?.userId || "anonymous";

const toNormalizedEmail = (value) => String(value || "").trim().toLowerCase();

const uploadsDir = path.resolve(__dirname, "..", "uploads");

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const getFileExtension = (mimeType = "") => {
  if (mimeType.includes("jpeg")) return ".jpg";
  if (mimeType.includes("png")) return ".png";
  if (mimeType.includes("webp")) return ".webp";
  if (mimeType.includes("gif")) return ".gif";
  return ".png";
};

const getHRProfiles = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const records = await HRProfile.find({ ownerUserId }).sort({ updatedAt: -1 }).lean();
    res.json(records);
  } catch (err) {
    console.error("❌ Error in getHRProfiles:", err);
    res.status(500).json({ msg: err.message });
  }
};

const createHRProfile = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = toNormalizedEmail(req.body?.email);

    console.log("📝 Creating HR Profile:", { ownerUserId, name, role, email });

    if (!name || !role || !email) {
      return res.status(400).json({ msg: "name, role, and email are required" });
    }

    // Check for global duplicate email first (collection may have unique index on email)
    const existingGlobal = await HRProfile.findOne({ email }).lean();
    if (existingGlobal) {
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

    console.log("✅ HR Profile Created:", profile._id);
    res.status(201).json(profile);
  } catch (err) {
    // Duplicate key handling
    if (err && err.code === 11000) {
      console.warn('Duplicate key error creating HR profile', err.keyValue || err.message);
      return res.status(409).json({ msg: 'Profile with this email already exists' });
    }
    console.error("❌ Error in createHRProfile:", err.message, err.stack);
    res.status(500).json({ msg: err.message });
  }
};

const getHRProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Fetching HR profile by id: ${id}`);
    
    const profile = await HRProfile.findById(id).lean();
    if (!profile) {
      console.log(`⚠️ Profile not found for id: ${id}`);
      return res.status(404).json({ msg: 'HR profile not found' });
    }
    
    console.log(`✅ Returning profile: ${id}`);
    res.json(profile);
  } catch (err) {
    console.error('❌ Error in getHRProfileById:', err);
    res.status(500).json({ msg: err.message });
  }
};

const updateHRProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✏️ Updating HR Profile ${id}`);

    // Find profile by id - no ownership check
    const existing = await HRProfile.findById(id);
    if (!existing) {
      console.log(`⚠️ Profile ${id} not found`);
      return res.status(404).json({ msg: "HR profile not found" });
    }

    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = toNormalizedEmail(req.body?.email);

    if (!name || !role || !email) {
      return res.status(400).json({ msg: "name, role, and email are required" });
    }

    // Check for duplicate email from OTHER profiles
    const duplicate = await HRProfile.findOne({
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
    console.log(`✅ HR Profile updated: ${id}`);
    res.json(existing);
  } catch (err) {
    console.error('❌ Error in updateHRProfile:', err.message);
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

const uploadHRAvatar = async (req, res) => {
  try {
    console.log("📸 Avatar upload request received");
    const image = String(req.body?.image || "");
    if (!image.startsWith("data:image/")) {
      console.warn("⚠️  Invalid image format");
      return res.status(400).json({ msg: "Valid image data is required" });
    }

    const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      console.warn("⚠️  Invalid image payload format");
      return res.status(400).json({ msg: "Invalid image payload" });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    ensureUploadsDir();

    const fileName = `hr-avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${getFileExtension(mimeType)}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    console.log("✅ Avatar saved:", fileName);
    res.status(201).json({ url: `/uploads/${fileName}` });
  } catch (err) {
    console.error("❌ Error in uploadHRAvatar:", err.message, err.stack);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getHRProfiles,
  createHRProfile,
  getHRProfileById,
  updateHRProfile,
  deleteHRProfile,
  uploadHRAvatar
};
