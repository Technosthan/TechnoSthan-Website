import AdminRoute from "./AdminRoute";

const ProtectedAdminRoute = ({ children }) => <AdminRoute>{children}</AdminRoute>;

export default ProtectedAdminRoute;
