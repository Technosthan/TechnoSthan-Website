import {
  Activity,
  BriefcaseBusiness,
  CalendarCheck,
  ChartNoAxesCombined,
  Database,
  LayoutDashboard,
  Megaphone,
  PanelsTopLeft,
  Settings,
  Shield,
  Users,
  Bell,
  FileText,
} from "lucide-react";

export const ADMIN_SIDEBAR_OPEN_KEY =
  "technosthan-admin-sidebar-open-sections";

export const ADMIN_MENU_IDS = ["workspace", "content", "operations", "system"];

export const getMenuDashboardPath = (menuId) =>
  `/admin/menu-dashboards/${String(menuId || "").trim().toLowerCase()}`;

export const ADMIN_MENU_TREE = [
  {
    id: "workspace",
    label: "Workspace",
    icon: ChartNoAxesCombined,
    children: [
      {
        id: "workspace-dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: getMenuDashboardPath("workspace"),
        dashboardConfig: { menuId: "workspace" },
      },
      {
        id: "workspace-assignments",
        label: "Assignments",
        icon: BriefcaseBusiness,
        path: "/admin/assignments",
      },
      {
        id: "workspace-services",
        label: "Workspace Services",
        icon: ChartNoAxesCombined,
        path: "/admin/workspace-services",
      },
      {
        id: "workspace-business-verticals",
        label: "TechnoSthan Verticals",
        icon: BriefcaseBusiness,
        path: "/admin/business-verticals",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: PanelsTopLeft,
    children: [
      {
        id: "content-dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: getMenuDashboardPath("content"),
        dashboardConfig: { menuId: "content" },
      },
      {
        id: "content-campaigns",
        label: "Campaign Manager",
        icon: Megaphone,
        path: "/admin/campaigns",
      },
      {
        id: "content-forms",
        label: "Form Builder",
        icon: FileText,
        path: "/admin/forms",
      },
      {
        id: "content-page-content",
        label: "TechnoSthan Page Content",
        icon: PanelsTopLeft,
        path: "/admin/page-content",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Database,
    children: [
      {
        id: "operations-dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: getMenuDashboardPath("operations"),
        dashboardConfig: { menuId: "operations" },
      },
      {
        id: "operations-data-work-manager",
        label: "Data Work Manager",
        icon: Database,
        path: "/admin/data-work-manager",
      },
      {
        id: "operations-users",
        label: "Users",
        icon: Users,
        path: "/admin/users",
      },
      {
        id: "operations-activity-logs",
        label: "Activity Logs",
        icon: Activity,
        path: "/admin/activity-logs",
      },
      {
        id: "operations-daily-tasks",
        label: "Daily Tasks",
        icon: CalendarCheck,
        path: "/admin/daily-tasks",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    children: [
      {
        id: "system-dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: getMenuDashboardPath("system"),
        dashboardConfig: { menuId: "system" },
      },
      {
        id: "system-settings",
        label: "Settings",
        icon: Settings,
        path: "/admin/settings",
      },
      {
        id: "system-email-settings",
        label: "Email Settings",
        icon: Bell,
        path: "/admin/settings/email",
      },

    ],
  },
];

const matchesPath = (pathname, path, exact = false) => {
  if (!path) {
    return false;
  }

  const targetPath = typeof path === "string" ? path : path.pathname;
  return exact
    ? pathname === targetPath
    : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
};

export const findMenuNodeByPath = (pathname, nodes = ADMIN_MENU_TREE) => {
  for (const node of nodes) {
    if (matchesPath(pathname, node.path, node.exact)) {
      return node;
    }

    if (node.children?.length) {
      const match = findMenuNodeByPath(pathname, node.children);
      if (match) {
        return match;
      }
    }
  }

  return null;
};

export const collectAncestorIdsByPath = (pathname, nodes = ADMIN_MENU_TREE) => {
  for (const node of nodes) {
    if (matchesPath(pathname, node.path, node.exact)) {
      return [node.id];
    }

    if (node.children?.length) {
      const childPath = collectAncestorIdsByPath(pathname, node.children);
      if (childPath.length) {
        return [node.id, ...childPath];
      }
    }
  }

  return [];
};

export const findMenuById = (menuId, nodes = ADMIN_MENU_TREE) => {
  const normalizedMenuId = String(menuId || "").trim().toLowerCase();
  for (const node of nodes) {
    if (node.id === normalizedMenuId) {
      return node;
    }
    if (node.children?.length) {
      const match = findMenuById(normalizedMenuId, node.children);
      if (match) {
        return match;
      }
    }
  }
  return null;
};
