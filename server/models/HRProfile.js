const mongoose = require("mongoose");

const hrProfileSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    color: {
      type: String,
      default: "#6366f1",
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HRProfile", hrProfileSchema);
