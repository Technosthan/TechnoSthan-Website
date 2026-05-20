import { Clock3, Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";
import {
  getAssignmentProgress,
  getAssignmentTargetLabel,
  getDeadlineLabel,
  getPriorityStyle,
  getStatusStyle,
  isOverdue,
} from "./assignmentUtils";

const AssignmentCard = ({
  assignment,
  canManageAssignment = () => false,
  canEditAssignment = canManageAssignment,
  canDeleteAssignment = canManageAssignment,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-slate-950/40 backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
          Assignment
        </p>
        <h3 className="mt-2 truncate text-base font-semibold text-white">
          {assignment.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
          {assignment.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyle(assignment.status)}`}
        >
          {assignment.status.replace("_", " ")}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityStyle(assignment.priority)}`}
        >
          {assignment.priority}
        </span>
      </div>
    </div>

    <div className="mt-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>Progress</span>
        <span className="font-medium text-slate-200">
          {getAssignmentProgress(assignment)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
          style={{ width: `${getAssignmentProgress(assignment)}%` }}
        />
      </div>
    </div>

    <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
      <div>
        <span className="text-slate-500">Assigned To</span>
        <p className="mt-1 font-medium text-white">
          {getAssignmentTargetLabel(assignment)}
        </p>
      </div>
      <div>
        <span className="text-slate-500">Deadline</span>
        <p
          className={`mt-1 flex items-center gap-2 font-medium ${isOverdue(assignment) ? "text-rose-300" : "text-white"}`}
        >
          <Clock3 size={16} />
          {getDeadlineLabel(assignment)}
        </p>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        onClick={() => onView(assignment)}
      >
        <Eye size={16} />
        View
      </button>

      {canEditAssignment(assignment) && (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/30"
          onClick={() => onEdit(assignment)}
        >
          <Pencil size={16} />
          Edit
        </button>
      )}

      {canDeleteAssignment(assignment) && (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25"
          onClick={() => onDelete(assignment)}
        >
          <Trash2 size={16} />
          Delete
        </button>
      )}

      {!canManageAssignment(assignment) && (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25"
          onClick={() => onView(assignment)}
        >
          <MessageSquare size={16} />
          Update
        </button>
      )}
    </div>
  </div>
);

export default AssignmentCard;
