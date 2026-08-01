import mongoose from "mongoose";

const empoweringCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
      default: "image",
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
      trim: true,
    },
    mediaPublicId: {
      type: String,
      default: "",
      trim: true,
    },
    mediaResourceType: {
      type: String,
      default: "image",
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
    thumbnailPublicId: {
      type: String,
      default: "",
      trim: true,
    },
    thumbnailResourceType: {
      type: String,
      default: "image",
      trim: true,
    },
    iconKey: {
      type: String,
      default: "tractor",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Learn More",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "#",
      trim: true,
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const EmpoweringCard = mongoose.model("EmpoweringCard", empoweringCardSchema);

export default EmpoweringCard;
