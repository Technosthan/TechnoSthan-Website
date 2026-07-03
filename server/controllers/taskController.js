const TaskTemplate = require("../models/TaskTemplate");
const TaskInstance = require("../models/TaskInstance");
const { normalizeRole, ROLES } = require("../constants/rbac");
const taskSchedulerService = require("../services/taskSchedulerService");

const buildTaskTemplatePayload = (payload, workspaceId, user) => ({
  title: String(payload.title || "").trim(),
  description: String(payload.description || "").trim(),
  recurrenceType: String(payload.recurrenceType || "daily").toLowerCase(),
  recurrenceDays: Array.isArray(payload.recurrenceDays)
    ? payload.recurrenceDays
    : [],
  notificationTime: String(payload.notificationTime || "09:00").trim(),
  priority: String(payload.priority || "medium").toLowerCase(),
  category: String(payload.category || "general").trim(),
  workspaceId,
  active: payload.active !== false,
  startDate: payload.startDate ? new Date(payload.startDate) : new Date(),
  endDate: payload.endDate ? new Date(payload.endDate) : null,
  targetRoles: Array.isArray(payload.targetRoles)
    ? payload.targetRoles.map(normalizeRole)
    : [],
  targetUsers: Array.isArray(payload.targetUsers) ? payload.targetUsers : [],
  createdBy: user.id,
  createdByRole: normalizeRole(user.role),
  notificationEnabled: payload.notificationEnabled !== false,
  popupEnabled: payload.popupEnabled !== false,
  reminderFrequencyMinutes:
    Number(payload.reminderFrequencyMinutes) > 0
      ? Number(payload.reminderFrequencyMinutes)
      : 60,
  escalationHours:
    Number(payload.escalationHours) >= 0 ? Number(payload.escalationHours) : 0,
  resetDailyAfterComplete: payload.resetDailyAfterComplete !== false,
});

exports.createTaskTemplate = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.title) {
      return res.status(400).json({
        success: false,
        message: "Task template title is required.",
      });
    }

    if (
      !Array.isArray(payload.targetRoles) &&
      !Array.isArray(payload.targetUsers)
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one target role or user is required.",
      });
    }

    const templatePayload = buildTaskTemplatePayload(
      payload,
      req.workspaceSettings._id,
      req.user,
    );

    const taskTemplate = await TaskTemplate.create(templatePayload);
    // After creating template, generate today's instances and create one notification per user
    try {
      const workspaceId = req.workspaceSettings._id;
      const instances = await taskSchedulerService.createDailyTaskInstances(
        new Date(),
        workspaceId,
      );
      // create notifications and send sockets for created instances
      for (const inst of instances) {
        try {
          await taskSchedulerService.createNotificationsForTaskInstance(
            inst,
            `New daily task assigned: ${inst.title}`,
            `You have a new task: ${inst.title}`,
          );
          await taskSchedulerService.sendSocketForTaskInstance(
            req.app,
            inst,
            `New daily task assigned: ${inst.title}`,
            `You have a new task: ${inst.title}`,
          );
        } catch (err) {
          console.warn(
            "Creating notification/socket for instance failed:",
            err.message,
          );
        }
      }
    } catch (err) {
      console.warn(
        "Post-create task instance/notification generation failed:",
        err.message,
      );
    }

    res.status(201).json({ success: true, data: taskTemplate });
  } catch (error) {
    console.error("Create task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create task template.",
    });
  }
};

exports.getTaskTemplates = async (req, res) => {
  try {
    const templates = await TaskTemplate.find({
      workspaceId: req.workspaceSettings._id,
    }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error("Get task templates error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load task templates.",
    });
  }
};

exports.getTaskInstances = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    const filter = {
      workspaceId: req.workspaceSettings._id,
    };

    if (userRole === ROLES.ADMIN) {
      filter.$or = [
        { assignedToRole: ROLES.ADMIN },
        { assignedToUser: req.user.id },
      ];
    } else if (userRole === ROLES.HR) {
      filter.$or = [
        { assignedToRole: ROLES.HR },
        { assignedToUser: req.user.id },
      ];
    } else {
      filter.$or = [
        { assignedToRole: ROLES.USER },
        { assignedToUser: req.user.id },
      ];
    }

    const instances = await TaskInstance.find(filter)
      .sort({ reminderAt: 1, dueDate: 1 })
      .populate(
        "templateId",
        "title notificationTime reminderFrequencyMinutes popupEnabled",
      );

    res.status(200).json({ success: true, data: instances });
  } catch (error) {
    console.error("Get task instances error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load task instances.",
    });
  }
};

exports.completeTaskInstance = async (req, res) => {
  try {
    const instanceId = req.params.id;
    const userRole = normalizeRole(req.user.role);

    const instance = await TaskInstance.findById(instanceId);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Task instance not found.",
      });
    }

    const canComplete =
      instance.assignedToUser?.toString() === req.user.id ||
      normalizeRole(instance.assignedToRole) === userRole;

    if (!canComplete) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this task.",
      });
    }

    instance.status = "completed";
    instance.completionAt = new Date();
    instance.reminderAt = null;
    await instance.save();

    res.status(200).json({ success: true, data: instance });
  } catch (error) {
    console.error("Complete task instance error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to complete task instance.",
    });
  }
};

