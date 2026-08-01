import axiosInstance from "../../shared/lib/axiosInstance";
import { hasConfiguredApiBaseUrl, resolveApiBaseUrl } from "../../shared/lib/apiConfig";

const publicBaseUrl =
  resolveApiBaseUrl({
    allowSameOriginProxy: false,
  }) || "";

export const getPublicEmpoweringCards = async () => {
  if (!publicBaseUrl) {
    throw new Error(
      hasConfiguredApiBaseUrl()
        ? "Homepage cards base URL is unavailable"
        : "Missing VITE_API_BASE_URL in production. Falling back to safe defaults.",
    );
  }

  const response = await fetch(`${publicBaseUrl}/api/empowering-cards/public`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(message || `Failed to fetch homepage cards (${response.status})`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return { data };
};

export const getAdminEmpoweringCards = () =>
  axiosInstance.get("/api/admin/empowering-cards");

export const getAdminEmpoweringCard = (cardId) =>
  axiosInstance.get(`/api/admin/empowering-cards/${cardId}`);

export const createAdminEmpoweringCard = (formData) =>
  axiosInstance.post("/api/admin/empowering-cards", formData);

export const updateAdminEmpoweringCard = (cardId, formData) =>
  axiosInstance.put(`/api/admin/empowering-cards/${cardId}`, formData);

export const deleteAdminEmpoweringCard = (cardId) =>
  axiosInstance.delete(`/api/admin/empowering-cards/${cardId}`);

export const updateAdminEmpoweringCardStatus = (cardId, isActive) =>
  axiosInstance.patch(`/api/admin/empowering-cards/${cardId}/status`, {
    isActive,
  });

export const reorderAdminEmpoweringCards = (items) =>
  axiosInstance.patch("/api/admin/empowering-cards/reorder", { items });

export const previewAdminEmpoweringCardUpload = (formData) =>
  axiosInstance.post("/api/admin/empowering-cards/preview-upload", formData);

