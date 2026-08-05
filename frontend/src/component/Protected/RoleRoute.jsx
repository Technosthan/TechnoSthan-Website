import { Navigate, useLocation } from "react-router-dom";
import { getDashboardPath, getStoredUser, hasRole, isAuthenticated } from "../../utils/auth";

const RoleRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(user, roles)) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

export default RoleRoute;
