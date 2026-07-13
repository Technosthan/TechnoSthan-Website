import { hasConfiguredApiBaseUrl, resolveApiBaseUrl } from "./apiConfig";

const baseURL =
  resolveApiBaseUrl({
    allowSameOriginProxy: false,
  }) || "";

export const getPublicSettings = async () => {
  if (!baseURL) {
    throw new Error(
      hasConfiguredApiBaseUrl()
        ? "Public settings base URL is unavailable"
        : "Missing VITE_API_BASE_URL in production. Falling back to safe defaults.",
    );
  }

  const response = await fetch(`${baseURL}/api/settings/public`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(
      message || `Failed to fetch public settings (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return { data };
};
