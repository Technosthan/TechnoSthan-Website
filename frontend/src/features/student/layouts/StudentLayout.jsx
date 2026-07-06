import { Outlet } from "react-router-dom";
import DashboardLayout from "../../../shared/layouts/DashboardLayout";
import { ROUTES } from "../../../shared/constants/routes";
import { useAuth } from "../../../shared/hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: ROUTES.DASHBOARD },
  { label: "My Programs", path: ROUTES.DASHBOARD_PROGRAMS },
  { label: "Payments", path: ROUTES.DASHBOARD_PAYMENTS },
  { label: "Profile", path: ROUTES.DASHBOARD_PROFILE },
  { label: "Certificates", path: ROUTES.DASHBOARD_CERTIFICATES },
];

const StudentLayout = () => {
  const { logout } = useAuth();

  return (
    <DashboardLayout title="Student Dashboard" navItems={navItems} onLogout={logout}>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentLayout;
