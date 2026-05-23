import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Save,
  X,
  Search,
  CheckCircle,
  Ban,
  RefreshCw,
} from "lucide-react";

import {
  getAllUsers,
  getUserServicePermission,
  createUser,
  updateUserRole,
  updateUserStatus,
  updateUserServicePermissions,
  deleteUser,
} from "./adminApi";

const UserManagement = () => {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    status: "active",
    emailOtpEnabled: undefined,
    phoneOtpEnabled: undefined,
    whatsappLoginEnabled: undefined,
  });

  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionUpdating, setPermissionUpdating] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      status: "active",
      emailOtpEnabled: undefined,
      phoneOtpEnabled: undefined,
      whatsappLoginEnabled: undefined,
    });

    setEditingUser(null);
    setShowForm(false);
    setError("");
    setSuccess("");
    setPermissionLoading(false);
    setPermissionUpdating("");
  };

  const fetchUserPermissions = async (userId) => {
    try {
      setPermissionLoading(true);

      const response = await getUserServicePermission(userId);

      const permissions = response.data?.data || {};

      setFormData((prev) => ({
        ...prev,
        emailOtpEnabled: permissions.emailOtpEnabled,
        phoneOtpEnabled: permissions.phoneOtpEnabled,
        whatsappLoginEnabled: permissions.whatsappLoginEnabled,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load permissions",
      );
    } finally {
      setPermissionLoading(false);
    }
  };

  const handlePermissionToggle = async (field, value) => {
    if (!editingUser) return;

    try {
      setPermissionUpdating(field);

      await updateUserServicePermissions(editingUser._id, {
        [field]: value,
      });

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      setSuccess("Permission updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update permission",
      );
    } finally {
      setPermissionUpdating("");
    }
  };

  const handleEdit = async (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status || "active",
      emailOtpEnabled: undefined,
      phoneOtpEnabled: undefined,
      whatsappLoginEnabled: undefined,
    });

    setEditingUser(user);
    setShowForm(true);

    await fetchUserPermissions(user._id);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete user",
      );
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update role",
      );
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus =
        user.status === "active" ? "blocked" : "active";

      await updateUserStatus(user._id, newStatus);

      setUsers(
        users.map((u) =>
          u._id === user._id
            ? { ...u, status: newStatus }
            : u,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update status",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setError("");
      setSuccess("");

      if (editingUser) {
        if (formData.role !== editingUser.role) {
          await updateUserRole(
            editingUser._id,
            formData.role,
          );
        }

        if (
          formData.status !==
          (editingUser.status || "active")
        ) {
          await updateUserStatus(
            editingUser._id,
            formData.status,
          );
        }

        setSuccess("User updated successfully");
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
        });

        setSuccess("User created successfully");
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save user",
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesEmail = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesName || matchesEmail;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-300 font-medium">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-8 ${theme.text}`}>
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-5xl font-black ${theme.text} mb-3`}>
            User Management
          </h1>

          <p className={`${theme.textSecondary} text-lg`}>
            Manage user accounts, roles and permissions
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-2xl"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* SEARCH */}

      <div
        className={`${theme.card} rounded-3xl border ${theme.border} p-6`}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className={`${theme.input} w-full pl-12 pr-4 py-4 rounded-2xl`}
          />
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-400" />

            <p className="text-red-300 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />

            <p className="text-emerald-300 font-medium">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* MODAL */}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`${theme.card} rounded-3xl border ${theme.border} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="text-slate-400 mt-1">
                  Manage user information and permissions
                </p>
              </div>

              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NAME */}

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-300">
                    Name
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                    placeholder="Enter user name..."
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                    placeholder="Enter email..."
                  />
                </div>

                {/* PASSWORD */}

                {!editingUser && (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-300">
                      Password
                    </label>

                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                      placeholder="Enter password..."
                    />
                  </div>
                )}

                {/* ROLE */}

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-300">
                    Role
                  </label>

                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  >
                    <option value="student">
                      Student
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>
              </div>

              {/* USER ACCESS */}

              {editingUser && (
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        User Access Controls
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        Enable or disable services for
                        this user
                      </p>
                    </div>

                    {permissionLoading && (
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        field:
                          "emailOtpEnabled",
                        label:
                          "Email OTP Access",
                        description:
                          "Allow email OTP login",
                      },

                      {
                        field:
                          "phoneOtpEnabled",
                        label:
                          "Phone OTP Access",
                        description:
                          "Allow phone OTP login",
                      },

                      {
                        field:
                          "whatsappLoginEnabled",
                        label:
                          "WhatsApp Access",
                        description:
                          "Allow WhatsApp login",
                      },
                    ].map((item) => (
                      <div
                        key={item.field}
                        className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-white font-semibold">
                            {item.label}
                          </h4>

                          <p className="text-slate-400 text-sm mt-1">
                            {
                              item.description
                            }
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              formData[
                                item.field
                              ],
                            )}
                            disabled={
                              permissionLoading ||
                              permissionUpdating ===
                                item.field
                            }
                            onChange={(e) =>
                              void handlePermissionToggle(
                                item.field,
                                e.target
                                  .checked,
                              )
                            }
                            className="sr-only peer"
                          />

                          <div className="w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                          <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-2xl border border-white/10 text-slate-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center gap-2 hover:scale-105 transition-all duration-300"
                >
                  <Save className="w-5 h-5" />

                  {editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USERS TABLE */}

      <div
        className={`${theme.card} rounded-3xl border ${theme.border}`}
      >
        {/* HEADER */}

        <div
          onClick={() =>
            setIsUsersOpen(!isUsersOpen)
          }
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-lg">
              {isUsersOpen ? "▼" : "▶"}
            </span>

            <div>
              <h2 className="text-2xl font-bold text-white">
                All Users
              </h2>

              <p className="text-slate-400">
                {filteredUsers.length} of{" "}
                {users.length} items
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className={`${theme.input} pl-12 pr-4 py-3 rounded-2xl w-72`}
            />
          </div>
        </div>

        {/* TABLE */}

        {isUsersOpen && (
          <div className="border-t border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  {[
                    "#",
                    "NAME",
                    "EMAIL",
                    "ROLE",
                    "STATUS",
                    "CREATED DATE",
                    "ACTIONS",
                  ].map((item) => (
                    <th
                      key={item}
                      className="px-6 py-5 text-left text-xs font-semibold tracking-wider text-slate-400"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredUsers.map(
                  (user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-white/5 transition"
                    >
                      {/* NUMBER */}

                      <td className="px-6 py-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </td>

                      {/* NAME */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-300" />
                          </div>

                          <span className="text-white font-semibold">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-5 text-slate-300">
                        {user.email}
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-5">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleUpdate(
                              user._id,
                              e.target
                                .value,
                            )
                          }
                          className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="student">
                            Student
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            user.status ===
                            "active"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {user.status ===
                          "active" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}

                          {user.status ===
                          "active"
                            ? "Active"
                            : "Blocked"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5 text-slate-300">
                        {new Date(
                          user.createdAt,
                        ).toLocaleDateString()}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleEdit(
                                user,
                              )
                            }
                            className="p-2 rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                user._id,
                              )
                            }
                            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() =>
                              toggleUserStatus(
                                user,
                              )
                            }
                            className={`p-2 rounded-xl transition ${
                              user.status ===
                              "active"
                                ? "text-red-400 hover:bg-red-500/10"
                                : "text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {user.status ===
                            "active" ? (
                              <Ban className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;