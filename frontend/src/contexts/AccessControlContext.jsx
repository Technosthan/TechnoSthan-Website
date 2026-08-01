import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "./SettingsContext.jsx";

const AccessControlContext = createContext({
  publicAccessEnabled: false,
  publicWebsiteEnabled: false,
  publicRoutes: ["/"],
  loading: true,
});

export const AccessControlProvider = ({ children }) => {
  const { settings, loading } = useSettings();

  const value = useMemo(
    () => ({
      publicAccessEnabled:
        typeof settings.publicAccessEnabled === "boolean"
          ? settings.publicAccessEnabled
          : false,
      publicWebsiteEnabled:
        typeof settings.publicWebsiteEnabled === "boolean"
          ? settings.publicWebsiteEnabled
          : false,
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
