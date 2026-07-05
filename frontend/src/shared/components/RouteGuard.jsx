import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
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

  const alwaysPublicRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-phone",
    "/login/telegram",
    "/login/whatsapp",
    "/forms/:slug",
    "/f/:slug",
  ];

  const routeIsPublic =
    alwaysPublicRoutes.includes(pathname) ||
    (publicWebsiteEnabled === true &&
      publicAccessEnabled === true &&
      isRoutePublic(pathname, publicRoutes));

  // Log state for debugging
  useEffect(() => {
    if (!loading && import.meta.env.DEV) {
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
        <div className="w-full max-w-5xl space-y-6">
          <div className="h-16 rounded-2xl bg-white/10 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 rounded-3xl bg-white/10 animate-pulse" />
            <div className="h-64 rounded-3xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

 

  return <Outlet />;
};

export default RouteGuard;
