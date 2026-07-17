import {
  ArrowLeft,
  FileImage,
  Upload,
  Table2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  previewAdminDataWorkFile,
} from "./dataWorkApi";
import {
  FILE_SIZE_LIMIT_BYTES,
  formatBytes,
  formatPlainCellValue,
} from "./dataWorkUtils";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60";

const modalBaseClass =
  "max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] p-5 shadow-2xl shadow-slate-950/60 sm:p-6";

const previewColumns = (previewRows = []) => {
  const firstRow = previewRows[0]?.data || {};
  return Object.keys(firstRow);
};

const supportedExtensions = [
  ".xlsx",
  ".xls",
  ".csv",
  ".json",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const DataWorkFormModal = ({
  open,
  mode = "create",
  work = null,
  onClose,
  onSubmit,
  saving = false,
}) => {
  const fileInputRef = useRef(null);
  const [stage, setStage] = useState("form");
  const [dragActive, setDragActive] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [formError, setFormError] = useState("");

  const isEditMode = mode === "edit";
  const isReplaceMode = mode === "replace";
  const isCreateMode = mode === "create";
  const requiresFile = isCreateMode || isReplaceMode;

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => {
      setStage("form");
      setDragActive(false);
      setPreview(null);
      setPreviewError("");
      setPreviewLoading(false);
      setFormError("");
      setFile(null);
      setSelectedSheet("");
      setSelectedTableId("");
      setName(work?.name || "");
      setDescription(work?.description || "");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, work]);

  const sheetNames = useMemo(
    () => (Array.isArray(preview?.sheetNames) ? preview.sheetNames : []),
    [preview],
  );

  const tableOptions = useMemo(
    () => (Array.isArray(preview?.availableTables) ? preview.availableTables : []),
    [preview],
  );

  const selectedPreviewTable = useMemo(() => {
    const tableId = selectedTableId || preview?.selectedTableId || "";
    if (!tableId) return null;
    return (
      (Array.isArray(preview?.tables) &&
        preview.tables.find((table) => table.id === tableId)) ||
      null
    );
  }, [preview, selectedTableId]);

  const previewRows = selectedPreviewTable?.previewRows || preview?.previewRows || [];
  const previewColumnsList =
    selectedPreviewTable?.columns?.length
      ? selectedPreviewTable.columns
      : Array.isArray(preview?.columns)
        ? preview.columns
        : [];
  const hasMultipleTables = tableOptions.length > 1;

  const loadPreview = useCallback(async (nextFile, nextSheet = "") => {
    if (!nextFile) {
      setPreview(null);
      setPreviewError("");
      return;
    }

    setPreviewLoading(true);
    setPreviewError("");
    try {
      const formData = new FormData();
      formData.append("file", nextFile);
      if (nextSheet) {
        formData.append("selectedSheet", nextSheet);
      }

      const { data } = await previewAdminDataWorkFile(formData);
      const previewData = data?.data || null;
      setPreview(previewData);
      if (previewData?.selectedSheet) {
        setSelectedSheet(previewData.selectedSheet);
      }
      setSelectedTableId(previewData?.selectedTableId || "");
      if ((previewData?.sheetNames || []).length > 1) {
        setStage("preview");
      }
      setStage(isReplaceMode || isCreateMode ? "preview" : "form");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to preview file";
      setPreviewError(message);
      toast.error(message);
    } finally {
      setPreviewLoading(false);
    }
  }, [isCreateMode, isReplaceMode]);

  useEffect(() => {
    if (!open || !file || !requiresFile) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadPreview(file, selectedSheet);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [file, selectedSheet, open, requiresFile, loadPreview]);

  const handleFile = (selected) => {
    if (!selected) {
      setFile(null);
      setPreview(null);
      setSelectedSheet("");
      setSelectedTableId("");
      setPreviewError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const extension = `.${String(selected.name || "")
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedExtensions.includes(extension)) {
      toast.error(
        "Supported files are XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.",
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (selected.size > FILE_SIZE_LIMIT_BYTES) {
      toast.error("The selected file exceeds the 10 MB limit.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(selected);
    setSelectedSheet("");
    setSelectedTableId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const trimmedName = String(name || "").trim();
    const trimmedDescription = String(description || "").trim().slice(0, 500);

    if (trimmedName.length < 2) {
      setFormError("Please enter a work name.");
      return;
    }

    if (trimmedName.length > 100) {
      setFormError("Work name must be 100 characters or fewer.");
      return;
    }

    if (!isEditMode && requiresFile && !file) {
      setFormError(
        "Please select a supported file. Supported files are XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.",
      );
      return;
    }

    if (!isEditMode && hasMultipleTables && !selectedTableId) {
      setFormError("Multiple tables were detected. Please select one.");
      return;
    }

    if (isEditMode) {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription,
      });
      return;
    }

    await onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      file,
      selectedSheet: selectedSheet || preview?.selectedSheet || "",
      selectedTableId: selectedTableId || preview?.selectedTableId || "",
    });
  };

  const handleConfirmPreview = () => {
    if (requiresFile && !file) {
      setFormError(
        "Please select a supported file. Supported files are XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.",
      );
      return;
    }
    if (hasMultipleTables && !selectedTableId) {
      setFormError("Multiple tables were detected. Please select one.");
      return;
    }
    setStage("preview");
  };

  const title =
    mode === "edit"
      ? "Edit Work"
      : mode === "replace"
        ? "Replace File"
        : "Add a New Work";

  const submitLabel =
    mode === "edit"
      ? "Save Changes"
      : mode === "replace"
        ? "Confirm and Replace"
        : "Create Work and Import Data";

  return open ? (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 px-3 py-6 backdrop-blur">
      <div className={modalBaseClass}>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
                  Data Work Manager
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {isEditMode
                    ? "Update the work name and description without changing imported data."
                    : isReplaceMode
                      ? "Replacing the file will replace the imported rows after validation succeeds."
                      : "Create a named workspace, preview the uploaded file, and import its structured rows into the database."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              {formError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {formError}
                </div>
              ) : null}

              {isReplaceMode && work ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Replacing <span className="font-semibold">{work.name}</span> will
                  remove the existing records only after the new file validates
                  successfully.
                </div>
              ) : null}

              {!isEditMode ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
                  <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    {isCreateMode ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-200">
                            Work Name
                          </label>
                          <input
                            className={fieldClassName}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Jaipur CA Contact Data"
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-200">
                            Description
                          </label>
                          <textarea
                            className={`${fieldClassName} min-h-[122px]`}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Optional description"
                            maxLength={500}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                          Current Work
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {work?.name}
                        </p>
                        {work?.description ? (
                          <p className="mt-2 leading-6 text-slate-400">
                            {work.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-slate-500">No description provided.</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        File Upload
                      </label>
                      <div
                        className={`rounded-[28px] border border-dashed px-4 py-5 transition ${
                          dragActive
                            ? "border-cyan-400/60 bg-cyan-500/10"
                            : "border-white/10 bg-slate-950/60"
                        }`}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(event) => {
                          event.preventDefault();
                          setDragActive(false);
                          handleFile(event.dataTransfer.files?.[0]);
                        }}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                              <Upload size={16} />
                              Drag and drop your file here
                            </div>
                            <p className="text-xs leading-5 text-slate-500">
                              Supported: XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.
                              Maximum size is 10 MB.
                            </p>
                          </div>

                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FileImage size={16} />
                            Browse
                          </button>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv,.json,.pdf,.png,.jpg,.jpeg,.webp,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/json,text/plain,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(event) => handleFile(event.target.files?.[0])}
                        />

                        {file ? (
                          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {file.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {file.type || "Unknown type"} • {formatBytes(file.size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Replace selected file
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {previewLoading ? (
                          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                            <div className="space-y-1.5">
                              <p className="font-semibold">Reading document...</p>
                              <p className="text-xs text-cyan-100/80">Extracting text...</p>
                              <p className="text-xs text-cyan-100/80">Detecting table...</p>
                              <p className="text-xs text-cyan-100/80">Preparing preview...</p>
                            </div>
                          </div>
                        ) : null}

                        {previewError ? (
                          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                            {previewError}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          Import Preview
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Review the detected sheet, headers, and first few rows
                          before saving.
                        </p>
                      </div>
                      {stage === "preview" && requiresFile ? (
                        <button
                          type="button"
                          onClick={() => setStage("form")}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                        >
                          <ArrowLeft size={14} />
                          Back
                        </button>
                      ) : null}
                    </div>

                    {preview ? (
                      <div className="space-y-4">
                        {(preview.extractionWarnings || []).length ? (
                          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            {preview.extractionWarnings.map((warning) => (
                              <p key={warning} className="leading-6">
                                {warning}
                              </p>
                            ))}
                          </div>
                        ) : null}

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              File
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {preview.originalFileName || file?.name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {preview.fileType || file?.type || "-"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              Extraction Method
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {preview.extractionMethod || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {preview.ocrUsed ? "OCR enabled" : "Direct text extraction"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              Document Info
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {preview.pageCount ? `${preview.pageCount} page(s)` : "Single image"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {preview.imageWidth && preview.imageHeight
                                ? `${preview.imageWidth} × ${preview.imageHeight}px`
                                : preview.totalRows
                                  ? `${preview.totalRows} detected rows`
                                  : "-"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              Confidence
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {preview.averageConfidence !== null &&
                              preview.averageConfidence !== undefined
                                ? `${Math.round(preview.averageConfidence)}%`
                                : "N/A"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {preview.ocrUsed ? "OCR review recommended" : "Structured extraction"}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              Selected Sheet
                            </p>
                            {sheetNames.length > 1 ? (
                              <select
                                className={`${fieldClassName} mt-2`}
                                value={selectedSheet || preview.selectedSheet || ""}
                                onChange={(event) => setSelectedSheet(event.target.value)}
                              >
                                {sheetNames.map((sheet) => (
                                  <option key={sheet} value={sheet}>
                                    {sheet}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p className="mt-2 text-sm font-medium text-white">
                                {preview.selectedSheet || "-"}
                              </p>
                            )}
                          </div>

                          {hasMultipleTables ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                Detected Table
                              </p>
                              <select
                                className={`${fieldClassName} mt-2`}
                                value={selectedTableId || preview.selectedTableId || ""}
                                onChange={(event) => setSelectedTableId(event.target.value)}
                              >
                                <option value="">Select a table</option>
                                {tableOptions.map((table) => (
                                  <option key={table.id} value={table.id}>
                                    {table.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                Detected Table
                              </p>
                              <p className="mt-2 text-sm font-medium text-white">
                                {selectedPreviewTable?.label ||
                                  preview.selectedTable?.label ||
                                  preview.tableName ||
                                  "-"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                Detected Headers
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {selectedPreviewTable?.rowCount || preview.totalRows || 0} rows ready for import
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                              <Table2 size={12} />
                              {selectedPreviewTable?.label || preview.tableName || "Table"}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(previewColumnsList.length
                              ? previewColumnsList
                              : previewColumns(previewRows)
                            ).map((column) => (
                              <span
                                key={column.normalizedKey || column}
                                className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100"
                              >
                                {column.originalHeader || column}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10">
                          <div className="max-h-[360px] overflow-auto">
                            <table className="w-full min-w-[680px] text-left text-xs text-slate-200">
                              <thead className="sticky top-0 bg-slate-950/95 text-slate-300">
                                <tr className="border-b border-white/10">
                                  <th className="px-3 py-2">Row</th>
                                  {(previewColumnsList.length
                                    ? previewColumnsList
                                    : previewColumns(previewRows)
                                  ).map((column) => (
                                    <th key={column.normalizedKey || column} className="px-3 py-2">
                                      {column.originalHeader || column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 bg-slate-950/55">
                                {previewRows.slice(0, 10).map((row) => (
                                  <tr key={row.rowNumber} className="hover:bg-white/[0.03]">
                                    <td className="px-3 py-2 align-top text-slate-500">
                                      {row.rowNumber}
                                    </td>
                                    {(previewColumnsList.length
                                      ? previewColumnsList
                                      : previewColumns(previewRows)
                                    ).map((column) => {
                                      const key = column.normalizedKey || column;
                                      const value = row.data?.[key];
                                      return (
                                        <td
                                          key={`${row.rowNumber}-${key}`}
                                          className="px-3 py-2 align-top"
                                        >
                                          <span
                                            className="block max-w-[220px] truncate"
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
                      </div>
                    ) : (
                      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 px-6 text-center text-sm text-slate-400">
                        {requiresFile
                          ? "Choose a file to generate a backend preview and detect the headers automatically."
                          : "The preview will appear here after a file is selected."}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Work Name
                      </label>
                      <input
                        className={fieldClassName}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Description
                      </label>
                      <textarea
                        className={`${fieldClassName} min-h-[122px]`}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {isEditMode
                    ? "Only the work name and description are editable here."
                    : "Imported rows are stored server-side and paginated in the database."}
                </p>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  {!isEditMode && stage === "form" ? (
                    <button
                      type="button"
                      className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
                      onClick={handleConfirmPreview}
                      disabled={saving}
                    >
                      Preview File
                    </button>
                  ) : null}

                  {!isEditMode && stage === "preview" ? (
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                      onClick={() => setStage("form")}
                      disabled={saving}
                    >
                      Back
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={saving || previewLoading || (requiresFile && !file && !isEditMode)}
                    className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Processing..." : submitLabel}
                  </button>
                </div>
              </div>
            </form>
      </div>
    </div>
  ) : null;
};

export default DataWorkFormModal;
