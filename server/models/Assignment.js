const mongoose = require("mongoose");
const { ROLES } = require("../constants/rbac");

const attachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      trim: true,
      default: "",
    },
    mimeType: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    fileName: { type: String, trim: true, default: "" },
    originalFileName: { type: String, trim: true, default: "" },
    fileType: { type: String, trim: true, default: "" },
    uploadedAt: { type: Date, default: Date.now },
    // Cloudinary metadata
    public_id: { type: String, trim: true, default: null },
    secure_url: { type: String, trim: true, default: null },
    original_filename: { type: String, trim: true, default: null },
    resource_type: { type: String, trim: true, default: null },
    format: { type: String, trim: true, default: null },
    delivery_type: { type: String, trim: true, default: "upload" },
    bytes: { type: Number, default: 0 },
    previewable: { type: Boolean, default: false },
  },
  { _id: false },
);

const remarkSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    kind: {
      type: String,
      enum: ["feedback", "submission", "system"],
      default: "feedback",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    assignedToRole: {
      type: String,
      enum: [ROLES.HR, ROLES.USER, "BOTH"],
      default: ROLES.USER,
      index: true,
    },
    assignedUsers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    creatorRole: {
      type: String,
      enum: Object.values(ROLES),
      index: true,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    submissionLink: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    remarks: {
      type: [remarkSchema],
      default: [],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastSubmittedAt: {
      type: Date,
      default: null,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

assignmentSchema.pre("save", function () {
  if (!this.assignedTo && this.assignedUsers.length > 0) {
    [this.assignedTo] = this.assignedUsers;
  }
});

assignmentSchema.index({ title: "text", description: "text" });
assignmentSchema.index({ assignedUsers: 1, status: 1, deadline: 1 });
assignmentSchema.index({ assignedToRole: 1, status: 1, deadline: 1 });
assignmentSchema.index({ assignedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
