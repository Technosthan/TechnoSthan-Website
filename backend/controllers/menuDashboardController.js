const mongoose = require("mongoose");
const MenuDashboard = require("../models/MenuDashboard");
const Assignment = require("../models/Assignment");
const Campaign = require("../models/Campaign");
const PageContent = require("../models/PageContent");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const BusinessVertical = require("../models/BusinessVertical");
const { DataWork } = require("../models/DataWork");
const Form = require("../form/form.model");
const DailyTaskTemplate = require("../models/DailyTaskTemplate");
const DailyTaskInstance = require("../models/DailyTaskInstance");
const Notification = require("../models/Notification");
const WorkspaceSettings = require("../models/WorkspaceSettings");

const DATA_SOURCES = {
  assignments: {
    model: Assignment,
    defaultLink: "/admin/assignments",
  },
  forms: {
    model: Form,
    defaultLink: "/admin/forms",
  },
  campaigns: {
    model: Campaign,
    defaultLink: "/admin/campaigns",
  },
  pageContent: {
    model: PageContent,
    defaultLink: "/admin/page-content",
  },
  users: {
    model: User,
    defaultLink: "/admin/users",
  },
  activityLogs: {
    model: ActivityLog,
    defaultLink: "/admin/activity-logs",
  },
  businessVerticals: {
    model: BusinessVertical,
    defaultLink: "/admin/business-verticals",
  },
  dataWorks: {
    model: DataWork,
    defaultLink: "/admin/data-work-manager",
  },
  dailyTaskTemplates: {
    model: DailyTaskTemplate,
    defaultLink: "/admin/daily-tasks",
  },
  dailyTaskInstances: {
    model: DailyTaskInstance,
    defaultLink: "/admin/daily-tasks",
  },
  notifications: {
    model: Notification,
    defaultLink: "/admin/daily-tasks",
  },
  workspaceSettings: {
    model: WorkspaceSettings,
    defaultLink: "/admin/settings",
  },
};

const ALLOWED_AGGREGATIONS = new Set([
  "count",
  "sum",
  "average",
  "minimum",
  "maximum",
]);

const ALLOWED_MENU_IDS = new Set([
  "workspace",
  "content",
  "operations",
  "system",
]);

const ALLOWED_FILTER_OPERATORS = new Set([
  "$eq",
  "$ne",
  "$in",
  "$nin",
  "$gte",
  "$lte",
  "$gt",
  "$lt",
]);

