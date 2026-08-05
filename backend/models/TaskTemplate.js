const mongoose = require("mongoose");
const { ROLES, normalizeRole } = require("../constants/rbac");

const VALID_RECURRENCE_TYPES = ["daily", "weekly", "monthly"];

const taskTemplateSchema = new mongoose.Schema(
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
    recurrenceType: {
      type: String,
      enum: VALID_RECURRENCE_TYPES,
      default: "daily",
    },
    recurrenceDays: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    notificationTime: {
      type: String,
      default: "09:00",
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
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceSettings",
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    endDate: {
      type: Date,
      default: null,
    },
    targetRoles: {
      type: [String],
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER],
      default: [],
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER],
      default: ROLES.ADMIN,
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    popupEnabled: {
      type: Boolean,
      default: true,
    },
    reminderFrequencyMinutes: {
      type: Number,
      default: 60,
      min: 5,
    },
    escalationHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    resetDailyAfterComplete: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TaskTemplate", taskTemplateSchema);
