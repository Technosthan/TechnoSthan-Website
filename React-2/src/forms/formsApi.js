import axiosInstance from "../shared/lib/axiosInstance";

export const getAdminForms = () => axiosInstance.get("/api/admin/forms");
export const getAdminFormById = (formId) =>
  axiosInstance.get(`/api/admin/forms/${formId}`);
export const getAdminFormExport = (formId) =>
  axiosInstance.get(`/api/admin/forms/${formId}/export-json`);
export const createAdminForm = (payload) =>
  axiosInstance.post("/api/admin/forms", payload);
export const updateAdminForm = (formId, payload) =>
  axiosInstance.put(`/api/admin/forms/${formId}`, payload);
export const importAdminFormFile = (formData) =>
  axiosInstance.post("/api/admin/forms/import-file", formData);
export const deleteAdminForm = (formId) =>
  axiosInstance.delete(`/api/admin/forms/${formId}`);
export const getAdminFormResponses = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses`, { params });
export const getAdminFormResponseAnalysis = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses/analysis`, { params });
export const getAdminFormResponse = (formId, responseId) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses/${responseId}`);
export const deleteAdminFormResponse = (formId, responseId) =>
  axiosInstance.delete(`/api/admin/forms/${formId}/responses/${responseId}`);
export const revealAdminFormResponseSecret = (formId, responseId, questionId) =>
  axiosInstance.post(
    `/api/admin/forms/${formId}/responses/${responseId}/reveal-secret`,
    { questionId },
  );
export const exportAdminFormResponses = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/export`, {
    responseType: "blob",
    params,
  });

export const getPublicFormBySlug = (slug) =>
  axiosInstance.get(`/api/forms/${slug}`);
export const sendPublicFormVerification = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/email/send`, payload);
export const verifyPublicFormVerification = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/email/verify`, payload);
export const sendPublicPhoneVerification = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/phone/send`, payload);
export const verifyPublicPhoneVerification = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/phone/verify`, payload);

export const submitPublicForm = (slug, formData) =>
  axiosInstance.post(`/api/forms/${slug}/submit`, formData);

export const buildPublicFormUrl = (slug) =>
  `${window.location.origin}/forms/${slug}`;
