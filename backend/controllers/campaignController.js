const Campaign = require("../models/Campaign");
const cloudinaryService = require("../services/cloudinaryService");
const {
  findBestMatchingCampaign,
  normalizeCampaignRoute,
  normalizePathname,
} = require("../utils/campaignRoutes");

const parseOptionalDateTime = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }

  return parsedDate;
};

const normalizeRedirectUrl = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const trimmedUrl = String(value).trim();
  if (!trimmedUrl) {
    return null;
  }
  // Allow internal paths like "/some/path"
  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch (err) {
    const error = new Error("Invalid redirect URL");
    error.statusCode = 400;
    throw error;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    const error = new Error("Redirect URL must use http or https");
    error.statusCode = 400;
    throw error;
  }

  return parsedUrl.toString();
};

const normalizeCampaignButtonUrl = (value, index) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    const error = new Error(`Campaign button ${index} URL is required`);
    error.statusCode = 400;
    throw error;
  }

  const trimmed = String(value).trim();
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch (err) {
    const error = new Error(`Campaign button ${index} URL is invalid`);
    error.statusCode = 400;
    throw error;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    const error = new Error(`Campaign button ${index} URL must use http or https`);
    error.statusCode = 400;
    throw error;
  }

  return parsedUrl.toString();
};

const parseCampaignButtonsPayload = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      const error = new Error("campaignButtons must be valid JSON");
      error.statusCode = 400;
      throw error;
    }
  }

  return [];
};

const normalizeCampaignButtons = (value) => {
  const buttons = parseCampaignButtonsPayload(value)
    .map((button, index) => {
      const text = String(button?.text || "").trim();
      const url = String(button?.url || "").trim();

      if (!text && !url) {
        return null;
      }

      if (!text) {
        const error = new Error(`Campaign button ${index + 1} text is required`);
        error.statusCode = 400;
        throw error;
      }

      const normalizedUrl = normalizeCampaignButtonUrl(url, index + 1);
      return { text, url: normalizedUrl };
    })
    .filter(Boolean);

  return buttons;
};

const serializeCampaign = (campaign) => {
  if (!campaign) {
    return null;
  }

  const campaignButtons = Array.isArray(campaign.campaignButtons)
    ? campaign.campaignButtons
        .map((button) => ({
          text: String(button?.text || "").trim(),
          url: String(button?.url || "").trim(),
        }))
        .filter((button) => button.text && button.url)
    : [];

  const legacyButtons = [
    campaign.button1Text && campaign.button1Url
      ? { text: campaign.button1Text, url: campaign.button1Url }
      : null,
    campaign.button2Text && campaign.button2Url
      ? { text: campaign.button2Text, url: campaign.button2Url }
      : null,
  ].filter(Boolean);

  return {
    ...campaign,
    _id: campaign._id?.toString?.() || campaign.id,
    id: campaign._id?.toString?.() || campaign.id,
    displayRoute: normalizeCampaignRoute(campaign.displayRoute || "/"),
    isActive: Boolean(campaign.isActive),
    campaignButtons: campaignButtons.length ? campaignButtons : legacyButtons,
  };
};

const normalizeCampaignBodyRoute = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    const error = new Error("Display Route is required");
    error.statusCode = 400;
    throw error;
  }

  return normalizeCampaignRoute(value);
};

const deactivateConflictingCampaigns = async (displayRoute, excludeId = null) => {
  const candidates = await Campaign.find({
    isActive: true,
  })
    .select("_id displayRoute")
    .lean();

  const conflictingIds = candidates
    .filter((campaign) => {
      if (excludeId && campaign._id?.toString?.() === String(excludeId)) {
        return false;
      }

      return normalizeCampaignRoute(campaign.displayRoute || "/") === displayRoute;
    })
    .map((campaign) => campaign._id);

  if (!conflictingIds.length) {
    return;
  }

  await Campaign.updateMany(
    { _id: { $in: conflictingIds } },
    { $set: { isActive: false } },
  );
};

const applyCampaignRouteSafety = async (campaign, displayRoute) => {
  if (!campaign.isActive) {
    return;
  }

  await deactivateConflictingCampaigns(displayRoute, campaign._id);
};

