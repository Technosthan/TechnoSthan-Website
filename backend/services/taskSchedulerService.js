const TaskTemplate = require("../models/TaskTemplate");
const TaskInstance = require("../models/TaskInstance");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { ROLES, normalizeRole } = require("../constants/rbac");
const { getWorkspaceSettings } = require("./workspaceSettingsService");

const DEFAULT_REMINDER_FREQUENCY_MINUTES = 60;

const parseTimeToDate = (timeString, referenceDate = new Date()) => {
  const [hours = "0", minutes = "0"] = String(timeString || "").split(":");
  const date = new Date(referenceDate);
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date;
};

const normalizeDayIndex = (value) => {
  if (value === null || value === undefined) return null;
  const day = String(value).trim().toLowerCase();
  const index = Number(day);
  if (!Number.isNaN(index) && index >= 0 && index <= 6) {
    return index;
  }

  const lookup = {
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };
  return lookup[day] ?? null;
};

const buildCalendarDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getTemplateMatchesDate = (template, date) => {
  if (!template || !template.active) return false;

  const calendarDate = buildCalendarDate(date);
  const startDate = template.startDate
    ? buildCalendarDate(template.startDate)
    : null;
  const endDate = template.endDate ? buildCalendarDate(template.endDate) : null;

  if (startDate && calendarDate < startDate) {
    return false;
  }

  if (endDate && calendarDate > endDate) {
    return false;
  }

  if (template.recurrenceType === "daily") {
    return true;
  }

  if (template.recurrenceType === "weekly") {
    const recurrenceDays = (template.recurrenceDays || [])
      .map(normalizeDayIndex)
      .filter((value) => value !== null);

    if (!recurrenceDays.length) {
      return false;
    }

    return recurrenceDays.includes(calendarDate.getDay());
  }

  if (template.recurrenceType === "monthly") {
    const recurrenceDays = (template.recurrenceDays || [])
      .map((item) => Number(item))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 31);

    if (!recurrenceDays.length) {
      return template.startDate
        ? buildCalendarDate(template.startDate).getDate() ===
            calendarDate.getDate()
        : false;
    }

    return recurrenceDays.includes(calendarDate.getDate());
  }

  return false;
};

const getTargetUsersForNotification = async (instance) => {
  if (instance.assignedToUser) {
    return [instance.assignedToUser.toString()];
  }

  if (!instance.assignedToRole) {
    return [];
  }

  const normalizedRole = normalizeRole(instance.assignedToRole);
  const users = await User.find(
    {
      role: normalizedRole,
      isActive: true,
    },
    "_id",
  ).lean();

  return users.map((user) => user._id.toString());
};

const getToneFromNotificationType = (type) => {
  if (type === "task_reminder") return "amber";
  if (type === "task_popup") return "cyan";
  if (type === "task_update") return "emerald";
  return "slate";
};

const ensureTaskInstancePayload = (
  template,
  assignedToRole,
  assignedToUser,
  date,
  workspaceId,
) => {
  const taskDueDate = new Date(date);
  taskDueDate.setHours(23, 59, 59, 999);

  return {
    templateId: template._id,
    title: template.title,
    description: template.description,
    dueDate: taskDueDate,
    reminderAt: parseTimeToDate(template.notificationTime, date),
    assignedToRole:
      assignedToRole || normalizeRole(assignedToUser?.role) || ROLES.USER,
    assignedToUser: assignedToUser?.id || assignedToUser || null,
    workspaceId,
    reminderRepeatUntil: taskDueDate,
  };
};

const buildNotificationPayload = ({
  userId,
  taskInstanceId,
  workspaceId,
  title,
  message,
  type,
  meta = {},
}) => ({
  userId,
  taskInstanceId,
  workspaceId,
  title,
  message,
  type,
  meta,
});

