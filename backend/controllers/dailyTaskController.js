const DailyTaskTemplate = require("../models/DailyTaskTemplate");
const DailyTaskInstance = require("../models/DailyTaskInstance");
const User = require("../models/User");
const { ROLES, normalizeRole } = require("../constants/rbac");
const dailyTaskSchedulerService = require("../services/dailyTaskSchedulerService");

const normalizeIdList = (value = []) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => {
          if (item && typeof item === "object") {
            return String(item._id || item.id || "").trim();
          }
          return String(item || "").trim();
        })
        .filter(Boolean),
    ),
  );

const normalizeChannelList = (value = []) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => String(item || "").trim().toLowerCase())
        .filter((item) => ["dashboard", "email", "whatsapp"].includes(item)),
    ),
  );

const toStringIdList = (value = []) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (item && typeof item === "object") {
        return String(item._id || item.id || "").trim();
      }
      return String(item || "").trim();
    })
    .filter(Boolean);
};

const isValidNotificationTime = (value) => {
  const timeString = String(value || "").trim();
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const serializeTemplate = (template) => {
  const specificUsers = toStringIdList(
    template.specificUsers ||
      template.specificUserIds ||
      template.targetUsers ||
      [],
  );

  return {
    ...template,
    _id: template._id?.toString?.() || template.id,
    id: template._id?.toString?.() || template.id,
    isActive: Boolean(template.isActive),
    active: Boolean(template.isActive),
    deliveryChannels: normalizeChannelList(template.deliveryChannels),
    specificUsers,
    specificUserIds: specificUsers,
    targetUsers: specificUsers,
  };
};

const serializeInstance = (instance) => ({
  ...instance,
  _id: instance._id?.toString?.() || instance.id,
  id: instance._id?.toString?.() || instance.id,
  assignedTo: instance.assignedTo,
  assignedRole: normalizeRole(instance.assignedRole),
  taskDate: instance.taskDate,
});

const getInstanceDedupKey = (instance) =>
  [
    String(instance.templateId?._id || instance.templateId || ""),
    String(instance.assignedTo?._id || instance.assignedTo || ""),
    new Date(instance.taskDate).toISOString(),
  ].join(":");

const dedupeInstances = (instances = []) => {
  const seen = new Set();

  return instances.filter((instance) => {
    const key = getInstanceDedupKey(instance);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const buildTemplatePayload = (payload, workspaceId, user) => ({
  title: String(payload.title || "").trim(),
  description: String(payload.description || "").trim(),
  priority: String(payload.priority || "medium").toLowerCase(),
  category: String(payload.category || "general").trim(),
  recurrenceType: String(payload.recurrenceType || "daily").toLowerCase(),
  recurrenceDays: Array.isArray(payload.recurrenceDays)
    ? payload.recurrenceDays
    : [],
  notificationTime: String(payload.notificationTime || "09:00").trim(),
  deliveryChannels: normalizeChannelList(payload.deliveryChannels).length
    ? normalizeChannelList(payload.deliveryChannels)
    : ["dashboard"],
  targetRoles: normalizeIdList(payload.targetRoles).map(normalizeRole),
  specificUserIds: normalizeIdList(
    payload.specificUsers || payload.specificUserIds || payload.targetUsers,
  ),
  isActive: payload.isActive ?? payload.active ?? true,
  createdBy: user?._id || user?.id,
  workspaceId,
});

const validateTemplatePayload = (payload = {}) => {
  if (!String(payload.title || "").trim()) {
    return "Task title is required.";
  }

  if (
    payload.notificationTime !== undefined &&
    !isValidNotificationTime(payload.notificationTime)
  ) {
    return "notificationTime must be a valid HH:mm value.";
  }

  const priority = String(payload.priority || "medium").toLowerCase();
  if (!["low", "medium", "high", "urgent"].includes(priority)) {
    return "priority must be one of: low, medium, high, urgent.";
  }

  const recurrenceType = String(
    payload.recurrenceType || "daily",
  ).toLowerCase();
  if (!["daily", "weekly", "monthly"].includes(recurrenceType)) {
    return "recurrenceType must be one of: daily, weekly, monthly.";
  }

  const deliveryChannels = normalizeChannelList(payload.deliveryChannels);
  if (!deliveryChannels.length) {
    return "Select at least one delivery method.";
  }

  const targetRoles = Array.isArray(payload.targetRoles)
    ? normalizeIdList(payload.targetRoles).map(normalizeRole)
    : [];
  const specificUsers = normalizeIdList(
    payload.specificUsers || payload.specificUserIds || payload.targetUsers,
  );

  if (targetRoles.length === 0 && specificUsers.length === 0) {
    return "At least one target role or specific user is required.";
  }

  return null;
};

exports.createTaskTemplate = async (req, res) => {
  try {
    console.log("DAILY TASK CREATE BODY:", req.body);

    const validationMessage = validateTemplatePayload(req.body || {});
    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const template = await DailyTaskTemplate.create(
      buildTemplatePayload(req.body, req.workspaceSettings._id, req.user),
    );

    try {
      await dailyTaskSchedulerService.generateDailyTaskInstances(
        new Date(),
        req.workspaceSettings._id,
        { ignoreNotificationTime: true, app: req.app },
      );
    } catch (generationError) {
      console.error("DAILY TASK INSTANCE GENERATION ERROR:", generationError);
    }

    res.status(201).json({
      success: true,
      data: serializeTemplate(template.toObject()),
    });
  } catch (error) {
    console.error("CREATE DAILY TASK TEMPLATE ERROR:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Daily task template validation failed.",
        errors: error.errors || null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to create daily task template.",
      errors: error.errors || null,
    });
  }
};

exports.getTaskTemplates = async (req, res) => {
  try {
    const templates = await DailyTaskTemplate.find({
      workspaceId: req.workspaceSettings._id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: templates.map(serializeTemplate),
    });
  } catch (error) {
    console.error("Get daily task templates error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load daily task templates.",
    });
  }
};

exports.getTaskTemplate = async (req, res) => {
  try {
    const template = await DailyTaskTemplate.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceSettings._id,
    }).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Daily task template not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: serializeTemplate(template),
    });
  } catch (error) {
    console.error("Get daily task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load daily task template.",
    });
  }
};

