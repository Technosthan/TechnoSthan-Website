const fs             = require('fs');
const Contact        = require('../models/Contact');
const SystemSettings = require('../models/SystemSettings');
const { parseFile }  = require('../utils/fileParser');
const { sendEmailsInBatches } = require('../services/emailService');
const { log }        = require('../utils/logger');

// POST /api/upload
const uploadContacts = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const rows = await parseFile(req.file.path, req.file.originalname);
    fs.unlinkSync(req.file.path);
    if (!rows.length) return res.status(400).json({ success: false, message: 'File is empty or has no valid rows' });

    const settings = await SystemSettings.findOne() || { requireApproval: false };
    const initialStatus  = settings.requireApproval ? 'waiting_approval' : 'pending';
    const initialMessage = settings.requireApproval ? 'Waiting for Admin Approval' : 'Not Sent Yet';

    let inserted = 0, duplicates = 0;
    const contacts = [];

    for (const row of rows) {
      try {
        const contact = await Contact.create({
          email: row.email, phone: row.phone,
          uploadedBy: req.user._id,
          status: initialStatus, message: initialMessage,
        });
        contacts.push(contact);
        inserted++;
      } catch (err) {
        if (err.code === 11000) duplicates++;
        else throw err;
      }
    }

    await log(req.user._id, 'upload', `Uploaded ${inserted} contacts (${duplicates} duplicates)`);

    if (!settings.requireApproval && contacts.length) {
      res.json({ success: true, message: `Uploaded ${inserted} contacts. Sending emails now...`, data: { inserted, duplicates, requireApproval: false } });
      sendEmailsInBatches(contacts, 10, 2000, async (id, status, errorMessage) => {
        await Contact.findByIdAndUpdate(id, {
          status,
          message: status === 'sent' ? 'Mail Sent Successfully' : `Failed: ${errorMessage}`,
          errorMessage: status === 'failed' ? errorMessage : '',
          sentAt: status === 'sent' ? new Date() : null,
        });
      }).then(() => log(req.user._id, 'send', 'Batch send completed'));
      return;
    }

    res.json({
      success: true,
      message: settings.requireApproval ? `Uploaded ${inserted} contacts. Waiting for admin approval.` : `Uploaded ${inserted} contacts.`,
      data: { inserted, duplicates, requireApproval: settings.requireApproval },
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};

// GET /api/status
const getMyStatus = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const filter = { uploadedBy: req.user._id };
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Contact.countDocuments(filter),
    ]);
    const summary = await Contact.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const stats = { pending: 0, sent: 0, failed: 0, waiting_approval: 0 };
    summary.forEach(({ _id, count }) => { if (_id in stats) stats[_id] = count; });
    res.json({ success: true, data: contacts, stats, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

// DELETE /api/my-contacts — delete all contacts uploaded by this user
const deleteMyContacts = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({ uploadedBy: req.user._id });
    await log(req.user._id, 'delete', `Deleted ${result.deletedCount} contacts`);
    res.json({ success: true, message: `Deleted ${result.deletedCount} contacts` });
  } catch (err) { next(err); }
};

module.exports = { uploadContacts, getMyStatus, deleteMyContacts };
