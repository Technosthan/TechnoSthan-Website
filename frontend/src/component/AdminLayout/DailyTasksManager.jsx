import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit2,
  Eye,
  Plus,
  Save,
  Trash2,
  ToggleLeft,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import useAutoDraft from "../../hooks/useAutoDraft";
import {
  buildDraftKey,
  clearDraft,
  getCurrentDraftUserId,
} from "../../shared/lib/draftPersistence";
import { getStoredUser } from "../../utils/auth";
import {
  GlassPanel,
  StatCard,
  EmptyState,
  SkeletonList,
} from "../Dashboard/DashboardWidgets";

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const RECURRENCE_OPTIONS = ["daily", "weekly", "monthly"];
const ROLE_OPTIONS = ["ADMIN", "HR", "USER"];
const DELIVERY_OPTIONS = ["dashboard", "email", "whatsapp"];

const normalizeNotificationTime = (value) => {
  if (value === null || value === undefined) return "09:00";

  const timeString = String(value).trim();
  if (!timeString) return "09:00";

  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(":");
    return `${String(Number(hours)).padStart(2, "0")}:${minutes}`;
  }

  const meridiemMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (meridiemMatch) {
    let hours = Number(meridiemMatch[1]);
    const minutes = meridiemMatch[2];
    const suffix = meridiemMatch[3].toUpperCase();

    if (suffix === "PM" && hours < 12) hours += 12;
    if (suffix === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return "09:00";
};

const formatRecurrenceLabel = (template) => {
  if (!template) return "";

  if (template.recurrenceType === "daily") return "Daily";

  if (template.recurrenceType === "weekly") {
    return template.recurrenceDays?.length
      ? `Weekly (${template.recurrenceDays.join(", ")})`
      : "Weekly";
  }

  if (template.recurrenceType === "monthly") {
    return template.recurrenceDays?.length
      ? `Monthly (${template.recurrenceDays.join(", ")})`
      : "Monthly";
  }

  return template.recurrenceType;
};

const buildTemplatePayload = (formData) => {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    recurrenceType: formData.recurrenceType,
    recurrenceDays: Array.isArray(formData.recurrenceDays)
      ? formData.recurrenceDays
      : [],
    notificationTime: normalizeNotificationTime(formData.notificationTime),
    priority: formData.priority,
    deliveryChannels: Array.isArray(formData.deliveryChannels)
      ? formData.deliveryChannels
      : ["dashboard"],
    targetRoles: Array.isArray(formData.targetRoles)
      ? formData.targetRoles.map((role) => String(role).toUpperCase())
      : [],
    specificUsers: Array.isArray(formData.targetUsers)
      ? formData.targetUsers
          .map((user) =>
            typeof user === "string" ? user : user?._id || user?.id,
          )
          .filter(Boolean)
      : [],
    isActive: Boolean(formData.active),
  };
};

const getInitialFormData = () => ({
  title: "",
  description: "",
  recurrenceType: "daily",
  recurrenceDays: [],
  notificationTime: "09:00",
  priority: "medium",
  deliveryChannels: ["dashboard"],
  targetRoles: [],
  targetUsers: [],
  active: true,
});

