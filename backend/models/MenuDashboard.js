const mongoose = require("mongoose");

const menuDashboardCardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    dataSource: {
      type: String,
      required: true,
      trim: true,
    },
    aggregation: {
      type: String,
      enum: ["count", "sum", "average", "minimum", "maximum"],
      default: "count",
    },
    field: {
      type: String,
      default: "",
      trim: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    refreshInterval: {
      type: Number,
      default: 0,
    },
    chartEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const menuDashboardSchema = new mongoose.Schema(
  {
    menuId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    dashboardTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cards: {
      type: [menuDashboardCardSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MenuDashboard", menuDashboardSchema);