exports.ensureTodayTaskInstances = async (req, res) => {
  try {
    const settings = req.workspaceSettings;
    const workspaceId = settings._id;
    const instances = await taskSchedulerService.createDailyTaskInstances(
      new Date(),
      workspaceId,
    );

    res.status(200).json({ success: true, data: instances });
  } catch (error) {
    console.error("Ensure today task instances error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate today task instances.",
    });
  }
};

exports.getTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await TaskTemplate.findOne({
      _id: id,
      workspaceId: req.workspaceSettings._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Task template not found.",
      });
    }

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error("Get task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load task template.",
    });
  }
};

exports.updateTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const template = await TaskTemplate.findOne({
      _id: id,
      workspaceId: req.workspaceSettings._id,
    });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Task template not found.",
      });
    }

    const updateData = {};
    if (payload.title !== undefined)
      updateData.title = String(payload.title || "").trim();
    if (payload.description !== undefined)
      updateData.description = String(payload.description || "").trim();
    if (payload.recurrenceType !== undefined)
      updateData.recurrenceType = String(
        payload.recurrenceType || "daily",
      ).toLowerCase();
    if (payload.recurrenceDays !== undefined)
      updateData.recurrenceDays = Array.isArray(payload.recurrenceDays)
        ? payload.recurrenceDays
        : [];
    if (payload.notificationTime !== undefined)
      updateData.notificationTime = String(
        payload.notificationTime || "09:00",
      ).trim();
    if (payload.priority !== undefined)
      updateData.priority = String(payload.priority || "medium").toLowerCase();
    if (payload.category !== undefined)
      updateData.category = String(payload.category || "general").trim();
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate
        ? new Date(payload.startDate)
        : new Date();
    if (payload.endDate !== undefined)
      updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;
    if (payload.targetRoles !== undefined)
      updateData.targetRoles = Array.isArray(payload.targetRoles)
        ? payload.targetRoles.map(normalizeRole)
        : [];
    if (payload.targetUsers !== undefined)
      updateData.targetUsers = Array.isArray(payload.targetUsers)
        ? payload.targetUsers
        : [];
    if (payload.notificationEnabled !== undefined)
      updateData.notificationEnabled = payload.notificationEnabled !== false;
    if (payload.popupEnabled !== undefined)
      updateData.popupEnabled = payload.popupEnabled !== false;
    if (payload.reminderFrequencyMinutes !== undefined)
      updateData.reminderFrequencyMinutes =
        Number(payload.reminderFrequencyMinutes) > 0
          ? Number(payload.reminderFrequencyMinutes)
          : 60;
    if (payload.escalationHours !== undefined)
      updateData.escalationHours =
        Number(payload.escalationHours) >= 0
          ? Number(payload.escalationHours)
          : 0;
    if (payload.resetDailyAfterComplete !== undefined)
      updateData.resetDailyAfterComplete =
        payload.resetDailyAfterComplete !== false;

    const updated = await TaskTemplate.findOneAndUpdate(
      {
        _id: id,
        workspaceId: req.workspaceSettings._id,
      },
      updateData,
      {
        new: true,
      },
    );

    // Propagate select changes to existing task instances for this template
    try {
      const instanceUpdate = {};
      if (updateData.title !== undefined)
        instanceUpdate.title = updateData.title;
      if (updateData.description !== undefined)
        instanceUpdate.description = updateData.description;
      if (updateData.priority !== undefined)
        instanceUpdate.priority = updateData.priority;

      if (Object.keys(instanceUpdate).length) {
        await TaskInstance.updateMany(
          { templateId: id },
          { $set: instanceUpdate },
        );
      }

      // If notificationTime changed, recompute reminderAt for future instances
      if (updateData.notificationTime !== undefined) {
        const allInstances = await TaskInstance.find({ templateId: id });
        for (const inst of allInstances) {
          try {
            const [hours = "0", minutes = "0"] = String(
              updateData.notificationTime || "",
            ).split(":");
            const newReminder = new Date(inst.dueDate);
            newReminder.setHours(
              Number(hours) || 0,
              Number(minutes) || 0,
              0,
              0,
            );
            inst.reminderAt = newReminder;
            await inst.save();
          } catch (err) {
            console.warn(
              "Failed updating reminderAt for instance",
              inst._id,
              err.message,
            );
          }
        }
      }
    } catch (err) {
      console.warn(
        "Failed to propagate template updates to instances:",
        err.message,
      );
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update task template.",
    });
  }
};

