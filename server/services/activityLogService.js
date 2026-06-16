const ActivityLog = require("../models/ActivityLog");

const createLog = async (payload = {}) => {
  try {
    const doc = await ActivityLog.create(payload);
    return doc;
  } catch (err) {
    console.error(
      "Failed to create activity log:",
      err && err.message ? err.message : err,
    );
    return null;
  }
};

const queryLogs = async (filter = {}, options = {}) => {
  const page = Number(options.page || 1);
  const limit = Math.min(Number(options.limit || 50), 200);
  const skip = (page - 1) * limit;

  const q = ActivityLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const [items, total] = await Promise.all([
    q.lean(),
    ActivityLog.countDocuments(filter),
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

module.exports = { createLog, queryLogs };
