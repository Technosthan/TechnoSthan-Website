const DailyTaskTemplate = require("../models/DailyTaskTemplate");
const DailyTaskInstance = require("../models/DailyTaskInstance");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { ROLES, normalizeRole } = require("../constants/rbac");
const { getWorkspaceSettings } = require("./workspaceSettingsService");
const { sendDailyTaskDelivery } = require("./dailyTaskDeliveryService");

const SCHEDULER_TICK_MS = 60 * 1000;

const buildDayKey = (date = new Date()) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildStartOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const parseNotificationTime = (timeString = "09:00") => {
  const [hours = "0", minutes = "0"] = String(timeString).split(":");
  return {
    hours: Number(hours) || 0,
    minutes: Number(minutes) || 0,
  };
};

const buildScheduledDateTime = (date = new Date(), timeString = "09:00") => {
  const value = new Date(date);
  const { hours, minutes } = parseNotificationTime(timeString);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const normalizeDayIndex = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 6) {
    return numeric;
  }

  const lookup = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  return lookup[String(value).trim().toLowerCase()] ?? null;
};

const templateMatchesDate = (template, date) => {
  if (!template?.isActive) {
    return false;
  }

  const start = template.startDate ? buildStartOfDay(template.startDate) : null;
  const end = template.endDate ? buildStartOfDay(template.endDate) : null;
  const current = buildStartOfDay(date);

  if (start && current < start) {
    return false;
  }

  if (end && current > end) {
    return false;
  }

  if (template.recurrenceType === "daily") {
    return true;
  }

  if (template.recurrenceType === "weekly") {
    const recurrenceDays = (template.recurrenceDays || [])
      .map(normalizeDayIndex)
      .filter((day) => day !== null);

    return recurrenceDays.includes(current.getDay());
  }

  if (template.recurrenceType === "monthly") {
    const recurrenceDays = (template.recurrenceDays || [])
      .map((item) => Number(item))
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31);

    if (recurrenceDays.length > 0) {
      return recurrenceDays.includes(current.getDate());
    }

    return template.startDate
      ? buildStartOfDay(template.startDate).getDate() === current.getDate()
      : false;
  }

  return false;
};

const dedupeUsers = (items = []) => {
  const map = new Map();

  for (const item of items) {
    if (!item) {
      continue;
    }

    const id = String(item._id || item.id || item).trim();
    if (!id) {
      continue;
    }

    if (!map.has(id)) {
      map.set(id, item);
    }
  }

  return Array.from(map.values());
};

const resolveTargetsForTemplate = async (template) => {
  const specificUserIds = Array.isArray(template.specificUserIds)
    ? template.specificUserIds.map((value) => String(value))
    : [];
  const targetRoles = Array.isArray(template.targetRoles)
    ? template.targetRoles.map(normalizeRole)
    : [];

  const usersById = new Map();

  if (specificUserIds.length > 0) {
    const users = await User.find(
      { _id: { $in: specificUserIds }, isActive: true },
      "_id name email role",
    ).lean();

    users.forEach((user) => {
      usersById.set(user._id.toString(), user);
    });
  }

  if (targetRoles.length > 0) {
    const users = await User.find(
      {
        role: { $in: targetRoles },
        isActive: true,
      },
      "_id name email role",
    ).lean();

    users.forEach((user) => {
      usersById.set(user._id.toString(), user);
    });
  }

  return dedupeUsers(Array.from(usersById.values())).map((user) => ({
    assignedTo: user._id,
    assignedRole: normalizeRole(user.role),
  }));
};

const buildInstancePayload = (template, target, taskDate, workspaceId) => ({
  templateId: template._id,
  assignedTo: target.assignedTo,
  assignedRole: target.assignedRole,
  taskDate: buildStartOfDay(taskDate),
  title: template.title,
  description: template.description,
  priority: template.priority,
  category: template.category,
  workspaceId,
});

const removeDuplicateDailyTaskInstances = async (
  workspaceId,
  date = null,
) => {
  const filter = {
    workspaceId,
  };

  if (date) {
    filter.taskDate = buildStartOfDay(date);
  }

  const instances = await DailyTaskInstance.find(filter)
    .sort({ createdAt: 1 })
    .lean();

  const seen = new Map();
  const duplicateIds = [];

  for (const instance of instances) {
    const key = [
      String(instance.templateId || ""),
      String(instance.assignedTo || ""),
      buildStartOfDay(instance.taskDate).toISOString(),
    ].join(":");

    if (seen.has(key)) {
      duplicateIds.push(instance._id);
      continue;
    }

    seen.set(key, instance._id);
  }

  if (duplicateIds.length > 0) {
    await DailyTaskInstance.deleteMany({ _id: { $in: duplicateIds } });
  }

  return duplicateIds.length;
};

