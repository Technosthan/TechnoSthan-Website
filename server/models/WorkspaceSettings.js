const mongoose = require("mongoose");

const workspaceSettingsSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      role: { type: String, default: null },
    },
    history: [
      {
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          id: String,
          name: String,
          role: String,
        },
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WorkspaceSettings", workspaceSettingsSchema);
