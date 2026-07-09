const PageContent = require("../models/PageContent");

const normalizeRoute = (value) => {
  if (typeof value !== "string") {
    return "/";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const normalizeOptionalUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch (error) {
    return trimmed.startsWith("/") ? trimmed : "";
  }
};

const getPageContent = async (req, res) => {
  try {
    const routeParam = req.query.route;
    const listAllSections =
      typeof routeParam === "string" &&
      routeParam.trim().toLowerCase() === "all";
    const includeInactive = req.query.includeInactive === "true";

    const filter = listAllSections
      ? {}
      : { route: normalizeRoute(routeParam || "/") };

    if (!listAllSections && !includeInactive) {
      filter.status = true;
    }

    const sections = await PageContent.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error("Get page content error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load page content" });
  }
};

const createPageContent = async (req, res) => {
  try {
    const payload = {
      route: normalizeRoute(req.body.route),
      position: String(req.body.position || "custom").trim(),
      title: String(req.body.title || "").trim(),
      subtitle: String(req.body.subtitle || "").trim(),
      content: String(req.body.content || ""),
      themeType: ["website", "original"].includes(req.body.themeType)
        ? req.body.themeType
        : "website",
      customStyles:
        typeof req.body.customStyles === "object" && req.body.customStyles
          ? req.body.customStyles
          : {},
      status: req.body.status === undefined ? true : Boolean(req.body.status),
    };

    if (!payload.route || !payload.position || !payload.title) {
      return res.status(400).json({
        success: false,
        message: "Route, position, and title are required",
      });
    }

    const section = await PageContent.create(payload);
    return res.status(201).json({ success: true, data: section });
  } catch (error) {
    console.error("Create page content error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create page content" });
  }
};

const updatePageContent = async (req, res) => {
  try {
    const section = await PageContent.findById(req.params.id);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Page content not found" });
    }

    const payload = {
      route: normalizeRoute(req.body.route || section.route),
      position: String(req.body.position || section.position).trim(),
      title: String(req.body.title ?? section.title).trim(),
      subtitle: String(req.body.subtitle ?? section.subtitle).trim(),
      content: String(req.body.content ?? section.content),
      themeType: ["website", "original"].includes(req.body.themeType)
        ? req.body.themeType
        : section.themeType,
      customStyles:
        typeof req.body.customStyles === "object" && req.body.customStyles
          ? req.body.customStyles
          : section.customStyles,
      status:
        req.body.status === undefined
          ? section.status
          : Boolean(req.body.status),
    };

    Object.assign(section, payload);
    await section.save();

    return res.status(200).json({ success: true, data: section });
  } catch (error) {
    console.error("Update page content error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update page content" });
  }
};

const deletePageContent = async (req, res) => {
  try {
    const section = await PageContent.findById(req.params.id);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Page content not found" });
    }

    await section.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Page content deleted" });
  } catch (error) {
    console.error("Delete page content error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete page content" });
  }
};

const updatePageContentStatus = async (req, res) => {
  try {
    const section = await PageContent.findById(req.params.id);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Page content not found" });
    }

    section.status =
      req.body.status === undefined
        ? !section.status
        : Boolean(req.body.status);
    await section.save();

    return res.status(200).json({ success: true, data: section });
  } catch (error) {
    console.error("Update page content status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update status" });
  }
};

module.exports = {
  getPageContent,
  createPageContent,
  updatePageContent,
  deletePageContent,
  updatePageContentStatus,
};
