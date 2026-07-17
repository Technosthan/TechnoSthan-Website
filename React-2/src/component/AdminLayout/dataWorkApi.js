import api from "../../lib/api";

export const getAdminDataWorks = (params = {}) =>
  api.get("/api/admin/data-works", { params });

export const getAdminDataWorkById = (workId) =>
  api.get(`/api/admin/data-works/${workId}`);

export const getAdminDataWorkRecords = (workId, params = {}) =>
  api.get(`/api/admin/data-works/${workId}/records`, { params });

export const previewAdminDataWorkFile = (formData) =>
  api.post("/api/admin/data-works/preview", formData);

export const createAdminDataWork = (formData) =>
  api.post("/api/admin/data-works", formData);

export const updateAdminDataWork = (workId, payload) =>
  api.put(`/api/admin/data-works/${workId}`, payload);

export const replaceAdminDataWorkFile = (workId, formData) =>
  api.post(`/api/admin/data-works/${workId}/file`, formData);

export const deleteAdminDataWork = (workId) =>
  api.delete(`/api/admin/data-works/${workId}`);

export const exportAdminDataWork = (workId) =>
  api.get(`/api/admin/data-works/${workId}/export`, {
    responseType: "blob",
  });
