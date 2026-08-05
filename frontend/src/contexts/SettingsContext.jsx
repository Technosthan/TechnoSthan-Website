import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../lib/api";
import { AUTH_STORAGE_KEYS } from "../utils/auth";

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

  const refreshSettings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === AUTH_STORAGE_KEYS.workspaceSettingsUpdatedAt) {
        refreshSettings();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      loading,
      settings,
      refreshSettings,
    }),
    [loading, refreshSettings, settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
