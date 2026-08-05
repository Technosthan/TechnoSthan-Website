const activityLogService = require("../services/activityLogService");

const buildFilterFromQuery = (query) => {
  const filter = {};

  if (query.search) {
    const regex = new RegExp(String(query.search).trim(), "i");
    filter.$or = [
      { userName: regex },
      { email: regex },
      { description: regex },
      { action: regex },
    ];
  }

  if (query.userName)
    filter.userName = new RegExp(String(query.userName).trim(), "i");
  if (query.email) filter.email = new RegExp(String(query.email).trim(), "i");
  if (query.role) filter.role = query.role;
  if (query.module) filter.module = query.module;
  if (query.action)
    filter.action = new RegExp(String(query.action).trim(), "i");

  // Handle date range
  if (query.dateRange) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    let dateFilter = {};
    switch (query.dateRange) {
      case "today":
        dateFilter.$gte = startOfDay;
        dateFilter.$lt = endOfDay;
        break;
      case "yesterday":
        const yesterday = new Date(startOfDay);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFilter.$gte = yesterday;
        dateFilter.$lt = startOfDay;
        break;
      case "week":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        dateFilter.$gte = startOfWeek;
        dateFilter.$lt = endOfDay;
        break;
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter.$gte = startOfMonth;
        dateFilter.$lt = endOfDay;
        break;
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter.$gte = thirtyDaysAgo;
        dateFilter.$lt = endOfDay;
        break;
      default:
        break;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = filter.createdAt || {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  return filter;
};

exports.getActivityLogs = async (req, res) => {
  try {
    const filter = buildFilterFromQuery(req.query);
    const options = { page: req.query.page || 1, limit: req.query.limit || 50 };

    const result = await activityLogService.queryLogs(filter, options);

    // CSV / Excel export
    const exportType = String(req.query.export || "").toLowerCase();
    if (exportType === "csv" || exportType === "excel") {
      const rows = result.items || [];
      const headers = [
        "createdAt",
        "userName",
        "email",
        "role",
        "action",
        "module",
        "description",
        "entityType",
        "entityId",
        "ipAddress",
        "userAgent",
      ];
      const csv = [headers.join(",")]
        .concat(
          rows.map((r) =>
            headers
              .map((h) => {
                const v =
                  r[h] === undefined || r[h] === null
                    ? ""
                    : String(r[h]).replace(/"/g, '""');
                return `"${v}"`;
              })
              .join(","),
          ),
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      const ext = exportType === "excel" ? "xlsx" : "csv";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=activity-logs-${Date.now()}.${ext}`,
      );
      return res.send(csv);
    }

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get activity logs error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load activity logs right now",
    });
  }
};
