const Project = require("../models/Project");

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

const getProjects = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const projects = await Project.find(filter)
      .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ success: false, message: "Unable to load projects" });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: "Unable to load project" });
  }
};

const createProject = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = slugify(req.body.slug || title);
    const exists = await Project.findOne({ slug });
    if (exists) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const project = await Project.create({
      title,
      slug,
      category: String(req.body.category || "").trim(),
      city: String(req.body.city || "").trim(),
      state: String(req.body.state || "").trim(),
      status: String(req.body.status || "").trim(),
      area: String(req.body.area || "").trim(),
      developmentType: String(req.body.developmentType || "").trim(),
      timeline: String(req.body.timeline || "").trim(),
      summary: String(req.body.summary || "").trim(),
      description: String(req.body.description || "").trim(),
      imageUrl: String(req.body.imageUrl || "").trim(),
      brochureUrl: String(req.body.brochureUrl || "").trim(),
      gallery: normalizeList(req.body.gallery),
      facts: normalizeList(req.body.facts),
      featured: Boolean(req.body.featured),
      isActive: req.body.isActive === undefined ? true : Boolean(req.body.isActive),
      sortOrder: Number(req.body.sortOrder) || 0,
      publishDate: req.body.publishDate ? new Date(req.body.publishDate) : null,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: "Unable to create project" });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (req.body.title !== undefined) project.title = String(req.body.title || "").trim();
    if (req.body.slug !== undefined || req.body.title !== undefined) {
      const nextSlug = slugify(req.body.slug || req.body.title || project.title);
      if (nextSlug && nextSlug !== project.slug) {
        const exists = await Project.findOne({ slug: nextSlug, _id: { $ne: project._id } });
        if (exists) {
          return res.status(409).json({ success: false, message: "Slug already exists" });
        }
        project.slug = nextSlug;
      }
    }
    if (req.body.category !== undefined) project.category = String(req.body.category || "").trim();
    if (req.body.city !== undefined) project.city = String(req.body.city || "").trim();
    if (req.body.state !== undefined) project.state = String(req.body.state || "").trim();
    if (req.body.status !== undefined) project.status = String(req.body.status || "").trim();
    if (req.body.area !== undefined) project.area = String(req.body.area || "").trim();
    if (req.body.developmentType !== undefined) project.developmentType = String(req.body.developmentType || "").trim();
    if (req.body.timeline !== undefined) project.timeline = String(req.body.timeline || "").trim();
    if (req.body.summary !== undefined) project.summary = String(req.body.summary || "").trim();
    if (req.body.description !== undefined) project.description = String(req.body.description || "").trim();
    if (req.body.imageUrl !== undefined) project.imageUrl = String(req.body.imageUrl || "").trim();
    if (req.body.brochureUrl !== undefined) project.brochureUrl = String(req.body.brochureUrl || "").trim();
    if (req.body.gallery !== undefined) project.gallery = normalizeList(req.body.gallery);
    if (req.body.facts !== undefined) project.facts = normalizeList(req.body.facts);
    if (req.body.featured !== undefined) project.featured = Boolean(req.body.featured);
    if (req.body.isActive !== undefined) project.isActive = Boolean(req.body.isActive);
    if (req.body.sortOrder !== undefined) project.sortOrder = Number(req.body.sortOrder) || 0;
    if (req.body.publishDate !== undefined) {
      project.publishDate = req.body.publishDate ? new Date(req.body.publishDate) : null;
    }

    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, message: "Unable to update project" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await project.deleteOne();
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: "Unable to delete project" });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.isActive =
      req.body.isActive === undefined ? !project.isActive : Boolean(req.body.isActive);
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    console.error("Update project status error:", error);
    res.status(500).json({ success: false, message: "Unable to update project status" });
  }
};

module.exports = {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
};

