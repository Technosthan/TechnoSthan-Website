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

      const resolveEnabled = (websiteEnabled, accessEnabled) => {
        if (websiteEnabled === false || accessEnabled === false) {
          return false;
        }
        if (typeof websiteEnabled === "boolean") {
          return websiteEnabled;
        }
        if (typeof accessEnabled === "boolean") {
          return accessEnabled;
        }
        return true;
      };

      const publicAccessEnabledValue =
        typeof data.publicAccessEnabled === "boolean"
          ? data.publicAccessEnabled
          : data.publicWebsiteEnabled;
      const publicWebsiteEnabledValue =
        typeof data.publicWebsiteEnabled === "boolean"
          ? data.publicWebsiteEnabled
          : data.publicAccessEnabled;
      const enabled = resolveEnabled(
        publicWebsiteEnabledValue,
        publicAccessEnabledValue,
      );

      console.log("[AccessControl] Settings fetched:", {
        enabled,
        publicWebsiteEnabled: publicWebsiteEnabledValue,
        publicAccessEnabled: publicAccessEnabledValue,
        publicRoutes: Array.isArray(data.publicRoutes) ? data.publicRoutes : [],
      });

      setPublicAccessEnabled(publicAccessEnabledValue);
      setPublicWebsiteEnabled(publicWebsiteEnabledValue);
      setPublicRoutes(
        Array.isArray(data.publicRoutes) ? data.publicRoutes : [],
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

    const resolveEnabled = (websiteEnabled, accessEnabled) => {
      if (websiteEnabled === false || accessEnabled === false) {
        return false;
      }
      if (typeof websiteEnabled === "boolean") {
        return websiteEnabled;
      }
      if (typeof accessEnabled === "boolean") {
        return accessEnabled;
      }
      return true;
    };

    const handlePublicAccessUpdated = (event) => {
      console.log("[AccessControl] publicAccessUpdated event received:", {
        publicWebsiteEnabled: event?.detail?.publicWebsiteEnabled,
        publicAccessEnabled: event?.detail?.publicAccessEnabled,
        publicRoutes: event?.detail?.publicRoutes,
      });

      if (event?.detail) {
        const publicAccessEnabledValue =
          typeof event.detail.publicAccessEnabled === "boolean"
            ? event.detail.publicAccessEnabled
            : publicAccessEnabled;
        const publicWebsiteEnabledValue =
          typeof event.detail.publicWebsiteEnabled === "boolean"
            ? event.detail.publicWebsiteEnabled
            : publicWebsiteEnabled;

        setPublicAccessEnabled(publicAccessEnabledValue);
        setPublicWebsiteEnabled(publicWebsiteEnabledValue);
        setPublicRoutes(
          Array.isArray(event.detail.publicRoutes)
            ? event.detail.publicRoutes
            : [],
        );

        const enabled = resolveEnabled(
          publicWebsiteEnabledValue,
          publicAccessEnabledValue,
        );
        console.log("[AccessControl] Updated access control state:", {
          enabled,
          publicWebsiteEnabledValue,
          publicAccessEnabledValue,
        });

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
  }, []);

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
