const mongoose = require("mongoose");

const createModel = (name, schema) =>
  mongoose.models[name] || mongoose.model(name, schema);

const dataWorkFileSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataWork",
      required: true,
      unique: true,
      index: true,
    },
    originalFileName: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    storedFileName: {
      type: String,
      trim: true,
      default: "",
    },
    fileHash: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    storageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    filePath: {
      type: String,
      trim: true,
      default: "",
    },
    mimeType: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    extension: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    selectedSheet: {
      type: String,
      trim: true,
      default: "",
    },
    sheetNames: {
      type: [String],
      default: [],
    },
    extractionMethod: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    imageWidth: {
      type: Number,
      default: null,
    },
    imageHeight: {
      type: Number,
      default: null,
    },
    selectedTable: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    selectedPage: {
      type: Number,
      default: null,
      index: true,
    },
    ocrUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    averageConfidence: {
      type: Number,
      default: null,
    },
    processingStatus: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    extractionWarnings: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

const dataWorkColumnSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataWork",
      required: true,
      index: true,
    },
    originalHeader: {
      type: String,
      trim: true,
      default: "",
    },
    normalizedKey: {
      type: String,
      trim: true,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    detectedType: {
      type: String,
      trim: true,
      default: "text",
    },
  },
  { timestamps: true },
);

dataWorkColumnSchema.index({ workId: 1, displayOrder: 1 }, { unique: true });
dataWorkColumnSchema.index({ workId: 1, normalizedKey: 1 }, { unique: true });

const dataWorkRecordSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataWork",
      required: true,
      index: true,
    },
    rowNumber: {
      type: Number,
      required: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    searchableText: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
  },
  { timestamps: true },
);

dataWorkRecordSchema.index({ workId: 1, rowNumber: 1 }, { unique: true });
dataWorkRecordSchema.index({ workId: 1, searchableText: "text" });

const dataWorkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Ready", "Failed"],
      default: "Processing",
      index: true,
    },
    currentFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataWorkFile",
      default: null,
      index: true,
    },
    originalFileName: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    storedFileName: {
      type: String,
      trim: true,
      default: "",
    },
    storageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    filePath: {
      type: String,
      trim: true,
      default: "",
    },
    mimeType: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    extension: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    selectedSheet: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    sheetNames: {
      type: [String],
      default: [],
    },
    extractionMethod: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    imageWidth: {
      type: Number,
      default: null,
    },
    imageHeight: {
      type: Number,
      default: null,
    },
    selectedTable: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    selectedPage: {
      type: Number,
      default: null,
      index: true,
    },
    ocrUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    averageConfidence: {
      type: Number,
      default: null,
    },
    processingStatus: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    extractionWarnings: {
      type: [String],
      default: [],
    },
    totalColumns: {
      type: Number,
      default: 0,
      index: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
      index: true,
    },
    fileUploadedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

dataWorkSchema.index({ createdBy: 1, createdAt: -1 });
dataWorkSchema.index({ updatedAt: -1 });
dataWorkSchema.index({ name: 1, updatedAt: -1 });

const DataWork = createModel("DataWork", dataWorkSchema);
const DataWorkFile = createModel("DataWorkFile", dataWorkFileSchema);
const DataWorkColumn = createModel("DataWorkColumn", dataWorkColumnSchema);
const DataWorkRecord = createModel("DataWorkRecord", dataWorkRecordSchema);

module.exports = {
  DataWork,
  DataWorkFile,
  DataWorkColumn,
  DataWorkRecord,
};
