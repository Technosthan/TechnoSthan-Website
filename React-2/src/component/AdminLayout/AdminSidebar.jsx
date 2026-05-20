import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  House,
  LogOut,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

const AdminSidebar = ({ onLogout }) => {
  const role = normalizeRole(getStoredUser()?.role);
  const { canAccessFeature } = useWorkspaceAccess();
  const basePath =
    role === "HR" ? "/hr" : role === "USER" ? "/dashboard" : "/admin";
  const items =
    role === "HR"
      ? [
          { label: "Overview", to: "/hr", icon: House },
          canAccessFeature("assignmentsEnabled") && {
            label: "Assignments",
            to: "/hr/assignments",
            icon: BriefcaseBusiness,
          },
        ].filter(Boolean)
      : role === "USER"
        ? [
            { label: "Overview", to: "/dashboard", icon: House },
            canAccessFeature("assignmentsEnabled") && {
              label: "Assignments",
              to: "/my-assignments",
              icon: BriefcaseBusiness,
            },
          ].filter(Boolean)
        : [
            { label: "Overview", to: "/admin", icon: House },
            canAccessFeature("assignmentsEnabled") && {
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
          ].filter(Boolean);

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/10 bg-slate-950/85 xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] uppercase tracking-[0.28em] text-indigo-200">
          <ChartNoAxesCombined size={16} />
          {role === "HR"
            ? "HR Panel"
            : role === "USER"
              ? "Personal Workspace"
              : "Admin panel"}
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-white">
          {role === "HR"
            ? "TechnoSthan HR panel"
            : role === "USER"
              ? "TechnoSthan Tasks"
              : "TechnoSthan Admin "}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Secure role-based operations with a focused workspace.
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === basePath}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-indigo-400/20 bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-white shadow-lg shadow-indigo-500/10"
                    : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="rounded-xl bg-white/[0.04] p-2 text-slate-300 transition group-hover:text-white">
                <IconComponent size={16} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
          onClick={onLogout}
        >
          <span className="rounded-xl bg-white/[0.04] p-2">
            <LogOut size={16} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
