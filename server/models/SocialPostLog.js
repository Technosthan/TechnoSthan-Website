const mongoose = require("mongoose");

const socialPostLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    platforms: {
      type: [String],
      required: true,
      default: []
    },
    type: {
      type: String,
      enum: ["post", "message"],
      required: true
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "failed"
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    results: {
      type: [
        new mongoose.Schema(
          {
            platform: String,
            success: Boolean,
            detail: String
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SocialPostLog", socialPostLogSchema);
