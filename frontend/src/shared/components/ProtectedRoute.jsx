import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

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
