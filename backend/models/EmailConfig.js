const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  emailUser:    { type: String, required: true },
  emailPass:    { type: String, required: true },
  subject:      { type: String, default: 'Greeting from Our Team' },
  bodyTemplate: { type: String, default: 'Hi {{email}}, we hope you are doing well. This is a message from our platform. Welcome aboard!' },
  updatedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
