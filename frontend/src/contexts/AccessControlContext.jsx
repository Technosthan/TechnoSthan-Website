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

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL_PROD ||
          import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(
          `${baseURL || ""}/api/settings/public`,
        );
        const { data } = response.data;
        const enabled =
          typeof data.publicWebsiteEnabled === "boolean" ||
          typeof data.publicAccessEnabled === "boolean"
            ? Boolean(data.publicWebsiteEnabled || data.publicAccessEnabled)
            : true;
        setPublicAccessEnabled(enabled);
        setPublicWebsiteEnabled(enabled);
        setPublicRoutes(
          Array.isArray(data.publicRoutes) && data.publicRoutes.length > 0
            ? data.publicRoutes
            : ["/"],
        );
      } catch (error) {
        console.error("Failed to load access control settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSettings();

    const handlePublicAccessUpdated = (event) => {
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
