import { Outlet } from "react-router-dom";
import DashboardLayout from "../../../shared/layouts/DashboardLayout";
import { useAuth } from "../../../shared/hooks/useAuth";

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <DashboardLayout title="Innovation Hub Admin" onLogout={logout}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
