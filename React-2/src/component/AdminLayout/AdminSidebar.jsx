import {
  BriefcaseBusiness,
  CalendarCheck,
  ChartNoAxesCombined,
  Database,
  House,
  LogOut,
  Megaphone,
  PanelsTopLeft,
  Settings,
  Shapes,
  X,
  Users,
} from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

const AdminSidebar = ({ onLogout, isOpen, onClose }) => {

    const sidebarNavRef = useRef(null);

  useLayoutEffect(() => {
    const savedScrollPosition = Number(
      sessionStorage.getItem("adminSidebarScrollPosition") || 0,
    );

    if (sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = savedScrollPosition;
    }
  }, []);

  const saveSidebarScrollPosition = () => {
    if (sidebarNavRef.current) {
      sessionStorage.setItem(
        "adminSidebarScrollPosition",
        String(sidebarNavRef.current.scrollTop),
      );
    }
  };

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
          {
            label: "Daily Tasks",
            to: "/hr/daily-tasks",
            icon: CalendarCheck,
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
            {
              label: "Daily Tasks",
              to: "/daily-tasks",
              icon: CalendarCheck,
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
            {
              label: "Business Verticals",
              to: "/admin/business-verticals",
              icon: BriefcaseBusiness,
            },
            {
              label: "Campaign Manager",
              to: "/admin/campaigns",
              icon: Megaphone,
            },
            {
              label: "Form Builder",
              to: "/admin/forms",
              icon: Shapes,
            },
            {
              label: "Data Work Manager",
              to: "/admin/data-work-manager",
              icon: Database,
            },
            {
              label: "Page Content Manager",
              to: "/admin/page-content",
              icon: PanelsTopLeft,
            },
            { label: "Users", to: "/admin/users", icon: Users },
            {
              label: "Activity Logs",
              to: "/admin/activity-logs",
              icon: Megaphone,
            },
            canAccessFeature("assignmentsEnabled") && {
              label: "Daily Tasks",
              to: "/admin/daily-tasks",
              icon: CalendarCheck,
            },
            {
              label: "Settings",
              to: "/admin/settings",
              icon: Settings,
            },
          ].filter(Boolean);

  return (
    <aside
      className={`admin-sidebar-scrollbar fixed inset-y-0 left-0 z-[100] flex h-screen min-h-screen w-64 transform flex-col overflow-hidden border-r border-white/10 bg-slate-950 transition-transform duration-300 ease-in-out xl:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <div className="flex flex-col">
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
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white xl:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav
  ref={sidebarNavRef}
  onScroll={saveSidebarScrollPosition}
  className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-4 pb-8"
>
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === basePath}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium ${
                  isActive
                    ? "border-indigo-400/20 bg-indigo-500/15 text-white"
                    : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-300 group-hover:text-white">
                <IconComponent size={16} />
              </span>

              <span className="min-w-0 truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
          onClick={() => {
            onClose();
            onLogout();
          }}
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
