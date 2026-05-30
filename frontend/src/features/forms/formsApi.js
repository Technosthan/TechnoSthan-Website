import axiosInstance from "../../shared/lib/axiosInstance";

export const getAvailableForms = () => axiosInstance.get("/api/forms");
export const getFormBySlug = (slug) =>
  axiosInstance.get(`/api/forms/slug/${slug}`);
export const submitForm = (formId, payload) =>
  axiosInstance.post(`/api/forms/${formId}/submit`, payload);