exports.updateTaskTemplate = async (req, res) => {
  try {
    const updateData = {};
    const payload = req.body || {};

    const validationMessage = validateTemplatePayload(payload);
    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    if (payload.title !== undefined)
      updateData.title = String(payload.title || "").trim();
    if (payload.description !== undefined)
      updateData.description = String(payload.description || "").trim();
    if (payload.priority !== undefined)
      updateData.priority = String(payload.priority || "medium").toLowerCase();
    if (payload.category !== undefined)
      updateData.category = String(payload.category || "general").trim();
    if (payload.recurrenceType !== undefined)
      updateData.recurrenceType = String(
        payload.recurrenceType || "daily",
      ).toLowerCase();
    if (payload.recurrenceDays !== undefined) {
      updateData.recurrenceDays = Array.isArray(payload.recurrenceDays)
        ? payload.recurrenceDays
        : [];
    }
    if (payload.notificationTime !== undefined)
      updateData.notificationTime = String(
        payload.notificationTime || "09:00",
      ).trim();
    if (payload.deliveryChannels !== undefined) {
      updateData.deliveryChannels = normalizeChannelList(
        payload.deliveryChannels,
      ).length
        ? normalizeChannelList(payload.deliveryChannels)
        : ["dashboard"];
    }
    if (payload.targetRoles !== undefined) {
      updateData.targetRoles = normalizeIdList(payload.targetRoles).map(
        normalizeRole,
      );
    }
    if (
      payload.specificUsers !== undefined ||
      payload.specificUserIds !== undefined ||
      payload.targetUsers !== undefined
    ) {
      updateData.specificUserIds = normalizeIdList(
        payload.specificUsers || payload.specificUserIds || payload.targetUsers,
      );
    }
    if (payload.isActive !== undefined) {
      updateData.isActive = Boolean(payload.isActive);
    } else if (payload.active !== undefined) {
      updateData.isActive = Boolean(payload.active);
    }

    const updated = await DailyTaskTemplate.findOneAndUpdate(
      {
        _id: req.params.id,
        workspaceId: req.workspaceSettings._id,
      },
      { $set: updateData },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Daily task template not found.",
      });
    }

    await dailyTaskSchedulerService.generateDailyTaskInstances(
      new Date(),
      req.workspaceSettings._id,
      { ignoreNotificationTime: true, app: req.app },
    );

    res.status(200).json({
      success: true,
      data: serializeTemplate(updated),
    });
  } catch (error) {
    console.error("Update daily task template error:", error);
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Daily task template validation failed.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to update daily task template.",
    });
  }
};

