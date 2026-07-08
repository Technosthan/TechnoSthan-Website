const mongoose = require("mongoose");

const pageContentSchema = new mongoose.Schema(
  {
    route: {
      type: String,
      required: true,
      trim: true,
      default: "/",
    },
    position: {
      type: String,
      required: true,
      trim: true,
      default: "custom",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    buttonLink: {
      type: String,
      trim: true,
      default: "",
    },
    themeType: {
      type: String,
      enum: ["website", "original"],
      default: "website",
    },
    customStyles: {
      type: Object,
      default: {},
    },
    status: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

pageContentSchema.index({ route: 1, status: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model("PageContent", pageContentSchema);
