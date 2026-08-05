const activityLogService = require("../services/activityLogService");

module.exports = (req, res, next) => {
  req.logActivity = async (data = {}) => {
    try {
      const payload = {
        userId: data.userId || (req.user && req.user.id) || null,
        userName:
          data.userName ||
          (req.user && req.user.name) ||
          (req.user && req.user.email) ||
          "",
        email: data.email || (req.user && req.user.email) || "",
        role: data.role || (req.user && req.user.role) || null,
        action: data.action || "UNKNOWN",
        module: data.module || null,
        description: data.description || "",
        entityId: data.entityId || null,
        entityType: data.entityType || null,
        metadata: data.metadata || {},
        ipAddress: (
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          ""
        )?.toString(),
        userAgent: req.headers["user-agent"] || null,
      };

      await activityLogService.createLog(payload);
    } catch (err) {
      console.error(
        "req.logActivity failed",
        err && err.message ? err.message : err,
      );
    }
  };

  next();
};
