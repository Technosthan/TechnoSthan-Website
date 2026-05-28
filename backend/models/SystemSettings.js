const mongoose = require("mongoose");
const {
  DEFAULT_FIELD_ALIASES,
  DEFAULT_FIELD_WEIGHTS,
  DEFAULT_MERGE_THRESHOLD,
} = require("../utils/fieldNormalization");

const systemSettingsSchema = new mongoose.Schema(
  {
    requireApproval: { type: Boolean, default: false },

    // Field alias mapping - for header normalization
    // Maps user-provided headers to canonical field names
    fieldAliases: {
      type: Map,
      of: [String],
      default: DEFAULT_FIELD_ALIASES,
    },

    // Field weights for merge scoring
    // Higher weight = more important for duplicate detection
    fieldWeights: {
      type: Map,
      of: Number,
      default: DEFAULT_FIELD_WEIGHTS,
    },

    // Minimum score threshold for merging
    // If calculated score >= threshold, records are merged
    mergeThreshold: {
      type: Number,
      default: DEFAULT_MERGE_THRESHOLD,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
