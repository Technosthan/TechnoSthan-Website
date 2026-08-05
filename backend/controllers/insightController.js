const Insight = require("../models/Insight");

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

const getInsights = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const insights = await Insight.find(filter)
      .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: insights });
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({ success: false, message: "Unable to load insights" });
  }
};

const getInsightBySlug = async (req, res) => {
  try {
    const insight = await Insight.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();
    if (!insight) {
      return res.status(404).json({ success: false, message: "Insight not found" });
    }
    res.json({ success: true, data: insight });
  } catch (error) {
    console.error("Get insight error:", error);
    res.status(500).json({ success: false, message: "Unable to load insight" });
  }
};

const createInsight = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = slugify(req.body.slug || title);
    const exists = await Insight.findOne({ slug });
    if (exists) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const insight = await Insight.create({
      title,
      slug,
      category: String(req.body.category || "").trim(),
      summary: String(req.body.summary || "").trim(),
      body: String(req.body.body || "").trim(),
      imageUrl: String(req.body.imageUrl || "").trim(),
      tags: normalizeList(req.body.tags),
      featured: Boolean(req.body.featured),
      isActive: req.body.isActive === undefined ? true : Boolean(req.body.isActive),
      sortOrder: Number(req.body.sortOrder) || 0,
      publishDate: req.body.publishDate ? new Date(req.body.publishDate) : null,
    });

    res.status(201).json({ success: true, data: insight });
  } catch (error) {
    console.error("Create insight error:", error);
    res.status(500).json({ success: false, message: "Unable to create insight" });
  }
};

const updateInsight = async (req, res) => {
  try {
    const insight = await Insight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ success: false, message: "Insight not found" });
    }

    if (req.body.title !== undefined) insight.title = String(req.body.title || "").trim();
    if (req.body.slug !== undefined || req.body.title !== undefined) {
      const nextSlug = slugify(req.body.slug || req.body.title || insight.title);
      if (nextSlug && nextSlug !== insight.slug) {
        const exists = await Insight.findOne({ slug: nextSlug, _id: { $ne: insight._id } });
        if (exists) {
          return res.status(409).json({ success: false, message: "Slug already exists" });
        }
        insight.slug = nextSlug;
      }
    }
    if (req.body.category !== undefined) insight.category = String(req.body.category || "").trim();
    if (req.body.summary !== undefined) insight.summary = String(req.body.summary || "").trim();
    if (req.body.body !== undefined) insight.body = String(req.body.body || "").trim();
    if (req.body.imageUrl !== undefined) insight.imageUrl = String(req.body.imageUrl || "").trim();
    if (req.body.tags !== undefined) insight.tags = normalizeList(req.body.tags);
    if (req.body.featured !== undefined) insight.featured = Boolean(req.body.featured);
    if (req.body.isActive !== undefined) insight.isActive = Boolean(req.body.isActive);
    if (req.body.sortOrder !== undefined) insight.sortOrder = Number(req.body.sortOrder) || 0;
    if (req.body.publishDate !== undefined) {
      insight.publishDate = req.body.publishDate ? new Date(req.body.publishDate) : null;
    }

    await insight.save();
    res.json({ success: true, data: insight });
  } catch (error) {
    console.error("Update insight error:", error);
    res.status(500).json({ success: false, message: "Unable to update insight" });
  }
};

const deleteInsight = async (req, res) => {
  try {
    const insight = await Insight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ success: false, message: "Insight not found" });
    }

    await insight.deleteOne();
    res.json({ success: true, message: "Insight deleted" });
  } catch (error) {
    console.error("Delete insight error:", error);
    res.status(500).json({ success: false, message: "Unable to delete insight" });
  }
};

const updateInsightStatus = async (req, res) => {
  try {
    const insight = await Insight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ success: false, message: "Insight not found" });
    }

    insight.isActive =
      req.body.isActive === undefined ? !insight.isActive : Boolean(req.body.isActive);
    await insight.save();

    res.json({ success: true, data: insight });
  } catch (error) {
    console.error("Update insight status error:", error);
    res.status(500).json({ success: false, message: "Unable to update insight status" });
  }
};

module.exports = {
  getInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
  updateInsightStatus,
};

