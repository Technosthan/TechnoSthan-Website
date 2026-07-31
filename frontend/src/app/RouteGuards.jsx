import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../shared/hooks/useAuth";
import {
  ADMIN_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
} from "../shared/constants";
import { getLandingRouteForUser } from "../shared/utils";

const isProtectedUserPath = (path) =>
  [DASHBOARD_ROUTE, PROFILE_ROUTE].includes(path) ||
  path.startsWith(`${ADMIN_ROUTE}/`);

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <Navigate
        to={getLandingRouteForUser(user)}
        replace
      />
    );
  }

  return children;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!isAdmin) {
    const nextRoute =
      isProtectedUserPath(location.pathname)
        ? DASHBOARD_ROUTE
        : getLandingRouteForUser(user);

    return <Navigate to={nextRoute} replace />;
  }

  return children;
};
