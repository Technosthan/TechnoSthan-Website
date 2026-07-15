import api from "../../lib/api";

export const uploadFormBannerImage = (formData) =>
  api.post("/api/admin/forms/upload", formData);

export const uploadFormLogoImage = (formData) =>
  api.post("/api/admin/forms/upload", formData);

export const deleteCloudinaryAsset = (payload) =>
  api.delete("/api/admin/forms/upload", { data: payload });
