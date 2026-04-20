const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema({
  socials: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Social", socialSchema);