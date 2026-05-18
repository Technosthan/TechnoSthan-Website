import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export default ProtectedRoute;
