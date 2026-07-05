const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL_PROD ||
  import.meta.env.VITE_API_BASE_URL ||
  window.location.origin;

export const getPublicSettings = async () => {
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
