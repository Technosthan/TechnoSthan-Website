import { useEffect, useState, useCallback, useRef } from "react";
import api from "../lib/api";

/**
 * usePermissions Hook
 * Fetches and caches user permissions from the backend
 * Provides hasPermission() check and permission source info
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef(null);
  const fetchTimeRef = useRef(null);

  // Fetch all user permissions
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/api/permissions/user-permissions");

      if (data.success) {
        setPermissions(data.data || {});
        cacheRef.current = data.data;
        fetchTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError(err.message);
      // Use cached data if available
      if (cacheRef.current) {
        setPermissions(cacheRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user has permission
   * Returns boolean for easy conditional rendering
   */
  const hasPermission = useCallback(
    (permissionKey) => {
      const normalizedKey = permissionKey.toLowerCase().trim();
      const permData = permissions[normalizedKey];
      return permData?.allowed ?? false;
    },
    [permissions],
  );

  /**
   * Get detailed permission info
   * Includes source (role, override, blocked reason, etc.)
   */
  const getPermissionDetails = useCallback(
    (permissionKey) => {
      const normalizedKey = permissionKey.toLowerCase().trim();
      return permissions[normalizedKey] || null;
    },
    [permissions],
  );

  /**
   * Get permission source for display
   * Useful for showing why a permission is allowed/blocked
   */
  const getPermissionSource = useCallback(
    (permissionKey) => {
      const details = getPermissionDetails(permissionKey);
      if (!details) return "not_configured";
      return details.source;
    },
    [getPermissionDetails],
  );

  /**
   * Refresh permissions (e.g., after admin changes)
   */
  const refreshPermissions = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    getPermissionDetails,
    getPermissionSource,
    refreshPermissions,
  };
};

/**
 * Hook to check a specific permission
 * Simpler API when you only need to check one permission
 */
export const usePermission = (permissionKey) => {
  const { hasPermission, getPermissionDetails, loading } = usePermissions();
  const allowed = hasPermission(permissionKey);
  const details = getPermissionDetails(permissionKey);

  return {
    allowed,
    details,
    loading,
  };
};

/**
 * Component wrapper for permission checks
 * Renders children only if user has permission
 */
export const PermissionGate = ({ permission, fallback = null, children }) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
};

export default usePermissions;
