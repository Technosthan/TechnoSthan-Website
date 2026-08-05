import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  Eye,
  FileSpreadsheet,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import DataWorkFormModal from "./DataWorkFormModal";
import {
  createAdminDataWork,
  deleteAdminDataWork,
  getAdminDataWorks,
  updateAdminDataWork,
  replaceAdminDataWorkFile,
} from "./dataWorkApi";
import {
  formatDateTime,
  getWorkStatusBadgeClass,
} from "./dataWorkUtils";
import {
  buildDraftKey,
  clearDraft,
  getCurrentDraftUserId,
} from "../../shared/lib/draftPersistence";
import { getStoredUser } from "../../utils/auth";

const cardClassName =
  "rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_44%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.88))] p-5 shadow-xl shadow-slate-950/25";

const filterClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "workName", label: "Work Name" },
  { value: "totalRecords", label: "Total Records" },
];

const pageSizeOptions = [10, 25, 50, 100];

const initialFormState = {
  mode: "create",
  work: null,
  open: false,
};

const emptySummary = {
  totalWorks: 0,
  totalFiles: 0,
  totalRecords: 0,
  recentlyUpdated: 0,
  latestUpdatedAt: null,
};

const WorkActionMenu = ({ work, onView, onEdit, onReplace, onDelete }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClose = () => setOpen(false);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("click", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("click", handleClose);
    };
  }, [open]);

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/50">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
            onClick={() => {
              setOpen(false);
              onView(work);
            }}
          >
            <Eye size={15} />
            View Data
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
            onClick={() => {
              setOpen(false);
              onReplace(work);
            }}
          >
            <Upload size={15} />
            Upload / Replace File
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
            onClick={() => {
              setOpen(false);
              onEdit(work);
            }}
          >
            <Pencil size={15} />
            Edit Work
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-rose-100 transition hover:bg-rose-500/10"
            onClick={() => {
              setOpen(false);
              onDelete(work);
            }}
          >
            <Trash2 size={15} />
            Delete Work
          </button>
        </div>
      ) : null}
    </div>
  );
};

