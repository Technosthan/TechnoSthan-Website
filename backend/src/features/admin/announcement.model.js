import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "admins"],
      default: "all",
    },
    deliveryChannel: {
      type: String,
      enum: ["dashboard", "email", "both"],
      default: "dashboard",
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
announcementSchema.index({
  isActive: 1,
  expiresAt: 1,
  targetAudience: 1,
  deliveryChannel: 1,
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
