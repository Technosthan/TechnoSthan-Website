const mongoose = require("mongoose");

const formNotificationSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      index: true,
    },
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormResponse",
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    channel: {
      type: String,
      enum: ["dashboard", "email", "telegram", "whatsapp"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    actionUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending",
      index: true,
    },
    error: {
      type: String,
      default: "",
      trim: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

formNotificationSchema.index({ recipientUserId: 1, readAt: 1, createdAt: -1 });

const FormNotification = mongoose.model(
  "FormNotification",
  formNotificationSchema,
);

module.exports = FormNotification;
