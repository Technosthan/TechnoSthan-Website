export const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

export const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const ASSIGNMENT_TYPE_OPTIONS = [
  { label: "Role Based", value: "role" },
  { label: "Specific User", value: "user" },
];

export const ROLE_TARGET_OPTIONS = [
  { label: "HR", value: "HR" },
  { label: "User", value: "USER" },
  { label: "HR + User", value: "BOTH" },
];

const statusStyles = {
  pending: "bg-amber-500/15 text-amber-200 ring-amber-400/20",
  in_progress: "bg-sky-500/15 text-sky-200 ring-sky-400/20",
  submitted: "bg-violet-500/15 text-violet-200 ring-violet-400/20",
  completed: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
  rejected: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
};

const priorityStyles = {
  low: "bg-slate-500/15 text-slate-200 ring-slate-400/20",
  medium: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/20",
  high: "bg-orange-500/15 text-orange-200 ring-orange-400/20",
  urgent: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
};

export const getStatusStyle = (status) => statusStyles[status] || statusStyles.pending;
export const getPriorityStyle = (priority) => priorityStyles[priority] || priorityStyles.medium;

export const getRoleTargetLabel = (value) => {
  if (value === "HR") {
    return "HR";
  }

  if (value === "BOTH") {
    return "HR + User";
  }

  return "User";
};

export const getAssignmentType = (assignment) =>
  assignment?.assignedTo || (assignment?.assignedUsers || []).length > 0 ? "user" : "role";

export const getAssignmentTargetLabel = (assignment) => {
  if (!assignment) {
    return "Unassigned";
  }

  if (getAssignmentType(assignment) === "user") {
    if (assignment.assignedTo?.name) {
      return assignment.assignedTo.name;
    }

    if ((assignment.assignedUsers || []).length > 0) {
      return assignment.assignedUsers
        .map((user) => user?.name || user?.email)
        .filter(Boolean)
        .join(", ");
    }
  }

  return getRoleTargetLabel(assignment.assignedToRole);
};

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "N/A";

export const formatDateOnly = (value) =>
  value ? new Date(value).toLocaleDateString([], { dateStyle: "medium" }) : "N/A";

export const isOverdue = (assignment) =>
  assignment?.deadline && !["completed"].includes(assignment.status) && new Date(assignment.deadline) < new Date();

export const getDeadlineLabel = (assignment) => {
  if (!assignment?.deadline) {
    return "No deadline";
  }

  const deadline = new Date(assignment.deadline);
  const diff = deadline.getTime() - Date.now();
  const hours = Math.round(diff / (1000 * 60 * 60));

  if (hours < 0) {
    return `${Math.abs(hours)}h overdue`;
  }

  if (hours < 24) {
    return `${hours}h left`;
  }

  const days = Math.ceil(hours / 24);
  return `${days}d left`;
};

export const getRelativeDeadlineLabel = (value) => {
  if (!value) {
    return "No deadline";
  }

  const deadline = new Date(value);
  const diffMs = deadline.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) {
    const overdueDays = Math.round(Math.abs(diffHours) / 24);
    if (overdueDays >= 1) {
      return `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
    }

    return `Overdue by ${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? "" : "s"}`;
  }

  if (diffHours <= 24) {
    if (diffHours === 0) {
      return "Due today";
    }

    return `Due in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }

  const dueDays = Math.ceil(diffHours / 24);
  return `Due in ${dueDays} day${dueDays === 1 ? "" : "s"}`;
};

export const getAssignmentProgress = (assignment) => {
  const status = assignment?.status || "pending";

  if (status === "completed") {
    return 100;
  }

  if (status === "submitted") {
    return 85;
  }

  if (status === "rejected") {
    return 60;
  }

  if (status === "in_progress") {
    return 55;
  }

  return 20;
};

export const getSubmissionStatusLabel = (status) => {
  if (!status) {
    return "Pending";
  }

  if (status === "submitted") {
    return "Pending";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getUserInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export const attachmentsToText = (attachments = []) => attachments.map((item) => item.url).join("\n");

export const textToAttachments = (value = "") =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({
      name: url.replace(/^https?:\/\//, "").slice(0, 40),
      url,
      mimeType: "",
      size: 0,
    }));
