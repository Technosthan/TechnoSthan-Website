const fsp = require("fs/promises");
const path = require("path");

const {
  MAX_FILE_SIZE_BYTES,
  validateDataWorkFile,
  parseUploadedDataFile,
  buildSearchableText,
  formatPreviewCell,
  escapeRegExp,
} = require("./documentExtractionService");

const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads", "data-works");

const ensureUploadDir = async () => {
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
};

const sanitizeStoredFileName = (workName, originalFileName, extension) => {
  const safeBase =
    String(workName || originalFileName || "data-work")
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
  buildSearchableText,
  formatPreviewCell,
  escapeRegExp,
};
