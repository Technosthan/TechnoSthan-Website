import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AccessControlContext = createContext({
  publicAccessEnabled: true,
  publicWebsiteEnabled: true,
  publicRoutes: ["/"],
  loading: true,
});

export const AccessControlProvider = ({ children }) => {
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(true);
  const [publicWebsiteEnabled, setPublicWebsiteEnabled] = useState(true);
  const [publicRoutes, setPublicRoutes] = useState([
    "/",
    "/landing",
    "/about",
    "/contact",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-phone",
    "/login/telegram",
    "/login/whatsapp",
    "/AgriTech Wiki",
    "/chat",
    "/quiz/:contentId",
  ]);
  const [loading, setLoading] = useState(true);

  const fetchPublicSettings = async () => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL_PROD ||
        import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL || ""}/api/settings/public`);
      const { data } = response.data;

      if (!data) {
        console.warn("No settings data returned from API");
        return;
      }

      const enabled =
        typeof data.publicWebsiteEnabled === "boolean" ||
        typeof data.publicAccessEnabled === "boolean"
          ? Boolean(data.publicWebsiteEnabled || data.publicAccessEnabled)
          : true;

      console.log("[AccessControl] Settings fetched:", {
        enabled,
        publicWebsiteEnabled: data.publicWebsiteEnabled,
        publicAccessEnabled: data.publicAccessEnabled,
        routeCount: Array.isArray(data.publicRoutes)
          ? data.publicRoutes.length
          : 0,
      });

      setPublicAccessEnabled(enabled);
      setPublicWebsiteEnabled(enabled);
      setPublicRoutes(
        Array.isArray(data.publicRoutes) && data.publicRoutes.length > 0
          ? data.publicRoutes
          : ["/"],
      );
    } catch (error) {
      console.error("[AccessControl] Failed to load access control settings:", {
        message: error.message,
        status: error.response?.status,
      });
      // Keep existing values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSettings();

    const handlePublicAccessUpdated = (event) => {
      console.log("[AccessControl] publicAccessUpdated event received:", {
        publicWebsiteEnabled: event?.detail?.publicWebsiteEnabled,
        publicAccessEnabled: event?.detail?.publicAccessEnabled,
      });

      if (event?.detail) {
        const enabled =
          event.detail.publicWebsiteEnabled ??
          event.detail.publicAccessEnabled ??
          publicAccessEnabled;
        setPublicAccessEnabled(enabled);
        setPublicWebsiteEnabled(enabled);
        setPublicRoutes(
          Array.isArray(event.detail.publicRoutes) &&
            event.detail.publicRoutes.length > 0
            ? event.detail.publicRoutes
            : ["/"],
        );

        // Also re-fetch from backend to ensure sync
        console.log("[AccessControl] Re-fetching settings after update");
        fetchPublicSettings();
      }
    };

    window.addEventListener("publicAccessUpdated", handlePublicAccessUpdated);

    return () => {
      window.removeEventListener(
        "publicAccessUpdated",
        handlePublicAccessUpdated,
      );
    };
  }, [publicAccessEnabled]); // Add dependency to refresh on auth state change

  return (
    <AccessControlContext.Provider
      value={{
        publicAccessEnabled,
        publicWebsiteEnabled,
        publicRoutes,
        loading,
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => useContext(AccessControlContext);
