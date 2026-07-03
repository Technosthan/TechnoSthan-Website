const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_reminder",
        "task_popup",
        "task_update",
        "daily_task",
        "system",
      ],
      default: "task_reminder",
    },
    deliveryChannels: {
      type: [String],
      enum: ["dashboard", "email", "whatsapp"],
      default: ["dashboard"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    taskInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskInstance",
      default: null,
    },
    relatedTaskInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyTaskInstance",
      default: null,
      index: true,
    },
    relatedTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyTaskTemplate",
      default: null,
      index: true,
    },
    dateKey: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceSettings",
      required: true,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Ensure uniqueness per user + taskInstance + type to avoid duplicates
notificationSchema.index(
  { userId: 1, taskInstanceId: 1, type: 1 },
  { unique: true, background: true, sparse: true },
);

notificationSchema.index(
  { userId: 1, relatedTaskInstanceId: 1, type: 1 },
  {
    unique: true,
    background: true,
    partialFilterExpression: {
      type: "daily_task",
      relatedTaskInstanceId: { $type: "objectId" },
    },
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
