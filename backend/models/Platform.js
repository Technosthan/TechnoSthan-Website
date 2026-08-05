const mongoose = require("mongoose");

// ============ SOCIAL ICON GRID SCHEMA ============
const platformSchema = new mongoose.Schema(
  {
    // Platform identification
    platformId: { type: String, required: true, unique: true }, // "facebook", "instagram", etc
    name: { type: String, required: true }, // Display name
    icon: { type: String, required: true }, // Component name from PlatformIcons
    color: { type: String, default: "#000000" }, // Brand color
    charLimit: { type: Number, default: 280 }, // Character limit for posts

    // Platform stats
    followers: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },

    // HR Control & Management
    isActive: { type: Boolean, default: true }, // Enable/disable platform
    isVisibleToUsers: { type: Boolean, default: true }, // Show in user dashboard
    
    // HR can add custom platforms
    isCustom: { type: Boolean, default: false }, // Custom platform added by HR
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HR who added it
    
    // Social platform connection settings
    apiEndpoint: { type: String, default: null },
    connectivityStatus: { type: String, enum: ["connected", "disconnected", "error"], default: "disconnected" },
    lastSyncedAt: { type: Date, default: null },

    // Icon grid display settings
    gridPosition: { type: Number, default: 0 }, // Order in grid
    displaySize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    
    // Platform-specific URLs & handles
    baseUrl: { type: String, default: null },
    communityUrl: { type: String, default: null },
    shareableLinks: [{
      type: { type: String }, // "profile", "page", "channel"
      url: String,
      label: String
    }],

    // Metrics & analytics
    lastPostedAt: { type: Date, default: null },
    totalImpressions: { type: Number, default: 0 },
    totalReach: { type: Number, default: 0 },

    metadata: {
      description: String,
      category: { type: String, enum: ["social", "messaging", "professional", "content", "community", "custom"] },
      features: [String], // ["share", "post", "dm", "story", etc]
      requiresAuth: { type: Boolean, default: true }
    },

    // Audit trail
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// ============ USER SELECTED ICONS SCHEMA ============
const userIconSelectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    selectedPlatforms: [{
      platformId: String,
      isSelected: { type: Boolean, default: true },
      customLabel: String,
      customIcon: String,
      customUrl: String,
      position: Number
    }],
    theme: { type: String, enum: ["light", "dark", "custom"], default: "light" },
    gridLayout: { type: String, enum: ["3col", "4col", "6col", "auto"], default: "auto" },
    showLabels: { type: Boolean, default: true },
    enableCopyButton: { type: Boolean, default: true },
    enableShareButton: { type: Boolean, default: true },
    customCss: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// ============ ICON SHARE LOG SCHEMA ============
const iconShareLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    platformId: String,
    actionType: { type: String, enum: ["copy", "share", "click", "view"], default: "click" },
    copiedText: String,
    sharedTo: String, // email, social platform, etc
    ipAddress: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// ============ MODELS ============
module.exports = {
  Platform: mongoose.model("Platform", platformSchema),
  UserIconSelection: mongoose.model("UserIconSelection", userIconSelectionSchema),
  IconShareLog: mongoose.model("IconShareLog", iconShareLogSchema)
};