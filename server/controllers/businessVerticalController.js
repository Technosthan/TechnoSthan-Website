const BusinessVertical = require("../models/BusinessVertical");
const {
  uploadFromDataUri,
  deleteAsset,
} = require("../services/cloudinaryService");

const DEFAULT_BUSINESS_VERTICALS = [
  {
    _id: "default-technosthan-hospitality",
    title: "TECHNOSTHAN HOSPITALITY",
    description:
      "Advanced hospitality platforms, booking systems, and management tools for hotels and resorts.",
    imageKey: "hospitality",
    imageUrl: "DEFAULT_HOSPITALITY",
    path: "/services/technosthan-hospitality",
    isDefault: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: "default-technosthan-innovations-hub",
    title: "TECHNOSTHAN INNOVATIONS HUB",
    description:
      "Product innovation, custom application development, and digital transformation solutions.",
    imageKey: "innovation",
    imageUrl: "DEFAULT_INNOVATION",
    path: "https://ih.technosthan.com/",
    isDefault: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    _id: "default-technosthan-agritech",
    title: "TECHNOSTHAN AGRITECH",
    description:
      "Smart agri-tech solutions, farm automation, and data-driven agricultural growth services.",
    imageKey: "agritech",
    imageUrl: "DEFAULT_AGRITECH",
    path: "https://agritech.technosthan.com",
    isDefault: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    _id: "default-technosthan-it-services",
    title: "TECHNOSTHAN IT SERVICES",
    description:
      "Comprehensive IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
    imageKey: "it",
    imageUrl: "DEFAULT_IT",
    path: "https://it.technosthan.com",
    isDefault: true,
    isActive: true,
    sortOrder: 4,
  },
];

const isDefaultVerticalId = (id) =>
  DEFAULT_BUSINESS_VERTICALS.some((vertical) => vertical._id === id);

const buildPublicPayload = (verticals) =>
  [...DEFAULT_BUSINESS_VERTICALS, ...verticals]
    .filter((vertical) => vertical.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

const getBusinessVerticals = async (req, res) => {
  try {
    const customVerticals = await BusinessVertical.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: buildPublicPayload(customVerticals),
    });
  } catch (err) {
    console.error("Get business verticals error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load business verticals",
    });
  }
};

const getAdminBusinessVerticals = async (req, res) => {
  try {
    const customVerticals = await BusinessVertical.find({ isDefault: false })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: customVerticals,
    });
  } catch (err) {
    console.error("Get admin business verticals error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load admin business verticals",
    });
  }
};

const createBusinessVertical = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const mimeType = String(file.mimetype || "").toLowerCase();
    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are supported",
      });
    }

    const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
    const result = await uploadFromDataUri(dataUri, {
      resource_type: "image",
      folder: "technosthan/business-verticals",
    });

    if (!result || !result.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const count = await BusinessVertical.countDocuments({ isDefault: false });
    const businessVertical = await BusinessVertical.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: result.secure_url,
      publicId: result.public_id,
      isDefault: false,
      isActive: true,
      sortOrder: count + 1,
    });

    return res.status(201).json({ success: true, data: businessVertical });
  } catch (err) {
    console.error("Create business vertical error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unable to create business vertical",
    });
  }
};

const updateBusinessVertical = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const file = req.file;

    if (isDefaultVerticalId(id)) {
      return res.status(403).json({
        success: false,
        message: "Default business verticals cannot be edited",
      });
    }

    const businessVertical = await BusinessVertical.findById(id);
    if (!businessVertical) {
      return res.status(404).json({
        success: false,
        message: "Business vertical not found",
      });
    }

    if (title) businessVertical.title = title.trim();
    if (description) businessVertical.description = description.trim();

    if (file) {
      const mimeType = String(file.mimetype || "").toLowerCase();
      if (!mimeType.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are supported",
        });
      }

      const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
      const result = await uploadFromDataUri(dataUri, {
        resource_type: "image",
        folder: "technosthan/business-verticals",
      });

      if (!result || !result.secure_url) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }

      if (businessVertical.publicId) {
        try {
          await deleteAsset(businessVertical.publicId, "image");
        } catch (deleteErr) {
          console.warn(
            "Failed to delete previous vertical image:",
            deleteErr.message,
          );
        }
      }

      businessVertical.imageUrl = result.secure_url;
      businessVertical.publicId = result.public_id;
    }

    await businessVertical.save();

    return res.status(200).json({ success: true, data: businessVertical });
  } catch (err) {
    console.error("Update business vertical error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unable to update business vertical",
    });
  }
};

const toggleBusinessVerticalActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isDefaultVerticalId(id)) {
      return res.status(403).json({
        success: false,
        message: "Default business verticals cannot be deactivated",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const businessVertical = await BusinessVertical.findById(id);
    if (!businessVertical) {
      return res.status(404).json({
        success: false,
        message: "Business vertical not found",
      });
    }

    if (businessVertical.isDefault) {
      return res.status(403).json({
        success: false,
        message: "Default business verticals cannot be deactivated",
      });
    }

    businessVertical.isActive = isActive;
    await businessVertical.save();

    return res.status(200).json({ success: true, data: businessVertical });
  } catch (err) {
    console.error("Toggle business vertical active error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unable to update business vertical active state",
    });
  }
};

const deleteBusinessVertical = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDefaultVerticalId(id)) {
      return res.status(403).json({
        success: false,
        message: "Default business verticals cannot be deleted",
      });
    }

    const businessVertical = await BusinessVertical.findById(id);
    if (!businessVertical) {
      return res.status(404).json({
        success: false,
        message: "Business vertical not found",
      });
    }

    if (businessVertical.publicId) {
      try {
        await deleteAsset(businessVertical.publicId, "image");
      } catch (deleteErr) {
        console.warn("Failed to delete vertical image:", deleteErr.message);
      }
    }

    await businessVertical.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Business vertical deleted",
    });
  } catch (err) {
    console.error("Delete business vertical error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unable to delete business vertical",
    });
  }
};

module.exports = {
  getBusinessVerticals,
  getAdminBusinessVerticals,
  createBusinessVertical,
  updateBusinessVertical,
  toggleBusinessVerticalActive,
  deleteBusinessVertical,
};
