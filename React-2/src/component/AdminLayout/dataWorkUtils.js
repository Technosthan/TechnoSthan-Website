export const FILE_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;

export const formatBytes = (bytes = 0) => {
  const value = Number(bytes) || 0;
  if (value === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCellValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "—";
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()) && /[-/:T]/.test(value)) {
      return formatDateTime(value);
    }
    return value;
  }
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  return String(value);
};

export const getWorkStatusBadgeClass = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "ready") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";
  }
  if (normalized === "processing") {
    return "border-amber-400/30 bg-amber-500/15 text-amber-100";
  }
  if (normalized === "failed") {
    return "border-rose-400/30 bg-rose-500/15 text-rose-100";
  }
  return "border-white/10 bg-white/5 text-slate-200";
};

export const buildRecordSearchableText = (record, columns = []) =>
  columns
    .map((column) => formatCellValue(record?.data?.[column.normalizedKey]))
    .filter((value) => value && value !== "—")
    .join(" ")
    .toLowerCase();
