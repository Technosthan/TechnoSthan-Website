import axiosInstance from "../../shared/lib/axiosInstance";

export const getAdminForms = () => axiosInstance.get("/api/admin/forms");
export const getAdminFormById = (formId) =>
  axiosInstance.get(`/api/admin/forms/${formId}`);
export const createAdminForm = (payload) =>
  axiosInstance.post("/api/admin/forms", payload);
export const updateAdminForm = (formId, payload) =>
  axiosInstance.put(`/api/admin/forms/${formId}`, payload);
export const deleteAdminForm = (formId) =>
  axiosInstance.delete(`/api/admin/forms/${formId}`);
export const importAdminFormFromFile = (formData) =>
  axiosInstance.post("/api/admin/forms/import-file", formData);
export const getAdminFormResponses = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses`, { params });
export const getAdminFormResponseAnalysis = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses/analysis`, { params });
export const getAdminFormResponse = (formId, responseId) =>
  axiosInstance.get(`/api/admin/forms/${formId}/responses/${responseId}`);
export const revealAdminFormResponseSecret = (formId, responseId, questionId) =>
  axiosInstance.post(
    `/api/admin/forms/${formId}/responses/${responseId}/reveal-secret`,
    { questionId },
  );
export const deleteAdminFormResponse = (formId, responseId) =>
  axiosInstance.delete(`/api/admin/forms/${formId}/responses/${responseId}`);
export const exportAdminFormResponses = (formId, params = {}) =>
  axiosInstance.get(`/api/admin/forms/${formId}/export`, {
    responseType: "blob",
    params,
  });

export const getPublicFormBySlug = (slug) =>
  axiosInstance.get(`/api/forms/${slug}`);

export const submitPublicForm = (slug, formData) =>
  axiosInstance.post(`/api/forms/${slug}/submit`, formData);

export const sendPublicFormVerificationOtp = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/${payload?.challengeType}/send`, payload);

export const verifyPublicFormVerificationOtp = (slug, payload) =>
  axiosInstance.post(`/api/forms/${slug}/verification/${payload?.challengeType}/verify`, payload);

export const buildPublicFormUrl = (slug) =>
  `${window.location.origin}/forms/${slug}`;
