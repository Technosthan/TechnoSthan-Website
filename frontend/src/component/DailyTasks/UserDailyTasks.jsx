import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader } from "lucide-react";
import AdminLayout from "../AdminLayout/AdminLayout";
import api from "../../lib/api";
import { getStoredUser } from "../../utils/auth";

const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500/10 text-red-200 border-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-200 border-orange-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-200 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-200 border-slate-500/20";
  }
};

const getTaskDedupKey = (task) =>
  [
    String(task?.templateId?._id || task?.templateId || ""),
    String(task?.assignedTo?._id || task?.assignedTo || ""),
    new Date(task?.taskDate || task?.dateKey || task?.createdAt || new Date()).toISOString(),
  ].join(":");

const UserDailyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});

  const user = getStoredUser();
  const userId = user?._id;
  const roleKey = (user?.role || "USER").toLowerCase();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Frontend] Current user:", { userId, roleKey });
      const res = await api.get("/api/daily-tasks/today");
      const tasks = Array.isArray(res.data?.data) ? res.data.data : [];
      const deduped = Array.from(
        tasks
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .reduce((map, task) => {
            const key = getTaskDedupKey(task);
            if (!map.has(key)) {
              map.set(key, task);
            }
            return map;
          }, new Map())
          .values(),
      );
      console.log("[Frontend] Fetched task instances:", tasks);
      setTasks(deduped);
    } catch (err) {
      console.error("[Frontend] Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [roleKey, userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (taskId) => {
    try {
      setCompleting((c) => ({ ...c, [taskId]: true }));
      await api.patch(`/api/daily-tasks/${taskId}/complete`);
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting((c) => ({ ...c, [taskId]: false }));
    }
  };

  return (
    <AdminLayout title="Daily Tasks" subtitle="Tasks assigned for today">
      <div className="space-y-5">
        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-center py-8">
                <Loader size={20} className="animate-spin text-cyan-400" />
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center">
              <CheckCircle2
                size={28}
                className="mx-auto mb-2 text-emerald-400"
              />
              <p className="text-sm text-slate-400">No tasks for today</p>
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t._id}
                className={`rounded-lg border border-white/10 bg-white/[0.03] p-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {t.title}
                      </h4>
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPriorityColor(t.templateId?.priority || "medium")}`}
                      >
                        {t.templateId?.priority || "medium"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                    <div className="mt-3 text-xs text-slate-400">
                      Notification Time:{" "}
                      {t.templateId?.notificationTime ||
                        t.notificationTime ||
                        "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Created By:{" "}
                      {t.templateId?.createdBy?.name ||
                        t.templateId?.createdBy ||
                        "—"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-slate-300">
                      {t.status === "completed" ? "✔ Completed" : "□ Pending"}
                    </div>
                    {t.status !== "completed" ? (
                      <button
                        onClick={() => handleComplete(t._id)}
                        disabled={!!completing[t._id]}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
                      >
                        {completing[t._id] ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          "Mark Complete"
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDailyTasks;
