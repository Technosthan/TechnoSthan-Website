import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageSquareQuote,
  Paperclip,
  SendHorizonal,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  STATUS_OPTIONS,
  attachmentsToText,
  formatDateTime,
  getAssignmentProgress,
  getAssignmentTargetLabel,
  getAssignmentType,
  getPriorityStyle,
  getRoleTargetLabel,
  getStatusStyle,
  getSubmissionStatusLabel,
  textToAttachments,
} from "./assignmentUtils";
import { uploadAssignmentFile } from "../../lib/assignments";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60";

const buttonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition";

const AssignmentDetails = ({
  assignment,
  open,
  onClose,
  canManageAssignments,
  onStatusChange,
  onFeedback,
  onReviewSubmission,
  onSubmitWork,
  loading,
  canSubmitWork = true,
  canUploadFiles = true,
  showSubmissionActions = true,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [submissionForm, setSubmissionForm] = useState({
    submissionLink: "",
    attachmentsText: "",
    note: "",
    status: "submitted",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!assignment) {
      return;
    }

    setSubmissionForm({
      submissionLink: assignment.submissionLink || "",
      attachmentsText: attachmentsToText(assignment.attachments),
      note: "",
      status: assignment.status === "submitted" ? "submitted" : "in_progress",
    });
    setFeedbackMessage("");
    setFeedbackStatus("");
    setUploadProgress(0);
    setUploading(false);
    setDragActive(false);
  }, [assignment]);

  if (!assignment) {
    return null;
  }

  const parsedAttachments = textToAttachments(submissionForm.attachmentsText);

  const handleFileUpload = async (file) => {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const response = await uploadAssignmentFile(file, (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }

        setUploadProgress(
          Math.round((progressEvent.loaded / progressEvent.total) * 100),
        );
      });

      const nextAttachments = [
        ...textToAttachments(submissionForm.attachmentsText),
        response.data,
      ];

      setSubmissionForm((current) => ({
        ...current,
        attachmentsText: attachmentsToText(nextAttachments),
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleInputUpload = async (event) => {
    const file = event.target.files?.[0];
    await handleFileUpload(file);
    event.target.value = "";
  };

  const removeAttachment = (url) => {
    const nextAttachments = parsedAttachments.filter((item) => item.url !== url);
    setSubmissionForm((current) => ({
      ...current,
      attachmentsText: attachmentsToText(nextAttachments),
    }));
  };

  const submissionActions = (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <h3 className="text-sm font-semibold text-white">Submission Workspace</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Share links, upload files, and submit progress updates without leaving
        the assignment flow.
      </p>
      <div className="mt-4 grid gap-3">
        <input
          className={fieldClassName}
          placeholder="Submission link"
          value={submissionForm.submissionLink}
          onChange={(event) =>
            setSubmissionForm((current) => ({
              ...current,
              submissionLink: event.target.value,
            }))
          }
        />

        <div
          className={`rounded-[24px] border border-dashed px-4 py-4 transition ${
            dragActive
              ? "border-cyan-400/40 bg-cyan-500/10"
              : "border-white/10 bg-slate-950/40"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            if (canUploadFiles) {
              setDragActive(true);
            }
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={async (event) => {
            event.preventDefault();
            setDragActive(false);
            if (!canUploadFiles) {
              return;
            }
            const file = event.dataTransfer.files?.[0];
            await handleFileUpload(file);
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Upload size={16} />
                Drag and drop files here
              </span>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                PDF, DOC, DOCX, JPG, PNG, and WEBP are supported.
              </p>
            </div>
            <button
              type="button"
              className={`${buttonClassName} border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10`}
              onClick={() => fileInputRef.current?.click()}
              disabled={!canUploadFiles}
            >
              Choose file
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputUpload}
          />

          {!canUploadFiles ? (
            <p className="mt-3 text-xs text-slate-500">
              File uploads are disabled for your account.
            </p>
          ) : null}

          {uploading ? (
            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
              <div className="flex items-center justify-between gap-3 text-sm text-cyan-100">
                <span>Uploading file</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-950/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {parsedAttachments.length > 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Uploaded files</p>
              <span className="text-xs text-slate-500">
                {parsedAttachments.length} file
                {parsedAttachments.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {parsedAttachments.map((attachment) => (
                <div
                  key={attachment.url}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/55 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
                      <FileText size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {attachment.name || attachment.url}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {attachment.url}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
                    onClick={() => removeAttachment(attachment.url)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <textarea
          className={`${fieldClassName} min-h-[96px]`}
          placeholder="Attachment URLs, one per line"
          value={submissionForm.attachmentsText}
          onChange={(event) =>
            setSubmissionForm((current) => ({
              ...current,
              attachmentsText: event.target.value,
            }))
          }
        />

        <textarea
          className={`${fieldClassName} min-h-[110px]`}
          placeholder="Progress update, blockers, or submission note"
          value={submissionForm.note}
          onChange={(event) =>
            setSubmissionForm((current) => ({
              ...current,
              note: event.target.value,
            }))
          }
        />

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <select
            className={fieldClassName}
            value={submissionForm.status}
            onChange={(event) =>
              setSubmissionForm((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
          >
            <option value="in_progress">Save as in progress</option>
            <option value="submitted">Submit for review</option>
          </select>
          <button
            className={`${buttonClassName} bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() =>
              onSubmitWork({
                submissionLink: submissionForm.submissionLink,
                attachments: parsedAttachments,
                note: submissionForm.note,
                status: submissionForm.status,
              })
            }
            disabled={loading || uploading || !canSubmitWork}
          >
            <SendHorizonal size={16} />
            {!canSubmitWork
              ? "Submission Disabled"
              : assignment.lastSubmittedAt
                ? "Save Resubmission"
                : "Save Submission"}
          </button>
        </div>

        {!canSubmitWork ? (
          <p className="text-xs text-slate-500">
            Submission updates are currently disabled for your account.
          </p>
        ) : null}
      </div>
    </div>
  );

  const feedbackActions = (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <h3 className="text-sm font-semibold text-white">Feedback & Status</h3>
        <div className="mt-4 grid gap-3">
          <select
            className={fieldClassName}
            value={feedbackStatus}
            onChange={(event) => setFeedbackStatus(event.target.value)}
          >
            <option value="">Keep current status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <textarea
            className={`${fieldClassName} min-h-[120px]`}
            placeholder="Add remarks, review notes, or next-step guidance"
            value={feedbackMessage}
            onChange={(event) => setFeedbackMessage(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button
              className={`${buttonClassName} bg-indigo-500 text-white shadow-lg shadow-indigo-500/30`}
              onClick={() =>
                onFeedback({
                  message: feedbackMessage,
                  status: feedbackStatus || undefined,
                })
              }
              disabled={loading}
            >
              <MessageSquareQuote size={16} />
              Send Feedback
            </button>
            <button
              className={`${buttonClassName} border border-emerald-400/30 bg-emerald-500/10 text-emerald-100`}
              onClick={() =>
                onStatusChange("completed", "Marked as completed by manager")
              }
              disabled={loading}
            >
              <CheckCircle2 size={16} />
              Mark Completed
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <h3 className="text-sm font-semibold text-white">Submission Review</h3>
        <div className="mt-4 space-y-4">
          {(assignment.submissions || []).length === 0 ? (
            <p className="text-sm text-slate-500">No submissions yet.</p>
          ) : (
            assignment.submissions.map((submission) => (
              <div
                key={submission._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {submission.userId?.name || "User"} • Revision{" "}
                      {submission.revision}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(submission.submittedAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyle(
                      submission.status === "approved"
                        ? "completed"
                        : submission.status === "needs_revision"
                          ? "rejected"
                          : submission.status === "submitted"
                            ? "submitted"
                            : submission.status,
                    )}`}
                  >
                    {getSubmissionStatusLabel(submission.status)}
                  </span>
                </div>
                {submission.note ? (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {submission.note}
                  </p>
                ) : null}
                {(submission.attachments || []).length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {submission.attachments.map((attachment, index) => (
                      <li key={`${attachment.url}-${index}`}>
                        <a
                          className="text-sm text-slate-200 underline underline-offset-4"
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {attachment.name || attachment.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                    onClick={() =>
                      onReviewSubmission(submission._id, {
                        status: "approved",
                        feedback: "Approved by reviewer",
                      })
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100"
                    onClick={() =>
                      onReviewSubmission(submission._id, {
                        status: "rejected",
                        feedback: "Needs revision and resubmission",
                      })
                    }
                  >
                    Needs Revision
                  </button>
                  <button
                    className="rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-100"
                    onClick={() =>
                      onReviewSubmission(submission._id, {
                        status: "rejected",
                        feedback: "Needs revision",
                      })
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const unavailableActions = (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <h3 className="text-sm font-semibold text-white">Access Restricted</h3>
      <p className="mt-3 text-sm text-slate-400">
        Interactive actions for this assignment are not enabled for your
        account right now.
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] overflow-hidden bg-slate-950/80 backdrop-blur"
        >
          <div className="flex h-full justify-end">
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              className="flex h-full w-full max-w-[1100px] flex-col overflow-auto border-l border-white/10 bg-slate-900/95 p-4 shadow-2xl sm:p-5 lg:w-[78vw] lg:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Assignment Details
                  </p>
                  <h2 className="mt-2 truncate text-2xl font-semibold text-white">
                    {assignment.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      {getAssignmentType(assignment) === "user"
                        ? "Specific User"
                        : getRoleTargetLabel(assignment.assignedToRole)}
                    </span>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      {getAssignmentProgress(assignment)}% progress
                    </span>
                  </div>
                </div>
                <button
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Completion progress</span>
                  <span className="font-medium text-slate-200">
                    {getAssignmentProgress(assignment)}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                    style={{ width: `${getAssignmentProgress(assignment)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                    <h3 className="text-sm font-semibold text-white">
                      Task Summary
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {assignment.description}
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Assigned To
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {getAssignmentTargetLabel(assignment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Assigned By
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {assignment.assignedBy?.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Deadline
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatDateTime(assignment.deadline)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Completed At
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatDateTime(assignment.completedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-indigo-300" />
                      <h3 className="text-sm font-semibold text-white">
                        Attachments & Submission
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      {assignment.submissionLink ? (
                        <a
                          className="flex items-center gap-2 text-indigo-200 underline underline-offset-4"
                          href={assignment.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={16} />
                          Open submission link
                        </a>
                      ) : null}

                      {(assignment.attachments || []).length > 0 ? (
                        <ul className="space-y-2">
                          {assignment.attachments.map((attachment, index) => (
                            <li key={`${attachment.url}-${index}`}>
                              <a
                                className="text-slate-200 underline underline-offset-4"
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {attachment.name || attachment.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">
                          No attachments added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                    <h3 className="text-sm font-semibold text-white">
                      Remarks Timeline
                    </h3>
                    <div className="mt-4 space-y-4">
                      {(assignment.remarks || []).length === 0 ? (
                        <p className="text-sm text-slate-500">No remarks yet.</p>
                      ) : (
                        assignment.remarks.map((remark, index) => (
                          <div
                            key={`${remark.createdAt}-${index}`}
                            className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-white">
                                {remark.authorName ||
                                  remark.author?.name ||
                                  remark.role}
                              </p>
                              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                {remark.kind}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                              {remark.message}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                              {formatDateTime(remark.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {canManageAssignments
                    ? feedbackActions
                    : showSubmissionActions
                      ? submissionActions
                      : unavailableActions}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentDetails;
