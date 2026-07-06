import { Outlet } from "react-router-dom";
import DashboardLayout from "../../../shared/layouts/DashboardLayout";
import { ROUTES } from "../../../shared/constants/routes";
import { useAuth } from "../../../shared/hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: ROUTES.ADMIN },
  { label: "Hero", path: ROUTES.ADMIN_HERO },
  { label: "Programs", path: ROUTES.ADMIN_PROGRAMS },
  { label: "Workshops", path: ROUTES.ADMIN_WORKSHOPS },
  { label: "Enquiries", path: ROUTES.ADMIN_ENQUIRIES },
  { label: "Students", path: ROUTES.ADMIN_STUDENTS },
  { label: "Payments", path: ROUTES.ADMIN_PAYMENTS },
  { label: "Testimonials", path: ROUTES.ADMIN_TESTIMONIALS },
  { label: "Settings", path: ROUTES.ADMIN_SETTINGS },
];

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <DashboardLayout title="Innovation Hub Admin" navItems={navItems} onLogout={logout}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
