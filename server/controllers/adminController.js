const User = require("../models/User");
const { getRoleVariants, normalizeRole } = require("../constants/rbac");

// GET /api/admin/users?q=search
const getUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const role = normalizeRole(req.query.role);
    const ids = String(req.query.ids || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const filter = { isActive: true };
    if (ids.length > 0) {
      filter._id = { $in: ids };
    }
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: re }, { email: re }];
    }
    if (req.query.role) {
      filter.role = { $in: getRoleVariants(role) };
    }

    const rows = await User.find(filter)
      .limit(50)
      .select("_id name email role")
      .lean();

    const users = rows.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Get admin users error:", err);
    res.status(500).json({ success: false, message: "Unable to load users" });
  }
};

module.exports = {
  getUsers,
};