const getActiveCampaign = async (req, res) => {
  try {
    const now = new Date();
    const pathname = normalizePathname(
      req.query.pathname || req.query.route || req.query.path || "/",
    );

    const campaigns = await Campaign.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const campaign = findBestMatchingCampaign(campaigns, pathname, now);

    return res.status(200).json({
      success: true,
      data: serializeCampaign(campaign),
    });
  } catch (err) {
    console.error("Get active campaign error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load active campaign" });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: campaigns.map(serializeCampaign),
    });
  } catch (err) {
    console.error("Get campaigns error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load campaigns" });
  }
};

const createCampaign = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Campaign media is required" });
    }

    const startAt = parseOptionalDateTime(
      req.body.startAt,
      "start date and time",
    );
    const expiresAt = parseOptionalDateTime(
      req.body.expiresAt,
      "expiry date and time",
    );

    if (startAt && expiresAt && expiresAt <= startAt) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date and time must be later than the start date and time",
      });
    }

    const redirectUrl = normalizeRedirectUrl(req.body.redirectUrl);
    const displayRoute = normalizeCampaignBodyRoute(req.body.displayRoute);

    if (!cloudinaryService.validateCloudinaryConfig()) {
      return res.status(503).json({
        success: false,
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    const mimeType = String(file.mimetype || "").toLowerCase();
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid campaign media type" });
    }

    const mediaType = isVideo ? "video" : "image";
    const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

    const uploadOptions = {
      resource_type: mediaType === "video" ? "video" : "image",
      folder: "technosthan_campaigns",
      quality: "auto",
      fetch_format: "auto",
      overwrite: false,
    };

    const result = await cloudinaryService.cloudinaryClient.uploader.upload(dataUri, uploadOptions);

    if (!result || !result.secure_url || !result.public_id) {
      return res.status(500).json({ success: false, message: "Upload failed" });
    }

    const isActive =
      typeof req.body.isActive !== "undefined"
        ? req.body.isActive === "true" || req.body.isActive === true
        : false;

    const campaignPayload = {
      mediaType,
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      startAt,
      expiresAt,
      startDateTime: startAt,
      expiryDateTime: expiresAt,
      redirectUrl,
      displayRoute,
      isActive,
    button1Text: req.body.button1Text || null,
    button1Url: req.body.button1Url || null,
    button2Text: req.body.button2Text || null,
    button2Url: req.body.button2Url || null,
    campaignButtons: normalizeCampaignButtons(req.body.campaignButtons),
  };

    let campaign;
    try {
      if (isActive) {
        await applyCampaignRouteSafety(campaignPayload, displayRoute);
      }

      campaign = await Campaign.create(campaignPayload);
    } catch (saveErr) {
      if (
        isActive &&
        saveErr &&
        (saveErr.code === 11000 || saveErr.code === 11001)
      ) {
        await deactivateConflictingCampaigns(displayRoute);
        campaign = await Campaign.create(campaignPayload);
      } else {
        throw saveErr;
      }
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "CAMPAIGN_CREATED",
          module: "Campaign",
          description: `Campaign created ${campaign._id}`,
          entityId: campaign._id?.toString(),
          entityType: "Campaign",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(201).json({ success: true, data: serializeCampaign(campaign.toObject()) });
  } catch (err) {
    console.error("Create campaign error:", err);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Unable to create campaign",
    });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    const displayRoute =
      req.body.displayRoute !== undefined
        ? normalizeCampaignBodyRoute(req.body.displayRoute)
        : normalizeCampaignRoute(campaign.displayRoute || "/");

    // Parse optional dates
    const startAt = parseOptionalDateTime(
      req.body.startAt,
      "start date and time",
    );
    const expiresAt = parseOptionalDateTime(
      req.body.expiresAt,
      "expiry date and time",
    );

    if (startAt && expiresAt && expiresAt <= startAt) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date and time must be later than the start date and time",
      });
    }

    const redirectUrl = normalizeRedirectUrl(req.body.redirectUrl);

    // If a new file is provided, upload and replace existing asset
    const file = req.file;
    if (file) {
      ensureCloudinaryConfigured();
      const mimeType = String(file.mimetype || "").toLowerCase();
      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");

      if (!isImage && !isVideo) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid campaign media type" });
      }

      const mediaType = isVideo ? "video" : "image";
      const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
      const uploadOptions = {
        resource_type: mediaType === "video" ? "video" : "image",
        folder: "technosthan_campaigns",
        quality: "auto",
        fetch_format: "auto",
        overwrite: false,
      };

      const result = await cloudinaryService.cloudinaryClient.uploader.upload(dataUri, uploadOptions);
      if (!result || !result.secure_url || !result.public_id) {
        return res
          .status(500)
          .json({ success: false, message: "Upload failed" });
      }

      // Try to remove old asset
      if (campaign.publicId) {
        try {
          await cloudinaryService.cloudinaryClient.uploader.destroy(campaign.publicId, {
            resource_type: campaign.mediaType === "video" ? "video" : "image",
            invalidate: true,
          });
        } catch (err) {
          console.warn("Failed to destroy old Cloudinary asset:", err.message);
        }
      }

      campaign.mediaType = mediaType;
      campaign.mediaUrl = result.secure_url;
      campaign.publicId = result.public_id;
    }

    // Update fields
    if (typeof req.body.isActive !== "undefined") {
      const isActive =
        req.body.isActive === "true" || req.body.isActive === true;
      if (isActive) {
        await applyCampaignRouteSafety(
          { ...campaign.toObject(), isActive: true },
          displayRoute,
        );
      }
      campaign.isActive = isActive;
    }

    campaign.startAt = startAt;
    campaign.expiresAt = expiresAt;
    campaign.startDateTime = startAt;
    campaign.expiryDateTime = expiresAt;
    campaign.redirectUrl = redirectUrl;
    campaign.displayRoute = displayRoute;

    campaign.button1Text = req.body.button1Text || null;
    campaign.button1Url = req.body.button1Url || null;
    campaign.button2Text = req.body.button2Text || null;
    campaign.button2Url = req.body.button2Url || null;
    campaign.campaignButtons = normalizeCampaignButtons(req.body.campaignButtons);

    let savedCampaign;
    try {
      savedCampaign = await campaign.save();
    } catch (saveErr) {
      if (
        campaign.isActive &&
        (saveErr.code === 11000 || saveErr.code === 11001)
      ) {
        await deactivateConflictingCampaigns(displayRoute, campaign._id);
        savedCampaign = await campaign.save();
      } else {
        throw saveErr;
      }
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "CAMPAIGN_UPDATED",
          module: "Campaign",
          description: `Campaign updated ${campaign._id}`,
          entityId: campaign._id?.toString(),
          entityType: "Campaign",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      data: serializeCampaign(savedCampaign.toObject()),
    });
  } catch (err) {
    console.error("Update campaign error:", err);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Unable to update campaign",
    });
  }
};

const toggleCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be boolean" });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (isActive) {
      await applyCampaignRouteSafety(
        { ...campaign.toObject(), isActive: true },
        normalizeCampaignRoute(campaign.displayRoute || "/"),
      );
    }

    campaign.isActive = isActive;
    let savedCampaign;
    try {
      savedCampaign = await campaign.save();
    } catch (saveErr) {
      if (isActive && (saveErr.code === 11000 || saveErr.code === 11001)) {
        await deactivateConflictingCampaigns(
          normalizeCampaignRoute(campaign.displayRoute || "/"),
          campaign._id,
        );
        savedCampaign = await campaign.save();
      } else {
        throw saveErr;
      }
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: isActive ? "CAMPAIGN_ENABLED" : "CAMPAIGN_DISABLED",
          module: "Campaign",
          description: `Campaign ${campaign._id} ${isActive ? "enabled" : "disabled"}`,
          entityId: campaign._id?.toString(),
          entityType: "Campaign",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      data: serializeCampaign(savedCampaign.toObject()),
    });
  } catch (err) {
    console.error("Toggle campaign error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update campaign status" });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (campaign.publicId) {
      try {
        await cloudinaryService.cloudinaryClient.uploader.destroy(campaign.publicId, {
          resource_type: campaign.mediaType === "video" ? "video" : "image",
          invalidate: true,
        });
      } catch (destroyErr) {
        console.warn("Failed to destroy Cloudinary asset:", destroyErr.message);
      }
    }

    await campaign.deleteOne();

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "CAMPAIGN_DELETED",
          module: "Campaign",
          description: `Campaign deleted ${campaign._id}`,
          entityId: campaign._id?.toString(),
          entityType: "Campaign",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (err) {
    console.error("Delete campaign error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete campaign" });
  }
};

module.exports = {
  getActiveCampaign,
  getCampaigns,
  createCampaign,
  updateCampaign,
  toggleCampaign,
  deleteCampaign,
};
