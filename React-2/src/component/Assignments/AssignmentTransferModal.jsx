import { AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const modalInputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60";

const AssignmentTransferModal = ({
  open,
  assignment,
  assignees = [],
  recipient = "",
  note = "",
  saving = false,
  onRecipientChange,
  onNoteChange,
  onClose,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open, assignment?._id]);

  const availableUsers = assignees;

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const currentAssigneeId =
      assignment?.assignedTo?._id ||
      assignment?.assignedTo ||
      assignment?.assignedUsers?.[0]?._id ||
      "";

    return availableUsers.filter((user) => {
      if (!user?._id || String(user._id) === String(currentAssigneeId)) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search)
      );
    });
  }, [assignment, availableUsers, searchTerm]);

  useEffect(() => {
    console.log("Search:", searchTerm);
    console.log("Available users:", availableUsers.length);
    console.log("Filtered users:", filteredUsers.length);
  }, [availableUsers.length, filteredUsers.length, searchTerm]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 px-4 py-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-assignment-title"
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/80 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-200">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Transfer Assignment
                    </p>
                    <h2
                      id="transfer-assignment-title"
                      className="mt-1 text-lg font-semibold text-white"
                    >
                      {assignment?.title || "Transfer work"}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-slate-950/80 p-2 text-slate-300 transition hover:border-white/20 hover:bg-slate-900"
                  onClick={onClose}
                >
                  <span className="sr-only">Close transfer dialog</span>x
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assignment
                </label>
                <div className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3">
                  <p className="text-sm text-white">{assignment?.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {assignment?.assignedTo?.name ||
                      assignment?.assignedToRole ||
                      "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Search user
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                  <input
                    className={`${modalInputClassName} pl-11`}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email, or role"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New assignee
                </label>
                <select
                  className={modalInputClassName}
                  value={recipient}
                  onChange={(event) => onRecipientChange(event.target.value)}
                >
                  <option value="">Select user</option>
                  {filteredUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Transfer reason
                </label>
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
                  value={note}
                  onChange={(event) => onNoteChange(event.target.value)}
                  placeholder="Optional reason for the transfer"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-slate-900"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={onConfirm}
                  disabled={saving}
                >
                  {saving ? "Transferring..." : "Transfer Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default AssignmentTransferModal;
