const test = require("node:test");
const assert = require("node:assert/strict");

const dailyTaskController = require("../controllers/dailyTaskController");
const DailyTaskTemplate = require("../models/DailyTaskTemplate");
const dailyTaskSchedulerService = require("../services/dailyTaskSchedulerService");

test("createTaskTemplate generates today instances immediately", async () => {
  let schedulerCalls = [];
  const originalCreate = DailyTaskTemplate.create;
  const originalGenerate = dailyTaskSchedulerService.generateDailyTaskInstances;

  DailyTaskTemplate.create = async () => ({
    toObject: () => ({
      _id: "template-1",
      title: "Test task",
      description: "",
      priority: "medium",
      category: "general",
      recurrenceType: "daily",
      notificationTime: "09:00",
      targetRoles: ["USER"],
      specificUserIds: [],
      isActive: true,
      createdBy: "user-1",
      workspaceId: "workspace-1",
    }),
  });

  dailyTaskSchedulerService.generateDailyTaskInstances = async (
    date,
    workspaceId,
    app,
    options = {},
  ) => {
    schedulerCalls.push({ date, workspaceId, app, options });
    return [];
  };

  const req = {
    body: {
      title: "Test task",
      description: "",
      recurrenceType: "daily",
      notificationTime: "09:00",
      priority: "medium",
      category: "general",
      targetRoles: ["USER"],
      specificUsers: [],
      isActive: true,
    },
    workspaceSettings: { _id: "workspace-1" },
    user: { id: "user-1" },
    app: {},
  };

  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  try {
    await dailyTaskController.createTaskTemplate(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(schedulerCalls.length, 1);
    assert.equal(schedulerCalls[0].workspaceId, "workspace-1");
    assert.equal(schedulerCalls[0].options.ignoreNotificationTime, true);
    assert.equal(res.payload.success, true);
  } finally {
    DailyTaskTemplate.create = originalCreate;
    dailyTaskSchedulerService.generateDailyTaskInstances = originalGenerate;
  }
});
