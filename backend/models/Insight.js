const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    publishDate: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Insight", insightSchema);

