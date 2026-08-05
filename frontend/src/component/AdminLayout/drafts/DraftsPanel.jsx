import { useMemo, useState } from "react";
import { Clock3, FileQuestion, Trash2, X } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
};

const DraftActionModal = ({
  open,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  tone = "cyan",
}) => {
  if (!open) return null;

  const toneClass =
    tone === "rose"
      ? "bg-rose-500/10 text-rose-100 border-rose-500/20"
      : "bg-cyan-500/10 text-cyan-100 border-cyan-400/20";

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 px-3 py-6 backdrop-blur">
      <div className="w-full max-w-lg rounded-[30px] border border-white/10 bg-slate-950/96 p-5 shadow-2xl shadow-slate-950/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
          Are you sure you want to continue?
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-slate-950 transition ${
              tone === "rose" ? "bg-rose-400 hover:bg-rose-300" : "bg-cyan-400 hover:bg-cyan-300"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const DraftsPanel = ({
  open,
  onClose,
  drafts,
  titleResolver,
  summaryResolver,
  onRestore,
  onDelete,
  moduleLabel = "Drafts",
  emptyMessage = "Your automatically saved drafts will appear here.",
  unsavedChangesMessage = "Restoring this draft will replace the unsaved values currently shown on this page.",
  hasUnsavedChanges = false,
}) => {
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sortedDrafts = useMemo(
    () => [...(drafts || [])].sort((left, right) => {
      const a = new Date(right.savedAt || 0).getTime();
      const b = new Date(left.savedAt || 0).getTime();
      return a - b;
    }),
    [drafts],
  );

  if (!open) return null;

  const requestRestore = (draft) => {
    if (hasUnsavedChanges) {
      setRestoreTarget(draft);
      return;
    }
    onRestore(draft);
  };

  const confirmRestore = () => {
    if (restoreTarget) {
      onRestore(restoreTarget);
    }
    setRestoreTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 px-3 py-4 backdrop-blur">
        <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/96 shadow-2xl shadow-slate-950/60">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/75">
                {moduleLabel}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your Drafts</h2>
              <p className="mt-2 text-sm text-slate-400">
                Continue from an automatically saved draft.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
              aria-label="Close drafts"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {sortedDrafts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 px-6 py-16 text-center text-slate-400">
                <FileQuestion size={34} className="mx-auto text-cyan-300/70" />
                <p className="mt-4 text-lg font-semibold text-white">
                  No saved drafts
                </p>
                <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {sortedDrafts.map((draft) => {
                  const title = titleResolver?.(draft) || "Untitled Draft";
                  const summary = summaryResolver?.(draft) || "";
                  return (
                    <div
                      key={draft.key}
                      className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-white">
                              {title}
                            </h3>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                              {draft.mode === "edit" ? "Edit" : "Create"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            {summary || "Automatically saved draft"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={12} />
                              {formatDateTime(draft.savedAt)}
                            </span>
                            <span>
                              Age{" "}
                              {Math.max(
                                0,
                                Math.round(
                                  (Date.now() - new Date(draft.savedAt || Date.now()).getTime()) /
                                    60000,
                                ),
                              )}{" "}
                              min
                            </span>
                          </div>
                          {draft.data?.fileMeta ? (
                            <p className="mt-3 text-xs text-amber-200/90">
                              1 file must be selected again after restoring.
                            </p>
                          ) : null}
                          {draft.data?.serverUpdatedAt && draft.data?.savedAt ? (
                            <p className="mt-2 text-xs text-amber-200/90">
                              The saved record was updated after this draft.
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => requestRestore(draft)}
                            className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            Restore Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(draft)}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                          >
                            <Trash2 size={14} />
                            Delete Draft
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <DraftActionModal
        open={Boolean(restoreTarget)}
        title="Restore this draft?"
        message={unsavedChangesMessage}
        confirmLabel="Restore Draft"
        onCancel={() => setRestoreTarget(null)}
        onConfirm={confirmRestore}
      />

      <DraftActionModal
        open={Boolean(deleteTarget)}
        title="Delete Draft?"
        message="This draft will be permanently removed from this browser."
        confirmLabel="Delete Draft"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        tone="rose"
      />
    </>
  );
};

export default DraftsPanel;
