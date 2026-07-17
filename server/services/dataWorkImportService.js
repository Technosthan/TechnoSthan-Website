const fsp = require("fs/promises");
const path = require("path");
const XLSX = require("xlsx");

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".xlsx", ".xls", ".csv", ".json"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "text/plain",
  "application/json",
  "text/json",
]);

const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads", "data-works");

const ensureUploadDir = async () => {
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
};

const safeObjectKey = (value, fallbackIndex = 0) => {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return text || `column_${fallbackIndex + 1}`;
};

const normalizeVisibleHeader = (value, fallbackIndex = 0) => {
  const text = String(value ?? "").trim();
  return text || `Column ${fallbackIndex + 1}`;
};

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isEmptyRow = (row = []) =>
  !Array.isArray(row) ||
  row.every((cell) => {
    if (cell === null || cell === undefined) {
      return true;
    }
    if (typeof cell === "string") {
      return cell.trim() === "";
    }
    if (Array.isArray(cell)) {
      return cell.length === 0;
    }
    if (cell instanceof Date) {
      return false;
    }
    return String(cell).trim() === "";
  });

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string") {
    return value.trim() === "" ? null : value;
  }
  if (Array.isArray(value)) {
    return value.length ? JSON.stringify(value) : null;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (err) {
      return String(value);
    }
  }
  return String(value);
};

const inferValueType = (value) => {
  if (value === null || value === undefined) return "empty";
  if (value instanceof Date) return "date";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "empty";
    if (/^(true|false)$/i.test(trimmed)) return "boolean";
    if (!Number.isNaN(Number(trimmed)) && trimmed !== "") return "number";
    const dateCandidate = new Date(trimmed);
    if (!Number.isNaN(dateCandidate.getTime()) && /[-/:T]/.test(trimmed)) {
      return "date";
    }
    return "text";
  }
  return "text";
};

const formatPreviewCell = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return String(value);
};

const buildSearchableText = (data = {}) =>
  Object.values(data)
    .map((value) => formatPreviewCell(value))
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

const validateDataWorkFile = (file) => {
  if (!file) {
    const error = new Error("Please select an Excel, CSV, or JSON file.");
    error.statusCode = 400;
    throw error;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    const error = new Error("Please select an Excel or CSV file.");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    const error = new Error("The selected file type is not supported.");
    error.statusCode = 400;
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error = new Error("The selected file exceeds the 10 MB limit.");
    error.statusCode = 413;
    throw error;
  }

  return {
    extension,
    mimeType,
  };
};

