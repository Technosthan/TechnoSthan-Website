import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit3,
  RefreshCw,
  Search,
  Table2,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import DataWorkFormModal from "./DataWorkFormModal";
import {
  exportAdminDataWork,
  deleteAdminDataWork,
  getAdminDataWorkById,
  getAdminDataWorkRecords,
  replaceAdminDataWorkFile,
  updateAdminDataWork,
} from "./dataWorkApi";
import {
  formatBytes,
  formatDateTime,
  formatPlainCellValue,
} from "./dataWorkUtils";

const filterClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60";

const detailCardClass =
  "rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_44%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.88))] p-5 shadow-xl shadow-slate-950/25";

const pageSizeOptions = [10, 25, 50, 100];

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

const DataWorkDetails = () => {
  const navigate = useNavigate();
  const { workId } = useParams();

  const [work, setWork] = useState(null);
  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordsError, setRecordsError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("rowNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pagination, setPagination] = useState(null);
  const [modalState, setModalState] = useState({ open: false, mode: "edit" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadWork = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getAdminDataWorkById(workId);
      const payload = data?.data || null;
      setWork(payload);
      setColumns(payload?.columns || []);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load work details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [workId]);

  const loadRecords = useCallback(async () => {
    try {
      setRecordsLoading(true);
      setRecordsError("");
      const params = {
        page,
        limit,
        search: search.trim(),
        sortBy: sortField,
        sortOrder,
      };
      const { data } = await getAdminDataWorkRecords(workId, params);
      setRecords(data.data || []);
      setColumns(data.columns || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load imported records.";
      setRecordsError(message);
      toast.error(message);
    } finally {
      setRecordsLoading(false);
    }
  }, [workId, page, limit, search, sortField, sortOrder]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWork();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWork]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadRecords();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const summaryCards = useMemo(
    () => [
      { label: "Total Columns", value: work?.totalColumns ?? columns.length },
      { label: "Total Records", value: work?.totalRecords ?? 0 },
      { label: "Uploaded File Size", value: formatBytes(work?.fileSize || work?.currentFile?.fileSize) },
      { label: "Status", value: work?.status || "-" },
    ],
    [work, columns.length],
  );

  const handleExport = async () => {
    try {
      const response = await exportAdminDataWork(workId);
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${String(work?.name || "data-work")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "data-work"}-export.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to export data.");
    }
  };

  const openEdit = () => setModalState({ open: true, mode: "edit" });
  const openReplace = () => setModalState({ open: true, mode: "replace" });
  const closeModal = () => setModalState({ open: false, mode: "edit" });
  const openDelete = () => setDeleteOpen(true);
  const closeDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
  };

  const handleSave = async (payload) => {
    try {
      if (modalState.mode === "edit") {
        const response = await updateAdminDataWork(workId, payload);
        toast.success(response?.data?.message || "Work updated successfully.");
      } else {
        const formData = new FormData();
        formData.append("file", payload.file);
        if (payload.selectedSheet) {
          formData.append("selectedSheet", payload.selectedSheet);
        }
        if (payload.selectedTableId) {
          formData.append("selectedTableId", payload.selectedTableId);
        }
        const response = await replaceAdminDataWorkFile(workId, formData);
        toast.success(response?.data?.message || "File replaced successfully.");
      }
      closeModal();
      await loadWork();
      await loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save work.");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteAdminDataWork(workId);
      toast.success(response?.data?.message || "Work deleted successfully.");
      setDeleteOpen(false);
      navigate("/admin/data-work-manager");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete this work.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const emptyState = (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/65 px-6 py-14 text-center text-slate-400">
      <Table2 size={36} className="mx-auto text-cyan-300/80" />
      <p className="mt-4 text-lg font-semibold text-white">No records found</p>
      <p className="mt-2 text-sm text-slate-500">
        The selected file may be empty or the current filters returned no rows.
      </p>
    </div>
  );

  return (
    <AdminLayout
      title="Data Work Details"
      subtitle={work?.description || "Dynamic imported records and metadata"}
    >
      <div className="space-y-6 pb-24">
        <div className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/admin/data-work-manager")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
                  Work Overview
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {work?.name || "Loading..."}
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
                  {work?.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                onClick={openEdit}
              >
                <Edit3 size={15} />
                Edit Work
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                onClick={openReplace}
              >
                <Upload size={15} />
                Replace File
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-100 transition hover:bg-rose-500/15"
                onClick={openDelete}
              >
                <Trash2 size={15} />
                Delete Work
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                onClick={handleExport}
              >
                <Download size={15} />
                Export
              </button>
            </div>
          </div>

          {work?.currentFile ? (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
              <div className={detailCardClass}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Original File
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {work.currentFile.originalFileName || work.originalFileName || "-"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {work.currentFile.extension || work.extension || "-"} •{" "}
                  {formatBytes(work.currentFile.fileSize || work.fileSize || 0)}
                </p>
              </div>
              <div className={detailCardClass}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Selected Sheet
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {work.currentFile.selectedSheet || work.selectedSheet || "-"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Sheets detected: {(work.currentFile.sheetNames || work.sheetNames || []).join(", ") || "-"}
                </p>
              </div>
              <div className={detailCardClass}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  File Timing
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatDateTime(work.currentFile.uploadedAt || work.fileUploadedAt)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Last updated: {formatDateTime(work.updatedAt)}
                </p>
              </div>
              <div className={detailCardClass}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Preview Scope
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {work.currentFile.pageCount || work.pageCount || 1} page(s)
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {work.currentFile.selectedTable || work.selectedTable || "No table label"}
                </p>
              </div>
              <div className={detailCardClass}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Confidence
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {work.currentFile.averageConfidence !== null &&
                  work.currentFile.averageConfidence !== undefined
                    ? `${Math.round(work.currentFile.averageConfidence)}%`
                    : work.averageConfidence !== null && work.averageConfidence !== undefined
                      ? `${Math.round(work.averageConfidence)}%`
                      : "-"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {work.currentFile.ocrUsed || work.ocrUsed ? "OCR enabled" : "Direct text extraction"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className={detailCardClass}>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {card.value ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-950/65 p-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
              Search records
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                className={`${filterClassName} pl-10`}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search within imported row values"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[640px]">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
                Sort Field
              </label>
              <select
                className={filterClassName}
                value={sortField}
                onChange={(event) => {
                  setSortField(event.target.value);
                  setPage(1);
                }}
              >
                <option value="rowNumber">Imported Row Number</option>
                {columns.map((column) => (
                  <option key={column.normalizedKey} value={column.normalizedKey}>
                    {column.originalHeader}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">
                Sort Order
              </label>
              <select
                className={filterClassName}
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value);
                  setPage(1);
                }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
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

        {recordsError ? (
          <div className="rounded-[22px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {recordsError}
          </div>
        ) : null}

        {recordsLoading || loading ? (
          <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/65 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : records.length ? (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-xl shadow-slate-950/25">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full text-left text-sm text-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-4">Row</th>
                    {columns.map((column) => (
                      <th key={column.normalizedKey} className="px-4 py-4">
                        {column.originalHeader}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((record) => (
                    <tr key={record._id || record.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-4 align-top text-slate-500">
                        {record.rowNumber}
                      </td>
                      {columns.map((column) => {
                        const value = record.data?.[column.normalizedKey];
                        return (
                          <td key={`${record.rowNumber}-${column.normalizedKey}`} className="px-4 py-4 align-top">
                            <span
                              className="block max-w-[240px] truncate text-slate-200"
                              title={formatPlainCellValue(value)}
                            >
                              {formatPlainCellValue(value)}
                            </span>
                          </td>
                        );
                      })}
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
              Page {pagination.page} of {pagination.totalPages} | {pagination.total} matching records
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
        work={work}
        saving={false}
        onClose={closeModal}
        onSubmit={handleSave}
      />

      <ConfirmationModal
        open={deleteOpen}
        title="Delete Work?"
        message={`You are about to permanently delete "${work?.name || ""}". Its uploaded file, detected columns, imported records, and related metadata will also be removed. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        loading={deleteLoading}
        onClose={closeDelete}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default DataWorkDetails;
