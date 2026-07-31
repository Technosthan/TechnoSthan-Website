import React, { useState } from "react";
import { ShieldCheck, Zap, Users, Settings } from "lucide-react";
import AdminLayout from "./AdminLayout";
import GlobalServicesComponent from "./GlobalServicesComponent";
import RolePermissionsComponent from "./RolePermissionsComponent";
import UserOverridesComponent from "./UserOverridesComponent";
import "./WorkspaceServices.css";

/**
 * WORKSPACE SERVICES PAGE - REDESIGNED
 * Complete enterprise-grade permission management UI
 *
 * Three main sections:
 * 1. Global Services - Master workspace switches
 * 2. Role Permissions - HR & USER role permissions
 * 3. User Overrides - Individual user exceptions
 */

const WorkspaceServices = () => {
  const [activeTab, setActiveTab] = useState("global");

  const tabs = [
    {
      id: "global",
      label: "Global Services",
      icon: Zap,
      description: "Master workspace-wide feature toggles",
    },
    {
      id: "roles",
      label: "Role Permissions",
      icon: ShieldCheck,
      description: "Configure permissions for HR and User roles",
    },
    {
      id: "overrides",
      label: "User Overrides",
      icon: Users,
      description: "Set exceptions for individual users",
    },
  ];

  return (
    <AdminLayout
      // title="Workspace Permissions"
      // subtitle="Manage service availability, role permissions, and user-specific overrides in one place."
    >
      <div className="space-y-6 pb-24 lg:pb-0">
        {/* Permission System Overview */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-6">
          <div className="flex items-start gap-4">
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20">
              <Settings size={24} className="text-indigo-400" />
            </div> */}
            {/* <div>
              <h3 className="text-sm font-semibold text-white">
                Permission Resolution Order
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Permissions are checked in order: Global Service → User Override
                → Role Permission
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-700/40 px-2 py-1">
                  Global OFF = Always Blocked
                </span>
                <span className="rounded-full bg-slate-700/40 px-2 py-1">
                  User Override = Highest Priority
                </span>
                <span className="rounded-full bg-slate-700/40 px-2 py-1">
                  Role Default = Fallback
                </span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-500/50"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          {/* Global Services Tab */}
          {activeTab === "global" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Global Services
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Master switches for workspace-wide service availability. If
                  disabled here, the service is blocked for everyone regardless
                  of role or overrides.
                </p>
              </div>
              <GlobalServicesComponent />
            </div>
          )}

          {/* Role Permissions Tab */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Role Permissions
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Define what HR users and regular users can do. These are the
                  default permissions that apply to all users in each role.
                </p>
              </div>
              <RolePermissionsComponent />
            </div>
          )}

          {/* User Overrides Tab */}
          {activeTab === "overrides" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  User Overrides
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Set specific permissions for individual users, overriding
                  their role defaults. Useful for exceptions, temporary
                  restrictions, or special privileges.
                </p>
              </div>
              <UserOverridesComponent />
            </div>
          )}
        </div>

        {/* Quick Reference Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">
            💡 Permission Reference
          </h3>
          <div className="grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1">
              <p className="font-medium text-cyan-200">HR Users Can:</p>
              <ul className="space-y-1 text-slate-400">
                <li>✓ Create assignments</li>
                <li>✓ Submit work</li>
                <li>✓ Review submissions</li>
                <li>✓ Upload files</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-cyan-200">Regular Users Can:</p>
              <ul className="space-y-1 text-slate-400">
                <li>✓ Submit work</li>
                <li>✓ Upload files</li>
                <li>✓ View assignments</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-cyan-200">Admin Users Can:</p>
              <ul className="space-y-1 text-slate-400">
                <li>✓ Everything</li>
                <li>✓ Manage permissions</li>
                <li>✓ Manage workspace</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-cyan-200">How Overrides Work:</p>
              <ul className="space-y-1 text-slate-400">
                <li>✓ Block specific user</li>
                <li>✓ Grant extra permission</li>
                <li>✓ Temporary restrictions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WorkspaceServices;
