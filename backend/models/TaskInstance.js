const mongoose = require("mongoose");
const { ROLES, normalizeRole } = require("../constants/rbac");

const taskInstanceSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskTemplate",
      required: true,
      index: true,
    },
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
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    reminderAt: {
      type: Date,
      default: null,
      index: true,
    },
    assignedToRole: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      set: normalizeRole,
      index: true,
    },
    assignedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "skipped"],
      default: "pending",
      index: true,
    },
    completionAt: {
      type: Date,
      default: null,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
    popupShownAt: {
      type: Date,
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceSettings",
      required: true,
      index: true,
    },
    reminderRepeatUntil: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

taskInstanceSchema.index(
  {
    templateId: 1,
    dueDate: 1,
    assignedToRole: 1,
    assignedToUser: 1,
    workspaceId: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("TaskInstance", taskInstanceSchema);
