const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: { type: String, default: "" },
    name: { type: String, default: "" },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "waiting_approval"],
      default: "pending",
    },
    message: { type: String, default: "Not Sent Yet" },
    errorMessage: { type: String, default: "" },
    sentAt: { type: Date, default: null },
    data: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    headerKeys: { type: [String], default: [] },
    searchText: { type: String, default: "" },
  },
  { timestamps: true },
);

// Prevent duplicate email per user when email exists

module.exports = mongoose.model("Contact", contactSchema);
