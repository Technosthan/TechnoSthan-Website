const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  message: String,
  platforms: [String],
  scheduleType: String,
  scheduleDate: String,
  scheduleTime: String,
  status: {
    type: String,
    default: "sent"
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);