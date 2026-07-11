import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const defaultSettings = {
  websiteLanguage: "en",
};

const SettingsContext = createContext({
  loading: false,
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/settings");
      setSettings({
        ...defaultSettings,
        ...(data?.data || {}),
      });
    } catch (error) {
      console.error("Failed to load public settings:", error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({
      loading,
      settings,
      refreshSettings,
    }),
    [loading, settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