const DEFAULT_MENU_DASHBOARDS = {
  workspace: {
    menuId: "workspace",
    dashboardTitle: "Workspace Dashboard",
    description: "Workspace-related activity and totals.",
    cards: [
      {
        id: "workspace-total-assignments",
        title: "Assignments",
        subtitle: "Total assignments",
        icon: "briefcase",
        dataSource: "assignments",
        aggregation: "count",
        field: "",
        filters: {},
        order: 0,
        active: true,
        link: "/admin/assignments",
      },
      {
        id: "workspace-pending-assignments",
        title: "Pending Assignments",
        subtitle: "Awaiting action",
        icon: "clock",
        dataSource: "assignments",
        aggregation: "count",
        field: "",
        filters: { status: "pending" },
        order: 1,
        active: true,
        link: "/admin/assignments",
      },
      {
        id: "workspace-active-assignments",
        title: "Active Assignments",
        subtitle: "In progress",
        icon: "activity",
        dataSource: "assignments",
        aggregation: "count",
        field: "",
        filters: { status: { $in: ["in_progress", "submitted"] } },
        order: 2,
        active: true,
        link: "/admin/assignments",
      },
      {
        id: "workspace-completed-assignments",
        title: "Completed Assignments",
        subtitle: "Closed work",
        icon: "check",
        dataSource: "assignments",
        aggregation: "count",
        field: "",
        filters: { status: "completed" },
        order: 3,
        active: true,
        link: "/admin/assignments",
      },
    ],
  },
  content: {
    menuId: "content",
    dashboardTitle: "Content Dashboard",
    description: "Content publishing and form activity.",
    cards: [
      {
        id: "content-total-forms",
        title: "Forms",
        subtitle: "Total forms",
        icon: "file",
        dataSource: "forms",
        aggregation: "count",
        field: "",
        filters: {},
        order: 0,
        active: true,
        link: "/admin/forms",
      },
      {
        id: "content-live-forms",
        title: "Live Forms",
        subtitle: "Currently live",
        icon: "file",
        dataSource: "forms",
        aggregation: "count",
        field: "",
        filters: { status: "live" },
        order: 1,
        active: true,
        link: "/admin/forms",
      },
      {
        id: "content-active-campaigns",
        title: "Active Campaigns",
        subtitle: "Published now",
        icon: "megaphone",
        dataSource: "campaigns",
        aggregation: "count",
        field: "",
        filters: { isActive: true },
        order: 2,
        active: true,
        link: "/admin/campaigns",
      },
      {
        id: "content-active-page-content",
        title: "Active Page Blocks",
        subtitle: "Visible sections",
        icon: "layout",
        dataSource: "pageContent",
        aggregation: "count",
        field: "",
        filters: { status: true },
        order: 3,
        active: true,
        link: "/admin/page-content",
      },
    ],
  },
  operations: {
    menuId: "operations",
    dashboardTitle: "Operations Dashboard",
    description: "Operational teams, logs, and data work.",
    cards: [
      {
        id: "operations-total-users",
        title: "Users",
        subtitle: "Active users",
        icon: "users",
        dataSource: "users",
        aggregation: "count",
        field: "",
        filters: { isActive: true },
        order: 0,
        active: true,
        link: "/admin/users",
      },
      {
        id: "operations-data-works",
        title: "Data Works",
        subtitle: "All workspaces",
        icon: "database",
        dataSource: "dataWorks",
        aggregation: "count",
        field: "",
        filters: {},
        order: 1,
        active: true,
        link: "/admin/data-work-manager",
      },
      {
        id: "operations-activity-logs",
        title: "Activity Logs",
        subtitle: "Recorded actions",
        icon: "activity",
        dataSource: "activityLogs",
        aggregation: "count",
        field: "",
        filters: {},
        order: 2,
        active: true,
        link: "/admin/activity-logs",
      },
      {
        id: "operations-daily-tasks",
        title: "Daily Tasks",
        subtitle: "Open templates",
        icon: "calendar",
        dataSource: "dailyTaskTemplates",
        aggregation: "count",
        field: "",
        filters: { isActive: true },
        order: 3,
        active: true,
        link: "/admin/daily-tasks",
      },
    ],
  },
  system: {
    menuId: "system",
    dashboardTitle: "System Dashboard",
    description: "System access, change history, and control data.",
    cards: [
      {
        id: "system-admin-users",
        title: "Admins",
        subtitle: "Active admin accounts",
        icon: "shield",
        dataSource: "users",
        aggregation: "count",
        field: "",
        filters: { isActive: true, role: "ADMIN" },
        order: 0,
        active: true,
        link: "/admin/users",
      },
      {
        id: "system-notifications",
        title: "Notifications",
        subtitle: "Pending system notices",
        icon: "bell",
        dataSource: "notifications",
        aggregation: "count",
        field: "",
        filters: { type: "system" },
        order: 1,
        active: true,
        link: "/admin/daily-tasks",
      },
      {
        id: "system-activity-logs",
        title: "System Logs",
        subtitle: "Audit trail",
        icon: "activity",
        dataSource: "activityLogs",
        aggregation: "count",
        field: "",
        filters: {},
        order: 2,
        active: true,
        link: "/admin/activity-logs",
      },
      {
        id: "system-workspace-settings",
        title: "Workspace Settings",
        subtitle: "Configuration record",
        icon: "settings",
        dataSource: "workspaceSettings",
        aggregation: "count",
        field: "",
        filters: {},
        order: 3,
        active: true,
        link: "/admin/settings",
      },
    ],
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeMenuId = (menuId) =>
  String(menuId || "")
    .trim()
    .toLowerCase();

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const slugifyId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `card-${Date.now()}`;

const sanitizeFilters = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeFilters(entry))
      .filter((entry) => entry !== undefined);
  }

  if (value instanceof Date) {
    return value;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith("$")) {
      if (!ALLOWED_FILTER_OPERATORS.has(key)) {
        continue;
      }

      sanitized[key] = sanitizeFilters(entry);
      continue;
    }

    sanitized[key] = sanitizeFilters(entry);
  }

  return sanitized;
};

