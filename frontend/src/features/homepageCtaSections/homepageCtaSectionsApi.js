import axiosInstance from "../../shared/lib/axiosInstance";
import { resolveApiBaseUrl } from "../../shared/lib/apiConfig";

export const HOMEPAGE_CTA_SECTIONS_CHANGED_EVENT = "homepage-cta-sections:changed";
const HOMEPAGE_CTA_SECTIONS_STORAGE_KEY = "homepage-cta-sections:version";

const publicBaseUrl =
  resolveApiBaseUrl({
    allowSameOriginProxy: false,
  }) || "";

export const notifyHomepageCtaSectionsChanged = () => {
  const timestamp = String(Date.now());

  try {
    localStorage.setItem(HOMEPAGE_CTA_SECTIONS_STORAGE_KEY, timestamp);
  } catch {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HOMEPAGE_CTA_SECTIONS_CHANGED_EVENT));
  }
};

export const getPublicHomepageCtaSections = async () => {
  const requestUrl = publicBaseUrl
    ? `${publicBaseUrl}/api/public/homepage-cta-sections`
    : "/api/public/homepage-cta-sections";

  const response = await fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(
      message || `Failed to fetch homepage CTA sections (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return { data };
};

export const getAdminHomepageCtaSections = () =>
  axiosInstance.get("/api/admin/homepage-cta-sections");

export const getAdminHomepageCtaSection = (sectionId) =>
  axiosInstance.get(`/api/admin/homepage-cta-sections/${sectionId}`);

export const createAdminHomepageCtaSection = (data) =>
  axiosInstance.post("/api/admin/homepage-cta-sections", data);

export const updateAdminHomepageCtaSection = (sectionId, data) =>
  axiosInstance.put(`/api/admin/homepage-cta-sections/${sectionId}`, data);

export const deleteAdminHomepageCtaSection = (sectionId) =>
  axiosInstance.delete(`/api/admin/homepage-cta-sections/${sectionId}`);

export const updateAdminHomepageCtaSectionStatus = (sectionId, isActive) =>
  axiosInstance.patch(`/api/admin/homepage-cta-sections/${sectionId}/status`, {
    isActive,
  });

export const reorderAdminHomepageCtaSections = (items) =>
  axiosInstance.patch("/api/admin/homepage-cta-sections/reorder", { items });

export const homepageCtaSectionsStorageKey = HOMEPAGE_CTA_SECTIONS_STORAGE_KEY;