const getExistingDailyTaskInstance = async (payload) =>
  DailyTaskInstance.findOne({
    templateId: payload.templateId,
    assignedTo: payload.assignedTo,
    taskDate: payload.taskDate,
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();

const getOrCreateDailyTaskInstance = async (payload) => {
  const existingInstance = await getExistingDailyTaskInstance(payload);
  if (existingInstance) {
    return { instance: existingInstance, created: false };
  }

  try {
    const created = await DailyTaskInstance.create(payload);
    return { instance: created.toObject(), created: true };
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await getExistingDailyTaskInstance(payload);
      if (duplicate) {
        return { instance: duplicate, created: false };
      }
    }

    throw error;
  }
};

const buildDailyTaskNotificationPayload = ({
  user,
  template,
  instance,
  channels,
}) => {
  const title = `Daily Task: ${template.title}`;
  const message = template.description
    ? template.description
    : `You have a new daily task scheduled for ${template.notificationTime || "09:00"}.`;

  return {
    userId: user._id,
    type: "daily_task",
    deliveryChannels: channels,
    title,
    message,
    relatedTaskInstanceId: instance._id,
    relatedTemplateId: template._id,
    workspaceId: instance.workspaceId,
    read: false,
    isRead: false,
    meta: {
      taskDate: instance.taskDate,
      assignedRole: instance.assignedRole,
      assignedTo: instance.assignedTo,
      templateTitle: template.title,
    },
  };
};

const emitDailyTaskNotification = (app, userId, notification) => {
  const io = app?.get?.("io");
  if (!io) {
    return;
  }

  io.to(`user:${String(userId)}`).emit("daily_task_notification", notification);
};

const ensureDailyTaskNotification = async ({
  app,
  template,
  instance,
  user,
}) => {
  const deliveryChannels = Array.from(
    new Set(
      (template.deliveryChannels || ["dashboard"])
        .map((channel) => String(channel || "").trim().toLowerCase())
        .filter((channel) => ["dashboard", "email", "whatsapp"].includes(channel)),
    ),
  );

  if (!deliveryChannels.length) {
    deliveryChannels.push("dashboard");
  }

  const payload = buildDailyTaskNotificationPayload({
    user,
    template,
    instance,
    channels: deliveryChannels,
  });

  const existing = await Notification.findOne({
    userId: user._id,
    relatedTaskInstanceId: instance._id,
    type: "daily_task",
  });

  if (existing) {
    return { notification: existing.toObject(), created: false };
  }

  const notificationDoc = await Notification.create(payload);
  const notification = notificationDoc.toObject();

  if (notification && deliveryChannels.includes("dashboard")) {
    emitDailyTaskNotification(app, user._id, {
      ...notification,
      id: notification._id?.toString?.() || notification.id,
    });
  }

  return { notification, created: true };
};

const generateDailyTaskInstances = async (
  date,
  workspaceId,
  options = {},
) => {
  const currentDate = new Date(date);
  const { ignoreNotificationTime = false } = options;
  const app = options.app || null;
  const scheduledTemplates = await DailyTaskTemplate.find({
    workspaceId,
    isActive: true,
  }).lean();

  await removeDuplicateDailyTaskInstances(workspaceId, currentDate);

  const createdInstances = [];

  for (const template of scheduledTemplates) {
    if (!templateMatchesDate(template, currentDate)) {
      continue;
    }

    const scheduledAt = buildScheduledDateTime(
      currentDate,
      template.notificationTime,
    );

    if (!ignoreNotificationTime && currentDate < scheduledAt) {
      continue;
    }

    const targets = await resolveTargetsForTemplate(template);
    if (!targets.length) {
      continue;
    }

    for (const target of targets) {
      const payload = buildInstancePayload(
        template,
        target,
        currentDate,
        workspaceId,
      );

      try {
        const { instance, created } = await getOrCreateDailyTaskInstance(
          payload,
        );

        if (instance) {
          createdInstances.push(instance);

          const user = await User.findById(
            payload.assignedTo,
            "_id name email role phone",
          )
            .lean()
            .catch(() => null);

          const { created } = payload.assignedTo
            ? await ensureDailyTaskNotification({
                app,
                template,
                instance,
                user: user || {
                  _id: payload.assignedTo,
                  name: "",
                  email: "",
                  role: payload.assignedRole,
                },
              })
            : { created: false };

          if (created && user) {
            await sendDailyTaskDelivery({
              recipient: user,
              instance,
              template,
              channels: template.deliveryChannels || ["dashboard"],
            }).catch((error) => {
              console.warn(
                "Daily task delivery failed:",
                error?.message || error,
              );
            });
          }
        }
      } catch (error) {
        if (error?.code !== 11000) {
          console.error("Daily task instance generation error:", error);
        }
      }
    }
  }

  return createdInstances;
};

const startDailyTaskScheduler = async (app) => {
  const settingsDoc = await getWorkspaceSettings();
  const workspaceId = settingsDoc?._id;

  if (!workspaceId) {
    throw new Error(
      "Workspace settings not available for daily task scheduler",
    );
  }

  await generateDailyTaskInstances(new Date(), workspaceId, { app });
  await removeDuplicateDailyTaskInstances(workspaceId);

  setInterval(async () => {
    try {
      await generateDailyTaskInstances(new Date(), workspaceId, { app });
      await removeDuplicateDailyTaskInstances(workspaceId, new Date());
    } catch (error) {
      console.error("Daily task scheduler error:", error);
    }
  }, SCHEDULER_TICK_MS);
};

module.exports = {
  startDailyTaskScheduler,
  generateDailyTaskInstances,
  buildDayKey,
  buildStartOfDay,
  buildScheduledDateTime,
  templateMatchesDate,
  resolveTargetsForTemplate,
  removeDuplicateDailyTaskInstances,
  getOrCreateDailyTaskInstance,
};
