import { useEffect, useRef } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAccessControl } from "../../contexts/AccessControlContext";
import { normalizeRoutePattern } from "./routeUtils";

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

  const routeIsPublic =
    alwaysPublicRoutes.includes(pathname) ||
    (publicWebsiteEnabled === true &&
      publicAccessEnabled === true &&
      isRoutePublic(pathname, publicRoutes));

  // Log state for debugging
  useEffect(() => {
    if (!loading) {
      console.log("[RouteGuard]", {
        pathname,
        routeIsPublic,
        token: !!token,
        publicWebsiteEnabled,
        publicAccessEnabled,
        publicRoutes,
      });
    }
  }, [
    pathname,
    routeIsPublic,
    token,
    loading,
    publicWebsiteEnabled,
    publicAccessEnabled,
    publicRoutes,
  ]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium">Loading access control...</p>
        </div>
      </div>
    );
  }

 

  return <Outlet />;
};

export default RouteGuard;
