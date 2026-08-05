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
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setShowDropdown(false);
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

  const handleSuggestionClick = (user) => {
    onRecipientChange(user._id);
    setSearchTerm(user.name || "");
    setShowDropdown(false);
  };

  useEffect(() => {
    console.log("searchTerm:", searchTerm);
    console.log("availableUsers:", availableUsers);
    console.log("filteredUsers:", filteredUsers);
  }, [availableUsers, filteredUsers, searchTerm]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 px-4 py-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-assignment-title"
        >
          <div className="relative w-full max-w-2xl overflow-visible rounded-[32px] border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/40">
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
                <div className="relative z-50 overflow-visible">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                  <input
                    className={`${modalInputClassName} pl-11`}
                    value={searchTerm}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => {
                      window.setTimeout(() => setShowDropdown(false), 150);
                    }}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setShowDropdown(true);
                    }}
                    placeholder="Search by name, email, or role"
                  />
                  {showDropdown && searchTerm.trim().length > 0 ? (
                    <div className="absolute left-0 top-full z-[9999] mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/40">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            className={`flex w-full flex-col items-start gap-1 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5 ${
                              String(recipient) === String(user._id)
                                ? "bg-emerald-500/10"
                                : ""
                            }`}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSuggestionClick(user);
                            }}
                          >
                            <span className="text-sm font-medium text-white">
                              {user.name || "Unnamed user"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {user.email || "No email"}
                              {user.role ? ` - ${user.role}` : ""}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400">
                          No users found
                        </div>
                      )}
                    </div>
                  ) : null}
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
