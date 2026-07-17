const crypto = require("crypto");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const { execFile } = require("child_process");

const sharp = require("sharp");
const Tesseract = require("tesseract.js");

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = Math.max(Number(process.env.DATA_WORK_MAX_PDF_PAGES || 25), 1);
const MAX_IMAGE_DIMENSION = Math.max(
  Number(process.env.DATA_WORK_MAX_IMAGE_DIMENSION || 3200),
  800,
);
const OCR_TIMEOUT_MS = Math.max(
  Number(process.env.DATA_WORK_OCR_TIMEOUT_MS || 120000),
  15000,
);

const ALLOWED_EXTENSIONS = new Set([
  ".xlsx",
  ".xls",
  ".csv",
  ".json",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "text/plain",
  "application/json",
  "text/json",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const PDF_EXTENSION = ".pdf";

const signatureChecks = {
  ".pdf": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 5 &&
    buffer.subarray(0, 5).toString("utf8") === "%PDF-",
  ".png": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  ".jpg": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,
  ".jpeg": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,
  ".webp": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("utf8") === "RIFF" &&
    buffer.subarray(8, 12).toString("utf8") === "WEBP",
  ".xls": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  ".xlsx": (buffer) =>
    Buffer.isBuffer(buffer) &&
    buffer.length >= 4 &&
    buffer.subarray(0, 2).toString("utf8") === "PK",
};

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSafeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const sha256 = (buffer) =>
  crypto.createHash("sha256").update(Buffer.isBuffer(buffer) ? buffer : Buffer.from("")).digest("hex");

const normalizeVisibleHeader = (value, fallbackIndex = 0) => {
  const text = String(value ?? "").trim();
  return text || `Column ${fallbackIndex + 1}`;
};

const safeObjectKey = (value, fallbackIndex = 0) => {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return text || `column_${fallbackIndex + 1}`;
};

const makeUniqueVisibleHeader = (headerCounts, headerText) => {
  const key = headerText.toLowerCase();
  const nextCount = (headerCounts.get(key) || 0) + 1;
  headerCounts.set(key, nextCount);
  return nextCount === 1 ? headerText : `${headerText} (${nextCount})`;
};

const makeUniqueNormalizedKey = (keyCounts, baseKey, fallbackIndex = 0) => {
  const normalizedBase = baseKey || `column_${fallbackIndex + 1}`;
  const nextCount = (keyCounts.get(normalizedBase) || 0) + 1;
  keyCounts.set(normalizedBase, nextCount);
  return nextCount === 1 ? normalizedBase : `${normalizedBase}_${nextCount}`;
};

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string") return value.trim() === "" ? null : value.trim();
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

const formatPreviewCell = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
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

const detectValueType = (value) => {
  if (value === null || value === undefined) return "empty";
  if (value instanceof Date) return "date";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isFinite(value) ? "number" : "empty";
  if (typeof value !== "string") return "text";

  const trimmed = value.trim();
  if (!trimmed) return "empty";
  if (/^(true|false)$/i.test(trimmed)) return "boolean";
  if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) return "number";
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return "email";
  if (/^\+?[0-9().\-\s]{7,}$/.test(trimmed)) return "phone";
  if (/^[$£€¥]\s?\d[\d,]*(\.\d{1,2})?$/.test(trimmed) || /^\d[\d,]*(\.\d{1,2})?\s?[$£€¥]$/.test(trimmed)) {
    return "currency";
  }
  if (!Number.isNaN(Date.parse(trimmed)) && /[-/:T]/.test(trimmed)) {
    return "date";
  }
  return "text";
};

const splitCsvLine = (line) => {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const splitLineByDelimiter = (line, delimiter) => {
  if (!delimiter) return [line.trim()];
  if (delimiter === "csv") return splitCsvLine(line);
  if (delimiter === "tab") return line.split(/\t+/g).map((cell) => cell.trim());
  if (delimiter === "pipe") {
    return line
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split(/\s*\|\s*/g)
      .map((cell) => cell.trim());
  }
  if (delimiter === "semicolon") {
    return line.split(/\s*;\s*/g).map((cell) => cell.trim());
  }
  return line.split(/\s{2,}/g).map((cell) => cell.trim());
};

const isEmptyRow = (row = []) =>
  !Array.isArray(row) ||
  row.every((cell) => {
    if (cell === null || cell === undefined) return true;
    if (typeof cell === "string") return cell.trim() === "";
    if (Array.isArray(cell)) return cell.length === 0;
    if (cell instanceof Date) return false;
    return String(cell).trim() === "";
  });

const normalizeLine = (value) => String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const normalizeTextLines = (text = "") =>
  String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter((line) => line.length > 0);

const groupTextItemsIntoLines = (items = []) => {
  const lineBuckets = new Map();

  items.forEach((item) => {
    const str = normalizeLine(item?.str);
    if (!str) return;

    const x = Number(item?.transform?.[4] || 0);
    const y = Number(item?.transform?.[5] || 0);
    const key = Math.round(y * 2) / 2;

    if (!lineBuckets.has(key)) {
      lineBuckets.set(key, { y, items: [] });
    }

    lineBuckets.get(key).items.push({ text: str, x, y });
  });

  return Array.from(lineBuckets.values())
    .sort((a, b) => b.y - a.y)
    .map((bucket) =>
      bucket.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
};

const scoreDelimiter = (lines = [], delimiter) => {
  const parsedRows = lines
    .map((line) => splitLineByDelimiter(line, delimiter))
    .map((cells) => cells.map((cell) => cell.trim()).filter((cell) => cell.length > 0));

  const validRows = parsedRows.filter((row) => row.length >= 2);
  if (validRows.length < 2) return null;

  const counts = new Map();
  validRows.forEach((row) => {
    counts.set(row.length, (counts.get(row.length) || 0) + 1);
  });

  let bestCount = 0;
  let bestColumns = 0;
  for (const [count, occurrences] of counts.entries()) {
    if (occurrences > bestCount || (occurrences === bestCount && count > bestColumns)) {
      bestCount = occurrences;
      bestColumns = count;
    }
  }

  const consistentRows = validRows.filter((row) => row.length === bestColumns).length;
  const totalRows = validRows.length;
  const averageColumns = validRows.reduce((sum, row) => sum + row.length, 0) / totalRows;

  return {
    delimiter,
    columns: bestColumns,
    rows: validRows,
    score: consistentRows * 10 + averageColumns + bestColumns,
  };
};

const detectTableSections = (lines = []) => {
  const sections = [];
  let current = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      if (current.length) {
        sections.push(current);
        current = [];
      }
      return;
    }
    current.push(normalizeLine(line));
  });

  if (current.length) {
    sections.push(current);
  }

  return sections;
};

