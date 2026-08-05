import { RotateCcw, Search, Shield, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../lib/api";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useToast } from "../Toast/ToastProvider";
import socket from "../../socket";

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/40";

const roleBadgeClassNames = {
  USER: "bg-sky-500/15 text-sky-200 ring-sky-400/20",
  HR: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
  ADMIN: "bg-indigo-500/15 text-indigo-100 ring-indigo-400/20",
};

const statusBadgeClassNames = {
  active: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
  suspended: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const didMountRef = useRef(false);

  const currentUser = getStoredUser();
  const { showToast } = useToast();

  const fetchUsers = useCallback(
    async ({ withLoading = true } = {}) => {
      try {
        if (withLoading) {
          setLoading(true);
        } else {
          setIsFetching(true);
        }
        setError("");

        const params = {
          page,
          limit,
        };

        if (search.trim()) params.search = search.trim();
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) {
          params.isActive =
            statusFilter === "active"
              ? true
              : statusFilter === "suspended"
                ? false
                : undefined;
        }

        const { data } = await api.get("/api/users", { params });

        setUsers(data.data || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("Failed to load users", err);
        setError("Failed to load users. Please try again.");
      } finally {
        if (withLoading) {
          setLoading(false);
        } else {
          setIsFetching(false);
        }
      }
    },
    [search, roleFilter, statusFilter, page, limit],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (didMountRef.current) {
      fetchUsers({ withLoading: false });
    } else {
      fetchUsers({ withLoading: true });
      didMountRef.current = true;
    }
  }, [fetchUsers]);

  useEffect(() => {
    const onUserUpdated = () => {
      fetchUsers();
    };

    const onUserDeleted = () => {
      fetchUsers();
    };

    socket.on("user_updated", onUserUpdated);
    socket.on("user_deleted", onUserDeleted);

    return () => {
      socket.off("user_updated", onUserUpdated);
      socket.off("user_deleted", onUserDeleted);
    };
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = normalizedSearch
        ? [user.name, user.email]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      const matchesRole = roleFilter
        ? normalizeRole(user.role) === roleFilter
        : true;

      const matchesStatus = statusFilter
        ? statusFilter === "active"
          ? user.isActive
          : statusFilter === "suspended"
            ? !user.isActive
            : true
        : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchInput, roleFilter, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: normalizeRole(newRole) } : user,
        ),
      );
      showToast({
        title: "Role updated",
        message: `Role updated to ${newRole}`,
        type: "success",
      });
    } catch (err) {
      console.error("Role update failed", err);
      showToast({
        title: "Error",
        message: err.response?.data?.message || "Error updating role",
        type: "error",
      });
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.patch(`/api/users/${userId}/status`, { isActive });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, isActive } : user)),
      );
      showToast({
        title: isActive ? "User reactivated" : "User suspended",
        type: "success",
      });
    } catch (err) {
      console.error("Status update failed", err);
      showToast({
        title: "Error",
        message: err.response?.data?.message || "Error updating status",
        type: "error",
      });
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      showToast({ title: "User deleted", type: "success" });
    } catch (err) {
      console.error("Delete user failed", err);
      showToast({
        title: "Error",
        message: err.response?.data?.message || "Error deleting user",
        type: "error",
      });
    }
  };

  return (
    <AdminLayout
      // title="User Management"
      // subtitle="Manage roles, access, and account status from one compact operations grid."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-[22px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
            Loading users...
          </div>
        ) : error ? (
          <div className="rounded-[22px] border border-rose-400/20 bg-rose-500/10 p-6 text-sm text-rose-100">
            {error}
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-slate-900/70 p-10 text-center">
                <h3 className="text-xl font-semibold text-white">
                  No users found
                </h3>
                <p className="mt-3 text-sm text-slate-400">
                  Try adjusting the current filters.
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                  onClick={resetFilters}
                >
                  <RotateCcw size={14} />
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/30">
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full table-fixed text-left">
                    <colgroup>
                      <col className="w-[20%]" />
                      <col className="w-[24%]" />
                      <col className="w-[14%]" />
                      <col className="w-[14%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead className="bg-slate-950/70">
                      <tr className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Current Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Change Role</th>
                       <th className="px-4 py-3 text-center">
  Actions
</th>
                      </tr>
                      <tr className="border-t border-white/10 bg-slate-950/45 align-top">
                        <th className="px-4 py-3">
                          <div className="relative">
                            <Search
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                              size={14}
                            />
                            <input
                              type="text"
                              placeholder="Search name or email"
                              value={searchInput}
                              onChange={(event) => {
                                setSearchInput(event.target.value);
                              }}
                              className={`${fieldClassName} pl-9`}
                            />
                          </div>
                        </th>
                        <th className="px-4 py-3">
                          <div className="px-1 py-2 text-xs text-slate-500">
                            Matches name or email
                          </div>
                        </th>
                        <th className="px-4 py-3">
                          <select
                            value={roleFilter}
                            onChange={(event) => {
                              setRoleFilter(event.target.value);
                              setPage(1);
                            }}
                            className={fieldClassName}
                          >
                            <option value="">All roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="HR">HR</option>
                            <option value="USER">User</option>
                          </select>
                        </th>
                        <th className="px-4 py-3">
                          <select
                            value={statusFilter}
                            onChange={(event) => {
                              setStatusFilter(event.target.value);
                              setPage(1);
                            }}
                            className={fieldClassName}
                          >
                            <option value="">All status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </th>
                        <th className="px-4 py-3">
                          <div className="px-1 py-2 text-xs text-slate-500">
                            Assign role directly in-row
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right">
                          <button
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                            onClick={resetFilters}
                          >
                            <RotateCcw size={13} />
                            Reset
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                      {filteredUsers.map((user) => {
                        const normalizedRole = normalizeRole(user.role);
                        const statusKey =
                          typeof user.isActive === "undefined"
                            ? ""
                            : user.isActive
                              ? "active"
                              : "suspended";

                        return (
                          <tr
                            key={user.id}
                            className="transition hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-4 align-top">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-white">
                                  {user.name}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="truncate text-sm text-slate-300">
                                {user.email}
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                  roleBadgeClassNames[normalizedRole] ||
                                  "bg-white/10 text-slate-200 ring-white/10"
                                }`}
                              >
                                {normalizedRole}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top">
                              {statusKey ? (
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                    statusBadgeClassNames[statusKey]
                                  }`}
                                >
                                  {statusKey === "active"
                                    ? "Active"
                                    : "Suspended"}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <select
  value={user.role}
  onChange={(event) =>
    handleRoleChange(user.id, event.target.value)
  }
  className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/40 disabled:opacity-50"
  disabled={currentUser?.id === user.id}
  style={{
    colorScheme: "dark",
  }}
>
  <option
    value="USER"
    className="bg-[#020617] text-white"
  >
    User / Intern
  </option>

  <option
    value="HR"
    className="bg-[#020617] text-white"
  >
    HR / Manager
  </option>

  <option
    value="ADMIN"
    className="bg-[#020617] text-white"
  >
    Admin
  </option>
</select>
                            </td>
                           <td className="px-4 py-4 align-middle">
  <div className="flex w-full items-center justify-center gap-2">
    <button
      type="button"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 p-0 text-amber-100 transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() =>
        handleStatusChange(user.id, !user.isActive)
      }
      disabled={currentUser?.id === user.id}
      title={
        user.isActive
          ? "Suspend user"
          : "Reactivate user"
      }
      aria-label={
        user.isActive
          ? "Suspend user"
          : "Reactivate user"
      }
    >
      <Shield size={16} />
    </button>

    <button
      type="button"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/15 p-0 text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => handleDelete(user.id)}
      disabled={currentUser?.id === user.id}
      title={
        currentUser?.id === user.id
          ? "Cannot delete yourself"
          : "Delete user"
      }
      aria-label="Delete user"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {pagination ? (
              <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-slate-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages} |{" "}
                  {pagination.total} users
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={pagination.page <= 1}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
