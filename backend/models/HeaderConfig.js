const mongoose = require("mongoose");

const headerConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true },
);

headerConfigSchema.index({ user: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("HeaderConfig", headerConfigSchema);