const ConfirmationModal = ({ open, title, message, confirmLabel, onClose, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-950/80 px-3 py-6 backdrop-blur">
      <div className="w-full max-w-lg rounded-[30px] border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-rose-300/80">
              Confirm Action
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataWorkManager = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(emptySummary);
  const [modalState, setModalState] = useState(initialFormState);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const draftUserId = getCurrentDraftUserId(getStoredUser());
  const draftKey = buildDraftKey({
    module: "data-work",
    mode: modalState.mode,
    recordId: modalState.work?._id || modalState.work?.id || "new",
    userId: draftUserId,
  });

  const fetchWorks = useCallback(async ({ pageNumber = page, withLoading = true } = {}) => {
    try {
      if (withLoading) {
        setLoading(true);
      }
      setError("");
      const { data } = await getAdminDataWorks({
        page: pageNumber,
        limit,
        sortBy,
        q: search.trim(),
      });
      setWorks(data.data || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || emptySummary);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load data works right now.";
      setError(message);
      toast.error(message);
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  }, [limit, page, search, sortBy]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchWorks({ pageNumber: 1, withLoading: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, sortBy, limit, fetchWorks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchWorks({ pageNumber: page, withLoading: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page, fetchWorks]);

  const openCreateModal = () => {
    setModalState({ mode: "create", work: null, open: true });
  };

  const openEditModal = (work) => {
    setModalState({ mode: "edit", work, open: true });
  };

  const openReplaceModal = (work) => {
    setModalState({ mode: "replace", work, open: true });
  };

  const closeModal = () => {
    if (saving) return;
    setModalState(initialFormState);
  };

  const handleView = (work) => {
    navigate(`/admin/data-work-manager/${work._id || work.id}`);
  };

  const handleSaveModal = async (payload) => {
    try {
      setSaving(true);
      if (modalState.mode === "edit") {
        const response = await updateAdminDataWork(modalState.work._id || modalState.work.id, payload);
        toast.success(response?.data?.message || "Work updated successfully.");
      } else if (modalState.mode === "replace") {
        const formData = new FormData();
        formData.append("file", payload.file);
        if (payload.selectedSheet) {
          formData.append("selectedSheet", payload.selectedSheet);
        }
        if (payload.selectedTableId) {
          formData.append("selectedTableId", payload.selectedTableId);
        }
        const response = await replaceAdminDataWorkFile(modalState.work._id || modalState.work.id, formData);
        toast.success(response?.data?.message || "File replaced successfully.");
      } else {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description || "");
        formData.append("file", payload.file);
        if (payload.selectedSheet) {
          formData.append("selectedSheet", payload.selectedSheet);
        }
        if (payload.selectedTableId) {
          formData.append("selectedTableId", payload.selectedTableId);
        }
        const response = await createAdminDataWork(formData);
        toast.success(response?.data?.message || "Work created successfully.");
      }
      clearDraft(draftKey);
      setModalState(initialFormState);
      await fetchWorks({ pageNumber: 1, withLoading: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to save work right now.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await deleteAdminDataWork(deleteTarget._id || deleteTarget.id);
      toast.success("Work deleted successfully.");
      setDeleteTarget(null);
      await fetchWorks({ pageNumber: 1, withLoading: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete work.");
    } finally {
      setSaving(false);
    }
  };

  const summaryCards = [
    {
      label: "Total Works",
      value: summary.totalWorks,
      icon: Database,
    },
    {
      label: "Total Uploaded Files",
      value: summary.totalFiles,
      icon: FileSpreadsheet,
    },
    {
      label: "Total Imported Records",
      value: summary.totalRecords,
      icon: Eye,
    },
    {
      label: "Recently Updated",
      value: summary.recentlyUpdated,
      icon: RefreshCw,
    },
  ];

  const emptyState = useMemo(
    () => (
      <div className="rounded-[28px] border border-white/10 bg-slate-950/65 px-6 py-14 text-center text-slate-400">
        <Database size={36} className="mx-auto text-cyan-300/80" />
        <p className="mt-4 text-lg font-semibold text-white">No data works yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Create a new work, upload a spreadsheet, and the imported records will
          appear here.
        </p>
        {/* <p className="mt-2 text-sm text-slate-500">
          Create separate workspaces, upload structured files, and manage imported records.
        </p> */}
      </div>
    ),
    [],
  );

  return (
    <AdminLayout
    //   title="Data Work Manager"
    //  subtitle="Create separate workspaces, upload structured files, and manage imported records."
    >
      <div className="space-y-6 pb-24">
        <div className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300/80">
              Admin Workspace
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Data Work Manager
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">
              Create separate workspaces, upload structured files, and manage
              imported records.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add New Work
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={cardClassName}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {card.value ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
                    <Icon size={18} />
                  </div>
                </div>
                {card.label === "Recently Updated" && summary.latestUpdatedAt ? (
                  <p className="mt-4 text-xs text-slate-500">
                    Latest update: {formatDateTime(summary.latestUpdatedAt)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-950/65 p-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                className={`${filterClassName} pl-10`}
                placeholder="Search by work name or file name"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
                Sort By
              </label>
              <select
                className={filterClassName}
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setPage(1);
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
                Page Size
              </label>
              <select
                className={filterClassName}
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[22px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/65 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : works.length ? (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-xl shadow-slate-950/25">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm text-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-4">Work Name</th>
                    <th className="px-4 py-4">Description</th>
                    <th className="px-4 py-4">Original File Name</th>
                    <th className="px-4 py-4">File Type</th>
                    <th className="px-4 py-4">Total Columns</th>
                    <th className="px-4 py-4">Total Records</th>
                    <th className="px-4 py-4">Created By</th>
                    <th className="px-4 py-4">Created At</th>
                    <th className="px-4 py-4">Last Updated</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {works.map((work) => (
                    <tr
                      key={work._id || work.id}
                      className="cursor-pointer transition hover:bg-white/[0.03]"
                      onClick={() => handleView(work)}
                    >
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          className="text-left font-semibold text-white underline-offset-4 hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleView(work);
                          }}
                        >
                          {work.name}
                        </button>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        <div className="max-w-[240px] truncate" title={work.description || "-"}>
                          {work.description || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        <div className="max-w-[220px] truncate" title={work.originalFileName || "-"}>
                          {work.originalFileName || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {work.extension || "-"}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {work.totalColumns ?? 0}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {work.totalRecords ?? 0}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {work.createdBy?.name || work.createdBy?.email || "-"}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {formatDateTime(work.createdAt)}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">
                        {formatDateTime(work.updatedAt)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getWorkStatusBadgeClass(
                            work.status,
                          )}`}
                        >
                          {work.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleView(work);
                            }}
                            title="View Data"
                          >
                            <Eye size={15} />
                          </button>
                          <WorkActionMenu
                            work={work}
                            onView={handleView}
                            onEdit={openEditModal}
                            onReplace={openReplaceModal}
                            onDelete={(item) => setDeleteTarget(item)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          emptyState
        )}

        {pagination ? (
          <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages} | {pagination.total} works
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <DataWorkFormModal
        open={modalState.open}
        mode={modalState.mode}
        work={modalState.work}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSaveModal}
        draftKey={draftKey}
      />

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete Work?"
        message={`You are about to permanently delete "${deleteTarget?.name || ""}". Its uploaded file, detected columns, imported records, and related metadata will also be removed. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default DataWorkManager;