const buildHeaderDefinitions = ({ headerRow = [], maxColumnCount = 0 }) => {
  const visibleCounts = new Map();
  const keyCounts = new Map();

  return Array.from({ length: maxColumnCount }, (_, index) => {
    const headerText = normalizeVisibleHeader(headerRow[index], index);
    const visibleHeader = makeUniqueVisibleHeader(visibleCounts, headerText);
    const baseKey = safeObjectKey(headerText, index);
    const normalizedKey = makeUniqueNormalizedKey(keyCounts, baseKey, index);

    return {
      originalHeader: visibleHeader,
      normalizedKey,
      displayOrder: index,
    };
  });
};

const buildRowsFromGrid = ({ rows = [], headerRowIndex = 0, headerRow = [], sourcePage = null, sourceTable = null }) => {
  const dataRows = rows.slice(headerRowIndex + 1);
  const maxColumnCount = Math.max(
    headerRow.length,
    ...rows.map((row) => (Array.isArray(row) ? row.length : 0)),
  );

  const columns = buildHeaderDefinitions({ headerRow, maxColumnCount });
  const detectedTypes = columns.map(() => new Map());
  const records = [];

  dataRows.forEach((row, index) => {
    if (!Array.isArray(row) || isEmptyRow(row)) {
      return;
    }

    const data = {};
    columns.forEach((column, columnIndex) => {
      const rawValue = row[columnIndex];
      const normalizedValue = normalizeCellValue(rawValue);
      data[column.normalizedKey] = normalizedValue;
      const detectedType = detectValueType(rawValue);
      const currentMap = detectedTypes[columnIndex];
      currentMap.set(detectedType, (currentMap.get(detectedType) || 0) + 1);
    });

    if (!Object.values(data).some((value) => value !== null)) {
      return;
    }

    records.push({
      rowNumber: headerRowIndex + index + 2,
      data,
      searchableText: buildSearchableText(data),
      sourcePage,
      sourceTable,
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
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
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
        data[column.normalizedKey] = normalizeCellValue(rawValue);
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

const loadPdfJs = async () => import("pdfjs-dist/legacy/build/pdf.mjs");

const extractPdfPages = async (buffer, maxPages = MAX_PDF_PAGES) => {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages || 0;
  const pagesToProcess = Math.min(totalPages, maxPages);
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pagesToProcess; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = groupTextItemsIntoLines(textContent.items || []);
    pageTexts.push({
      pageNumber,
      lines,
      text: lines.join("\n"),
      sourceType: "text",
    });
  }

  return {
    totalPages,
    pageTexts,
    truncated: pagesToProcess < totalPages,
  };
};

const renderPdfPageToImage = async (buffer, pageNumber) => {
  try {
    const image = sharp(buffer, {
      density: 220,
      page: pageNumber - 1,
      sequentialRead: true,
    });

    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const resizeNeeded = Math.max(width, height) > MAX_IMAGE_DIMENSION;

    let pipeline = image.rotate();
    if (resizeNeeded) {
      pipeline = pipeline.resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    pipeline = pipeline.normalize().png();
    const outputBuffer = await pipeline.toBuffer();

    return {
      buffer: outputBuffer,
      width,
      height,
    };
  } catch (sharpError) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "data-work-pdf-"));
    const pdfPath = path.join(tempDir, "source.pdf");
    const outPrefix = path.join(tempDir, `page-${pageNumber}`);
    await fs.writeFile(pdfPath, buffer);

    try {
      await new Promise((resolve, reject) => {
        execFile(
          "pdftoppm",
          ["-f", String(pageNumber), "-l", String(pageNumber), "-singlefile", "-png", pdfPath, outPrefix],
          (error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          },
        );
      });

      const pngPath = `${outPrefix}.png`;
      const outputBuffer = await fs.readFile(pngPath);
      const metadata = await sharp(outputBuffer).metadata();
      return {
        buffer: outputBuffer,
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
};

const preprocessImageBuffer = async (buffer) => {
  const image = sharp(buffer, { sequentialRead: true });
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const resizeNeeded = Math.max(width, height) > MAX_IMAGE_DIMENSION;

  let pipeline = image.rotate();
  if (resizeNeeded) {
    pipeline = pipeline.resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  pipeline = pipeline.normalize().png();

  return {
    buffer: await pipeline.toBuffer(),
    width,
    height,
  };
};

const runWithTimeout = async (task, timeoutMs, message) =>
  Promise.race([
    Promise.resolve().then(task),
    new Promise((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        const error = new Error(message || "The document could not be processed.");
        error.statusCode = 408;
        reject(error);
      }, timeoutMs);
      timer.unref?.();
    }),
  ]);

const ocrBuffer = async (buffer) => {
  const result = await runWithTimeout(
    () =>
      Tesseract.recognize(buffer, "eng", {
        logger: () => {},
      }),
    OCR_TIMEOUT_MS,
    "OCR timed out while processing this document.",
  );

  const data = result?.data || {};
  const text = normalizeLine(data.text || "");
  const confidence = Number.isFinite(Number(data.confidence)) ? Number(data.confidence) : null;
  return {
    text,
    confidence,
  };
};

const collectFallbackLines = (pageTexts = []) => {
  const records = [];
  let lineNumber = 1;

  pageTexts.forEach((page) => {
    (page.lines || []).forEach((line) => {
      const trimmed = normalizeLine(line);
      if (!trimmed) return;
      records.push({
        rowNumber: lineNumber,
        data: {
          lineNumber,
          extractedText: trimmed,
          pageNumber: page.pageNumber,
        },
        searchableText: `${lineNumber} | ${trimmed} | ${page.pageNumber}`.toLowerCase(),
        sourcePage: page.pageNumber,
      });
      lineNumber += 1;
    });
  });

  return records;
};

const buildFallbackColumns = () => [
  {
    originalHeader: "Line Number",
    normalizedKey: "line_number",
    displayOrder: 0,
    detectedType: "number",
  },
  {
    originalHeader: "Extracted Text",
    normalizedKey: "extracted_text",
    displayOrder: 1,
    detectedType: "text",
  },
  {
    originalHeader: "Page Number",
    normalizedKey: "page_number",
    displayOrder: 2,
    detectedType: "number",
  },
];

const buildTablePreviewRows = (records = []) =>
  records.slice(0, 10).map((record) => ({
    rowNumber: record.rowNumber,
    data: record.data,
    sourcePage: record.sourcePage || null,
    sourceTable: record.sourceTable || null,
  }));

const groupCompatibleTables = (tables = []) => {
  const groups = new Map();

  tables.forEach((table) => {
    if (!table.signature) return;
    if (!groups.has(table.signature)) {
      groups.set(table.signature, []);
    }
    groups.get(table.signature).push(table);
  });

  const combined = [];

  for (const [signature, group] of groups.entries()) {
    if (group.length < 2) continue;

    const mergedColumns = group[0].columns;
    const mergedRecords = [];
    group
      .slice()
      .sort((a, b) => a.pageNumber - b.pageNumber || a.tableIndex - b.tableIndex)
      .forEach((table) => {
        table.records.forEach((record, index) => {
          mergedRecords.push({
            ...record,
            rowNumber: mergedRecords.length + 1,
            sourcePage: table.pageNumber,
            sourceTable: table.id,
          });
        });
      });

    combined.push({
      id: `combined:${signature}`,
      label: "Combined compatible table",
      pageNumber: null,
      tableIndex: 0,
      extractionMethod: group.some((item) => item.extractionMethod === "ocr") ? "ocr" : "text",
      confidence:
        group.reduce((sum, item) => sum + (item.confidence || 0), 0) / group.length,
      columns: mergedColumns,
      records: mergedRecords,
      previewRows: buildTablePreviewRows(mergedRecords),
      rowCount: mergedRecords.length,
      columnCount: mergedColumns.length,
      signature,
      tableName: "Combined compatible table",
      warnings: [],
      sourcePageNumbers: group.map((item) => item.pageNumber),
    });
  }

  return combined;
};

const parseTextPagesIntoTables = ({ pageTexts = [], sourceType = "text" }) => {
  const tables = [];

  pageTexts.forEach((page) => {
    const sections = detectTableSections(page.lines || []);
    let tableIndex = 0;

    sections.forEach((section) => {
      const delimiterScores = [
        scoreDelimiter(section, "tab"),
        scoreDelimiter(section, "pipe"),
        scoreDelimiter(section, "semicolon"),
        scoreDelimiter(section, "csv"),
        scoreDelimiter(section, "spaces"),
      ].filter(Boolean);

      if (!delimiterScores.length) {
        return;
      }

      const best = delimiterScores.sort((a, b) => b.score - a.score)[0];
      if (!best || best.columns < 2) {
        return;
      }

      const rows = section.map((line) => splitLineByDelimiter(line, best.delimiter));
      const headerRowIndex = 0;
      const headerRow = rows[0] || [];
      const { columns, records } = buildRowsFromGrid({
        rows,
        headerRowIndex,
        headerRow,
        sourcePage: page.pageNumber,
      });

      if (!records.length || columns.length < 2) {
        return;
      }

      tableIndex += 1;
      const signature = columns.map((column) => column.originalHeader.toLowerCase()).join("|");
      tables.push({
        id: `page-${page.pageNumber}-table-${tableIndex}`,
        label: `Page ${page.pageNumber} - Table ${tableIndex}`,
        pageNumber: page.pageNumber,
        tableIndex,
        extractionMethod: sourceType,
        confidence: Math.min(100, 70 + best.score),
        columns,
        records,
        previewRows: buildTablePreviewRows(records),
        rowCount: records.length,
        columnCount: columns.length,
        signature,
        tableName: `Page ${page.pageNumber} - Table ${tableIndex}`,
        warnings: [],
        sourcePageNumbers: [page.pageNumber],
      });
    });
  });

  return tables;
};

const parseFallbackLines = ({ pageTexts = [], sourceType = "text", ocrConfidence = null }) => {
  const records = collectFallbackLines(pageTexts);
  const columns = buildFallbackColumns();

  const fallbackRecords = records.map((record, index) => ({
    ...record,
    rowNumber: index + 1,
    data: {
      line_number: record.data.lineNumber,
      extracted_text: record.data.extractedText,
      page_number: record.data.pageNumber,
    },
  }));

  return {
    id: `fallback:${sourceType}`,
    label: "Extracted text lines",
    pageNumber: null,
    tableIndex: 0,
    extractionMethod: sourceType,
    confidence: ocrConfidence,
    columns,
    records: fallbackRecords,
    previewRows: buildTablePreviewRows(fallbackRecords),
    rowCount: fallbackRecords.length,
    columnCount: columns.length,
    signature: "fallback:text-lines",
    tableName: "Extracted text lines",
    warnings: [
      "No clear table was detected. The document can be imported as extracted text lines.",
    ],
    sourcePageNumbers: pageTexts.map((page) => page.pageNumber),
    fallback: true,
  };
};

const selectTableCandidate = (tables = [], selectedTableId = "") => {
  if (!tables.length) return null;

  if (selectedTableId) {
    return tables.find((table) => table.id === selectedTableId) || null;
  }

  return [...tables]
    .sort((a, b) => {
      const confidenceA = Number.isFinite(Number(a.confidence)) ? Number(a.confidence) : 0;
      const confidenceB = Number.isFinite(Number(b.confidence)) ? Number(b.confidence) : 0;
      if (confidenceA !== confidenceB) return confidenceB - confidenceA;
      if ((b.rowCount || 0) !== (a.rowCount || 0)) return (b.rowCount || 0) - (a.rowCount || 0);
      return (b.columnCount || 0) - (a.columnCount || 0);
    })[0];
};

const summarizeConfidence = (tables = []) => {
  const values = tables
    .map((table) => Number(table.confidence))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

const buildDocumentPreviewResponse = ({
  kind,
  originalFileName,
  extension,
  mimeType,
  fileHash,
  tables = [],
  selectedTable = null,
  pageCount = null,
  imageWidth = null,
  imageHeight = null,
  ocrUsed = false,
  extractionMethod = "text",
  extractionWarnings = [],
  processingStatus = "ready",
  sourcePageNumbers = [],
}) => {
  const chosen = selectedTable || tables[0] || null;
  const mergedWarnings = Array.from(
    new Set([
      ...(extractionWarnings || []),
      ...(chosen?.warnings || []),
      ...(ocrUsed
        ? ["Some values may require review because this file was processed using OCR."]
        : []),
    ]),
  );

  return {
    kind,
    originalFileName,
    fileType: extension,
    extension,
    mimeType,
    fileHash,
    extractionMethod,
    pageCount,
    imageWidth,
    imageHeight,
    ocrUsed,
    averageConfidence: summarizeConfidence(chosen ? [chosen] : tables),
    processingStatus,
    extractionWarnings: mergedWarnings,
    tableName: chosen?.tableName || chosen?.label || "Document preview",
    selectedTableId: chosen?.id || "",
    selectedPage: chosen?.pageNumber || null,
    selectedTable: chosen
      ? {
          id: chosen.id,
          label: chosen.label,
          tableName: chosen.tableName,
          pageNumber: chosen.pageNumber,
          tableIndex: chosen.tableIndex,
          confidence: chosen.confidence,
          rowCount: chosen.rowCount,
          columnCount: chosen.columnCount,
          extractionMethod: chosen.extractionMethod,
          fallback: Boolean(chosen.fallback),
          sourcePageNumbers: chosen.sourcePageNumbers || sourcePageNumbers,
        }
      : null,
    availableTables: tables.map((table) => ({
      id: table.id,
      label: table.label,
      tableName: table.tableName,
      pageNumber: table.pageNumber,
      tableIndex: table.tableIndex,
      confidence: table.confidence,
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      extractionMethod: table.extractionMethod,
      fallback: Boolean(table.fallback),
      sourcePageNumbers: table.sourcePageNumbers || [],
    })),
    tables: tables.map((table) => ({
      id: table.id,
      label: table.label,
      tableName: table.tableName,
      pageNumber: table.pageNumber,
      tableIndex: table.tableIndex,
      confidence: table.confidence,
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      extractionMethod: table.extractionMethod,
      fallback: Boolean(table.fallback),
      sourcePageNumbers: table.sourcePageNumbers || [],
      previewRows: table.previewRows || [],
      columns: table.columns || [],
    })),
    columns: chosen?.columns || [],
    records: chosen?.records || [],
    previewRows: chosen?.previewRows || [],
    totalRows: chosen?.rowCount || 0,
    totalColumns: chosen?.columnCount || 0,
    sourcePageNumbers,
  };
};

const detectPdfContent = async ({ buffer, selectedTableId = "", maxPages = MAX_PDF_PAGES }) => {
  const { totalPages, pageTexts, truncated } = await extractPdfPages(buffer, maxPages);

  const pageTextLength = pageTexts.reduce((sum, page) => sum + page.lines.join(" ").length, 0);
  const textTables = parseTextPagesIntoTables({ pageTexts, sourceType: "text" });
  const combinedTables = [...textTables, ...groupCompatibleTables(textTables)];
  const hasReadableText = pageTextLength >= 20 || textTables.length > 0;

  if (hasReadableText && combinedTables.length) {
    const selectedTable = selectTableCandidate(combinedTables, selectedTableId);
    return {
      kind: "pdf",
      pageCount: totalPages,
      imageWidth: null,
      imageHeight: null,
      ocrUsed: false,
      extractionMethod: "text",
      extractionWarnings: truncated
        ? [`Only the first ${maxPages} PDF pages were processed.`]
        : [],
      selectedTableId: selectedTable?.id || "",
      selectedTable,
      tables: combinedTables,
      processingStatus: "ready",
      pageTexts,
    };
  }

  if (hasReadableText) {
    const fallback = parseFallbackLines({
      pageTexts,
      sourceType: "text",
      ocrConfidence: null,
    });

    return {
      kind: "pdf",
      pageCount: totalPages,
      imageWidth: null,
      imageHeight: null,
      ocrUsed: false,
      extractionMethod: "text",
      extractionWarnings: truncated
        ? [`Only the first ${maxPages} PDF pages were processed.`]
        : [...(fallback.warnings || [])],
      selectedTableId: fallback.id,
      selectedTable: fallback,
      tables: [fallback],
      processingStatus: "ready",
      pageTexts,
    };
  }

  const ocrPageTexts = [];
  let imageWidth = null;
  let imageHeight = null;
  let averageConfidence = null;

  for (const page of pageTexts.length ? pageTexts : Array.from({ length: Math.min(totalPages, maxPages) }, (_, index) => ({ pageNumber: index + 1 }))) {
    const rendered = await renderPdfPageToImage(buffer, page.pageNumber);
    imageWidth = imageWidth || rendered.width || null;
    imageHeight = imageHeight || rendered.height || null;
    const ocr = await ocrBuffer(rendered.buffer);
    averageConfidence = averageConfidence === null ? ocr.confidence : Math.round((averageConfidence + (ocr.confidence || averageConfidence)) / 2);
    ocrPageTexts.push({
      pageNumber: page.pageNumber,
      lines: normalizeTextLines(ocr.text),
      text: ocr.text,
      sourceType: "ocr",
      confidence: ocr.confidence,
    });
  }

  const ocrTables = parseTextPagesIntoTables({ pageTexts: ocrPageTexts, sourceType: "ocr" });
  const combinedOcrTables = [...ocrTables, ...groupCompatibleTables(ocrTables)];

  if (combinedOcrTables.length) {
    const selectedTable = selectTableCandidate(combinedOcrTables, selectedTableId);
    return {
      kind: "pdf",
      pageCount: totalPages,
      imageWidth,
      imageHeight,
      ocrUsed: true,
      extractionMethod: "ocr",
      extractionWarnings: [
        ...(truncated ? [`Only the first ${maxPages} PDF pages were processed.`] : []),
      ],
      selectedTableId: selectedTable?.id || "",
      selectedTable,
      tables: combinedOcrTables,
      processingStatus: "ready",
      pageTexts: ocrPageTexts,
      averageConfidence,
    };
  }

  const fallback = parseFallbackLines({
    pageTexts: ocrPageTexts.length ? ocrPageTexts : pageTexts,
    sourceType: "ocr",
    ocrConfidence: averageConfidence,
  });

  return {
    kind: "pdf",
    pageCount: totalPages,
    imageWidth,
    imageHeight,
    ocrUsed: true,
    extractionMethod: "ocr",
    extractionWarnings: [
      ...(truncated ? [`Only the first ${maxPages} PDF pages were processed.`] : []),
      ...(fallback.warnings || []),
    ],
    selectedTableId: fallback.id,
    selectedTable: fallback,
    tables: [fallback],
    processingStatus: "ready",
    pageTexts: ocrPageTexts,
    averageConfidence,
  };
};

const detectImageContent = async ({ buffer, originalFileName, selectedTableId = "" }) => {
  const preprocessed = await preprocessImageBuffer(buffer);
  const ocr = await ocrBuffer(preprocessed.buffer);
  const lines = normalizeTextLines(ocr.text);
  const pageTexts = [
    {
      pageNumber: 1,
      lines,
      text: ocr.text,
      sourceType: "ocr",
      confidence: ocr.confidence,
    },
  ];

  const tables = parseTextPagesIntoTables({ pageTexts, sourceType: "ocr" });
  const combinedTables = [...tables, ...groupCompatibleTables(tables)];

  if (combinedTables.length) {
    const selectedTable = selectTableCandidate(combinedTables, selectedTableId);
    return {
      kind: "image",
      originalFileName,
      pageCount: 1,
      imageWidth: preprocessed.width || null,
      imageHeight: preprocessed.height || null,
      ocrUsed: true,
      extractionMethod: "ocr",
      extractionWarnings: [],
      selectedTableId: selectedTable?.id || "",
      selectedTable,
      tables: combinedTables,
      processingStatus: "ready",
      pageTexts,
      averageConfidence: ocr.confidence,
    };
  }

  const fallback = parseFallbackLines({
    pageTexts,
    sourceType: "ocr",
    ocrConfidence: ocr.confidence,
  });

  if (!fallback.records.length) {
    const error = new Error("OCR could not read enough data from this image.");
    error.statusCode = 400;
    throw error;
  }

  return {
    kind: "image",
    originalFileName,
    pageCount: 1,
    imageWidth: preprocessed.width || null,
    imageHeight: preprocessed.height || null,
    ocrUsed: true,
    extractionMethod: "ocr",
    extractionWarnings: fallback.warnings || [],
    selectedTableId: fallback.id,
    selectedTable: fallback,
    tables: [fallback],
    processingStatus: "ready",
    pageTexts,
    averageConfidence: ocr.confidence,
  };
};

const validateDataWorkFile = (file) => {
  if (!file) {
    const error = new Error(
      "Please select a supported file. Supported files are XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.",
    );
    error.statusCode = 400;
    throw error;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    const error = new Error(
      "Please select a supported file. Supported files are XLSX, XLS, CSV, JSON, PDF, PNG, JPG, JPEG, and WEBP.",
    );
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

  const signatureCheck = signatureChecks[extension];
  if (signatureCheck && !signatureCheck(file.buffer || Buffer.alloc(0))) {
    const error = new Error("The selected file does not appear to be a valid document.");
    error.statusCode = 400;
    throw error;
  }

  return {
    extension,
    mimeType,
    fileHash: sha256(file.buffer || Buffer.alloc(0)),
  };
};

const parseSpreadsheetFile = ({
  buffer,
  originalFileName,
  extension,
  selectedSheet,
}) => {
  const XLSX = require("xlsx");

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
    selectedSheet && sheetNames.includes(selectedSheet) ? selectedSheet : sheetNames[0];
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
  const { columns, records } = buildRowsFromGrid({
    rows,
    headerRowIndex,
    headerRow,
  });

  return {
    kind: "spreadsheet",
    originalFileName,
    fileType: extension,
    sheetNames,
    selectedSheet: resolvedSheet,
    selectedTableId: "",
    selectedTable: null,
    totalRows: records.length,
    totalColumns: columns.length,
    columns,
    records,
    previewRows: records.slice(0, 10).map((record) => ({
      rowNumber: record.rowNumber,
      data: record.data,
    })),
    pageCount: null,
    imageWidth: null,
    imageHeight: null,
    ocrUsed: false,
    averageConfidence: null,
    extractionMethod: "spreadsheet",
    extractionWarnings: [],
    processingStatus: "ready",
    tables: [],
    availableTables: [],
    fileHash: sha256(buffer),
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
    fileType: ".json",
    sheetNames: ["JSON"],
    selectedSheet: "JSON",
    selectedTableId: "",
    selectedTable: null,
    totalRows: records.length,
    totalColumns: columns.length,
    columns,
    records,
    previewRows: records.slice(0, 10).map((record) => ({
      rowNumber: record.rowNumber,
      data: record.data,
    })),
    pageCount: null,
    imageWidth: null,
    imageHeight: null,
    ocrUsed: false,
    averageConfidence: null,
    extractionMethod: "json",
    extractionWarnings: [],
    processingStatus: "ready",
    tables: [],
    availableTables: [],
    fileHash: sha256(buffer),
  };
};

const parseUploadedDataFile = async ({
  file,
  selectedSheet,
  selectedTableId,
}) => {
  const validation = validateDataWorkFile(file);
  const extension = validation.extension;
  const buffer = file.buffer || Buffer.alloc(0);
  const originalFileName = String(file.originalname || "data-file").trim();

  if (extension === ".json") {
    return parseJsonFile({ buffer, originalFileName });
  }

  if (extension === ".pdf") {
    const pdfPreview = await detectPdfContent({
      buffer,
      selectedTableId,
      maxPages: MAX_PDF_PAGES,
    });

    const selectedTable = pdfPreview.selectedTable;
    const sourceTable = selectedTable || pdfPreview.tables[0] || null;

    return buildDocumentPreviewResponse({
      kind: "pdf",
      originalFileName,
      extension,
      mimeType: validation.mimeType,
      fileHash: validation.fileHash,
      tables: pdfPreview.tables || [],
      selectedTable: sourceTable,
      pageCount: pdfPreview.pageCount,
      imageWidth: pdfPreview.imageWidth,
      imageHeight: pdfPreview.imageHeight,
      ocrUsed: pdfPreview.ocrUsed,
      extractionMethod: pdfPreview.extractionMethod,
      extractionWarnings: pdfPreview.extractionWarnings || [],
      processingStatus: pdfPreview.processingStatus || "ready",
      sourcePageNumbers: sourceTable?.sourcePageNumbers || [],
    });
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    const imagePreview = await detectImageContent({
      buffer,
      originalFileName,
      selectedTableId,
    });

    return buildDocumentPreviewResponse({
      kind: "image",
      originalFileName,
      extension,
      mimeType: validation.mimeType,
      fileHash: validation.fileHash,
      tables: imagePreview.tables || [],
      selectedTable: imagePreview.selectedTable || null,
      pageCount: imagePreview.pageCount,
      imageWidth: imagePreview.imageWidth,
      imageHeight: imagePreview.imageHeight,
      ocrUsed: imagePreview.ocrUsed,
      extractionMethod: imagePreview.extractionMethod,
      extractionWarnings: imagePreview.extractionWarnings || [],
      processingStatus: imagePreview.processingStatus || "ready",
      sourcePageNumbers: imagePreview.selectedTable?.sourcePageNumbers || [1],
    });
  }

  return parseSpreadsheetFile({
    buffer,
    originalFileName,
    extension,
    selectedSheet,
  });
};

const getPreviewSelectionState = (preview = {}) => {
  const tables = Array.isArray(preview.tables) ? preview.tables : [];
  return {
    hasMultipleTables: tables.length > 1,
    selectedTableId: preview.selectedTableId || tables[0]?.id || "",
  };
};

module.exports = {
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_PAGES,
  MAX_IMAGE_DIMENSION,
  OCR_TIMEOUT_MS,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  validateDataWorkFile,
  parseUploadedDataFile,
  buildSearchableText,
  formatPreviewCell,
  sha256,
  getPreviewSelectionState,
  escapeRegExp,
};
