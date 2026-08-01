import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },
    iconKey: {
      type: String,
      default: "leaf",
      trim: true,
      maxlength: 40,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    _id: true,
    timestamps: false,
    minimize: false,
  },
);

const homepageCtaSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    headingIconKey: {
      type: String,
      default: "sprout",
      trim: true,
      maxlength: 40,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 600,
    },
    buttonText: {
      type: String,
      default: "Explore AgriTech",
      trim: true,
      maxlength: 60,
    },
    buttonLink: {
      type: String,
      default: "/",
      trim: true,
      maxlength: 2048,
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    panelTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    panelSubtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },
    panelIconKey: {
      type: String,
      default: "tractor",
      trim: true,
      maxlength: 40,
    },
    features: {
      type: [featureSchema],
      default: [],
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

homepageCtaSectionSchema.index({ displayOrder: 1, createdAt: 1 });
homepageCtaSectionSchema.index({ isActive: 1, displayOrder: 1 });

const HomepageCtaSection = mongoose.model(
  "HomepageCtaSection",
  homepageCtaSectionSchema,
);

export default HomepageCtaSection;