exports.toggleTaskTemplateActive = async (req, res) => {
  try {
    const template = await DailyTaskTemplate.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceSettings._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Daily task template not found.",
      });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
      success: true,
      data: serializeTemplate(template.toObject()),
    });
  } catch (error) {
    console.error("Toggle daily task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update daily task template status.",
    });
  }
};

exports.deleteTaskTemplate = async (req, res) => {
  try {
    const deleted = await DailyTaskTemplate.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.workspaceSettings._id,
    }).lean();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Daily task template not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Daily task template deleted.",
    });
  } catch (error) {
    console.error("Delete daily task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete daily task template.",
    });
  }
};

exports.getTodayTaskInstances = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    const todayKey = dailyTaskSchedulerService.buildDayKey(new Date());
    const todayStart = dailyTaskSchedulerService.buildStartOfDay(new Date());

    await dailyTaskSchedulerService.generateDailyTaskInstances(
      new Date(),
      req.workspaceSettings._id,
      { ignoreNotificationTime: true, app: req.app },
    );

    const filter = {
      workspaceId: req.workspaceSettings._id,
      taskDate: todayStart,
    };

    if (userRole === ROLES.ADMIN) {
      filter.$or = [{ assignedRole: ROLES.ADMIN }, { assignedTo: req.user.id }];
    } else if (userRole === ROLES.HR) {
      filter.$or = [{ assignedRole: ROLES.HR }, { assignedTo: req.user.id }];
    } else {
      filter.$or = [{ assignedRole: ROLES.USER }, { assignedTo: req.user.id }];
    }

    const instances = await DailyTaskInstance.find(filter)
      .sort({ status: 1, priority: -1, createdAt: 1 })
      .populate(
        "templateId",
        "title notificationTime priority category deliveryChannels createdBy",
      )
      .populate("assignedTo", "name email role")
      .lean();

    const dailyTasks = dedupeInstances(instances).map((instance) => ({
      ...serializeInstance(instance),
      templateId: instance.templateId,
      assignedTo: instance.assignedTo,
      dateKey: todayKey,
    }));

    res.status(200).json({
      success: true,
      data: dailyTasks,
    });
  } catch (error) {
    console.error("Get daily tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load today's daily tasks.",
    });
  }
};

exports.getTaskInstances = async (req, res) => {
  try {
    const filter = {
      workspaceId: req.workspaceSettings._id,
    };

    if (req.query.templateId) {
      filter.templateId = req.query.templateId;
    }

    const instances = await DailyTaskInstance.find(filter)
      .sort({ taskDate: -1, createdAt: -1 })
      .populate(
        "templateId",
        "title notificationTime priority category deliveryChannels createdBy",
      )
      .populate("assignedTo", "name email role")
      .lean();

    res.status(200).json({
      success: true,
      data: dedupeInstances(instances).map(serializeInstance),
    });
  } catch (error) {
    console.error("Get daily task instances error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load daily task instances.",
    });
  }
};

exports.completeTaskInstance = async (req, res) => {
  try {
    const instance = await DailyTaskInstance.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceSettings._id,
    });

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Daily task instance not found.",
      });
    }

    if (instance.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this task.",
      });
    }

    instance.status = "completed";
    instance.completedAt = new Date();
    await instance.save();

    res.status(200).json({
      success: true,
      data: serializeInstance(instance.toObject()),
    });
  } catch (error) {
    console.error("Complete daily task error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to complete daily task.",
    });
  }
};