const createNotificationsForTaskInstance = async (instance, title, message) => {
  const userIds = await getTargetUsersForNotification(instance);
  if (!userIds.length) {
    return [];
  }

  const operations = [];
  const workspaceId = instance.workspaceId;

  for (const userId of userIds) {
    const payload = buildNotificationPayload({
      userId,
      taskInstanceId: instance._id,
      workspaceId,
      title,
      message,
      type: "task_reminder",
      meta: {
        assignedToRole: instance.assignedToRole,
        assignedToUser: instance.assignedToUser,
      },
    });

    // Use upsert to ensure we create the notification only once per user+taskInstance+type
    operations.push(
      Notification.findOneAndUpdate(
        { userId, taskInstanceId: instance._id, type: payload.type },
        { $setOnInsert: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).catch((err) => {
        // ignore duplicate key errors caused by race conditions
        if (err && err.code === 11000) return null;
        throw err;
      }),
    );
  }

  return Promise.all(operations);
};

const sendSocketForTaskInstance = async (app, instance, title, message) => {
  const io = app.get("io");
  if (!io) {
    return;
  }

  const payload = {
    taskInstanceId: instance._id,
    title,
    message,
    assignedToRole: instance.assignedToRole,
    assignedToUser: instance.assignedToUser,
    dueDate: instance.dueDate,
    reminderAt: instance.reminderAt,
    workspaceId: instance.workspaceId,
  };

  if (instance.assignedToUser) {
    io.to(`user:${instance.assignedToUser.toString()}`).emit(
      "task_reminder",
      payload,
    );
    if (instance.templateId?.popupEnabled) {
      io.to(`user:${instance.assignedToUser.toString()}`).emit(
        "task_popup",
        payload,
      );
    }
    return;
  }

  const normalizedRole = normalizeRole(instance.assignedToRole);
  if (normalizedRole === ROLES.ADMIN) {
    io.to("admins").emit("task_reminder", payload);
    if (instance.templateId?.popupEnabled) {
      io.to("admins").emit("task_popup", payload);
    }
    return;
  }

  if (normalizedRole === ROLES.HR) {
    io.to("hrs").emit("task_reminder", payload);
    if (instance.templateId?.popupEnabled) {
      io.to("hrs").emit("task_popup", payload);
    }
    return;
  }

  if (normalizedRole === ROLES.USER) {
    io.to("users").emit("task_reminder", payload);
    if (instance.templateId?.popupEnabled) {
      io.to("users").emit("task_popup", payload);
    }
  }
};

const createDailyTaskInstances = async (date, workspaceId) => {
  const calendarDate = buildCalendarDate(date);
  const startOfDay = new Date(calendarDate);
  const endOfDay = new Date(calendarDate);
  endOfDay.setHours(23, 59, 59, 999);

  const templates = await TaskTemplate.find({
    workspaceId,
    active: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: endOfDay } },
        ],
      },
      {
        $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }],
      },
    ],
  }).lean();

  const instances = [];

  for (const template of templates) {
    if (!getTemplateMatchesDate(template, calendarDate)) {
      continue;
    }

    console.log("[SCHEDULER] Processing template:", template.title);
    console.log("[SCHEDULER] Template targetRoles:", template.targetRoles);
    console.log("[SCHEDULER] Template targetUsers:", template.targetUsers);

    const targets = [];

    if (Array.isArray(template.targetUsers) && template.targetUsers.length) {
      template.targetUsers.forEach((targetUser) => {
        targets.push({
          assignedToUser: targetUser,
          assignedToRole: template.targetRoles?.[0] || undefined,
        });
      });
    }

    // For role-based targets we must create per-user instances so each user has
    // an independent TaskInstance. Query users for that role and push per-user targets.
    if (Array.isArray(template.targetRoles) && template.targetRoles.length) {
      for (const role of template.targetRoles) {
        const normalized = normalizeRole(role);
        try {
          const users = await User.find(
            { role: normalized, isActive: true },
            "_id",
          ).lean();
          if (users && users.length) {
            users.forEach((u) =>
              targets.push({
                assignedToUser: u._id,
                assignedToRole: normalized,
              }),
            );
          } else {
            // If no users of role found, still create a role-scoped instance
            targets.push({ assignedToRole: normalized, assignedToUser: null });
          }
        } catch (err) {
          console.warn(
            "Failed to expand role targets to users:",
            role,
            err.message,
          );
          targets.push({
            assignedToRole: normalizeRole(role),
            assignedToUser: null,
          });
        }
      }
    }

    if (!targets.length) {
      console.log("[SCHEDULER] No targets for template:", template.title);
      continue;
    }

    console.log(
      "[SCHEDULER] Total targets for",
      template.title + ":",
      targets.length,
    );

    for (const target of targets) {
      const payload = ensureTaskInstancePayload(
        template,
        target.assignedToRole,
        target.assignedToUser,
        calendarDate,
        workspaceId,
      );

      console.log("[SCHEDULER] Creating instance:", {
        title: payload.title,
        assignedToRole: payload.assignedToRole,
        assignedToUser: payload.assignedToUser,
      });

      try {
        const created = await TaskInstance.findOneAndUpdate(
          {
            templateId: payload.templateId,
            dueDate: payload.dueDate,
            assignedToRole: payload.assignedToRole,
            assignedToUser: payload.assignedToUser,
          },
          {
            $setOnInsert: payload,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        console.log("[SCHEDULER] Instance created/updated:", created._id);
        instances.push(created);
      } catch (error) {
        console.warn(
          "Task instance creation skipped due to existing or invalid data",
          error.message,
        );
      }
    }
  }

  return instances;
};

const processDueTaskReminders = async (app) => {
  const now = new Date();
  const instances = await TaskInstance.find({
    status: { $in: ["pending", "in_progress"] },
    reminderAt: { $lte: now },
  })
    .populate("templateId")
    .lean();

  const operations = instances.map(async (instance) => {
    const template = instance.templateId;
    if (!template || !template.notificationEnabled) {
      return null;
    }

    const title = `Reminder: ${instance.title}`;
    const message = `Task is due ${new Date(instance.dueDate).toLocaleString()}.`;

    await createNotificationsForTaskInstance(instance, title, message);
    await sendSocketForTaskInstance(app, instance, title, message);

    const nextReminderAt = template.reminderFrequencyMinutes
      ? new Date(
          instance.reminderAt.getTime() +
            template.reminderFrequencyMinutes * 60000,
        )
      : null;

    const updatePayload = {
      notificationSentAt: now,
    };

    if (template.popupEnabled) {
      updatePayload.popupShownAt = now;
    }

    if (nextReminderAt && nextReminderAt <= instance.dueDate) {
      updatePayload.reminderAt = nextReminderAt;
    } else {
      updatePayload.reminderAt = null;
    }

    return TaskInstance.findByIdAndUpdate(instance._id, updatePayload, {
      new: true,
    });
  });

  return Promise.all(operations);
};

const startTaskScheduler = async (app) => {
  const settingsDoc = await getWorkspaceSettings();
  const workspaceId = settingsDoc._id;

  await createDailyTaskInstances(new Date(), workspaceId);

  const schedulerInterval = 60 * 1000;
  setInterval(async () => {
    try {
      await createDailyTaskInstances(new Date(), workspaceId);
      await processDueTaskReminders(app);
    } catch (error) {
      console.error("Task scheduler error:", error);
    }
  }, schedulerInterval);
};

module.exports = {
  startTaskScheduler,
  createDailyTaskInstances,
  processDueTaskReminders,
  createNotificationsForTaskInstance,
  sendSocketForTaskInstance,
};
