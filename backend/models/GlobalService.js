const mongoose = require("mongoose");

/**
 * Global Services Master Switch
 * Controls workspace-wide feature availability
 * If disabled here, permission is ALWAYS blocked regardless of role/overrides
 */
const globalServiceSchema = new mongoose.Schema(
  {
    // Standardized service key (snake_case)
    serviceKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: [
        "assignments",
        "reviews",
        "file_attachments",
        "deadline_extensions",
        "revisions",
        "social_posting",
        "analytics",
        "hr_dashboard",
        "user_dashboard",
      ],
      index: true,
    },

    // Human readable name
    name: {
      type: String,
      required: true,
    },

    // Service description
    description: {
      type: String,
      default: "",
    },

    // Is this service enabled for the workspace?
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Default state for new workspaces
    defaultEnabled: {
      type: Boolean,
      default: true,
    },

    // Service category for UI grouping
    category: {
      type: String,
      enum: ["assignments", "social", "analytics", "dashboard"],
      default: "assignments",
    },

    // Track who made changes
    updatedBy: {
      id: String,
      name: String,
      email: String,
    },

    // Change history for audit
    history: [
      {
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          id: String,
          name: String,
          email: String,
        },
        previousValue: Boolean,
        newValue: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
globalServiceSchema.index({ serviceKey: 1, enabled: 1 });

module.exports = mongoose.model("GlobalService", globalServiceSchema);
