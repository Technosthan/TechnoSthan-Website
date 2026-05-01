const Contact        = require('../models/Contact');
const EmailConfig    = require('../models/EmailConfig');
const SystemSettings = require('../models/SystemSettings');
const ActivityLog    = require('../models/ActivityLog');
const { sendEmailsInBatches } = require('../services/emailService');
const { log }        = require('../utils/logger');

const getAllUploads = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const filter = status ? { status } : {};
    const [contacts, total] = await Promise.all([
      Contact.find(filter).populate('uploadedBy', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Contact.countDocuments(filter),
    ]);
    const summary = await Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const stats = { pending: 0, sent: 0, failed: 0, waiting_approval: 0 };
    summary.forEach(({ _id, count }) => { if (_id in stats) stats[_id] = count; });
    res.json({ success: true, data: contacts, stats, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

const approveUploads = async (req, res, next) => {
  try {
    const { uploadedBy } = req.params;
    await Contact.updateMany({ uploadedBy, status: 'waiting_approval' }, { status: 'pending', message: 'Approved — sending...' });
    const contacts = await Contact.find({ uploadedBy, status: 'pending' });
    res.json({ success: true, message: `Approved ${contacts.length} contacts. Sending emails...` });
    await log(req.user._id, 'approve', `Approved uploads for user ${uploadedBy}`);
    sendEmailsInBatches(contacts, 10, 2000, async (id, status, errorMessage) => {
      await Contact.findByIdAndUpdate(id, {
        status,
        message: status === 'sent' ? 'Mail Sent Successfully' : `Failed: ${errorMessage}`,
        errorMessage: status === 'failed' ? errorMessage : '',
        sentAt: status === 'sent' ? new Date() : null,
      });
    });
  } catch (err) { next(err); }
};

const rejectUploads = async (req, res, next) => {
  try {
    const { uploadedBy } = req.params;
    const { reason = 'Rejected by admin' } = req.body;
    const result = await Contact.updateMany({ uploadedBy, status: 'waiting_approval' }, { status: 'failed', message: `Rejected: ${reason}`, errorMessage: reason });
    await log(req.user._id, 'reject', `Rejected uploads for user ${uploadedBy}`);
    res.json({ success: true, message: `Rejected ${result.modifiedCount} contacts` });
  } catch (err) { next(err); }
};

const getEmailConfig = async (req, res, next) => {
  try {
    const config = await EmailConfig.findOne().sort({ updatedAt: -1 }).select('-emailPass');
    res.json({ success: true, data: config });
  } catch (err) { next(err); }
};

const updateEmailConfig = async (req, res, next) => {
  try {
    const { emailUser, emailPass, subject, bodyTemplate } = req.body;
    if (!emailUser || !emailPass) return res.status(400).json({ success: false, message: 'emailUser and emailPass required' });
    const config = await EmailConfig.findOneAndUpdate({}, { emailUser, emailPass, subject, bodyTemplate, updatedBy: req.user._id }, { upsert: true, new: true });
    await log(req.user._id, 'config_update', `Email config updated`);
    res.json({ success: true, message: 'Email config saved', data: { ...config.toObject(), emailPass: '***' } });
  } catch (err) { next(err); }
};

const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne() || await SystemSettings.create({ requireApproval: false });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

const updateSystemSettings = async (req, res, next) => {
  try {
    const { requireApproval } = req.body;
    const settings = await SystemSettings.findOneAndUpdate({}, { requireApproval }, { upsert: true, new: true });
    await log(req.user._id, 'settings_update', `requireApproval = ${requireApproval}`);
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const [logs, total] = await Promise.all([
      ActivityLog.find().populate('userId', 'name email').sort({ timestamp: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      ActivityLog.countDocuments(),
    ]);
    res.json({ success: true, data: logs, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

const getNotifications = async (req, res, next) => {
  try {
    const count = await Contact.countDocuments({ status: 'waiting_approval' });
    res.json({ success: true, pendingApproval: count });
  } catch (err) { next(err); }
};

module.exports = { getAllUploads, approveUploads, rejectUploads, getEmailConfig, updateEmailConfig, getSystemSettings, updateSystemSettings, getActivity, getNotifications };
