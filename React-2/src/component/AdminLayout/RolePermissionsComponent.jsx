import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Lock, Unlock } from "lucide-react";
import api from "../../lib/api";

/**
 * ROLE PERMISSIONS COMPONENT
 * Manage permissions for HR and USER roles
 * Shows what actions each role can perform
 */
const RolePermissionsComponent = ({ onUpdate }) => {
  const [permissions, setPermissions] = useState({});
  const [activeRole, setActiveRole] = useState("HR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    { id: "HR", label: "HR Users", icon: "👔" },
    { id: "USER", label: "Regular Users", icon: "👤" },
  ];

  // Fetch role permissions
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/permissions/role-permissions");

      if (data.success) {
        // Organize by role
        const byRole = {};
        data.data.forEach((perm) => {
          if (!byRole[perm.role]) {
            byRole[perm.role] = [];
          }
          byRole[perm.role].push(perm);
        });
        setPermissions(byRole);
      }
    } catch (err) {
      console.error("Failed to fetch role permissions:", err);
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  // Update permission
  const updatePermission = async (role, permissionKey, enabled) => {
    try {
      setSaving(true);
      const { data } = await api.put("/api/permissions/role-permissions", {
        role,
        permissionKey,
        enabled,
      });

      if (data.success) {
        // Update local state
        setPermissions((prev) => ({
          ...prev,
          [role]: prev[role].map((p) =>
            p.permissionKey === permissionKey ? { ...p, enabled } : p,
          ),
        }));

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      console.error("Failed to update permission:", err);
      setError("Failed to update permission");
    } finally {
      setSaving(false);
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      assignments: "from-blue-500/10 to-blue-600/5",
      submissions: "from-cyan-500/10 to-cyan-600/5",
      reviews: "from-purple-500/10 to-purple-600/5",
      social: "from-pink-500/10 to-pink-600/5",
      workspace: "from-amber-500/10 to-amber-600/5",
    };
    return colors[category] || "from-slate-500/10 to-slate-600/5";
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      assignments: "bg-blue-500/20 text-blue-200 ring-blue-500/30",
      submissions: "bg-cyan-500/20 text-cyan-200 ring-cyan-500/30",
      reviews: "bg-purple-500/20 text-purple-200 ring-purple-500/30",
      social: "bg-pink-500/20 text-pink-200 ring-pink-500/30",
      workspace: "bg-amber-500/20 text-amber-200 ring-amber-500/30",
    };
    return (
      colors[category] || "bg-slate-500/20 text-slate-200 ring-slate-500/30"
    );
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const currentRolePerms = permissions[activeRole] || [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-white/10 bg-slate-900/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Role Tabs */}
      <div className="flex gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeRole === role.id
                ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-500/50"
                : "bg-slate-900/40 text-slate-300 hover:bg-slate-900/60"
            }`}
          >
            <span className="mr-2">{role.icon}</span>
            {role.label}
          </button>
        ))}
      </div>

      {/* Permissions Grid */}
      <div className="space-y-3">
        {currentRolePerms.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
            <Lock size={32} className="mx-auto text-slate-600" />
            <p className="mt-2 text-sm text-slate-400">
              No permissions configured for this role
            </p>
          </div>
        ) : (
          currentRolePerms.map((perm) => (
            <div
              key={perm._id || perm.permissionKey}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${getCategoryColor(perm.category)} p-4 transition hover:border-white/20`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {perm.name}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${getCategoryBadgeColor(perm.category)}`}
                    >
                      {perm.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {perm.description}
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() =>
                    updatePermission(
                      activeRole,
                      perm.permissionKey,
                      !perm.enabled,
                    )
                  }
                  disabled={saving}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition ${
                    perm.enabled
                      ? "bg-emerald-500/30 ring-1 ring-emerald-500/50"
                      : "bg-slate-700/40 ring-1 ring-slate-600/50"
                  }`}
                >
                  <div
                    className={`absolute h-6 w-6 rounded-full bg-white/90 transition ${
                      perm.enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Status */}
              <div className="mt-3 flex items-center gap-2">
                {perm.enabled ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">
                      Enabled for {activeRole}
                    </span>
                  </>
                ) : (
                  <>
                    <Circle size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">
                      Disabled for {activeRole}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RolePermissionsComponent;
