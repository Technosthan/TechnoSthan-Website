import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import {
  getCloudinaryFolder,
  getCloudinaryResourceType,
  normalizeStoredAsset,
  uploadBufferToCloudinary,
} from "../src/shared/services/cloudinary.service.js";
import Form from "../src/features/form/form.model.js";
import Settings from "../src/features/admin/settings.model.js";
import FormResponseAnswer from "../src/features/form/formResponseAnswer.model.js";
import Chat from "../src/features/chat/chat.model.js";

const ROOT = process.cwd().toLowerCase().endsWith(`${path.sep}backend`)
  ? path.resolve(process.cwd(), "..")
  : process.cwd();
const UPLOADS_DIR = path.join(ROOT, "backend", "uploads");
const STATE_DIR = path.join(ROOT, "backend", ".migration");
const STATE_FILE = path.join(STATE_DIR, "cloudinary-uploads.json");
const DRY_RUN = process.argv.includes("--dry-run");

const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
};

const readState = async () => {
  try {
    const content = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
};

const writeState = async (state) => {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
};

const listFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (!entry.name.startsWith(".")) {
      files.push(fullPath);
    }
  }
  return files;
};

const guessMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "application/octet-stream";
};

const buildCloudinaryFolder = (filePath) => {
  const relative = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, "/");
  if (/form-banner/i.test(relative)) {
    return getCloudinaryFolder("forms", "banners");
  }
  if (/chat/i.test(relative)) {
    return getCloudinaryFolder("chat");
  }
  return getCloudinaryFolder("general");
};

const updateStringField = (value, filename, nextUrl) => {
  const current = String(value || "");
  if (!current) return value;
  if (current.includes(filename) || current.includes("/uploads/")) {
    return nextUrl;
  }
  return value;
};

const maybeUpdateForm = async (fileName, asset) => {
  const nextAsset = normalizeStoredAsset(asset);
  const filePattern = new RegExp(fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const forms = await Form.find({});
  for (const form of forms) {
    let mutated = false;
    if (filePattern.test(String(form.bannerImageUrl || ""))) {
      form.bannerImageUrl = nextAsset.secureUrl || nextAsset.url || "";
      form.bannerImageAsset = nextAsset;
      mutated = true;
    }
    if (filePattern.test(String(form.emailTemplate?.logoUrl || ""))) {
      form.emailTemplate.logoUrl = nextAsset.secureUrl || nextAsset.url || "";
      form.emailTemplate.logoAsset = nextAsset;
      mutated = true;
    }
    if (filePattern.test(String(form.emailTemplate?.bannerImageUrl || ""))) {
      form.emailTemplate.bannerImageUrl = nextAsset.secureUrl || nextAsset.url || "";
      form.emailTemplate.bannerImageAsset = nextAsset;
      mutated = true;
    }
    if (mutated && !DRY_RUN) {
      await form.save();
    }
  }
};

const maybeUpdateSettings = async (fileName, asset) => {
  const nextAsset = normalizeStoredAsset(asset);
  const settings = await Settings.find({});
  for (const doc of settings) {
    const current = String(doc.logoUrl || "");
    if (current && (current.includes(fileName) || current.includes("/uploads/"))) {
      doc.logoUrl = nextAsset.secureUrl || nextAsset.url || "";
      doc.logoAsset = nextAsset;
      if (!DRY_RUN) {
        await doc.save();
      }
    }
  }
};

const maybeUpdateChat = async (fileName, asset) => {
  const nextAsset = normalizeStoredAsset(asset);
  const chats = await Chat.find({});
  for (const chat of chats) {
    const current = String(chat.file?.path || "");
    if (current && (current.includes(fileName) || current.includes("/uploads/"))) {
      chat.file.path = nextAsset.secureUrl || nextAsset.url || "";
      chat.file.asset = nextAsset;
      if (!DRY_RUN) {
        await chat.save();
      }
    }
  }
};

const maybeUpdateAnswers = async (fileName, asset) => {
  const nextAsset = normalizeStoredAsset(asset);
  const answers = await FormResponseAnswer.find({});
  for (const answer of answers) {
    const current = String(answer.fileUrl || "");
    if (current && (current.includes(fileName) || current.includes("/uploads/"))) {
      answer.fileUrl = nextAsset.secureUrl || nextAsset.url || "";
      answer.fileAsset = nextAsset;
      if (!DRY_RUN) {
        await answer.save();
      }
    }
  }
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are required");
  }

  await ensureConnected();

  const state = await readState();
  const files = await listFiles(UPLOADS_DIR).catch(() => []);

  console.log(
    `[migrate-uploads-to-cloudinary] Found ${files.length} files${DRY_RUN ? " (dry run)" : ""}`,
  );

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const stat = await fs.stat(filePath);
    const stateEntry = state[filePath];
    if (
      stateEntry &&
      stateEntry.size === stat.size &&
      stateEntry.mtimeMs === stat.mtimeMs &&
      stateEntry.secureUrl
    ) {
      skipped += 1;
      continue;
    }

    try {
      const buffer = await fs.readFile(filePath);
      const mimeType = guessMimeType(filePath);
      const asset = await uploadBufferToCloudinary({
        buffer,
        originalName: fileName,
        mimeType,
        size: stat.size,
        folder: buildCloudinaryFolder(filePath),
        resourceType: getCloudinaryResourceType({ mimetype: mimeType }),
      });

      state[filePath] = {
        ...asset,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      };

      if (!DRY_RUN) {
        await Promise.all([
          maybeUpdateForm(fileName, asset),
          maybeUpdateSettings(fileName, asset),
          maybeUpdateAnswers(fileName, asset),
          maybeUpdateChat(fileName, asset),
        ]);
        await writeState(state);
      }

      migrated += 1;
      console.log(`[migrate-uploads-to-cloudinary] migrated ${fileName}`);
    } catch (error) {
      failed += 1;
      console.error(
        `[migrate-uploads-to-cloudinary] failed ${fileName}:`,
        error.message,
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        migrated,
        skipped,
        failed,
        dryRun: DRY_RUN,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("[migrate-uploads-to-cloudinary] fatal:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