const DailyTasksManager = () => {
  const { showToast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [recurrenceFilter, setRecurrenceFilter] = useState("");
  const [formData, setFormData] = useState(getInitialFormData);
  const [targetUserSearch, setTargetUserSearch] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [viewTemplate, setViewTemplate] = useState(null);
  const recoveryHandledRef = useRef(false);
  const draftUserId = getCurrentDraftUserId(getStoredUser());
  const draftKey = useMemo(
    () =>
      buildDraftKey({
        module: "daily-task",
        mode: editingId ? "edit" : "create",
        recordId: editingId || "new",
        userId: draftUserId,
      }),
    [draftUserId, editingId],
  );
  const draftData = useMemo(
    () => ({
      ...formData,
      editingId,
      showForm,
    }),
    [editingId, formData, showForm],
  );
  const {
    draftSnapshot,
    draftStatus,
    draftError,
    restoreDraft,
    discardDraft,
    markRecoveryHandled,
  } = useAutoDraft({
    key: draftKey,
    data: draftData,
    enabled: showForm,
    module: "daily-task",
    mode: editingId ? "edit" : "create",
    recordId: editingId || "new",
    userId: draftUserId,
  });

  useEffect(() => {
    recoveryHandledRef.current = false;
  }, [draftKey]);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates.filter((template) => {
    const matchesSearch =
      !normalizedSearch ||
        [template.title, template.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const isActive = template.isActive ?? template.active;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      const matchesPriority =
        !priorityFilter || template.priority === priorityFilter;

      const matchesRecurrence =
        !recurrenceFilter || template.recurrenceType === recurrenceFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesRecurrence
      );
    });
  }, [templates, search, statusFilter, priorityFilter, recurrenceFilter]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/daily-task-templates");
      setTemplates(response.data?.data || []);
    } catch (error) {
      console.error("Fetch templates error:", error);
      showToast({
        title: "Error",
        message: "Failed to load task templates",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get("/api/admin/daily-task-report");
      setAnalytics(response.data?.data);
    } catch (error) {
      console.error("Fetch analytics error:", error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchAnalytics();
  }, [fetchTemplates, fetchAnalytics]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      showToast({
        title: "Validation Error",
        message: "Task title is required",
        type: "error",
      });
      return false;
    }

    if (
      formData.targetRoles.length === 0 &&
      formData.targetUsers.length === 0
    ) {
      showToast({
        title: "Validation Error",
        message: "Select at least one target role or user",
        type: "error",
      });
      return false;
    }

    if (!Array.isArray(formData.deliveryChannels) || formData.deliveryChannels.length === 0) {
      showToast({
        title: "Validation Error",
        message: "Select at least one delivery method",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const handleCreateTemplate = async () => {
    try {
      if (!validateForm()) return;

      const payload = buildTemplatePayload(formData);
      console.log("DAILY TASK CREATE PAYLOAD:", payload);

      const response = await api.post(
        "/api/admin/daily-task-templates",
        payload,
      );

      if (response.data?.success) {
        showToast({
          title: "Success",
          message: "Task template created successfully",
          type: "success",
        });

        clearDraft(draftKey);
        setShowForm(false);
        setEditingId(null);
        setFormData(getInitialFormData());

        Promise.allSettled([fetchTemplates(), fetchAnalytics()]);
      }

    } catch (error) {
      console.error("Create template error:", error);
      console.error("Backend response:", error.response?.data);

      showToast({
        title: "Error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create task template",
        type: "error",
      });
    }
  };

  const handleUpdateTemplate = async (id) => {
    try {
      if (!validateForm()) return;

      const payload = buildTemplatePayload(formData);
      console.log("DAILY TASK UPDATE PAYLOAD:", payload);

      const response = await api.put(
        `/api/admin/daily-task-templates/${id}`,
        payload,
      );

      if (response.data?.success) {
        setTemplates((current) =>
          current.map((template) =>
            template._id === id ? response.data.data : template,
          ),
        );

        clearDraft(draftKey);
        setEditingId(null);
        setShowForm(false);
        setFormData(getInitialFormData());

        showToast({
          title: "Success",
          message: "Task template updated successfully",
          type: "success",
        });

        fetchAnalytics();
      }
    } catch (error) {
      console.error("Update template error:", error);
      console.error("Backend response:", error.response?.data);

      showToast({
        title: "Error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update task template",
        type: "error",
      });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await api.patch(
        `/api/admin/daily-task-templates/${id}/toggle-active`,
      );

      if (response.data?.success) {
        setTemplates((current) =>
          current.map((template) =>
            template._id === id ? response.data.data : template,
          ),
        );

        const active = response.data.data.isActive ?? response.data.data.active;

        showToast({
          title: "Success",
          message: `Task template ${active ? "activated" : "deactivated"}`,
          type: "success",
        });

        fetchAnalytics();
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      showToast({
        title: "Error",
        message: "Failed to update task template status",
        type: "error",
      });
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task template?")) {
      return;
    }

    try {
      const response = await api.delete(
        `/api/admin/daily-task-templates/${id}`,
      );

      if (response.data?.success) {
        setTemplates((current) =>
          current.filter((template) => template._id !== id),
        );

        showToast({
          title: "Success",
          message: "Task template deleted successfully",
          type: "success",
        });

        fetchAnalytics();
      }
    } catch (error) {
      console.error("Delete template error:", error);
      showToast({
        title: "Error",
        message: "Failed to delete task template",
        type: "error",
      });
    }
  };

  const normalizeTargetUsers = (users = []) =>
    users
      .flatMap((user) => {
        if (!user) return [];
        if (typeof user === "string") return user;
        if (user._id) return user._id;
        if (user.id) return user.id;
        return [];
      })
      .filter(Boolean);

  const getUserLabel = (user) => {
    if (!user) return "";
    if (typeof user === "string") return user;

    return user.name || user.email || user.role || user._id || user.id || "User";
  };

  useEffect(() => {
    if (!targetUserSearch.trim()) {
      setUserSearchResults([]);
      setUserSearchLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setUserSearchLoading(true);

        const response = await api.get("/api/users", {
          params: {
            search: targetUserSearch.trim(),
            limit: 8,
          },
        });

        const ids = normalizeTargetUsers(formData.targetUsers);
        const users = response.data?.data || [];

        setUserSearchResults(
          users.filter((user) => !ids.includes(user._id || user.id)),
        );
      } catch (error) {
        console.error("Target user search failed", error);
      } finally {
        setUserSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [targetUserSearch, formData.targetUsers]);

  const handleAddTargetUser = (user) => {
    const id = user._id || user.id;
    if (!id) return;

    setFormData((current) => {
      const ids = normalizeTargetUsers(current.targetUsers);
      if (ids.includes(id)) return current;

      return {
        ...current,
        targetUsers: [...current.targetUsers, user],
      };
    });

    setTargetUserSearch("");
    setUserSearchResults([]);
  };

  const handleRemoveTargetUser = (userId) => {
    setFormData((current) => ({
      ...current,
      targetUsers: current.targetUsers.filter(
        (user) =>
          (typeof user === "string" ? user : user._id || user.id) !== userId,
      ),
    }));
  };

  const handleEditClick = (template) => {
    setFormData({
      title: template.title || "",
      description: template.description || "",
      recurrenceType: template.recurrenceType || "daily",
      recurrenceDays: template.recurrenceDays || [],
      notificationTime: normalizeNotificationTime(template.notificationTime),
      priority: template.priority || "medium",
      deliveryChannels: Array.isArray(template.deliveryChannels)
        ? template.deliveryChannels
        : ["dashboard"],
      targetRoles: Array.isArray(template.targetRoles)
        ? template.targetRoles.map((role) => String(role).toUpperCase())
        : [],
      targetUsers: template.specificUsers || template.targetUsers || [],
      active: template.isActive ?? template.active ?? true,
    });

    setEditingId(template._id);
    setShowForm(true);
    setTargetUserSearch("");
    setUserSearchResults([]);
    recoveryHandledRef.current = false;
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(getInitialFormData());
    setTargetUserSearch("");
    setUserSearchResults([]);
    recoveryHandledRef.current = false;
  };

  const summaryCards = useMemo(() => {
    const summary = analytics?.summary || {};
    const total = Number(summary.totalTemplates ?? 0);
    const completed = Number(summary.completed ?? 0);
    const pending = Number(summary.pending ?? 0);
    const completionRate = Number(summary.completionRate ?? 0);

    return [
      {
        label: "Total Templates",
        value: String(total),
        icon: Calendar,
        gradient: "from-cyan-500/20 to-blue-500/20",
      },
      {
        label: "Generated Today",
        value: String(Number(summary.generatedToday ?? 0)),
        icon: CheckCircle2,
        gradient: "from-emerald-500/20 to-green-500/20",
      },
      {
        label: "Completed",
        value: String(completed),
        icon: CheckCircle2,
        gradient: "from-emerald-500/20 to-green-500/20",
      },
      {
        label: "Pending",
        value: String(pending),
        icon: Clock3,
        gradient: "from-amber-500/20 to-orange-500/20",
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        icon: AlertTriangle,
        gradient: "from-indigo-500/20 to-purple-500/20",
      },
    ];
  }, [analytics]);

  return (
    <AdminLayout
      // title="Daily Recurring Tasks"
      // subtitle="Manage task templates and recurring schedules"
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, index) => (
            <StatCard key={card.label} delay={index * 0.05} {...card} />
          ))}
        </div>

        {analytics && (
          <GlassPanel>
            
          </GlassPanel>
        )}

        <GlassPanel>
          <div className="grid gap-3 sm:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates..."
              className="col-span-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:col-span-2"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={recurrenceFilter}
              onChange={(event) => setRecurrenceFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
            >
              <option value="">All recurrence</option>
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/75">
                Task Templates
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                {filteredTemplates.length} templates
                {templates.length > filteredTemplates.length
                  ? ` • ${templates.length} total`
                  : ""}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData(getInitialFormData());
                setShowForm((current) => {
                  const next = !current;
                  recoveryHandledRef.current = false;
                  return next;
                });
              }}
              className="inline-flex h-10 items-center rounded-full bg-cyan-500 px-3 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 sm:h-11 sm:px-5 sm:text-sm"
            >
              <Plus size={16} className="mr-2" />
              {showForm ? "Close form" : "Create template"}
            </button>
          </div>
        </GlassPanel>

        {showForm && (
          <GlassPanel className="space-y-4 border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-white">
                {editingId ? "Edit Task Template" : "Create New Task Template"}
              </h4>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Task Title *
                </label>

                <input
                  type="text"
                  placeholder="e.g., Daily Reporting"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  placeholder="Task description..."
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Recurrence Type
                </label>

                <select
                  value={formData.recurrenceType}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      recurrenceType: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-slate-900">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Task Time
                </label>

                <input
                  type="time"
                  value={normalizeNotificationTime(formData.notificationTime)}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      notificationTime: normalizeNotificationTime(
                        event.target.value,
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Priority
                </label>

                <select
                  value={formData.priority}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-slate-900">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Delivery Methods *
                </label>

                <div className="flex flex-wrap gap-2">
                  {DELIVERY_OPTIONS.map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        const next = formData.deliveryChannels.includes(channel)
                          ? formData.deliveryChannels.filter(
                              (item) => item !== channel,
                            )
                          : [...formData.deliveryChannels, channel];

                        setFormData((current) => ({
                          ...current,
                          deliveryChannels: next.length ? next : ["dashboard"],
                        }));
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        formData.deliveryChannels.includes(channel)
                          ? "border border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Target Roles *
                </label>

                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const newRoles = formData.targetRoles.includes(role)
                          ? formData.targetRoles.filter((item) => item !== role)
                          : [...formData.targetRoles, role];

                        setFormData((current) => ({
                          ...current,
                          targetRoles: newRoles,
                        }));
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        formData.targetRoles.includes(role)
                          ? "border border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Specific Users Optional
                </label>

                <input
                  type="text"
                  value={targetUserSearch}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTargetUserSearch(value);

                    if (!value.trim()) {
                      setUserSearchResults([]);
                      setUserSearchLoading(false);
                    }
                  }}
                  placeholder="Search users by name, email, or role"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                />

                {(userSearchLoading || userSearchResults.length > 0) && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-xl shadow-black/40">
                    {userSearchLoading ? (
                      <div className="p-2 text-xs text-slate-400">
                        Searching users...
                      </div>
                    ) : (
                      userSearchResults.map((user) => (
                        <button
                          key={user._id || user.id}
                          type="button"
                          onClick={() => handleAddTargetUser(user)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/5"
                        >
                          <div>
                            <div className="font-medium text-white">
                              {user.name || user.email || "Unknown user"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.email || user.role}
                            </div>
                          </div>

                          <span className="text-xs text-cyan-300">Add</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {formData.targetUsers?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.targetUsers.map((user) => {
                      const id =
                        typeof user === "string"
                          ? user
                          : user._id || user.id || "";

                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-200"
                        >
                          <span className="max-w-[180px] truncate">
                            {getUserLabel(user)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveTargetUser(id)}
                            className="text-cyan-300 transition hover:text-white"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

              <button
                type="button"
                onClick={() => {
                  if (editingId) {
                    handleUpdateTemplate(editingId);
                  } else {
                    handleCreateTemplate();
                  }
                }}
                className="inline-flex items-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                <Save size={16} className="mr-2" />
                {editingId ? "Update" : "Create"}
              </button>
              <div className="ml-auto self-center text-xs text-slate-400">
                {draftError
                  ? draftError
                  : draftStatus === "saved"
                    ? "Draft saved"
                    : draftStatus === "restored"
                      ? "Draft restored"
                      : draftStatus === "external-update"
                        ? "This draft was updated in another tab."
                        : ""}
              </div>
            </div>
          </GlassPanel>
        )}

        {loading ? (
          <SkeletonList count={3} />
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              templates.length === 0
                ? "No task templates yet"
                : "No matching templates"
            }
            description={
              templates.length === 0
                ? "Create your first recurring task template to get started"
                : "Try a different search or filter to reveal templates."
            }
          />
        ) : (
          <GlassPanel>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-950/90 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Title
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Delivery
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Priority
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Recurrence
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Time
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Target Roles
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Users
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredTemplates.map((template) => {
                    const active = template.isActive ?? template.active;

                    return (
                      <tr
                        key={template._id}
                        className="border-b border-white/5 transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="font-semibold text-white">
                            {template.title}
                          </div>

                          {template.description && (
                            <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {template.description}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top text-slate-300">
                          {(template.deliveryChannels || [])
                            .map((channel) =>
                              String(channel || "")
                                .charAt(0)
                                .toUpperCase() +
                              String(channel || "").slice(1),
                            )
                            .join(", ") || "Dashboard"}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
                              template.priority === "urgent"
                                ? "bg-red-500/20 text-red-200"
                                : template.priority === "high"
                                  ? "bg-orange-500/20 text-orange-200"
                                  : template.priority === "medium"
                                    ? "bg-amber-500/20 text-amber-200"
                                    : "bg-slate-500/20 text-slate-200"
                            }`}
                          >
                            {template.priority?.charAt(0).toUpperCase() +
                              template.priority?.slice(1)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top text-slate-300">
                          {formatRecurrenceLabel(template)}
                        </td>

                        <td className="px-4 py-4 align-top text-xs text-slate-400">
                          {template.notificationTime}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {template.targetRoles?.map((role) => (
                              <span
                                key={`role-${role}`}
                                className="inline-flex rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-200"
                              >
                                {String(role).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top text-xs text-slate-400">
                          {(template.specificUsers || template.targetUsers)
                            ?.length > 0
                            ? `${(template.specificUsers || template.targetUsers).length}`
                            : "—"}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                              active
                                ? "bg-emerald-500/10 text-emerald-200"
                                : "bg-slate-500/10 text-slate-300"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top text-right">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewTemplate(template)}
                              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditClick(template)}
                              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(template._id)}
                              className={`rounded-lg border p-1.5 transition ${
                                active
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "border-slate-500/20 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                              }`}
                              title={active ? "Deactivate" : "Activate"}
                            >
                              <ToggleLeft size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(template._id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        )}
      </div>

      {viewTemplate ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewTemplate(null)}
            aria-label="Close modal"
          />

          <div className="relative w-full max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {viewTemplate.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {(viewTemplate.deliveryChannels || []).join(", ") ||
                      "dashboard"}{" "}
                    • {viewTemplate.priority}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewTemplate(null)}
                  className="text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <p className="text-sm text-slate-200">
                  {viewTemplate.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                  <div>
                    <div className="text-xs text-slate-300">Recurrence</div>
                    <div className="mt-1">
                      {formatRecurrenceLabel(viewTemplate)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Task Time</div>
                    <div className="mt-1">{viewTemplate.notificationTime}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">
                      Delivery Methods
                    </div>
                    <div className="mt-1">
                      {(viewTemplate.deliveryChannels || []).join(", ") ||
                        "dashboard"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Target Roles</div>
                    <div className="mt-1">
                      {(viewTemplate.targetRoles || []).join(", ") || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Target Users</div>
                    <div className="mt-1 text-slate-400">
                      {(viewTemplate.specificUsers ||
                        viewTemplate.targetUsers ||
                        [])
                        .map((user) =>
                          typeof user === "string"
                            ? user
                            : user.name || user.email || user._id || user.id,
                        )
                        .join(", ") || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Status</div>
                    <div className="mt-1">
                      {(viewTemplate.isActive ?? viewTemplate.active)
                        ? "Active"
                        : "Inactive"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Created By</div>
                    <div className="mt-1">
                      {viewTemplate.createdBy?.name ||
                        viewTemplate.createdBy ||
                        "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Created At</div>
                    <div className="mt-1">
                      {viewTemplate.createdAt
                        ? new Date(viewTemplate.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default DailyTasksManager;
