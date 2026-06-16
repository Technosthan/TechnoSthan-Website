const mongoose = require("mongoose");
const { ROLES } = require("../constants/rbac");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    userName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: null, index: true },
    action: { type: String, trim: true, required: true, index: true },
    module: { type: String, trim: true, default: null, index: true },
    description: { type: String, trim: true, default: "" },
    entityId: { type: String, trim: true, default: null },
    entityType: { type: String, trim: true, default: null },
    ipAddress: { type: String, trim: true, default: null },
    userAgent: { type: String, trim: true, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Indexes for common queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ role: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
