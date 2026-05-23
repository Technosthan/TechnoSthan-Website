import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Shield,
  Search,
  Loader2,
  RefreshCw,
  Users,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import {
  getUserServicePermissions,
  updateUserServicePermissions,
  bulkUpdateUserServicePermissions,
} from "./adminApi";

const UserServicePermissions = ({ theme }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingKey, setUpdatingKey] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    void fetchUserPermissions();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchUserPermissions();
    }, 450);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!selectedUserId && users.length) {
      setSelectedUserId(users[0]._id);
    }
    if (selectedUserId && !users.find((user) => user._id === selectedUserId)) {
      setSelectedUserId(users[0]?._id || null);
    }
  }, [users, selectedUserId]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserServicePermissions({ search });
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error("[UserServicePermissions] fetch error", err);
      setError(
        err?.response?.data?.message || "Failed to load user permissions",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      setRefreshing(true);
      await fetchUserPermissions();
      toast.success("User permissions refreshed");
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggle = async (userId, field, value) => {
    try {
      const key = `${userId}:${field}`;
      setUpdatingKey(key);
      await updateUserServicePermissions(userId, { [field]: value });
      await fetchUserPermissions();
      toast.success("Permission updated");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update permission",
      );
    } finally {
      setUpdatingKey("");
    }
  };

  const handleBulkUpdate = async (field, value) => {
    if (!users.length) return;
    try {
      setBulkLoading(true);
      const userIds = users.map((user) => user._id);
      await bulkUpdateUserServicePermissions({
        userIds,
        updates: { [field]: value },
      });
      await fetchUserPermissions();
      toast.success("Bulk update applied");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const selectedUser = users.find((user) => user._id === selectedUserId);

  return (
    <div className={`rounded-2xl border border-gray-200 p-6 ${theme.card}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h4 className={`text-lg font-semibold ${theme.text}`}>
            User Access Management
          </h4>
          <p className={`text-sm ${theme.textSecondary}`}>
            Review service overrides with a user-focused detail panel.
          </p>
        </div>
        <button
          onClick={refreshUsers}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-all duration-200"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Users size={16} />
          )}
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email or phone..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 ${theme.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkUpdate("emailOtpEnabled", true)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-white hover:bg-green-700 transition-all duration-200"
            >
              <CheckCircle2 size={16} /> Enable Email OTP
            </button>
            <button
              onClick={() => handleBulkUpdate("emailOtpEnabled", false)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <X size={16} /> Disable Email OTP
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-4 shadow-sm max-h-155 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-500">
                No users matched your search.
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const selected = user._id === selectedUserId;
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => setSelectedUserId(user._id)}
                      className={`w-full rounded-3xl border p-4 text-left transition duration-200 ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.name || user.email}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email || user._id}
                          </div>
                        </div>
                        <div className="text-xs capitalize text-slate-600">
                          {user.role || "user"}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                          Email OTP {user.emailOtpEnabled ? "On" : "Off"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                          Phone OTP {user.phoneOtpEnabled ? "On" : "Off"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                          WhatsApp {user.whatsappLoginEnabled ? "On" : "Off"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Shield size={20} />
            </span>
            <div>
              <h4 className={`text-lg font-semibold ${theme.text}`}>
                Selected User Details
              </h4>
              <p className={`text-sm ${theme.textSecondary}`}>
                Manage access overrides for the highlighted account.
              </p>
            </div>
          </div>

          {!selectedUser ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              <p>No user selected yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">
                      {selectedUser.name || "Unknown"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {selectedUser.role || "user"}
                  </span>
                </div>
                <div className="mt-4 grid gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-sm text-slate-900">
                      {selectedUser.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">
                      {selectedUser.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    field: "emailOtpEnabled",
                    label: "Email OTP Override",
                    description: "Enable or disable email OTP for this user.",
                  },
                  {
                    field: "phoneOtpEnabled",
                    label: "Phone OTP Override",
                    description:
                      "Enable or disable phone OTP login for this user.",
                  },
                  {
                    field: "whatsappLoginEnabled",
                    label: "WhatsApp Override",
                    description:
                      "Allow WhatsApp-based authentication for this user.",
                  },
                ].map((item) => {
                  const currentValue = Boolean(selectedUser[item.field]);
                  const key = `${selectedUser._id}:${item.field}`;
                  return (
                    <div
                      key={item.field}
                      className="rounded-3xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.description}
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={currentValue}
                            disabled={updatingKey === key}
                            onChange={(e) =>
                              void handleToggle(
                                selectedUser._id,
                                item.field,
                                e.target.checked,
                              )
                            }
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span>
                    User-specific overrides take precedence over global access
                    settings.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserServicePermissions;
