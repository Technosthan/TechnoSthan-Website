const mongoose = require("mongoose");
const { ROLE_LIST } = require("../constants/rbac");

/**
 * Role-Based Permissions
 * Defines what actions each role can perform
 * Fallback permission source (after global service & user overrides)
 */
const rolePermissionSchema = new mongoose.Schema(
  {
    // Role identifier (HR, USER, ADMIN)
    role: {
      type: String,
      required: true,
      enum: ROLE_LIST,
      index: true,
    },

    // Standardized permission key (snake_case)
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
      index: true,
    },

    // Human readable permission name
    name: {
      type: String,
      required: true,
    },

    // Permission description
    description: {
      type: String,
      default: "",
    },

    // Is this permission enabled for this role?
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Group/category for UI organization
    category: {
      type: String,
      enum: ["assignments", "submissions", "reviews", "social", "workspace"],
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

// Composite unique index: one role-permission combination per role
rolePermissionSchema.index({ role: 1, permissionKey: 1 }, { unique: true });

// Index for faster role-based lookups
rolePermissionSchema.index({ role: 1, enabled: 1 });

module.exports = mongoose.model("RolePermission", rolePermissionSchema);
