import axiosInstance from "../../shared/lib/axiosInstance";
import { hasConfiguredApiBaseUrl, resolveApiBaseUrl } from "../../shared/lib/apiConfig";

const publicBaseUrl =
  resolveApiBaseUrl({
    allowSameOriginProxy: false,
  }) || "";

export const getPublicHomepageServices = async () => {
  if (!publicBaseUrl) {
    throw new Error(
      hasConfiguredApiBaseUrl()
        ? "Homepage services base URL is unavailable"
        : "Missing VITE_API_BASE_URL in production. Falling back to safe defaults.",
    );
  }

  const response = await fetch(`${publicBaseUrl}/api/homepage-services/public`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(
      message || `Failed to fetch homepage services (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return { data };
};

export const getAdminHomepageServices = (params = {}) =>
  axiosInstance.get("/api/admin/homepage-services", { params });

export const getAdminHomepageService = (serviceId) =>
  axiosInstance.get(`/api/admin/homepage-services/${serviceId}`);

export const createAdminHomepageService = (data) =>
  axiosInstance.post("/api/admin/homepage-services", data);

export const updateAdminHomepageService = (serviceId, data) =>
  axiosInstance.put(`/api/admin/homepage-services/${serviceId}`, data);

export const deleteAdminHomepageService = (serviceId) =>
  axiosInstance.delete(`/api/admin/homepage-services/${serviceId}`);

export const updateAdminHomepageServiceStatus = (serviceId, data) =>
  axiosInstance.patch(`/api/admin/homepage-services/${serviceId}/status`, data);

export const reorderAdminHomepageServices = (serviceOrder) =>
  axiosInstance.patch("/api/admin/homepage-services/reorder", { serviceOrder });

export const translateAdminHomepageService = (data) =>
  axiosInstance.post("/api/admin/homepage-services/translate", data);

export const uploadAdminHomepageServiceImage = (formData) =>
  axiosInstance.post("/api/admin/homepage-services/upload-image", formData);
