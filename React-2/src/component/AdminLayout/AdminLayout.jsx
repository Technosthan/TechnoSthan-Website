import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { clearAuth } from "../../utils/auth";

const AdminLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <div className="flex min-h-screen">
        <AdminSidebar onLogout={handleLogout} />
        <main className="flex-1 px-4 py-4 lg:px-6 lg:py-5 xl:ml-64 xl:px-8">
          <AdminNavbar title={title} subtitle={subtitle} />
          <div className="mx-auto max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
