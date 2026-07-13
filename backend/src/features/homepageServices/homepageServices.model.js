import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    rj: { type: String, default: "" },
  },
  { _id: false },
);

const translationStateSchema = new mongoose.Schema(
  {
    en: { type: String, default: "missing" },
    hi: { type: String, default: "missing" },
    rj: { type: String, default: "missing" },
  },
  { _id: false },
);

const translationErrorSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    rj: { type: String, default: "" },
  },
  { _id: false },
);

const assetSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    secureUrl: { type: String, default: "" },
    publicId: { type: String, default: "" },
    resourceType: { type: String, default: "" },
    format: { type: String, default: "" },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    version: { type: Number, default: null },
    folder: { type: String, default: "" },
  },
  { _id: false },
);

const innerServiceSchema = new mongoose.Schema(
  {
    title: { type: localizedTextSchema, default: () => ({}) },
    description: { type: localizedTextSchema, default: () => ({}) },
    sourceLanguage: {
      type: String,
      enum: ["en", "hi", "rj"],
      default: "en",
    },
    icon: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    imageAsset: { type: assetSchema, default: null },
    redirectUrl: { type: String, default: "" },
    openInNewTab: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    translationStatus: {
      type: translationStateSchema,
      default: () => ({ en: "missing", hi: "missing", rj: "missing" }),
    },
    translationErrors: {
      type: translationErrorSchema,
      default: () => ({ en: "", hi: "", rj: "" }),
    },
  },
  { _id: true, timestamps: true },
);

const homepageServiceSchema = new mongoose.Schema(
  {
    serviceKey: { type: String, required: true, unique: true, index: true },
    slug: { type: String, default: "", index: true },
    name: { type: localizedTextSchema, default: () => ({}) },
    description: { type: localizedTextSchema, default: () => ({}) },
    sourceLanguage: {
      type: String,
      enum: ["en", "hi", "rj"],
      default: "en",
    },
    icon: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    imageAsset: { type: assetSchema, default: null },
    accentColor: { type: String, default: "#0f766e" },
    redirectUrl: { type: String, default: "" },
    openInNewTab: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    translationStatus: {
      type: translationStateSchema,
      default: () => ({ en: "missing", hi: "missing", rj: "missing" }),
    },
    translationErrors: {
      type: translationErrorSchema,
      default: () => ({ en: "", hi: "", rj: "" }),
    },
    innerServices: {
      type: [innerServiceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

homepageServiceSchema.index({ serviceKey: 1 }, { unique: true });

const HomepageService = mongoose.model(
  "HomepageService",
  homepageServiceSchema,
);

export default HomepageService;

export const SERVICE_LANGUAGES = ["en", "hi", "rj"];

export const createBlankLocalizedText = () => ({
  en: "",
  hi: "",
  rj: "",
});

export const createBlankTranslationState = (value = "missing") => ({
  en: value,
  hi: value,
  rj: value,
});

export const createBlankTranslationErrors = () => ({
  en: "",
  hi: "",
  rj: "",
});