const sanitizeStoredFileName = (workName, originalFileName, extension) => {
  const safeBase = String(workName || originalFileName || "data-work")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "data-work";

  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${safeBase}-${Date.now()}-${randomPart}${extension}`;
};

const saveUploadedFile = async ({ file, workName }) => {
  await ensureUploadDir();
  const extension = path.extname(file.originalname || "").toLowerCase();
  const storedFileName = sanitizeStoredFileName(
    workName,
    file.originalname,
    extension,
  );
  const filePath = path.join(UPLOAD_DIR, storedFileName);
  await fsp.writeFile(filePath, file.buffer);

  return {
    storedFileName,
    filePath,
    storageUrl: `/uploads/data-works/${storedFileName}`,
  };
};

const deleteStoredFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fsp.unlink(filePath);
  } catch (err) {
    if (err && err.code !== "ENOENT") {
      throw err;
    }
  }
};

const detectTypeFromValue = (value) => inferValueType(value);

const buildHeaderDefinitions = ({ headerRow = [], maxColumnCount = 0 }) => {
  const visibleCounts = new Map();
  const keyCounts = new Map();

  const headers = Array.from({ length: maxColumnCount }, (_, index) => {
    const headerText = normalizeVisibleHeader(headerRow[index], index);
    const baseVisibleKey = headerText.toLowerCase();
    const visibleCount = (visibleCounts.get(baseVisibleKey) || 0) + 1;
    visibleCounts.set(baseVisibleKey, visibleCount);
    const visibleHeader =
      visibleCount === 1 ? headerText : `${headerText} (${visibleCount})`;

    const baseKey = safeObjectKey(headerText, index);
    const keyCount = (keyCounts.get(baseKey) || 0) + 1;
    keyCounts.set(baseKey, keyCount);
    const normalizedKey = keyCount === 1 ? baseKey : `${baseKey}_${keyCount}`;

    return {
      originalHeader: visibleHeader,
      normalizedKey,
      displayOrder: index,
    };
  });

  return headers;
};

const buildRowsFromGrid = ({ rows = [], headerRowIndex = 0, headerRow = [] }) => {
  const dataRows = rows.slice(headerRowIndex + 1);
  const maxColumnCount = Math.max(
    headerRow.length,
    ...rows.map((row) => (Array.isArray(row) ? row.length : 0)),
  );
  const columns = buildHeaderDefinitions({ headerRow, maxColumnCount });

  const records = [];
  const detectedTypes = columns.map(() => new Map());

  dataRows.forEach((row, index) => {
    if (!Array.isArray(row) || isEmptyRow(row)) {
      return;
    }

    const data = {};

    columns.forEach((column, columnIndex) => {
      const rawValue = row[columnIndex];
      const normalizedValue = normalizeCellValue(rawValue);
      if (normalizedValue !== null) {
        data[column.normalizedKey] = normalizedValue;
        const detectedType = detectTypeFromValue(rawValue);
        const currentMap = detectedTypes[columnIndex];
        currentMap.set(detectedType, (currentMap.get(detectedType) || 0) + 1);
      } else {
        data[column.normalizedKey] = null;
      }
    });

    const hasAnyValue = Object.values(data).some((value) => value !== null);
    if (!hasAnyValue) {
      return;
    }

    records.push({
      rowNumber: headerRowIndex + index + 2,
      data,
      searchableText: buildSearchableText(data),
    });
  });

  const columnsWithTypes = columns.map((column, index) => {
    const typeMap = detectedTypes[index];
    let detectedType = "text";
    let highestCount = 0;
    for (const [type, count] of typeMap.entries()) {
      if (count > highestCount) {
        highestCount = count;
        detectedType = type;
      }
    }
    return {
      ...column,
      detectedType,
    };
  });

  return {
    columns: columnsWithTypes,
    records,
  };
};

const buildRecordsFromJson = (rows = []) => {
  const orderedKeys = [];
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (
        key === "__proto__" ||
        key === "constructor" ||
        key === "prototype"
      ) {
        return;
      }
      if (!orderedKeys.includes(key)) {
        orderedKeys.push(key);
      }
    });
  });

  if (!orderedKeys.length) {
    const error = new Error("No readable data was found in this file.");
    error.statusCode = 400;
    throw error;
  }

  const columns = buildHeaderDefinitions({
    headerRow: orderedKeys,
    maxColumnCount: orderedKeys.length,
  }).map((column, index) => ({
    ...column,
    originalHeader: orderedKeys[index],
  }));

  const records = rows
    .map((row, index) => {
      const data = {};
      columns.forEach((column, columnIndex) => {
        const key = orderedKeys[columnIndex];
        const rawValue = row?.[key];
        const normalizedValue = normalizeCellValue(rawValue);
        data[column.normalizedKey] = normalizedValue;
      });

      if (!Object.values(data).some((value) => value !== null)) {
        return null;
      }

      return {
        rowNumber: index + 1,
        data,
        searchableText: buildSearchableText(data),
      };
    })
    .filter(Boolean);

  return { columns, records };
};

const readWorksheetRows = (buffer, extension, selectedSheet) => {
  let workbook;
  if (extension === ".csv") {
    workbook = XLSX.read(buffer.toString("utf8"), {
      type: "string",
      cellDates: true,
      raw: true,
    });
  } else {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
      cellFormula: false,
      raw: true,
    });
  }

  const sheetNames = Array.isArray(workbook.SheetNames)
    ? workbook.SheetNames.filter(Boolean)
    : [];

  if (!sheetNames.length) {
    const error = new Error("This workbook does not contain any sheets.");
    error.statusCode = 400;
    throw error;
  }

  const resolvedSheet =
    selectedSheet && sheetNames.includes(selectedSheet)
      ? selectedSheet
      : sheetNames[0];
  const worksheet = workbook.Sheets[resolvedSheet];
  if (!worksheet) {
    const error = new Error("The selected sheet could not be found.");
    error.statusCode = 400;
    throw error;
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    blankrows: true,
    raw: true,
  });

  const headerRowIndex = rows.findIndex((row) => !isEmptyRow(row));
  if (headerRowIndex < 0) {
    const error = new Error("The file does not contain a valid header row.");
    error.statusCode = 400;
    throw error;
  }

  const headerRow = rows[headerRowIndex] || [];
  return {
    sheetNames,
    selectedSheet: resolvedSheet,
    rows,
    headerRowIndex,
    headerRow,
  };
};

const parseSpreadsheetFile = ({
  buffer,
  originalFileName,
  extension,
  selectedSheet,
}) => {
  const { sheetNames, selectedSheet: resolvedSheet, rows, headerRowIndex, headerRow } =
    readWorksheetRows(buffer, extension, selectedSheet);

  const { columns, records } = buildRowsFromGrid({
    rows,
    headerRowIndex,
    headerRow,
  });

  return {
    kind: "spreadsheet",
    originalFileName,
    sheetNames,
    selectedSheet: resolvedSheet,
    totalRows: records.length,
    totalColumns: columns.length,
    columns,
    records,
    previewRows: records.slice(0, 10).map((record) => ({
      rowNumber: record.rowNumber,
      data: record.data,
    })),
  };
};

const parseJsonFile = ({ buffer, originalFileName }) => {
  let parsed;
  try {
    parsed = JSON.parse(buffer.toString("utf8"));
  } catch (err) {
    const error = new Error("The JSON file could not be parsed.");
    error.statusCode = 400;
    throw error;
  }

  const rows = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.rows)
      ? parsed.rows
      : Array.isArray(parsed?.data)
        ? parsed.data
        : null;

  if (!rows || !rows.length) {
    const error = new Error("No readable data was found in this file.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedRows = rows.map((row) =>
    row && typeof row === "object" && !Array.isArray(row) ? row : {},
  );

  const { columns, records } = buildRecordsFromJson(normalizedRows);

  return {
    kind: "json",
    originalFileName,
    sheetNames: ["JSON"],
    selectedSheet: "JSON",
    totalRows: records.length,
    totalColumns: columns.length,
    columns,
    records,
    previewRows: records.slice(0, 10).map((record) => ({
      rowNumber: record.rowNumber,
      data: record.data,
    })),
  };
};

const parseUploadedDataFile = async ({ file, selectedSheet }) => {
  const { extension } = validateDataWorkFile(file);
  const originalFileName = String(file.originalname || "data-file").trim();
  const buffer = file.buffer;

  if (extension === ".json") {
    return parseJsonFile({ buffer, originalFileName });
  }

  return parseSpreadsheetFile({
    buffer,
    originalFileName,
    extension,
    selectedSheet,
  });
};

const isTransactionUnsupportedError = (err) => {
  const message = String(err?.message || "").toLowerCase();
  return (
    message.includes("transaction numbers are only allowed") ||
    message.includes("transactions are not supported") ||
    message.includes("transaction support is unavailable") ||
    err?.code === 20
  );
};

const runWithOptionalTransaction = async (task) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await task(session);
    });
    return result;
  } catch (err) {
    if (isTransactionUnsupportedError(err)) {
      return task(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = {
  MAX_FILE_SIZE_BYTES,
  UPLOAD_DIR,
  validateDataWorkFile,
  saveUploadedFile,
  deleteStoredFile,
  parseUploadedDataFile,
  runWithOptionalTransaction,
  escapeRegExp,
  buildSearchableText,
  formatPreviewCell,
};
