const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    category: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    area: { type: String, default: "", trim: true },
    developmentType: { type: String, default: "", trim: true },
    timeline: { type: String, default: "", trim: true },
    summary: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    gallery: { type: [String], default: [] },
    brochureUrl: { type: String, default: "", trim: true },
    facts: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    publishDate: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);

