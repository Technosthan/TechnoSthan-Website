const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, default: '' },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['pending', 'sent', 'failed', 'waiting_approval'], default: 'pending' },
  message:     { type: String, default: 'Not Sent Yet' },
  errorMessage:{ type: String, default: '' },
  sentAt:      { type: Date, default: null },
}, { timestamps: true });

// Prevent duplicate email per user
contactSchema.index({ email: 1, uploadedBy: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);
