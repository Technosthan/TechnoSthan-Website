const mongoose = require("mongoose");

const platformMetricSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    followers: { type: Number, default: 0, min: 0 },
    engagement: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema({
  message: String,
  platforms: [String],
  platformMetrics: {
    type: [platformMetricSchema],
    default: []
  },
  scheduleType: String,
  scheduleDate: String,
  scheduleTime: String,
  status: {
    type: String,
    default: "sent"
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);