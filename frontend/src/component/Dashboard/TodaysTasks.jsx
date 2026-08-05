import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Loader,
  MessageSquare,
  X,
} from "lucide-react";
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

const getStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={16} className="text-emerald-400" />;
    case "in_progress":
      return <Clock size={16} className="text-cyan-400" />;
    default:
      return <AlertCircle size={16} className="text-amber-400" />;
  }
};

const TodayTaskItem = ({ task, onComplete, onAddRemark }) => {
  const [showRemark, setShowRemark] = useState(false);
  const [remark, setRemark] = useState(task.remarks || "");
  const [completing, setCompleting] = useState(false);
  const [savingRemark, setSavingRemark] = useState(false);

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await onComplete(task._id);
    } finally {
      setCompleting(false);
    }
  };

  const handleSaveRemark = async () => {
    try {
      setSavingRemark(true);
      await onAddRemark(task._id, remark);
      setShowRemark(false);
    } finally {
      setSavingRemark(false);
    }
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <div
      className={`rounded-lg border transition ${
        isOverdue
          ? "border-red-500/30 bg-red-500/5"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="space-y-2 p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <h4 className="font-medium text-white truncate text-sm">
                {task.title}
              </h4>
              {isOverdue && (
                <span className="inline-flex whitespace-nowrap rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-200">
                  Overdue
                </span>
              )}
              <span
                className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getPriorityColor(
                  task.templateId?.priority || "medium",
                )}`}
              >
                {task.templateId?.priority || "medium"}
              </span>
            </div>
          </div>
          {task.status !== "completed" && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-50"
              title="Mark complete"
            >
              {completing ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
            </button>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={12} />
          <span>
            Due:{" "}
            {new Date(task.dueDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Remarks Section */}
        {task.remarks && !showRemark && (
          <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-2">
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <MessageSquare size={12} />
              <span className="line-clamp-1">{task.remarks}</span>
            </div>
          </div>
        )}

        {/* Add Remark Input */}
        {showRemark && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Add remarks..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveRemark}
                disabled={savingRemark}
                className="flex-1 rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {savingRemark ? (
                  <Loader size={12} className="animate-spin mx-auto" />
                ) : (
                  "Save"
                )}
              </button>
              <button
                onClick={() => setShowRemark(false)}
                className="flex-1 rounded-md border border-white/10 px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Remark Button */}
        {!showRemark && task.status !== "completed" && (
          <button
            onClick={() => setShowRemark(true)}
            className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-slate-300"
          >
            <Edit2 size={12} />
            {task.remarks ? "Edit remarks" : "Add remarks"}
          </button>
        )}
      </div>
    </div>
  );
};

const TodaysTasks = ({ cardClassName = "" }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const fetchTodayTasks = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Frontend] TodaysTasks widget: fetching instances...");
      const response = await api.get("/api/tasks/instances/today");
      const fetchedTasks = response.data?.data || [];
      console.log(
        "[Frontend] TodaysTasks widget: received",
        fetchedTasks.length,
        "tasks",
        fetchedTasks,
      );
      setTasks(fetchedTasks);
      setSummary(response.data?.summary);
    } catch (error) {
      console.error("[Frontend] Fetch today tasks error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayTasks();
    const interval = setInterval(fetchTodayTasks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchTodayTasks]);

  const handleCompleteTask = async (taskId) => {
    try {
      await api.patch(`/api/tasks/instances/${taskId}/complete`);
      fetchTodayTasks();
    } catch (error) {
      console.error("Complete task error:", error);
    }
  };

  const handleAddRemark = async (taskId, remark) => {
    try {
      await api.patch(`/api/tasks/instances/${taskId}/remark`, { remark });
      fetchTodayTasks();
    } catch (error) {
      console.error("Add remark error:", error);
    }
  };

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === "pending"),
    [tasks],
  );

  if (loading) {
    return (
      <div
        className={`rounded-lg border border-white/10 bg-white/[0.03] p-4 ${cardClassName}`}
      >
        <div className="flex items-center justify-center py-8">
          <Loader size={20} className="animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-white/10 bg-white/[0.03] ${cardClassName}`}
    >
      <div className="space-y-0">
        {/* Header */}
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Today's Tasks</h3>
              <p className="mt-1 text-xs text-slate-400">
                {pendingTasks.length} pending
                {summary && ` • ${summary.progressPercentage}% progress`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-cyan-400">
                {summary?.total || 0}
              </p>
              <p className="text-[10px] text-slate-400">Total tasks</p>
            </div>
          </div>

          {/* Progress Bar */}
          {summary && summary.total > 0 && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${summary.progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="max-h-[400px] divide-y divide-white/10 overflow-y-auto p-4 sm:p-5">
          {tasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2
                size={24}
                className="mx-auto mb-2 text-emerald-400"
              />
              <p className="text-sm text-slate-400">No tasks for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TodayTaskItem
                  key={task._id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onAddRemark={handleAddRemark}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaysTasks;
