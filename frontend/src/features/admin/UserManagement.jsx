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
  Circle,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldCheck,
  Ban,
} from "lucide-react";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "./adminApi";

const UserManagement = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    status: "active",
  });

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
      role: "student",
      status: "active",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "active",
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      // For now, we'll just update existing users
      // In a full implementation, you'd have create user functionality
      if (editingUser) {
        await updateUserRole(editingUser._id, formData.role);
        await fetchUsers();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await updateUserStatus(user._id, newStatus);
      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, status: newStatus } : u,
        ),
      );
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  // Filter users based on search
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
      <div className="p-6 w-full flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            User Management
          </h1>
          <p className={`${theme.textSecondary}`}>
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-linear-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400"
                    placeholder="Enter user name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400"
                    placeholder="Enter email address..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div
          onClick={() => setIsUsersOpen(!isUsersOpen)}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-lg">
              {isUsersOpen ? "▼" : "▶"}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              <p className="text-sm text-gray-500">
                {filteredUsers.length} of {users.length} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 w-64"
              />
            </div>
          </div>
        </div>

        {isUsersOpen && (
          <div className="border-t border-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No users have been created yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleUpdate(user._id, e.target.value)
                            }
                            className="text-sm px-3 py-1 border border-gray-300 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Ban className="h-3 w-3 mr-1" />
                            )}
                            {user.status === "active" ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                user.status === "active"
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                user.status === "active"
                                  ? "Block user"
                                  : "Unblock user"
                              }
                            >
                              {user.status === "active" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
