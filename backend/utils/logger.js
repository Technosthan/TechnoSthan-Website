const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, detail = '') => {
  try { await ActivityLog.create({ userId, action, detail }); }
  catch (err) { console.error('Log error:', err.message); }
};

module.exports = { log };
