export const formatCompactDate = (value) =>
  value
    ? new Date(value).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : "No date";

export const formatDateTimeLabel = (value) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

export const getRelativeDeadlineLabel = (value) => {
  if (!value) {
    return "No deadline";
  }

  const deadline = new Date(value);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 0) {
      return `Overdue by ${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? "" : "s"}`;
    }
    if (diffHours === 0) {
      return "Due today";
    }
    return `Due in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
  }

  if (diffDays === 0) {
    return "Due today";
  }

  return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
};

export const getRelativeTimeLabel = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatCompactDate(value);
};

export const getProgressValue = (assignment) => {
  const status = assignment?.status || "pending";

  if (status === "completed") {
    return 100;
  }

  if (status === "submitted") {
    return 85;
  }

  if (status === "in_progress") {
    return 55;
  }

  if (status === "rejected") {
    return 65;
  }

  return 20;
};

export const getSubmissionReviewState = (submission) => {
  if (!submission?.status) {
    return "pending";
  }

  if (submission.status === "submitted") {
    return "pending";
  }

  return submission.status;
};

export const getUserInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export const buildAssignmentActivity = (assignment = {}, actorName = "System") => {
  const items = [];

  if (assignment.createdAt) {
    items.push({
      id: `${assignment._id || assignment.title}-created`,
      title: "Assignment assigned",
      description: `${assignment.title || "Task"} was assigned by ${assignment.assignedBy?.name || actorName}.`,
      time: assignment.createdAt,
      tone: "cyan",
    });
  }

  if (assignment.lastSubmittedAt || assignment.status === "submitted") {
    items.push({
      id: `${assignment._id || assignment.title}-submitted`,
      title: "Submission received",
      description: `${assignment.title || "Task"} was submitted for review.`,
      time: assignment.lastSubmittedAt || assignment.updatedAt || assignment.deadline,
      tone: "violet",
    });
  }

  if (assignment.lastReviewedAt) {
    items.push({
      id: `${assignment._id || assignment.title}-reviewed`,
      title: "Review updated",
      description: `${assignment.title || "Task"} review status changed to ${(assignment.status || "pending").replace("_", " ")}.`,
      time: assignment.lastReviewedAt,
      tone: assignment.status === "rejected" ? "rose" : "emerald",
    });
  }

  return items;
};

export const createSparklineData = (values = []) =>
  values.map((value, index) => ({
    name: `P${index + 1}`,
    value,
  }));

