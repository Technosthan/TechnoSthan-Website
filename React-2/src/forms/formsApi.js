import axiosInstance from "../shared/lib/axiosInstance";
import {
  clearAuth,
  getStoredToken,
  SESSION_EVENT_TYPES,
} from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const fetchAdminExport = async (path, params = {}, options = {}) => {
  const token = getStoredToken();
  if (!token) {
    const error = new Error("No token, access denied");
    error.response = { status: 401, data: { message: error.message } };
    clearAuth({
      reason: SESSION_EVENT_TYPES.AUTH_EXPIRED,
      message: error.message,
    });
    throw error;
  }

  const response = await fetch(`${API_BASE}${path}${buildQueryString(params)}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-access-token": token,
    },
  });

  const responseContentType =
    response.headers.get("content-type") || "";
  const contentDisposition = response.headers.get("content-disposition") || "";
  const expectedFormat = String(options.expectedFormat || "").toLowerCase();

  if (
    response.ok &&
    expectedFormat !== "json" &&
    responseContentType.includes("application/json") &&
    !contentDisposition
  ) {
    let message = "Failed to export responses";
    try {
      const text = await response.text();
      if (text) {
        const parsed = JSON.parse(text);
        message = parsed.message || text || message;
      }
    } catch {
      // Keep the default message if the body is not valid JSON.
    }

    const error = new Error(message);
    error.response = {
      status: response.status || 400,
      data: { message },
    };
    throw error;
  }

  if (!response.ok) {
    let message = "Failed to export responses";
    try {
      const text = await response.text();
      if (text) {
        const parsed = JSON.parse(text);
        message = parsed.message || text || message;
      }
    } catch {
      // Keep the default message if the response body is not JSON.
    }

    const error = new Error(message);
    error.response = {
      status: response.status,
      data: { message },
    };

    if (response.status === 401) {
      clearAuth({
        reason: SESSION_EVENT_TYPES.AUTH_EXPIRED,
        message,
      });
    }

    throw error;
  }

  return {
    data: await response.blob(),
    headers: {
      "content-type": response.headers.get("content-type") || "",
    },
  };
};

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
  fetchAdminExport(`/api/admin/forms/${formId}/responses/export`, params, {
    expectedFormat: "csv",
  });
export const exportAdminFormResponsesByFormat = (
  formId,
  format = "csv",
  params = {},
) => {
  return fetchAdminExport(
    `/api/admin/forms/${formId}/responses/export/${format}`,
    params,
    { expectedFormat: format },
  );
};
export const importAdminFormResponsesPreview = (formId, formData) =>
  axiosInstance.post(
    `/api/admin/forms/${formId}/responses/import/preview`,
    formData,
  );
export const importAdminFormResponses = (formId, formData) =>
  axiosInstance.post(`/api/admin/forms/${formId}/responses/import`, formData);
export const undoAdminFormResponseImport = (formId, batchId) =>
  axiosInstance.delete(`/api/admin/forms/${formId}/responses/import/${batchId}`);

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
