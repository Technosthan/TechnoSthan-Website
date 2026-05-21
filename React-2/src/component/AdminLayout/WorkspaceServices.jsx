import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import {
  FEATURE_FAMILIES,
  FEATURE_GROUP_CONFIG,
  FEATURE_METADATA,
  getOverrideEligibleFeaturesForRole,
  getScopeOptionsForFamily,
  normalizeFeatureState,
  normalizeUserOverrides,
} from "../../lib/workspaceSettings";
import AdminLayout from "./AdminLayout";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import { Toggle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "./WorkspaceServices.css";

const roleLabelMap = {
  HR: "HR",
  USER: "User",
  ADMIN: "Admin",
};

const normalizeSettingsPayload = (raw = {}) => {
  const normalized = {
    userOverrides: normalizeUserOverrides(raw.userOverrides),
  };

  Object.values(FEATURE_METADATA).forEach((feature) => {
    normalized[feature.key] = normalizeFeatureState(
      feature.key,
      raw?.[feature.key],
      feature.defaultEnabled,
    );
  });

  return normalized;
};

const WorkspaceServices = () => {
  const navigate = useNavigate();
  const { refreshAccess } = useWorkspaceAccess();
  const [settings, setSettings] = useState(null);
  const [editState, setEditState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [userDirectory, setUserDirectory] = useState({});
  const [searchTextByKey, setSearchTextByKey] = useState({});
  const [searchResultsByKey, setSearchResultsByKey] = useState({});
  const [overrideRole, setOverrideRole] = useState("HR");
  const [overrideUserId, setOverrideUserId] = useState("");
  const [overrideUserQuery, setOverrideUserQuery] = useState("");
  const [overrideUserResults, setOverrideUserResults] = useState([]);
  const deferredSearchTextByKey = useDeferredValue(searchTextByKey);
  const deferredOverrideUserQuery = useDeferredValue(overrideUserQuery);

  const fetchUsersByIds = async (ids = []) => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return;
    }

    try {
      const { data } = await api.get("/api/admin/users", {
        params: { ids: uniqueIds.join(",") },
      });
      const rows = data?.data || [];
      setUserDirectory((current) => {
        const next = { ...current };
        rows.forEach((user) => {
          next[user.id] = user;
        });
        return next;
      });
    } catch (error) {
      console.error("User hydration failed:", error);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get("/api/admin/workspace-services");
      const normalized = normalizeSettingsPayload(data?.data || {});
      setSettings(normalized);
      setEditState(normalized);

      const featureUserIds = Object.values(FEATURE_METADATA).flatMap(
        (feature) => normalized[feature.key]?.allowedUsers || [],
      );
      const overrideUserIds = (normalized.userOverrides || []).map(
        (entry) => entry.userId,
      );
      await fetchUsersByIds([...featureUserIds, ...overrideUserIds]);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Unable to load workspace settings",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const timers = Object.entries(deferredSearchTextByKey).map(
      ([featureKey, query]) => {
        const trimmed = String(query || "").trim();
        if (trimmed.length < 2) {
          setSearchResultsByKey((current) => ({
            ...current,
            [featureKey]: [],
          }));
          return null;
        }

        const feature = FEATURE_METADATA[featureKey];
        const role =
          feature.family === FEATURE_FAMILIES.HR
            ? "HR"
            : feature.family === FEATURE_FAMILIES.USER
              ? "USER"
              : feature.family === FEATURE_FAMILIES.ADMIN
                ? "ADMIN"
                : undefined;

        return setTimeout(async () => {
          try {
            const { data } = await api.get("/api/admin/users", {
              params: {
                q: trimmed,
                ...(role ? { role } : {}),
              },
            });
            const rows = data?.data || [];
            setSearchResultsByKey((current) => ({
              ...current,
              [featureKey]: rows,
            }));
            setUserDirectory((current) => {
              const next = { ...current };
              rows.forEach((user) => {
                next[user.id] = user;
              });
              return next;
            });
          } catch (error) {
            console.error("User search failed:", error);
          }
        }, 220);
      },
    );

    return () => timers.filter(Boolean).forEach((timer) => clearTimeout(timer));
  }, [deferredSearchTextByKey]);

  useEffect(() => {
    const trimmed = String(deferredOverrideUserQuery || "").trim();
    if (trimmed.length < 2) {
      setOverrideUserResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/admin/users", {
          params: { q: trimmed, role: overrideRole },
        });
        const rows = data?.data || [];
        setOverrideUserResults(rows);
        setUserDirectory((current) => {
          const next = { ...current };
          rows.forEach((user) => {
            next[user.id] = user;
          });
          return next;
        });
      } catch (error) {
        console.error("Override user search failed:", error);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [deferredOverrideUserQuery, overrideRole]);

  const isDirty = useMemo(() => {
    if (!settings || !editState) {
      return false;
    }

    const featureChanged = Object.values(FEATURE_METADATA).some((feature) => {
      const base = normalizeFeatureState(
        feature.key,
        settings[feature.key],
        feature.defaultEnabled,
      );
      const current = normalizeFeatureState(
        feature.key,
        editState[feature.key],
        feature.defaultEnabled,
      );
      return JSON.stringify(base) !== JSON.stringify(current);
    });

    const overridesChanged =
      JSON.stringify(normalizeUserOverrides(settings.userOverrides)) !==
      JSON.stringify(normalizeUserOverrides(editState.userOverrides));

    return featureChanged || overridesChanged;
  }, [editState, settings]);

  const setFeatureValue = (featureKey, nextValue) => {
    const feature = FEATURE_METADATA[featureKey];
    setEditState((current) => ({
      ...current,
      [featureKey]: {
        ...normalizeFeatureState(
          featureKey,
          current?.[featureKey],
          feature.defaultEnabled,
        ),
        ...nextValue,
      },
    }));
  };

  const handleAccessScopeChange = (featureKey, accessScope) => {
    const nextUsers = accessScope.startsWith("specific_")
      ? editState?.[featureKey]?.allowedUsers || []
      : [];

    setFeatureValue(featureKey, {
      accessScope,
      allowedRoles: [],
      allowedUsers: nextUsers,
    });
  };

  const handleUserSelect = (featureKey, user) => {
    const feature = FEATURE_METADATA[featureKey];
    const currentFeature = normalizeFeatureState(
      featureKey,
      editState?.[featureKey],
      feature.defaultEnabled,
    );

    if (currentFeature.allowedUsers.includes(user.id)) {
      return;
    }

    setUserDirectory((current) => ({ ...current, [user.id]: user }));
    setFeatureValue(featureKey, {
      allowedUsers: [...currentFeature.allowedUsers, user.id],
    });
    setSearchTextByKey((current) => ({ ...current, [featureKey]: "" }));
    setSearchResultsByKey((current) => ({ ...current, [featureKey]: [] }));
  };

  const handleUserRemove = (featureKey, userId) => {
    const currentFeature = normalizeFeatureState(
      featureKey,
      editState?.[featureKey],
      feature.defaultEnabled,
    );
    setFeatureValue(featureKey, {
      allowedUsers: currentFeature.allowedUsers.filter((id) => id !== userId),
    });
  };

  const selectedOverride = useMemo(() => {
    if (!editState || !overrideUserId) {
      return null;
    }
    return (
      normalizeUserOverrides(editState.userOverrides).find(
        (entry) => entry.userId === overrideUserId,
      ) || null
    );
  }, [editState, overrideUserId]);

  const overrideEligibleFeatures = useMemo(
    () => getOverrideEligibleFeaturesForRole(overrideRole),
    [overrideRole],
  );

  const upsertOverridePermission = (featureKey, value) => {
    if (!overrideUserId) {
      return;
    }

    setEditState((current) => {
      const currentOverrides = normalizeUserOverrides(current?.userOverrides);
      const existingIndex = currentOverrides.findIndex(
        (entry) => entry.userId === overrideUserId,
      );

      if (existingIndex === -1) {
        return {
          ...current,
          userOverrides: [
            ...currentOverrides,
            {
              userId: overrideUserId,
              role: overrideRole,
              permissions: { [featureKey]: value },
            },
          ],
        };
      }

      const nextOverrides = [...currentOverrides];
      nextOverrides[existingIndex] = {
        ...nextOverrides[existingIndex],
        role: overrideRole,
        permissions: {
          ...nextOverrides[existingIndex].permissions,
          [featureKey]: value,
        },
      };

      return {
        ...current,
        userOverrides: nextOverrides,
      };
    });
  };

  const removeOverrideUser = (userId) => {
    setEditState((current) => ({
      ...current,
      userOverrides: normalizeUserOverrides(current?.userOverrides).filter(
        (entry) => entry.userId !== userId,
      ),
    }));

    if (overrideUserId === userId) {
      setOverrideUserId("");
      setOverrideUserQuery("");
      setOverrideUserResults([]);
    }
  };

  const handleSave = async () => {
    if (!editState || !settings) {
      return;
    }

    const updates = {};
    Object.values(FEATURE_METADATA).forEach((feature) => {
      const base = normalizeFeatureState(
        feature.key,
        settings[feature.key],
        feature.defaultEnabled,
      );
      const current = normalizeFeatureState(
        feature.key,
        editState[feature.key],
        feature.defaultEnabled,
      );
      if (JSON.stringify(base) !== JSON.stringify(current)) {
        updates[feature.key] = current;
      }
    });

    const baseOverrides = normalizeUserOverrides(settings.userOverrides);
    const currentOverrides = normalizeUserOverrides(editState.userOverrides);
    if (JSON.stringify(baseOverrides) !== JSON.stringify(currentOverrides)) {
      updates.userOverrides = currentOverrides;
    }

    if (Object.keys(updates).length === 0) {
      setMessage({ type: "info", text: "No changes to save" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.patch("/api/admin/workspace-services", updates);
      await Promise.all([fetchSettings(), refreshAccess()]);
      setMessage({
        type: "success",
        text: "Workspace permissions updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Unable to save workspace settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    const confirmed = window.confirm(
      "Restore workspace defaults? This will overwrite current feature permissions and user overrides.",
    );
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.post("/api/admin/workspace-services/restore-defaults");
      await Promise.all([fetchSettings(), refreshAccess()]);
      setOverrideUserId("");
      setOverrideUserQuery("");
      setOverrideUserResults([]);
      setMessage({ type: "success", text: "Workspace defaults restored" });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to restore workspace defaults",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleHasOverrides = (featureKey, role) =>
    normalizeUserOverrides(editState?.userOverrides).some(
      (entry) =>
        entry.role === role &&
        typeof entry.permissions?.[featureKey] === "boolean",
    );

  const roleHasSpecificTargets = (featureKey, role) => {
    const featureMeta = FEATURE_METADATA[featureKey];
    const feature = normalizeFeatureState(
      featureKey,
      editState?.[featureKey],
      featureMeta.defaultEnabled,
    );

    return (feature.allowedUsers || []).some((userId) => {
      const targetRole = String(userDirectory[userId]?.role || "")
        .trim()
        .toUpperCase();
      return targetRole === role;
    });
  };

  const renderPermissionCell = (featureKey, role) => {
    const featureMeta = FEATURE_METADATA[featureKey];
    const feature = normalizeFeatureState(
      featureKey,
      editState?.[featureKey],
      featureMeta.defaultEnabled,
    );
    const family = featureMeta.family;

    if (role === "ADMIN") {
      if (!feature.enabled) {
        return <div className="text-center">No</div>;
      }
      if (family === FEATURE_FAMILIES.ADMIN) {
        return (
          <div className="text-center">
            {feature.accessScope === "specific_admin_users" ? "Custom" : "Yes"}
          </div>
        );
      }
      return <div className="text-center">Yes</div>;
    }

    if (!feature.enabled) {
      return (
        <div className="text-center">
          {roleHasOverrides(featureKey, role) ? "Custom" : "No"}
        </div>
      );
    }

    if (family === FEATURE_FAMILIES.HR) {
      if (role !== "HR") return <div className="text-center">No</div>;
      return (
        <div className="text-center">
          {feature.accessScope === "specific_hr_users" ? "Custom" : "Yes"}
        </div>
      );
    }

    if (family === FEATURE_FAMILIES.USER) {
      if (role !== "USER") return <div className="text-center">No</div>;
      return (
        <div className="text-center">
          {feature.accessScope === "specific_users" ? "Custom" : "Yes"}
        </div>
      );
    }

    if (feature.accessScope === "everyone") {
      return <div className="text-center">Yes</div>;
    }
    if (feature.accessScope === "hr_only") {
      return <div className="text-center">{role === "HR" ? "Yes" : "No"}</div>;
    }
    if (feature.accessScope === "users_only") {
      return (
        <div className="text-center">{role === "USER" ? "Yes" : "No"}</div>
      );
    }
    if (feature.accessScope === "hr_and_users") {
      return (
        <div className="text-center">
          {role === "HR" || role === "USER" ? "Yes" : "No"}
        </div>
      );
    }

    return (
      <div className="text-center">
        {roleHasSpecificTargets(featureKey, role) ||
        roleHasOverrides(featureKey, role)
          ? "Custom"
          : "No"}
      </div>
    );
  };

  const renderSpecificUsers = (featureKey, feature) => {
    const query = searchTextByKey[featureKey] || "";
    const results = searchResultsByKey[featureKey] || [];
    const selectedUsers = feature.allowedUsers
      .map((userId) => userDirectory[userId] || { id: userId, name: userId })
      .filter(Boolean);

    return (
      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Specific User Targeting
        </div>
        <input
          value={query}
          onChange={(event) =>
            setSearchTextByKey((current) => ({
              ...current,
              [featureKey]: event.target.value,
            }))
          }
          placeholder="Search users by name or email"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
        />

        {selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserRemove(featureKey, user.id)}
                className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20"
              >
                {user.name}
                {user.email ? ` - ${user.email}` : ""}
                {"  "}x
              </button>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-3 max-h-48 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80">
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(featureKey, user)}
                className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm text-slate-200 transition last:border-b-0 hover:bg-white/5"
              >
                <span>
                  {user.name}
                  <span className="ml-2 text-xs text-slate-500">
                    {user.email}
                  </span>
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFeatureCard = (item) => {
    const feature = normalizeFeatureState(
      item.key,
      editState?.[item.key],
      item.defaultEnabled,
    );
    const scopeOptions = getScopeOptionsForFamily(item.family);

    return (
      <div
        className="rounded-[22px] border border-white/10 bg-slate-900/45 p-4"
        key={item.key}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-100">
              {item.label}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {item.family === FEATURE_FAMILIES.HR
                ? "HR-scoped permission"
                : item.family === FEATURE_FAMILIES.USER
                  ? "User-scoped permission"
                  : item.family === FEATURE_FAMILIES.ADMIN
                    ? "Admin-governed permission"
                    : "Global workspace feature"}
            </div>
          </div>
          <Toggle
            size="md"
            checked={feature.enabled}
            checkedChildren=""
            unCheckedChildren=""
            onChange={(checked) =>
              setFeatureValue(item.key, {
                enabled: checked,
              })
            }
            className="rs-toggle-custom"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-slate-950/55 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Access Scope
          </div>
          <select
            value={feature.accessScope}
            onChange={(event) =>
              handleAccessScopeChange(item.key, event.target.value)
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
            disabled={!feature.enabled}
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {feature.enabled &&
            feature.accessScope.startsWith("specific_") &&
            renderSpecificUsers(item.key, feature)}
        </div>
      </div>
    );
  };

  const renderSection = (section) => (
    <div
      key={section.id}
      className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/30"
    >
      <div className="mb-4">
        <div className="text-lg font-semibold text-white">{section.title}</div>
        <div className="mt-1 text-sm text-slate-400">{section.description}</div>
      </div>
      <div className="space-y-3">{section.items.map(renderFeatureCard)}</div>
    </div>
  );

  const selectedOverrideUser = overrideUserId
    ? userDirectory[overrideUserId] || {
        id: overrideUserId,
        name: overrideUserId,
      }
    : null;

  const currentOverridePermissions = selectedOverride?.permissions || {};

  return (
    <AdminLayout
      title="Workspace Services"
      subtitle="Enterprise controls for feature targeting, role logic, and individual user overrides."
    >
      <div className="min-h-screen p-8 text-slate-100">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-indigo-300">
                Workspace Services & Access Control Center
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Context-aware permission architecture with role-correct scopes
                and per-user enterprise overrides.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin")}
                className="rounded-full bg-slate-700 px-4 py-2 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleResetDefaults}
                disabled={loading}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm disabled:opacity-60"
              >
                Restore Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || loading}
                className={`rounded-full px-4 py-2 text-sm ${
                  isDirty ? "bg-emerald-600" : "bg-slate-700"
                } disabled:opacity-60`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </header>

          {message && (
            <div
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                message.type === "error"
                  ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
                  : message.type === "success"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                    : "border-white/10 bg-slate-900/70 text-slate-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURE_GROUP_CONFIG.map(renderSection)}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/30">
            <div className="mb-4">
              <div className="text-lg font-semibold text-white">
                User Service Overrides
              </div>
              <div className="text-sm text-slate-400">
                Highest-priority overrides for individual HR or User accounts.
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Role
                  </div>
                  <select
                    value={overrideRole}
                    onChange={(event) => {
                      setOverrideRole(event.target.value);
                      setOverrideUserId("");
                      setOverrideUserQuery("");
                      setOverrideUserResults([]);
                    }}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                  >
                    <option value="HR">HR</option>
                    <option value="USER">User</option>
                  </select>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Select User
                  </div>
                  <input
                    value={overrideUserQuery}
                    onChange={(event) => {
                      setOverrideUserQuery(event.target.value);
                      setOverrideUserId("");
                    }}
                    placeholder={`Search ${roleLabelMap[overrideRole]} user...`}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                  />

                  {overrideUserResults.length > 0 && (
                    <div className="mt-3 max-h-52 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80">
                      {overrideUserResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setOverrideUserId(user.id);
                            setOverrideUserQuery(user.name);
                            setUserDirectory((current) => ({
                              ...current,
                              [user.id]: user,
                            }));
                            setOverrideUserResults([]);
                          }}
                          className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm text-slate-200 transition last:border-b-0 hover:bg-white/5"
                        >
                          <span>
                            {user.name}
                            <span className="ml-2 text-xs text-slate-500">
                              {user.email}
                            </span>
                          </span>
                          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {user.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedOverrideUser && (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                    <div className="font-medium">
                      {selectedOverrideUser.name}
                    </div>
                    <div className="mt-1 text-xs text-cyan-200/80">
                      {selectedOverrideUser.email || selectedOverrideUser.id}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeOverrideUser(selectedOverrideUser.id)
                      }
                      className="mt-3 rounded-full border border-cyan-400/20 px-3 py-1 text-xs transition hover:bg-cyan-500/20"
                    >
                      Remove All Overrides
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Services
                </div>
                {selectedOverrideUser ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {overrideEligibleFeatures.map((feature) => {
                      const currentValue =
                        currentOverridePermissions[feature.key];
                      return (
                        <div
                          key={feature.key}
                          className="rounded-2xl border border-white/10 bg-slate-900/45 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {feature.label}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Override priority beats scope and global
                                defaults
                              </div>
                            </div>
                            <select
                              value={
                                typeof currentValue === "boolean"
                                  ? String(currentValue)
                                  : ""
                              }
                              onChange={(event) => {
                                const value = event.target.value;
                                if (value === "") {
                                  setEditState((current) => ({
                                    ...current,
                                    userOverrides: normalizeUserOverrides(
                                      current?.userOverrides,
                                    )
                                      .map((entry) => {
                                        if (entry.userId !== overrideUserId) {
                                          return entry;
                                        }
                                        const nextPermissions = {
                                          ...entry.permissions,
                                        };
                                        delete nextPermissions[feature.key];
                                        return {
                                          ...entry,
                                          permissions: nextPermissions,
                                        };
                                      })
                                      .filter(
                                        (entry) =>
                                          Object.keys(entry.permissions)
                                            .length > 0,
                                      ),
                                  }));
                                  return;
                                }
                                upsertOverridePermission(
                                  feature.key,
                                  value === "true",
                                );
                              }}
                              className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/40"
                            >
                              <option value="">Inherit</option>
                              <option value="true">Force Allow</option>
                              <option value="false">Force Deny</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
                    Select an HR or User account to configure per-user service
                    overrides.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/30">
            <div className="mb-3">
              <div className="text-lg font-semibold text-white">
                Role Permission Matrix
              </div>
              <div className="text-sm text-slate-400">
                Role-level visibility with override-aware custom states.
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="w-1/2">Permission</th>
                    <th className="w-1/6 text-center">ADMIN</th>
                    <th className="w-1/6 text-center">HR</th>
                    <th className="w-1/6 text-center">USER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Object.values(FEATURE_METADATA).map((feature) => (
                    <tr key={feature.key} className="h-12">
                      <td className="pr-4 text-slate-200">{feature.label}</td>
                      <td>{renderPermissionCell(feature.key, "ADMIN")}</td>
                      <td>{renderPermissionCell(feature.key, "HR")}</td>
                      <td>{renderPermissionCell(feature.key, "USER")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WorkspaceServices;
