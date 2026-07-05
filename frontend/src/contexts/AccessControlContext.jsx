import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "./SettingsContext.jsx";

const AccessControlContext = createContext({
  publicAccessEnabled: true,
  publicWebsiteEnabled: true,
  publicRoutes: ["/"],
  loading: true,
});

export const AccessControlProvider = ({ children }) => {
  const { settings, loading } = useSettings();

  const value = useMemo(
    () => ({
      publicAccessEnabled: settings.publicAccessEnabled,
      publicWebsiteEnabled: settings.publicWebsiteEnabled,
      publicRoutes: settings.publicRoutes,
      loading,
    }),
    [
      loading,
      settings.publicAccessEnabled,
      settings.publicRoutes,
      settings.publicWebsiteEnabled,
    ],
  );

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => useContext(AccessControlContext);
