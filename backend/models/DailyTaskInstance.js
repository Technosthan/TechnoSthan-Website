const mongoose = require("mongoose");
const { ROLES, normalizeRole } = require("../constants/rbac");

const dailyTaskInstanceSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyTaskTemplate",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER],
      default: ROLES.USER,
      set: normalizeRole,
      index: true,
    },
    taskDate: {
      type: Date,
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
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceSettings",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

dailyTaskInstanceSchema.index(
  { templateId: 1, assignedTo: 1, taskDate: 1 },
  { unique: true, background: true },
);

module.exports = mongoose.model("DailyTaskInstance", dailyTaskInstanceSchema);
