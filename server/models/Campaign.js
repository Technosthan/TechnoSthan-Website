const mongoose = require("mongoose");
const { normalizeCampaignRoute } = require("../utils/campaignRoutes");

const CampaignSchema = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    // New alias fields (kept for backwards compatibility and clarity)
    startDateTime: {
      type: Date,
      default: null,
    },
    expiryDateTime: {
      type: Date,
      default: null,
    },
    redirectUrl: {
      type: String,
      default: null,
    },
    displayRoute: {
      type: String,
      required: true,
      default: "/",
      trim: true,
      set: (value) => normalizeCampaignRoute(value),
    },
    // Optional configurable campaign buttons
    button1Text: {
      type: String,
      default: null,
    },
    button1Url: {
      type: String,
      default: null,
    },
    button2Text: {
      type: String,
      default: null,
    },
    button2Url: {
      type: String,
      default: null,
    },
    campaignButtons: {
      type: [
        {
          text: {
            type: String,
            trim: true,
            default: "",
          },
          url: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

CampaignSchema.index(
  { displayRoute: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
      displayRoute: { $type: "string" },
    },
  },
);

module.exports = mongoose.model("Campaign", CampaignSchema);
