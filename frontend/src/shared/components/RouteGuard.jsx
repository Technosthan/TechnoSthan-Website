import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAccessControl } from "../../contexts/AccessControlContext";

const normalizeRoutePattern = (pattern) => {
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
  const { publicAccessEnabled, publicRoutes, loading } = useAccessControl();
  const token = localStorage.getItem("token");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium">Loading access control...</p>
        </div>
      </div>
    );
  }

  const alwaysPublicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-phone",
    "/login/telegram",
    "/login/whatsapp",
  ];

  const routeIsPublic =
    alwaysPublicRoutes.includes(location.pathname) ||
    publicAccessEnabled ||
    isRoutePublic(location.pathname, publicRoutes);

  if (!routeIsPublic && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
