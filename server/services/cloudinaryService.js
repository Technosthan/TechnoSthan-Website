const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "Cloudinary environment variables not fully set. Cloud uploads will fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are provided.",
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadFromDataUri = async (dataUri, options = {}) => {
  // options: { folder, resource_type }
  const uploadOptions = Object.assign(
    { resource_type: "auto", folder: "assignments" },
    options,
  );
  return cloudinary.uploader.upload(dataUri, uploadOptions);
};

const deleteAsset = async (publicId, resourceType = "auto") => {
  if (!publicId) return { result: "not_found" };
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  uploadFromDataUri,
  deleteAsset,
  cloudinaryClient: cloudinary,
};
