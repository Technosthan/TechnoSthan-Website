const mongoose = require("mongoose");

const socialConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    platform: {
      type: String,
      required: true,
      enum: ["linkedin", "facebook", "telegram"],
      lowercase: true,
      trim: true
    },
    accessToken: {
      type: String,
      default: ""
    },
    connected: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

socialConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("SocialConnection", socialConnectionSchema);
