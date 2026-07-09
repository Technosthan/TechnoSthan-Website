const cloudinary = require("cloudinary").v2;
const Campaign = require("../models/Campaign");

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

const ensureCloudinaryConfigured = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getActiveCampaign = async (req, res) => {
  try {
    const now = new Date();

    const campaign = await Campaign.findOne({
      isActive: true,
      $and: [
        {
          $or: [
            { startAt: null },
            { startAt: { $exists: false } },
            { startAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } },
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (campaign) {
      return res.status(200).json({ success: true, data: campaign });
    }

    const scheduledCampaign = await Campaign.findOne({
      isActive: true,
      startAt: { $gt: now },
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({ startAt: 1, createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json({ success: true, data: scheduledCampaign || null });
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
    return res.status(200).json({ success: true, data: campaigns });
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

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    if (!result || !result.secure_url || !result.public_id) {
      return res.status(500).json({ success: false, message: "Upload failed" });
    }

    const isActive =
      typeof req.body.isActive !== "undefined"
        ? req.body.isActive === "true" || req.body.isActive === true
        : false;

    if (isActive) {
      await Campaign.updateMany(
        { isActive: true },
        { $set: { isActive: false } },
      );
    }

    const campaign = await Campaign.create({
      mediaType,
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      startAt,
      expiresAt,
      startDateTime: startAt,
      expiryDateTime: expiresAt,
      redirectUrl,
      isActive,
      button1Text: req.body.button1Text || null,
      button1Url: req.body.button1Url || null,
      button2Text: req.body.button2Text || null,
      button2Url: req.body.button2Url || null,
    });

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

    return res.status(201).json({ success: true, data: campaign });
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

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
      if (!result || !result.secure_url || !result.public_id) {
        return res
          .status(500)
          .json({ success: false, message: "Upload failed" });
      }

      // Try to remove old asset
      if (campaign.publicId) {
        try {
          await cloudinary.uploader.destroy(campaign.publicId, {
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
        await Campaign.updateMany(
          { isActive: true },
          { $set: { isActive: false } },
        );
      }
      campaign.isActive = isActive;
    }

    campaign.startAt = startAt;
    campaign.expiresAt = expiresAt;
    campaign.startDateTime = startAt;
    campaign.expiryDateTime = expiresAt;
    campaign.redirectUrl = redirectUrl;

    campaign.button1Text = req.body.button1Text || null;
    campaign.button1Url = req.body.button1Url || null;
    campaign.button2Text = req.body.button2Text || null;
    campaign.button2Url = req.body.button2Url || null;

    await campaign.save();

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

    return res.status(200).json({ success: true, data: campaign });
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
      await Campaign.updateMany(
        { isActive: true },
        { $set: { isActive: false } },
      );
    }

    campaign.isActive = isActive;
    await campaign.save();

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

    return res.status(200).json({ success: true, data: campaign });
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
        await cloudinary.uploader.destroy(campaign.publicId, {
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
