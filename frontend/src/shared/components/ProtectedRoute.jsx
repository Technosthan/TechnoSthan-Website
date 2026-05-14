import { Navigate, useLocation } from "react-router-dom";
import { useAccessControl } from "../../contexts/AccessControlContext";
import { normalizeRoutePattern } from "./RouteGuard";

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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const { publicAccessEnabled, publicWebsiteEnabled, publicRoutes } =
    useAccessControl();
  const pathname = decodeURIComponent(location.pathname);

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

  if (routeIsPublic) {
    return children;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const requiresVerification =
    storedUser &&
    (!storedUser.emailVerified || !storedUser.phoneVerified) &&
    location.pathname !== "/profile";

  if (requiresVerification) {
    return <Navigate to="/profile?verification=required" replace />;
  }

  return children;
};

export default ProtectedRoute;
