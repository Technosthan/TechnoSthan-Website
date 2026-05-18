import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  House,
  LogOut,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getStoredUser, normalizeRole } from "../../utils/auth";

const AdminSidebar = ({ onLogout }) => {
  const role = normalizeRole(getStoredUser()?.role);
  const basePath =
    role === "HR" ? "/hr" : role === "USER" ? "/dashboard" : "/admin";
  const items =
    role === "HR"
      ? [
          { label: "Overview", to: "/hr", icon: House },
          {
            label: "Assignments",
            to: "/hr/assignments",
            icon: BriefcaseBusiness,
          },
        ]
      : role === "USER"
        ? [
            { label: "Overview", to: "/dashboard", icon: House },
            {
              label: "Assignments",
              to: "/my-assignments",
              icon: BriefcaseBusiness,
            },
          ]
        : [
            { label: "Overview", to: "/admin", icon: House },
            {
              label: "Assignments",
              to: "/admin/assignments",
              icon: BriefcaseBusiness,
            },
            {
              label: "Workspace Services",
              to: "/admin/workspace-services",
              icon: ChartNoAxesCombined,
            },
            { label: "Users", to: "/admin/users", icon: Users },
          ];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/85 xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-indigo-200">
          <ChartNoAxesCombined size={16} />
          {role === "HR"
            ? "HR Panel"
            : role === "USER"
              ? "Personal Workspace"
              : "Admin panel"}
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">
          {role === "HR"
            ? "TechnoSthan HR panel"
            : role === "USER"
              ? "TechnoSthan Tasks"
              : "TechnoSthan Admin "}
        </h2>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === basePath}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <IconComponent size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
