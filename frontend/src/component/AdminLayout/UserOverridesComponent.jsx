import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  UserX,
} from "lucide-react";
import api from "../../lib/api";

/**
 * USER OVERRIDES COMPONENT
 * Allow specific users to have different permissions than their role default
 * Useful for temporary exceptions, deactivations, or special privileges
 */
const UserOverridesComponent = ({ onUpdate }) => {
  const [overrides, setOverrides] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showUserOverrideModal, setShowUserOverrideModal] = useState(false);

  // Available permissions to override
  const availablePermissions = [
    { key: "submit_work", name: "Submit Work", category: "submissions" },
    { key: "upload_files", name: "Upload Files", category: "submissions" },
    {
      key: "create_assignments",
      name: "Create Assignments",
      category: "assignments",
    },
    {
      key: "edit_assignments",
      name: "Edit Assignments",
      category: "assignments",
    },
    {
      key: "delete_assignments",
      name: "Delete Assignments",
      category: "assignments",
    },
    {
      key: "review_submissions",
      name: "Review Submissions",
      category: "reviews",
    },
    { key: "add_feedback", name: "Add Feedback", category: "reviews" },
  ];

  // Fetch user overrides
  const fetchOverrides = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/permissions/user-overrides");

      if (data.success) {
        setOverrides(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch overrides:", err);
      setError("Failed to load overrides");
    } finally {
      setLoading(false);
    }
  };

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data } = await api.get("/api/admin/users", {
        params: { search: query, limit: 5 },
      });

      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setSearching(false);
    }
  };

  // Set user override
  const setOverride = async (permissionKey, enabled, reason = "") => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const { data } = await api.post("/api/permissions/user-overrides", {
        userId: selectedUser._id || selectedUser.id,
        permissionKey,
        enabled,
        reason,
      });

      if (data.success) {
        // Update overrides list
        fetchOverrides();
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      console.error("Failed to set override:", err);
      setError("Failed to set override");
    } finally {
      setSaving(false);
    }
  };

  // Remove user override
  const removeOverride = async (userId, permissionKey) => {
    try {
      setSaving(true);
      const { data } = await api.delete("/api/permissions/user-overrides", {
        data: { userId, permissionKey },
      });

      if (data.success) {
        fetchOverrides();
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      console.error("Failed to remove override:", err);
      setError("Failed to remove override");
    } finally {
      setSaving(false);
    }
  };

  // Get overrides for selected user
  const selectedUserOverrides = selectedUser
    ? overrides.filter(
        (o) => o.userId === (selectedUser._id || selectedUser.id),
      )
    : [];

  useEffect(() => {
    fetchOverrides();
  }, []);

  // Search users when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

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

      {/* User Search */}
      <div className="relative">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 pl-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-2 rounded-xl border border-white/10 bg-slate-900 shadow-lg">
            {searchResults.map((user) => (
              <button
                key={user._id || user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setUserSearch("");
                  setSearchResults([]);
                }}
                className="block w-full border-b border-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/5 last:border-0"
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-white">{selectedUser.name}</h4>
              <p className="text-sm text-indigo-200">{selectedUser.email}</p>
              <p className="mt-1 text-xs text-indigo-300">
                Role: <span className="font-medium">{selectedUser.role}</span>
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setUserSearch("");
              }}
              className="rounded-lg bg-white/10 p-2 text-indigo-200 hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>

          {/* Permission Overrides */}
          <div className="mt-4 space-y-3">
            {availablePermissions.map((perm) => {
              const override = selectedUserOverrides.find(
                (o) => o.permissionKey === perm.key,
              );

              return (
                <div
                  key={perm.key}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {perm.name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {perm.category}
                      {override && override.reason && ` • ${override.reason}`}
                    </p>
                  </div>

                  {/* Override Controls */}
                  <div className="flex items-center gap-2">
                    {override && (
                      <>
                        {override.enabled ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Circle size={16} className="text-rose-400" />
                        )}
                      </>
                    )}

                    <button
                      onClick={() => setOverride(perm.key, true, "")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        override?.enabled
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                      }`}
                      disabled={saving}
                    >
                      Allow
                    </button>

                    <button
                      onClick={() => setOverride(perm.key, false, "")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        override?.enabled === false
                          ? "bg-rose-500/20 text-rose-200"
                          : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                      }`}
                      disabled={saving}
                    >
                      Block
                    </button>

                    {override && (
                      <button
                        onClick={() =>
                          removeOverride(
                            selectedUser._id || selectedUser.id,
                            perm.key,
                          )
                        }
                        className="rounded-lg bg-slate-700/40 p-1.5 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
                        disabled={saving}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing Overrides List */}
      {overrides.length > 0 && !selectedUser && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Active Overrides</h4>
          <div className="space-y-2">
            {overrides.map((override) => (
              <div
                key={`${override.userId}-${override.permissionKey}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-slate-950/40 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {override.userName} • {override.permissionKey}
                  </p>
                  <p className="text-xs text-slate-400">{override.userEmail}</p>
                </div>
                {override.enabled ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Circle size={16} className="text-rose-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {overrides.length === 0 && !selectedUser && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
          <UserX size={32} className="mx-auto text-slate-600" />
          <p className="mt-2 text-sm text-slate-400">
            No user permission overrides set
          </p>
        </div>
      )}
    </div>
  );
};

export default UserOverridesComponent;