const buildMatchExpression = (filters) => {
  if (!isPlainObject(filters)) {
    return {};
  }

  return sanitizeFilters(filters);
};

const getNumericFields = (model) =>
  Object.entries(model.schema.paths)
    .filter(([pathName, schemaType]) => {
      if (pathName.startsWith("_")) {
        return false;
      }

      return schemaType.instance === "Number";
    })
    .map(([pathName]) => pathName);

const DATA_SOURCE_FIELD_MAP = Object.fromEntries(
  Object.entries(DATA_SOURCES).map(([key, descriptor]) => [
    key,
    getNumericFields(descriptor.model),
  ]),
);

const getDefaultDashboardConfig = (menuId) => {
  const normalizedMenuId = normalizeMenuId(menuId);
  if (!ALLOWED_MENU_IDS.has(normalizedMenuId)) {
    return null;
  }

  const config = DEFAULT_MENU_DASHBOARDS[normalizedMenuId];

  if (config) {
    return clone(config);
  }

  return {
    menuId: normalizedMenuId || "menu",
    dashboardTitle: "Menu Dashboard",
    description: "Dashboard cards for this menu.",
    cards: [],
    isActive: true,
  };
};

const normalizeCard = (card, index = 0) => {
  if (!isPlainObject(card)) {
    return null;
  }

  const dataSource = normalizeMenuId(card.dataSource);
  if (!DATA_SOURCES[dataSource]) {
    return null;
  }

  const aggregation = normalizeMenuId(card.aggregation || "count");
  if (!ALLOWED_AGGREGATIONS.has(aggregation)) {
    return null;
  }

  const field = String(card.field || "").trim();
  const numericFields = DATA_SOURCE_FIELD_MAP[dataSource] || [];
  if (aggregation !== "count" && field && !numericFields.includes(field)) {
    return null;
  }

  return {
    id: String(card.id || slugifyId(card.title || `card-${index}`)).trim(),
    title: String(card.title || "Untitled card").trim(),
    subtitle: String(card.subtitle || "").trim(),
    icon: String(card.icon || "").trim(),
    dataSource,
    aggregation,
    field,
    filters: buildMatchExpression(card.filters || {}),
    order: Number.isFinite(Number(card.order)) ? Number(card.order) : index,
    active: card.active !== undefined ? Boolean(card.active) : true,
    link: String(card.link || "").trim(),
    refreshInterval: Number.isFinite(Number(card.refreshInterval))
      ? Number(card.refreshInterval)
      : 0,
    chartEnabled: Boolean(card.chartEnabled),
  };
};

const normalizeConfigPayload = (payload = {}, existingMenuId = "") => {
  const menuId = normalizeMenuId(payload.menuId || existingMenuId);
  if (!ALLOWED_MENU_IDS.has(menuId)) {
    return {
      error: "Invalid menu dashboard id",
    };
  }

  const defaults = getDefaultDashboardConfig(menuId);
  if (!defaults) {
    return {
      error: "Invalid menu dashboard id",
    };
  }
  const cards = Array.isArray(payload.cards)
    ? payload.cards
        .map((card, index) => normalizeCard(card, index))
        .filter(Boolean)
        .sort((left, right) => left.order - right.order)
    : defaults.cards;

  return {
    menuId: menuId || defaults.menuId,
    dashboardTitle: String(
      payload.dashboardTitle || defaults.dashboardTitle || "Menu Dashboard",
    ).trim(),
    description: String(payload.description || defaults.description || "").trim(),
    isActive:
      payload.isActive === undefined ? defaults.isActive !== false : Boolean(payload.isActive),
    cards,
  };
};

