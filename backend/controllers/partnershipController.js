const Partnership = require("../models/Partnership");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeList = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

const getPartnerships = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const partnerships = await Partnership.find(filter)
      .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: partnerships });
  } catch (error) {
    console.error("Get partnerships error:", error);
    res.status(500).json({ success: false, message: "Unable to load partnerships" });
  }
};

const getPartnershipBySlug = async (req, res) => {
  try {
    const partnership = await Partnership.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();
    if (!partnership) {
      return res.status(404).json({ success: false, message: "Partnership not found" });
    }
    res.json({ success: true, data: partnership });
  } catch (error) {
    console.error("Get partnership error:", error);
    res.status(500).json({ success: false, message: "Unable to load partnership" });
  }
};

const createPartnership = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = slugify(req.body.slug || title);
    const exists = await Partnership.findOne({ slug });
    if (exists) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const partnership = await Partnership.create({
      title,
      slug,
      type: String(req.body.type || "").trim(),
      description: String(req.body.description || "").trim(),
      benefits: normalizeList(req.body.benefits),
      process: normalizeList(req.body.process),
      logoUrl: String(req.body.logoUrl || "").trim(),
      featured: Boolean(req.body.featured),
      isActive: req.body.isActive === undefined ? true : Boolean(req.body.isActive),
      sortOrder: Number(req.body.sortOrder) || 0,
    });

    res.status(201).json({ success: true, data: partnership });
  } catch (error) {
    console.error("Create partnership error:", error);
    res.status(500).json({ success: false, message: "Unable to create partnership" });
  }
};

const updatePartnership = async (req, res) => {
  try {
    const partnership = await Partnership.findById(req.params.id);
    if (!partnership) {
      return res.status(404).json({ success: false, message: "Partnership not found" });
    }

    if (req.body.title !== undefined) partnership.title = String(req.body.title || "").trim();
    if (req.body.slug !== undefined || req.body.title !== undefined) {
      const nextSlug = slugify(req.body.slug || req.body.title || partnership.title);
      if (nextSlug && nextSlug !== partnership.slug) {
        const exists = await Partnership.findOne({ slug: nextSlug, _id: { $ne: partnership._id } });
        if (exists) {
          return res.status(409).json({ success: false, message: "Slug already exists" });
        }
        partnership.slug = nextSlug;
      }
    }
    if (req.body.type !== undefined) partnership.type = String(req.body.type || "").trim();
    if (req.body.description !== undefined) partnership.description = String(req.body.description || "").trim();
    if (req.body.benefits !== undefined) partnership.benefits = normalizeList(req.body.benefits);
    if (req.body.process !== undefined) partnership.process = normalizeList(req.body.process);
    if (req.body.logoUrl !== undefined) partnership.logoUrl = String(req.body.logoUrl || "").trim();
    if (req.body.featured !== undefined) partnership.featured = Boolean(req.body.featured);
    if (req.body.isActive !== undefined) partnership.isActive = Boolean(req.body.isActive);
    if (req.body.sortOrder !== undefined) partnership.sortOrder = Number(req.body.sortOrder) || 0;

    await partnership.save();
    res.json({ success: true, data: partnership });
  } catch (error) {
    console.error("Update partnership error:", error);
    res.status(500).json({ success: false, message: "Unable to update partnership" });
  }
};

const deletePartnership = async (req, res) => {
  try {
    const partnership = await Partnership.findById(req.params.id);
    if (!partnership) {
      return res.status(404).json({ success: false, message: "Partnership not found" });
    }

    await partnership.deleteOne();
    res.json({ success: true, message: "Partnership deleted" });
  } catch (error) {
    console.error("Delete partnership error:", error);
    res.status(500).json({ success: false, message: "Unable to delete partnership" });
  }
};

const updatePartnershipStatus = async (req, res) => {
  try {
    const partnership = await Partnership.findById(req.params.id);
    if (!partnership) {
      return res.status(404).json({ success: false, message: "Partnership not found" });
    }

    partnership.isActive =
      req.body.isActive === undefined ? !partnership.isActive : Boolean(req.body.isActive);
    await partnership.save();

    res.json({ success: true, data: partnership });
  } catch (error) {
    console.error("Update partnership status error:", error);
    res.status(500).json({ success: false, message: "Unable to update partnership status" });
  }
};

module.exports = {
  getPartnerships,
  getPartnershipBySlug,
  createPartnership,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
};

