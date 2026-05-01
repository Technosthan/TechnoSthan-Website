const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  requireApproval: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
