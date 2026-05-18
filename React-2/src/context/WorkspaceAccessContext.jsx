import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../lib/api";

const WorkspaceAccessContext = createContext(null);

const EMPTY_ACCESS = Object.freeze({});

export const WorkspaceAccessProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [accessMap, setAccessMap] = useState(EMPTY_ACCESS);

  const refreshAccess = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/settings/access");
      const payload = data?.data || {};
      setSettings(payload.settings || {});
      setAccessMap(payload.access || EMPTY_ACCESS);
    } catch (error) {
      console.error("Workspace access fetch failed:", error);
      setSettings({});
      setAccessMap(EMPTY_ACCESS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshAccess();
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [refreshAccess]);

  const value = useMemo(
    () => ({
      loading,
      settings,
      accessMap,
      refreshAccess,
      getFeatureAccess: (featureKey) => accessMap?.[featureKey] || null,
      canAccessFeature: (featureKey) =>
        Boolean(accessMap?.[featureKey]?.allowed),
    }),
    [accessMap, loading, refreshAccess, settings],
  );

  return (
    <WorkspaceAccessContext.Provider value={value}>
      {children}
    </WorkspaceAccessContext.Provider>
  );
};

export const useWorkspaceAccess = () => {
  const context = useContext(WorkspaceAccessContext);
  if (!context) {
    throw new Error(
      "useWorkspaceAccess must be used within WorkspaceAccessProvider",
    );
  }
  return context;
};
