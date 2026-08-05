const mongoose = require("mongoose");

const formResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    imported: {
      type: Boolean,
      default: false,
      index: true,
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    importedAt: {
      type: Date,
      default: null,
      index: true,
    },
    sourceFile: {
      type: String,
      default: "",
      trim: true,
    },
    originalRowNumber: {
      type: Number,
      default: null,
    },
    importBatchId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    importSource: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    declaration: {
      accepted: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: "",
        trim: true,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
    },
    verification: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

formResponseSchema.index(
  { formId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string", $ne: "" },
    },
  },
);

formResponseSchema.index(
  { formId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: "string", $ne: "" },
    },
  },
);

const FormResponse = mongoose.model("FormResponse", formResponseSchema);

module.exports = FormResponse;
