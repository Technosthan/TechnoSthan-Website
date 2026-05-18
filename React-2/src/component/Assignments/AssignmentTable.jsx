import { Eye, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  formatDateOnly,
  getAssignmentTargetLabel,
  getPriorityStyle,
  getStatusStyle,
  isOverdue,
} from "./assignmentUtils";

const headerFieldClassName =
  "w-full rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50";

const AssignmentTable = ({
  assignments = [],
  filters = {},
  onFilterChange,
  onReset,
  assignees = [],
  canManageAssignment = () => false,
  onView,
  onEdit,
  onDelete,
  showAssigneeFilter = false,
  loading = false,
  emptyMessage = "No assignments found",
}) => {
  const rows = Array.isArray(assignments) ? assignments : [];
  const hasRows = rows.length > 0;

  return (
    <div className="hidden overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/30 backdrop-blur lg:block">
      <table className="w-full table-fixed text-left">
        <colgroup>
          <col className="w-[36%]" />
          <col className="w-[20%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead className="bg-slate-950/70">
          <tr className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
          <tr className="border-t border-white/10 bg-slate-950/45 align-top">
            <th className="px-4 py-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={14}
                />
                <input
                  className={`${headerFieldClassName} pl-9`}
                  value={filters.search || ""}
                  onChange={(event) =>
                    onFilterChange("search", event.target.value)
                  }
                  placeholder="Search title"
                />
              </div>
            </th>
            <th className="px-4 py-3">
              {showAssigneeFilter ? (
                <select
                  className={headerFieldClassName}
                  value={filters.assignedTo || ""}
                  onChange={(event) =>
                    onFilterChange("assignedTo", event.target.value)
                  }
                >
                  <option value="">All assignees</option>
                  {assignees.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-1 py-2 text-xs text-slate-500">Assignee</div>
              )}
            </th>
            <th className="px-4 py-3">
              <select
                className={headerFieldClassName}
                value={filters.priority || ""}
                onChange={(event) =>
                  onFilterChange("priority", event.target.value)
                }
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </th>
            <th className="px-4 py-3">
              <select
                className={headerFieldClassName}
                value={filters.status || ""}
                onChange={(event) =>
                  onFilterChange("status", event.target.value)
                }
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </th>
            <th className="px-4 py-3">
              <select
                className={headerFieldClassName}
                value={filters.deadlineState || ""}
                onChange={(event) =>
                  onFilterChange("deadlineState", event.target.value)
                }
              >
                <option value="">All deadlines</option>
                <option value="overdue">Overdue</option>
              </select>
            </th>
            <th className="px-4 py-3 text-right">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                onClick={onReset}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading && !hasRows ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                Loading assignments...
              </td>
            </tr>
          ) : !hasRows ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((assignment) => (
              <tr
                key={assignment._id}
                className="text-sm text-slate-200 transition hover:bg-white/[0.03]"
              >
                <td className="px-4 py-4 align-top">
                  <p className="truncate font-semibold text-white">
                    {assignment?.title || "Untitled assignment"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                    {assignment?.description || "No description provided."}
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-200">
                  {getAssignmentTargetLabel(assignment)}
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityStyle(
                      assignment?.priority,
                    )}`}
                  >
                    {assignment?.priority || "Medium"}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyle(
                      assignment?.status,
                    )}`}
                  >
                    {(assignment?.status || "pending").replace("_", " ")}
                  </span>
                </td>
                <td
                  className={`px-4 py-4 align-top text-sm ${
                    isOverdue(assignment) ? "text-rose-300" : "text-slate-200"
                  }`}
                >
                  {formatDateOnly(assignment?.deadline)}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      onClick={() => onView(assignment)}
                    >
                      <Eye size={15} />
                    </button>

                    {canManageAssignment(assignment) && (
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-100 transition hover:bg-indigo-500/30"
                        onClick={() => onEdit(assignment)}
                      >
                        <Pencil size={15} />
                      </button>
                    )}

                    {canManageAssignment(assignment) && (
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-100 transition hover:bg-rose-500/30"
                        onClick={() => onDelete(assignment)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
