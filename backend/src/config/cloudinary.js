import { env } from "./env.js";

const hasCloudinaryConfig =
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

let cloudinaryClientPromise = null;

export const isCloudinaryConfigured = Boolean(hasCloudinaryConfig);

export const getCloudinary = async () => {
  if (!hasCloudinaryConfig) {
    return null;
  }

  if (!cloudinaryClientPromise) {
    cloudinaryClientPromise = import("cloudinary").then(({ v2 }) => {
      v2.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      return v2;
    });
  }

  return cloudinaryClientPromise;
};
