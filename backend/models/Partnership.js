const mongoose = require("mongoose");

const partnershipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    type: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    benefits: { type: [String], default: [] },
    process: { type: [String], default: [] },
    logoUrl: { type: String, default: "", trim: true },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Partnership", partnershipSchema);

