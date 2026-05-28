const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+\-()\\.]{7,20}$/;

const normalizeHeader = (value) => {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
};

const normalizeKey = (value) => {
  const clean = normalizeHeader(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return clean || "field";
};

const buildUniqueKey = (base, usedKeys) => {
  let key = base || "field";
  let idx = 1;
  while (usedKeys[key]) {
    key = `${base || "field"}_${idx++}`;
  }
  usedKeys[key] = true;
  return key;
};

const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const extractFields = (fields) => {
  let email = "";
  let phone = "";
  let name = "";

  if (fields.email && EMAIL_REGEX.test(fields.email)) email = fields.email;
  if (fields.phone && PHONE_REGEX.test(fields.phone)) phone = fields.phone;

  const nameKeys = ["name", "full_name", "first_name", "last_name"];
  for (const key of Object.keys(fields)) {
    if (!name && nameKeys.includes(key) && fields[key]) {
      name = fields[key];
    }
  }

  for (const val of Object.values(fields)) {
    if (!email && EMAIL_REGEX.test(val)) email = val;
    if (!phone && PHONE_REGEX.test(val)) phone = val;
    if (
      !name &&
      typeof val === "string" &&
      val.trim().length > 2 &&
      /[a-zA-Z]/.test(val) &&
      !EMAIL_REGEX.test(val) &&
      !PHONE_REGEX.test(val)
    ) {
      name = val;
    }
  }

  return { email, phone, name };
};

const mergeFieldValue = (target, key, rawValue) => {
  const value = cleanValue(rawValue);
  if (!value) return;

  const existing = target[key];
  if (existing === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(existing)) {
    if (!existing.includes(value)) {
      existing.push(value);
    }
    return;
  }

  if (existing !== value) {
    target[key] = [existing, value];
  }
};

const normalizeRow = (row, headerMap, headerKeyMap, usedKeys) => {
  const normalized = {};
  for (const rawKey of Object.keys(row)) {
    const originalLabel = normalizeHeader(rawKey);
    const baseKey = normalizeKey(originalLabel) || "field";

    let key = headerKeyMap[baseKey];
    if (!key) {
      key = buildUniqueKey(baseKey, usedKeys);
      headerKeyMap[baseKey] = key;
      if (!headerMap[key]) headerMap[key] = originalLabel || key;
    }

    mergeFieldValue(normalized, key, row[rawKey]);
  }
  return normalized;
};

const buildHeadersFromMap = (headerMap) =>
  Object.keys(headerMap).map((key) => ({ key, label: headerMap[key] || key }));

const buildRowFromValues = (
  values,
  headers,
  headerMap,
  headerKeyMap,
  usedKeys,
) => {
  const normalized = {};
  for (let index = 0; index < headers.length; index += 1) {
    const rawHeader = normalizeHeader(headers[index]);
    if (!rawHeader) continue;

    const baseKey = normalizeKey(rawHeader) || "field";
    let key = headerKeyMap[baseKey];
    if (!key) {
      key = buildUniqueKey(baseKey, usedKeys);
      headerKeyMap[baseKey] = key;
      if (!headerMap[key]) headerMap[key] = rawHeader || key;
    }

    mergeFieldValue(normalized, key, values[index]);
  }
  return normalized;
};

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    const headerMap = {};
    const headerKeyMap = {};
    const usedKeys = {};
    let fileHeaders = null;

    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on("data", (row) => {
        const values = Object.values(row || {});
        if (!fileHeaders) {
          fileHeaders = values.map(normalizeHeader);
          return;
        }

        const normalized = buildRowFromValues(
          values,
          fileHeaders,
          headerMap,
          headerKeyMap,
          usedKeys,
        );

        if (Object.keys(normalized).length) results.push(normalized);
      })
      .on("end", () =>
        resolve({ rows: results, headers: buildHeadersFromMap(headerMap) }),
      )
      .on("error", reject);
  });

const parseExcel = (filePath) => {
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headerMap = {};
  const headerKeyMap = {};
  const usedKeys = {};
  let fileHeaders = [];
  const rows = rawRows.map((row, index) => {
    const values = Array.isArray(row) ? row : Object.values(row || {});
    if (!index) {
      fileHeaders = values.map(normalizeHeader);
      return null;
    }
    return buildRowFromValues(
      values,
      fileHeaders,
      headerMap,
      headerKeyMap,
      usedKeys,
    );
  });
  return {
    rows: rows.filter((row) => row && Object.keys(row).length),
    headers: buildHeadersFromMap(headerMap),
  };
};

const parseFile = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === ".csv") return parseCSV(filePath);
  if ([".xlsx", ".xls"].includes(ext)) return parseExcel(filePath);
  throw new Error("Unsupported file format");
};

module.exports = { parseFile, extractFields };
