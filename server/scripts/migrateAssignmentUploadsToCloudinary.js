require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const cloudinaryService = require("../services/cloudinaryService");

const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const isLocalUploadPath = (url) => {
  if (!url) return false;
  const normalized = String(url).trim();
  if (/^https?:\/\//i.test(normalized)) {
    return /(^https?:\/\/localhost(:\d+)?\/uploads\/|^https?:\/\/127\.0\.0\.1(:\d+)?\/uploads\/)/i.test(
      normalized,
    );
  }
  return /(^\/?uploads\/|\/uploads\/)/i.test(normalized);
};

const uploadLocalFileToCloudinary = async (url) => {
  try {
    const trimmed = String(url).replace(/^\/+/, "");
    const localPath = path.resolve(__dirname, "..", trimmed);
    if (!fs.existsSync(localPath)) {
      console.warn("Local file not found, skipping:", localPath);
      return null;
    }

    const buffer = fs.readFileSync(localPath);
    const mimeType = mime.lookup(localPath) || "application/octet-stream";
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    console.log("Uploading to Cloudinary:", localPath);
    const result = await cloudinaryService.uploadFromDataUri(dataUri, {
      folder: "assignments",
      resource_type: "auto",
    });

    if (!result || !result.secure_url || !result.public_id) {
      console.error("Invalid Cloudinary response for", localPath, result);
      return null;
    }

    // Optionally remove local file
    try {
      fs.unlinkSync(localPath);
      console.log("Removed local file:", localPath);
    } catch (e) {
      // not fatal
      console.warn("Could not remove local file:", localPath, e.message || e);
    }

    return {
      name: path.basename(localPath),
      fileName: result.public_id,
      originalFileName: result.original_filename || path.basename(localPath),
      fileType: result.format || mimeType,
      url: result.secure_url,
      mimeType: mimeType,
      size: result.bytes || buffer.length,
      uploadedAt: new Date(),
      public_id: result.public_id,
      secure_url: result.secure_url,
      original_filename: result.original_filename || null,
      resource_type: result.resource_type || null,
      format: result.format || null,
      bytes: result.bytes || buffer.length,
    };
  } catch (err) {
    console.error("Upload error:", err && err.message ? err.message : err);
    return null;
  }
};

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not set in environment");
      process.exit(2);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for migration");

    // Migrate assignments
    const assignments = await Assignment.find({
      $or: [
        { "attachments.url": /uploads/ },
        { "attachments.secure_url": /uploads/ },
      ],
    }).lean();
    console.log(
      `Found ${assignments.length} assignments with local attachments`,
    );

    for (const a of assignments) {
      const updated = [];
      let changed = false;
      for (const att of a.attachments || []) {
        const localValue = att.secure_url || att.url;
        if (isLocalUploadPath(localValue)) {
          const uploaded = await uploadLocalFileToCloudinary(localValue);
          if (uploaded) {
            updated.push(uploaded);
            changed = true;
            console.log(
              `Migrated attachment for assignment ${a._id}: ${uploaded.secure_url}`,
            );
          } else {
            updated.push(att);
          }
        } else {
          updated.push(att);
        }
      }

      if (changed) {
        await Assignment.findByIdAndUpdate(a._id, { attachments: updated });
        console.log(`Updated assignment ${a._id} attachments to Cloudinary`);
      }
    }

    // Migrate submissions
    const submissions = await Submission.find({
      $or: [
        { "attachments.url": /uploads/ },
        { "attachments.secure_url": /uploads/ },
      ],
    }).lean();
    console.log(
      `Found ${submissions.length} submissions with local attachments`,
    );

    for (const s of submissions) {
      const updated = [];
      let changed = false;
      for (const att of s.attachments || []) {
        const localValue = att.secure_url || att.url;
        if (isLocalUploadPath(localValue)) {
          const uploaded = await uploadLocalFileToCloudinary(localValue);
          if (uploaded) {
            updated.push(uploaded);
            changed = true;
            console.log(
              `Migrated attachment for submission ${s._id}: ${uploaded.secure_url}`,
            );
          } else {
            updated.push(att);
          }
        } else {
          updated.push(att);
        }
      }

      if (changed) {
        await Submission.findByIdAndUpdate(s._id, { attachments: updated });
        console.log(`Updated submission ${s._id} attachments to Cloudinary`);
      }
    }

    console.log("Migration finished");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err && err.message ? err.message : err);
    process.exit(2);
  }
};

migrate();
