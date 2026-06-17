import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { clearAuth } from "../../utils/auth";
import api from "../../lib/api";

const AdminLayout = ({ title, subtitle, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Notify server for logout audit trail, then clear local auth
    (async () => {
      try {
        await api.post("/api/auth/logout");
      } catch (err) {
        // ignore
      } finally {
        clearAuth();
        navigate("/login", { replace: true });
      }
    })();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <div className="flex min-h-screen">
        {/* Mobile Hamburger Button */}
        <button
          className="fixed left-4 top-4 z-[110] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-white shadow-lg backdrop-blur transition hover:bg-slate-800 xl:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AdminSidebar
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 px-3 py-3 sm:px-4 lg:px-6 lg:py-5 xl:ml-64 xl:px-7 2xl:px-8">
          <AdminNavbar title={title} subtitle={subtitle} />
          <div className="mx-auto max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
