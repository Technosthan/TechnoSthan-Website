const mongoose = require("mongoose");
const { ROLES, normalizeRole } = require("../constants/rbac");

const recurrenceTypes = ["daily", "weekly", "monthly"];
const deliveryChannels = ["dashboard", "email", "whatsapp"];

const dailyTaskTemplateSchema = new mongoose.Schema(
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
    recurrenceType: {
      type: String,
      enum: recurrenceTypes,
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
    deliveryChannels: {
      type: [String],
      enum: deliveryChannels,
      default: ["dashboard"],
    },
    targetRoles: {
      type: [String],
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.USER],
      default: [],
    },
    specificUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

dailyTaskTemplateSchema.pre("save", function () {
  this.targetRoles = Array.from(
    new Set((this.targetRoles || []).map(normalizeRole)),
  );
  this.deliveryChannels = Array.from(
    new Set(
      (this.deliveryChannels || [])
        .map((channel) => String(channel || "").trim().toLowerCase())
        .filter((channel) => deliveryChannels.includes(channel)),
    ),
  );

  if (!this.deliveryChannels.length) {
    this.deliveryChannels = ["dashboard"];
  }
});

module.exports = mongoose.model("DailyTaskTemplate", dailyTaskTemplateSchema);
