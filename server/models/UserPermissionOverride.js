const mongoose = require("mongoose");

/**
 * User Permission Overrides
 * Allows specific users to have different permissions than their role default
 * Can enable or disable specific permissions for individual users
 */
const userPermissionOverrideSchema = new mongoose.Schema(
  {
    // User being overridden
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // User name/email for reference
    userEmail: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    // User's role (for context)
    userRole: {
      type: String,
      required: true,
      index: true,
    },

    // Standardized permission key being overridden
    permissionKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: [
        "create_assignments",
        "edit_assignments",
        "delete_assignments",
        "submit_work",
        "upload_files",
        "review_submissions",
        "add_feedback",
        "extend_deadlines",
        "manage_revisions",
        "view_analytics",
        "manage_users",
        "manage_workspace",
        "post_to_social",
        "schedule_posts",
      ],
    },

    // Override value (true = grant, false = deny)
    // null/undefined = no override (use role default)
    enabled: {
      type: Boolean,
      default: null,
    },

    // Reason for override
    reason: {
      type: String,
      default: "",
    },

    // Who made this override
    createdBy: {
      id: String,
      name: String,
      email: String,
    },

    updatedBy: {
      id: String,
      name: String,
      email: String,
    },

    // When override expires (optional)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Composite unique index: one override per user-permission combination
userPermissionOverrideSchema.index(
  { userId: 1, permissionKey: 1 },
  { unique: true },
);

// Indexes for efficient lookups
userPermissionOverrideSchema.index({ userId: 1, enabled: 1 });
userPermissionOverrideSchema.index({ permissionKey: 1 });

module.exports = mongoose.model(
  "UserPermissionOverride",
  userPermissionOverrideSchema,
);