const resolveDashboardConfig = async (menuId) => {
  const normalizedMenuId = normalizeMenuId(menuId);
  const storedConfig = await MenuDashboard.findOne({
    menuId: normalizedMenuId,
  }).lean();

  if (storedConfig) {
    return {
      ...storedConfig,
      cards: [...(storedConfig.cards || [])].sort(
        (left, right) => (left.order || 0) - (right.order || 0),
      ),
    };
  }

  return getDefaultDashboardConfig(normalizedMenuId);
};

const aggregateCardValue = async (card) => {
  const source = DATA_SOURCES[card.dataSource];
  if (!source) {
    return 0;
  }

  const match = buildMatchExpression(card.filters || {});

  if (card.aggregation === "count") {
    return source.model.countDocuments(match);
  }

  if (!card.field) {
    return 0;
  }

  const accumulator =
    card.aggregation === "sum"
      ? { $sum: `$${card.field}` }
      : card.aggregation === "average"
        ? { $avg: `$${card.field}` }
        : card.aggregation === "minimum"
          ? { $min: `$${card.field}` }
          : { $max: `$${card.field}` };

  const rows = await source.model.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        value: accumulator,
      },
    },
  ]);

  const rawValue = rows[0]?.value;
  return rawValue === undefined || rawValue === null ? 0 : rawValue;
};

const buildStatsCards = async (config) => {
  const activeCards = [...(config.cards || [])]
    .filter((card) => card && card.active !== false)
    .sort((left, right) => (left.order || 0) - (right.order || 0));

  const cards = await Promise.all(
    activeCards.map(async (card) => {
      const source = DATA_SOURCES[card.dataSource];
      const value = source ? await aggregateCardValue(card) : 0;

      return {
        id: card.id,
        title: card.title,
        value,
        subtitle: card.subtitle,
        icon: card.icon,
        link: card.link || source?.defaultLink || "",
        active: card.active !== false,
        order: card.order || 0,
      };
    }),
  );

  return cards;
};

exports.getMenuDashboard = async (req, res) => {
  try {
    const menuId = normalizeMenuId(req.params.menuId);
    if (!ALLOWED_MENU_IDS.has(menuId)) {
      return res.status(404).json({
        success: false,
        message: "Menu dashboard not found",
      });
    }
    const dashboard = await resolveDashboardConfig(menuId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get menu dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load menu dashboard",
    });
  }
};

exports.getMenuDashboardStats = async (req, res) => {
  try {
    const menuId = normalizeMenuId(req.params.menuId);
    if (!ALLOWED_MENU_IDS.has(menuId)) {
      return res.status(404).json({
        success: false,
        message: "Menu dashboard not found",
      });
    }
    const config = await resolveDashboardConfig(menuId);
    const cards = await buildStatsCards(config);

    return res.status(200).json({
      success: true,
      data: {
        menuId: config.menuId,
        dashboardTitle: config.dashboardTitle,
        description: config.description,
        cards,
      },
    });
  } catch (error) {
    console.error("Get menu dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load menu dashboard stats",
    });
  }
};

exports.createMenuDashboard = async (req, res) => {
  try {
    const config = normalizeConfigPayload(req.body);
    if (config.error) {
      return res.status(400).json({
        success: false,
        message: config.error,
      });
    }
    if (!config.menuId) {
      return res.status(400).json({
        success: false,
        message: "menuId is required",
      });
    }

    const saved = await MenuDashboard.findOneAndUpdate(
      { menuId: config.menuId },
      config,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json({
      success: true,
      message: "Menu dashboard saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create menu dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save menu dashboard",
    });
  }
};

exports.updateMenuDashboard = async (req, res) => {
  try {
    const existing = await MenuDashboard.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Menu dashboard not found",
      });
    }

    const config = normalizeConfigPayload(req.body, existing.menuId);
    if (config.error) {
      return res.status(400).json({
        success: false,
        message: config.error,
      });
    }
    const updated = await MenuDashboard.findByIdAndUpdate(req.params.id, config, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Menu dashboard updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update menu dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update menu dashboard",
    });
  }
};

exports.deleteMenuDashboard = async (req, res) => {
  try {
    const deleted = await MenuDashboard.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Menu dashboard not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu dashboard deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete menu dashboard",
    });
  }
};
