import { useEffect, useRef } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAccessControl } from "../../contexts/AccessControlContext";

export const normalizeRoutePattern = (pattern) => {
  if (!pattern || typeof pattern !== "string") {
    return null;
  }

  const trimmed = pattern.trim();
  if (trimmed.endsWith("*")) {
    return new RegExp(`^${trimmed.replace(/\*+$/, ".*")}$`);
  }

  if (trimmed.includes(":")) {
    const regex = trimmed
      .split("/")
      .map((segment) =>
        segment.startsWith(":")
          ? "[^/]+"
          : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      )
      .join("/");
    return new RegExp(`^${regex}$`);
  }

  return trimmed;
};

const isRoutePublic = (pathname, publicRoutes) => {
  if (!Array.isArray(publicRoutes)) {
    return false;
  }

  return publicRoutes.some((route) => {
    const normalized = normalizeRoutePattern(route);
    if (normalized instanceof RegExp) {
      return normalized.test(pathname);
    }

    return normalized === pathname;
  });
};

const RouteGuard = () => {
  const location = useLocation();
  const { publicAccessEnabled, publicWebsiteEnabled, publicRoutes, loading } =
    useAccessControl();
  const token = localStorage.getItem("token");
  const pathname = decodeURIComponent(location.pathname);
  const hasToasted = useRef(false);

  const alwaysPublicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-phone",
    "/login/telegram",
    "/login/whatsapp",
  ];

  const publicEnabled =
    typeof publicWebsiteEnabled === "boolean" ||
    typeof publicAccessEnabled === "boolean"
      ? Boolean(publicWebsiteEnabled || publicAccessEnabled)
      : true;

  const routeIsPublic =
    alwaysPublicRoutes.includes(pathname) ||
    publicEnabled ||
    isRoutePublic(pathname, publicRoutes);

  // Log state for debugging
  useEffect(() => {
    if (!loading) {
      console.log("[RouteGuard]", {
        pathname,
        publicEnabled,
        routeIsPublic,
        token: !!token,
        publicWebsiteEnabled,
        publicAccessEnabled,
      });
    }
  }, [
    pathname,
    publicEnabled,
    token,
    loading,
    publicWebsiteEnabled,
    publicAccessEnabled,
  ]);

  useEffect(() => {
    if (!routeIsPublic && !token) {
      if (!hasToasted.current) {
        toast.error("Please login to continue.", { id: "login-required" });
        hasToasted.current = true;
      }
    } else {
      hasToasted.current = false;
    }
  }, [routeIsPublic, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium">Loading access control...</p>
        </div>
      </div>
    );
  }

  if (!routeIsPublic && !token) {
    console.log("[RouteGuard] Redirecting to login:", { pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
