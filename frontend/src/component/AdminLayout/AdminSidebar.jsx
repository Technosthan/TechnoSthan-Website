import {
  BriefcaseBusiness,
  CalendarCheck,
  ChartNoAxesCombined,
  ChevronDown,
  House,
  LogOut,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import {
  ADMIN_MENU_TREE,
  ADMIN_SIDEBAR_OPEN_KEY,
  collectAncestorIdsByPath,
} from "./adminMenuTree";

const ROLE_MENU_ITEMS = {
  HR: [
    { id: "hr-overview", label: "Overview", to: "/hr", icon: House },
    {
      id: "hr-assignments",
      label: "Assignments",
      to: "/hr/assignments",
      icon: BriefcaseBusiness,
    },
    {
      id: "hr-daily-tasks",
      label: "Daily Tasks",
      to: "/hr/daily-tasks",
      icon: CalendarCheck,
    },
  ],
  USER: [
    { id: "user-overview", label: "Overview", to: "/dashboard", icon: House },
    {
      id: "user-assignments",
      label: "Assignments",
      to: "/my-assignments",
      icon: BriefcaseBusiness,
    },
    {
      id: "user-daily-tasks",
      label: "Daily Tasks",
      to: "/daily-tasks",
      icon: CalendarCheck,
    },
  ],
};

// const depthPadding = (depth) => {
//   if (depth <= 0) return 12;
//   if (depth === 1) return 32;
//   if (depth === 2) return 52;
//   if (depth === 3) return 72;
//   return 72 + (depth - 3) * 20;
// };

const readStoredOpenSections = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return {};
    }

    const rawValue = window.localStorage.getItem(ADMIN_SIDEBAR_OPEN_KEY);
    const parsedValue = JSON.parse(rawValue);

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    return parsedValue;
  } catch {
    return {};
  }
};

const AdminSidebarItem = ({
  depth: _depth,
  icon: Icon,
  label,
  isActive = false,
  isExpanded = false,
  hasChildren = false,
  onClick,
  href,
}) => {
  const baseClasses =
    "admin-sidebar-item group grid h-12 w-full min-w-0 items-center rounded-[14px] border border-transparent text-left text-sm font-medium transition-none";

  const stateClasses = isActive
    ? "border-indigo-400/20 bg-indigo-500/15 text-white"
    : hasChildren && isExpanded
      ? "bg-white/[0.05] text-white"
      : "bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white";

  /*
   * Parent, submenu aur nested submenu sabke liye:
   *
   * 12px left padding
   * 32px fixed icon column
   * 12px icon aur text gap
   * 20px fixed arrow column
   *
   * Isse har icon aur text ek hi vertical line mein rahega.
   */
  const sharedStyle = {
    paddingLeft: "12px",
    paddingRight: "12px",
    gridTemplateColumns: "32px minmax(0, 1fr) 20px",
    columnGap: "12px",
  };

  const content = (
    <>
      <span className="admin-sidebar-icon flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-300">
        <Icon size={16} strokeWidth={1.8} />
      </span>

      <span className="admin-sidebar-label block min-w-0 truncate">
        {label}
      </span>

      <span
        className="admin-sidebar-arrow flex h-5 w-5 min-w-5 shrink-0 items-center justify-center text-slate-400"
        aria-hidden="true"
      >
        {hasChildren ? (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-white" : ""
            }`}
          />
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <NavLink
        to={href}
        end
        onClick={onClick}
        className={({ isActive: linkActive }) =>
          `${baseClasses} ${
            linkActive || isActive
              ? "border-indigo-400/20 bg-indigo-500/15 text-white"
              : stateClasses
          }`
        }
        style={sharedStyle}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={hasChildren ? isExpanded : undefined}
      className={`${baseClasses} ${stateClasses}`}
      style={sharedStyle}
    >
      {content}
    </button>
  );
};

const AdminSidebar = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const role = normalizeRole(getStoredUser()?.role);
  const sidebarNavRef = useRef(null);
  const [openSections, setOpenSections] = useState(readStoredOpenSections);

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

  const activeAncestors = useMemo(
    () => collectAncestorIdsByPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (role !== "ADMIN" || activeAncestors.length === 0) {
      return;
    }

    setOpenSections((previous) => {
      const next = { ...previous };
      let changed = false;

      activeAncestors.forEach((sectionId) => {
        if (!next[sectionId]) {
          next[sectionId] = true;
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [activeAncestors, role]);

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      window.localStorage.setItem(
        ADMIN_SIDEBAR_OPEN_KEY,
        JSON.stringify(openSections),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [openSections]);

  const toggleSection = (sectionId) => {
    setOpenSections((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  };

  const renderNode = (node, depth = 0) => {
  const Icon = node.icon || House;
  const hasChildren =
    Array.isArray(node.children) && node.children.length > 0;

  const isExpanded = Boolean(openSections[node.id]);

  const isActive =
    location.pathname === node.path ||
    (node.path &&
      node.path !== "/admin" &&
      location.pathname.startsWith(`${node.path}/`));

  if (hasChildren) {
    return (
      <div key={node.id} className="w-full space-y-1.5">
        <AdminSidebarItem
          depth={depth}
          icon={Icon}
          label={node.label}
          isActive={isActive}
          isExpanded={isExpanded}
          hasChildren
          onClick={() => toggleSection(node.id)}
        />

        {isExpanded ? (
          <div className="w-full space-y-1.5">
            {node.children.map((child) =>
              renderNode(child, depth + 1),
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <AdminSidebarItem
      key={node.id}
      depth={depth}
      icon={Icon}
      label={node.label}
      isActive={isActive}
      href={node.path}
      onClick={onClose}
    />
  );
};

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
        {role === "ADMIN" ? (
          <>
            <AdminSidebarItem
              depth={0}
              icon={House}
              label="Overview"
              href="/admin"
              onClick={onClose}
            />

            <div className="space-y-1.5">
              {ADMIN_MENU_TREE.map((menu) => renderNode(menu, 0))}
            </div>
          </>
        ) : (
          (ROLE_MENU_ITEMS[role] || []).map((item) => (
            <AdminSidebarItem
              key={item.id}
              depth={0}
              icon={item.icon}
              label={item.label}
              href={item.to}
              onClick={onClose}
            />
          ))
        )}
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
