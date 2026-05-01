const csv  = require('csv-parser');
const xlsx = require('xlsx');
const fs   = require('fs');
const path = require('path');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRow = (row) => {
  const out = {};
  for (const key of Object.keys(row)) {
    const clean = key.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase().trim();
    out[clean] = String(row[key]).trim();
  }
  return out;
};

const extractFields = (norm) => {
  let email = '';
  let phone = norm.phone || norm['phone number'] || '';
  if (norm.email && EMAIL_REGEX.test(norm.email)) {
    email = norm.email;
  } else {
    for (const val of Object.values(norm)) {
      if (EMAIL_REGEX.test(val)) { email = val; continue; }
      if (!phone && /^[\d\s+\-()\\.]{7,15}$/.test(val)) phone = val;
    }
  }
  return { email, phone };
};

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const { email, phone } = extractFields(normalizeRow(row));
        if (email) results.push({ email, phone });
      })
      .on('end',   () => resolve(results))
      .on('error', reject);
  });

const parseExcel = (filePath) => {
  const wb    = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet).map(normalizeRow).map(extractFields).filter((r) => r.email);
};

const parseFile = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (['.xlsx', '.xls'].includes(ext)) return parseExcel(filePath);
  throw new Error('Unsupported file format');
};

module.exports = { parseFile };
