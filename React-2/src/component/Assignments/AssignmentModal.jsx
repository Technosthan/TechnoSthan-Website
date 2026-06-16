import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, BriefcaseBusiness, Layers3, Link2, ListChecks, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  ROLE_TARGET_OPTIONS,
  STATUS_OPTIONS,
  attachmentsToText,
  getAssignmentType,
  textToAttachments,
} from "./assignmentUtils";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-slate-950";

const sectionClassName =
  "rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-5 shadow-xl shadow-slate-950/30";

const getInitialForm = (assignment, canManageAllRoles) => {
  if (assignment) {
    const assignmentType = getAssignmentType(assignment);
    return {
      title: assignment.title || "",
      description: assignment.description || "",
      assignmentType,
      targetRole: assignmentType === "role" ? assignment.assignedToRole || "USER" : canManageAllRoles ? "USER" : "USER",
      assignedUserId:
        assignment.assignedTo?._id ||
        assignment.assignedTo ||
        assignment.assignedUsers?.[0]?._id ||
        "",
      priority: assignment.priority || "medium",
      deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : "",
      status: assignment.status || "pending",
      submissionLink: assignment.submissionLink || "",
      attachmentsText: attachmentsToText(assignment.attachments),
    };
  }

 return {
  title: "",
  description: "",
  assignmentType: canManageAllRoles ? "role" : "user",
  targetRole: "USER",
  assignedUserId: "",
  priority: "medium",
  deadline: new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16),
  status: "pending",
  submissionLink: "",
  attachmentsText: "",
};
};

const AssignmentModal = ({
  open,
  onClose,
  onSubmit,
  assignees,
  assignment,
  loading,
  canManageAllRoles,
}) => {
  const [form, setForm] = useState(getInitialForm(null, canManageAllRoles));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(getInitialForm(assignment, canManageAllRoles));
    setErrors({});
  }, [assignment, open, canManageAllRoles]);

  const roleOptions = useMemo(
    () => (canManageAllRoles ? ROLE_TARGET_OPTIONS : ROLE_TARGET_OPTIONS.filter((option) => option.value === "USER")),
    [canManageAllRoles],
  );

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.deadline) {
      nextErrors.deadline = "Deadline is required.";
    }

    if (form.assignmentType === "role" && !form.targetRole) {
      nextErrors.targetRole = "Select a target role.";
    }

    if (form.assignmentType === "user" && !form.assignedUserId) {
      nextErrors.assignedUserId = "Select an assigned user.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleAssignmentTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      assignmentType: value,
      targetRole: value === "role" ? current.targetRole || "USER" : "",
      assignedUserId: value === "user" ? current.assignedUserId : "",
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.targetRole;
      delete nextErrors.assignedUserId;
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      assignmentType: form.assignmentType,
      targetRole: form.assignmentType === "role" ? form.targetRole : undefined,
      assignedUserId: form.assignmentType === "user" ? form.assignedUserId : undefined,
      priority: form.priority,
      deadline: form.deadline,
      status: form.status,
      submissionLink: form.submissionLink.trim(),
      attachments: textToAttachments(form.attachmentsText),
    });
  };

  const helperText =
    form.assignmentType === "role"
      ? "Task will be assigned automatically to all users belonging to the selected role."
      : "Task will be assigned only to the selected user.";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 px-4 py-8 backdrop-blur"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[36px] border border-cyan-400/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-slate-950/60"
          >
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                  Assignment Control
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {assignment ? "Refine Assignment Flow" : "Create New Assignment"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Choose one assignment strategy at a time so the task destination is always explicit and easy to review.
                </p>
              </div>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <section className={sectionClassName}>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <p className="text-sm text-slate-400">Define the task clearly before choosing who should receive it.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">Title</label>
                    <input
                      className={fieldClassName}
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                    />
                    {errors.title && <p className="mt-2 text-xs text-rose-300">{errors.title}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">Description</label>
                    <textarea
                      className={`${fieldClassName} min-h-[150px]`}
                      value={form.description}
                      onChange={(event) => updateField("description", event.target.value)}
                    />
                    {errors.description && <p className="mt-2 text-xs text-rose-300">{errors.description}</p>}
                  </div>
                </div>
              </section>

              <section className={sectionClassName}>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-200">
                    <Layers3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Assignment Target</h3>
                    <p className="text-sm text-slate-400">Select one strategy only: assign by role or route the task to one specific active user.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Assignment Type</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ASSIGNMENT_TYPE_OPTIONS.map((option) => {
                        const isActive = form.assignmentType === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAssignmentTypeChange(option.value)}
                            className={`rounded-[24px] border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                                : "border-white/10 bg-slate-950/50 hover:border-white/20 hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`rounded-2xl p-2 ${isActive ? "bg-cyan-500/20 text-cyan-100" : "bg-white/5 text-slate-300"}`}>
                                {option.value === "role" ? <ListChecks size={18} /> : <UserRound size={18} />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{option.label}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {option.value === "role" ? "Broadcast by department or workforce segment." : "Send the task to one named user only."}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={form.assignmentType}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4"
                    >
                      {form.assignmentType === "role" ? (
                        <>
                          <label className="mb-2 block text-sm font-medium text-slate-200">Target Role</label>
                          <select
                            className={fieldClassName}
                            value={form.targetRole}
                            onChange={(event) => updateField("targetRole", event.target.value)}
                          >
                            {roleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.targetRole && <p className="mt-2 text-xs text-rose-300">{errors.targetRole}</p>}
                        </>
                      ) : (
                        <>
                          <label className="mb-2 block text-sm font-medium text-slate-200">Assigned User</label>
                          <select
                            className={fieldClassName}
                            value={form.assignedUserId}
                            onChange={(event) => updateField("assignedUserId", event.target.value)}
                          >
                            <option value="">Select an active user</option>
                            {assignees.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                          {errors.assignedUserId && <p className="mt-2 text-xs text-rose-300">{errors.assignedUserId}</p>}
                        </>
                      )}

                      <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-500/5 px-4 py-3 text-sm text-slate-300">
                        {helperText}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <section className={sectionClassName}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Task Settings</h3>
                      <p className="text-sm text-slate-400">Set the delivery expectation and review state for this assignment.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Deadline</label>
                      <input
                        type="datetime-local"
                        className={fieldClassName}
                        value={form.deadline}
                        onChange={(event) => updateField("deadline", event.target.value)}
                      />
                      {errors.deadline && <p className="mt-2 text-xs text-rose-300">{errors.deadline}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Priority</label>
                      <select
                        className={fieldClassName}
                        value={form.priority}
                        onChange={(event) => updateField("priority", event.target.value)}
                      >
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-200">Status</label>
                      <select
                        className={fieldClassName}
                        value={form.status}
                        onChange={(event) => updateField("status", event.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className={sectionClassName}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-200">
                      <Link2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Submission</h3>
                      <p className="text-sm text-slate-400">Add the main submission destination and any supporting reference links.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Submission Link</label>
                      <input
                        className={fieldClassName}
                        placeholder="https://drive.google.com/..."
                        value={form.submissionLink}
                        onChange={(event) => updateField("submissionLink", event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Attachments / Resource Links</label>
                      <textarea
                        className={`${fieldClassName} min-h-[155px]`}
                        placeholder="One URL per line"
                        value={form.attachmentsText}
                        onChange={(event) => updateField("attachmentsText", event.target.value)}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Only one assignment strategy is active at a time, so the payload stays unambiguous.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Saving..." : assignment ? "Save Assignment" : "Create Assignment"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
