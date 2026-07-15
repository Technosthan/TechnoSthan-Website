import fs from "fs/promises";
import path from "path";
import multer from "multer";
import cloudinary, {
  hasCloudinaryConfig,
} from "../config/cloudinary.js";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    cb(new Error("Only image uploads are allowed"));
    return;
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

const getExtension = (file) => {
  const extFromName = path.extname(file.originalname || "");
  if (extFromName) {
    return extFromName.toLowerCase();
  }

  const mimeMap = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return mimeMap[file.mimetype] || ".png";
};

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          assetId: result.public_id,
          storage: "cloudinary",
        });
      }
    );

    stream.end(file.buffer);
  });

const uploadLocally = async (file, folder) => {
  await ensureUploadDir();

  const safeName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}${getExtension(file)}`;
  const relativePath = path.join(folder, safeName);
  const absolutePath = path.join(UPLOAD_DIR, folder, safeName);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return {
    url: `/uploads/${relativePath.replace(/\\/g, "/")}`,
    assetId: relativePath.replace(/\\/g, "/"),
    storage: "local",
  };
};

export const saveUploadedImage = async (
  file,
  folder = "shared"
) => {
  if (!file) {
    return null;
  }

  if (hasCloudinaryConfig) {
    return uploadToCloudinary(file, folder);
  }

  return uploadLocally(file, folder);
};

export const deleteStoredImage = async (
  image
) => {
  if (!image?.assetId) {
    return;
  }

  if (image.storage === "cloudinary") {
    await cloudinary.uploader.destroy(
      image.assetId,
      {
        resource_type: "image",
        invalidate: true,
      }
    );
    return;
  }

  const absolutePath = path.join(
    UPLOAD_DIR,
    image.assetId
  );

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
};
