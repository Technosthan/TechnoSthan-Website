import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {

  const user = JSON.parse(localStorage.getItem("user"));

  //  Agar login hi nahi
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Agar admin nahi
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // Admin hai
  return children;
};

export default AdminRoute;