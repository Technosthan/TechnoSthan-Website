import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  MessageSquareQuote,
  Paperclip,
  SendHorizonal,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  STATUS_OPTIONS,
  attachmentsToText,
  formatDateTime,
  getAssignmentTargetLabel,
  getAssignmentType,
  getPriorityStyle,
  getRoleTargetLabel,
  getStatusStyle,
  textToAttachments,
} from "./assignmentUtils";
import { uploadAssignmentFile } from "../../lib/assignments";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60";

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
  }, [assignment]);

  if (!assignment) {
    return null;
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
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
      setSubmissionForm({
        ...submissionForm,
        attachmentsText: attachmentsToText(nextAttachments),
      });
    } finally {
      setUploading(false);
    }
  };

  const submissionActions = (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <h3 className="text-sm font-semibold text-white">Submission</h3>
      <div className="mt-4 grid gap-3">
        <input
          className={fieldClassName}
          placeholder="Submission link"
          value={submissionForm.submissionLink}
          onChange={(event) =>
            setSubmissionForm({
              ...submissionForm,
              submissionLink: event.target.value,
            })
          }
        />
        <textarea
          className={`${fieldClassName} min-h-[110px]`}
          placeholder="Attachment URLs, one per line"
          value={submissionForm.attachmentsText}
          onChange={(event) =>
            setSubmissionForm({
              ...submissionForm,
              attachmentsText: event.target.value,
            })
          }
        />
        <label className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
          <span className="mb-2 inline-flex items-center gap-2 text-white">
            <Upload size={16} />
            Upload PDF, DOC, DOCX, or image
          </span>
          <input
            type="file"
            className="mt-2 block w-full text-xs"
            onChange={handleFileUpload}
          />
          {uploading && (
            <p className="mt-3 text-xs text-indigo-200">
              Uploading... {uploadProgress}%
            </p>
          )}
        </label>
        <textarea
          className={`${fieldClassName} min-h-[110px]`}
          placeholder="Progress update or submission note"
          value={submissionForm.note}
          onChange={(event) =>
            setSubmissionForm({ ...submissionForm, note: event.target.value })
          }
        />
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <select
            className={fieldClassName}
            value={submissionForm.status}
            onChange={(event) =>
              setSubmissionForm({
                ...submissionForm,
                status: event.target.value,
              })
            }
          >
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
            onClick={() =>
              onSubmitWork({
                submissionLink: submissionForm.submissionLink,
                attachments: textToAttachments(submissionForm.attachmentsText),
                note: submissionForm.note,
                status: submissionForm.status,
              })
            }
            disabled={loading || uploading}
          >
            <SendHorizonal size={16} />
            {loading ? "Saving..." : "Save Submission"}
          </button>
        </div>
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
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
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
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100"
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {submission.userId?.name || "User"} • Revision{" "}
                      {submission.revision}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {submission.status} •{" "}
                      {formatDateTime(submission.submittedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100"
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
                      className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100"
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
                {submission.note && (
                  <p className="mt-3 text-sm text-slate-300">
                    {submission.note}
                  </p>
                )}
                {(submission.attachments || []).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {submission.attachments.map((attachment, index) => (
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-stretch justify-end bg-slate-950/80 backdrop-blur overflow-hidden"
        >
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="
    flex
    h-full
    w-[70vw]
    min-w-[420px]
    max-w-[100vw]
    resize-x
    overflow-auto
    flex-col
    border-l
    border-white/10
    bg-slate-900/95
    p-6
    shadow-2xl
  "
            style={{
              resize: "horizontal",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Assignment Details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
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
                </div>
              </div>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"
                onClick={onClose}
              >
                Close
              </button>
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
                    {assignment.submissionLink && (
                      <a
                        className="flex items-center gap-2 text-indigo-200 underline underline-offset-4"
                        href={assignment.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={16} />
                        Open submission link
                      </a>
                    )}

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
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
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
                {canManageAssignments ? feedbackActions : submissionActions}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentDetails;