exports.ensureTodayTaskInstances = async (req, res) => {
  try {
    const generated =
      await dailyTaskSchedulerService.generateDailyTaskInstances(
        new Date(),
        req.workspaceSettings._id,
        { app: req.app },
      );

    res.status(200).json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Ensure daily task instances error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate today's daily task instances.",
    });
  }
};

exports.addTaskInstanceRemark = async (req, res) => {
  try {
    const { remark } = req.body || {};
    const instance = await DailyTaskInstance.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceSettings._id,
    });

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Daily task instance not found.",
      });
    }

    const canEdit =
      instance.assignedTo?.toString() === req.user.id ||
      normalizeRole(instance.assignedRole) === normalizeRole(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this task.",
      });
    }

    instance.remarks = remark ? String(remark).trim() : "";
    await instance.save();

    res.status(200).json({
      success: true,
      data: serializeInstance(instance.toObject()),
    });
  } catch (error) {
    console.error("Add daily task remark error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update daily task note.",
    });
  }
};

exports.getTaskInstanceHistory = async (req, res) => {
  try {
    const filter = {
      workspaceId: req.workspaceSettings._id,
    };

    if (req.query.templateId) {
      filter.templateId = req.query.templateId;
    }

    const history = await DailyTaskInstance.find(filter)
      .sort({ taskDate: -1 })
      .populate("templateId", "title description")
      .populate("assignedTo", "name email role")
      .lean();

    res.status(200).json({
      success: true,
      data: history.map(serializeInstance),
    });
  } catch (error) {
    console.error("Get daily task history error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load daily task history.",
    });
  }
};

exports.getTaskAnalytics = async (req, res) => {
  return exports.getDailyTaskReport(req, res);
};

exports.getDailyTaskReport = async (req, res) => {
  try {
    const todayStart = dailyTaskSchedulerService.buildStartOfDay(new Date());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const [templates, instances, allUsers] = await Promise.all([
      DailyTaskTemplate.find({
        workspaceId: req.workspaceSettings._id,
      }).lean(),
      DailyTaskInstance.find({
        workspaceId: req.workspaceSettings._id,
        taskDate: todayStart,
      })
        .populate("assignedTo", "name email role")
        .populate("templateId", "title")
        .lean(),
      User.find(
        {
          isActive: true,
          role: { $in: [ROLES.ADMIN, ROLES.HR, ROLES.USER] },
        },
        "name email role",
      ).lean(),
    ]);

    const todayGenerated = instances.length;
    const completed = instances.filter(
      (item) => item.status === "completed",
    ).length;
    const pending = instances.filter(
      (item) => item.status === "pending",
    ).length;

    const byTemplate = templates.map((template) => {
      const templateInstances = instances.filter(
        (item) =>
          item.templateId?._id?.toString?.() === template._id.toString(),
      );

      return {
        templateId: template._id.toString(),
        title: template.title,
        total: templateInstances.length,
        completed: templateInstances.filter(
          (item) => item.status === "completed",
        ).length,
        pending: templateInstances.filter((item) => item.status === "pending")
          .length,
        completionRate:
          templateInstances.length > 0
            ? Math.round(
                (templateInstances.filter((item) => item.status === "completed")
                  .length /
                  templateInstances.length) *
                  100,
              )
            : 0,
      };
    });

    const perUserStatus = allUsers.map((user) => {
      const userInstances = instances.filter(
        (item) => item.assignedTo?._id?.toString?.() === user._id.toString(),
      );

      return {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        total: userInstances.length,
        completed: userInstances.filter((item) => item.status === "completed")
          .length,
        pending: userInstances.filter((item) => item.status === "pending")
          .length,
      };
    });

    const completionRate =
      todayGenerated > 0 ? Math.round((completed / todayGenerated) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTemplates: templates.length,
          generatedToday: todayGenerated,
          completed,
          pending,
          completionRate,
        },
        templates: templates.map(serializeTemplate),
        byTemplate,
        perUserStatus,
        todayDate: todayStart,
        todayDateKey: dailyTaskSchedulerService.buildDayKey(todayStart),
      },
    });
  } catch (error) {
    console.error("Get daily task report error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load daily task report.",
    });
  }
};