exports.toggleTaskTemplateActive = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await TaskTemplate.findOne({
      _id: id,
      workspaceId: req.workspaceSettings._id,
    });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Task template not found.",
      });
    }

    template.active = !template.active;
    await template.save();

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error("Toggle task template active error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update task template status.",
    });
  }
};

exports.deleteTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await TaskTemplate.findOneAndDelete({
      _id: id,
      workspaceId: req.workspaceSettings._id,
    });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Task template not found.",
      });
    }

    res.status(200).json({ success: true, message: "Task template deleted." });
  } catch (error) {
    console.error("Delete task template error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete task template.",
    });
  }
};

exports.addTaskInstanceRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!remark || typeof remark !== "string") {
      return res.status(400).json({
        success: false,
        message: "Remark text is required.",
      });
    }

    const instance = await TaskInstance.findById(id);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Task instance not found.",
      });
    }

    const canEdit =
      instance.assignedToUser?.toString() === req.user.id ||
      normalizeRole(instance.assignedToRole) === normalizeRole(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add remarks to this task.",
      });
    }

    instance.remarks = String(remark).trim();
    await instance.save();

    res.status(200).json({ success: true, data: instance });
  } catch (error) {
    console.error("Add task instance remark error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add remark.",
    });
  }
};

exports.getTaskInstanceHistory = async (req, res) => {
  try {
    const { templateId } = req.query;
    const filter = {
      workspaceId: req.workspaceSettings._id,
    };

    if (templateId) {
      filter.templateId = templateId;
    }

    const history = await TaskInstance.find(filter)
      .sort({ dueDate: -1 })
      .populate("templateId", "title description")
      .lean();

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Get task instance history error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load task history.",
    });
  }
};

exports.getTodayTaskInstances = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    console.log(
      "[API] getTodayTaskInstances - User:",
      req.user.id,
      "Role:",
      userRole,
    );

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      workspaceId: req.workspaceSettings._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "in_progress"] },
    };

    if (userRole === ROLES.ADMIN) {
      filter.$or = [
        { assignedToRole: ROLES.ADMIN },
        { assignedToUser: req.user.id },
      ];
    } else if (userRole === ROLES.HR) {
      filter.$or = [
        { assignedToRole: ROLES.HR },
        { assignedToUser: req.user.id },
      ];
    } else {
      filter.$or = [
        { assignedToRole: ROLES.USER },
        { assignedToUser: req.user.id },
      ];
    }

    console.log(
      "[API] getTodayTaskInstances - Filter:",
      JSON.stringify(filter, null, 2),
    );

    const instances = await TaskInstance.find(filter)
      .sort({ reminderAt: 1 })
      .populate("templateId", "title priority category")
      .lean();

    console.log(
      "[API] getTodayTaskInstances - Found",
      instances.length,
      "instances",
    );

    const pending = instances.filter((i) => i.status === "pending");
    const inProgress = instances.filter((i) => i.status === "in_progress");
    const total = instances.length;
    const completed =
      total > 0 ? Math.round((inProgress.length / total) * 100) : 0;

    console.log("[API] getTodayTaskInstances - Returning:", {
      total,
      pending: pending.length,
      inProgress: inProgress.length,
      instances: instances.map((i) => ({
        title: i.title,
        assignedToRole: i.assignedToRole,
        assignedToUser: i.assignedToUser,
      })),
    });

    res.status(200).json({
      success: true,
      data: instances,
      summary: {
        total,
        pending: pending.length,
        inProgress: inProgress.length,
        progressPercentage: completed,
      },
    });
  } catch (error) {
    console.error("Get today task instances error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load today's tasks.",
    });
  }
};

exports.getTaskAnalytics = async (req, res) => {
  try {
    const { templateId, startDate, endDate } = req.query;
    const filter = {
      workspaceId: req.workspaceSettings._id,
    };

    if (templateId) {
      filter.templateId = templateId;
    }

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) {
        filter.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.dueDate.$lte = new Date(endDate);
      }
    }

    const instances = await TaskInstance.find(filter).lean();

    const stats = {
      total: instances.length,
      completed: instances.filter((i) => i.status === "completed").length,
      pending: instances.filter((i) => i.status === "pending").length,
      inProgress: instances.filter((i) => i.status === "in_progress").length,
      skipped: instances.filter((i) => i.status === "skipped").length,
    };

    const completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const byTemplate = {};
    instances.forEach((instance) => {
      const tid = instance.templateId.toString();
      if (!byTemplate[tid]) {
        byTemplate[tid] = {
          templateId: tid,
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
        };
      }
      byTemplate[tid].total += 1;
      byTemplate[tid][instance.status] += 1;
    });

    Object.keys(byTemplate).forEach((tid) => {
      byTemplate[tid].completionRate =
        byTemplate[tid].total > 0
          ? Math.round(
              (byTemplate[tid].completed / byTemplate[tid].total) * 100,
            )
          : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: { ...stats, completionRate },
        byTemplate: Object.values(byTemplate),
      },
    });
  } catch (error) {
    console.error("Get task analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load task analytics.",
    });
  }
};
