import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AccessControlContext = createContext({
  publicAccessEnabled: true,
  publicRoutes: ["/"],
  loading: true,
});

export const AccessControlProvider = ({ children }) => {
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(true);
  const [publicRoutes, setPublicRoutes] = useState(["/"]);
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
        setPublicAccessEnabled(
          data.publicAccessEnabled != null ? data.publicAccessEnabled : true,
        );
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
  }, []);

  return (
    <AccessControlContext.Provider
      value={{ publicAccessEnabled, publicRoutes, loading }}
    >
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => useContext(AccessControlContext);
