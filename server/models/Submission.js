const mongoose = require("mongoose");
const { ROLES } = require("../constants/rbac");

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, required: true },
    mimeType: { type: String, trim: true, default: "" },
    size: { type: Number, default: 0 },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema(
  {
    message: { type: String, trim: true, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    submissionLink: { type: String, trim: true, default: "" },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    fileUrl: { type: String, trim: true, default: "" },
    fileName: { type: String, trim: true, default: "" },
    mimeType: { type: String, trim: true, default: "" },
    size: { type: Number, default: 0 },
    note: { type: String, trim: true, default: "" },
    feedback: { type: String, trim: true, default: "" },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewerRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER, null],
      default: null,
    },
    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "submitted",
      index: true,
    },
    submittedAt: { type: Date, default: Date.now, index: true },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

submissionSchema.index({ assignmentId: 1, userId: 1, submittedAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
