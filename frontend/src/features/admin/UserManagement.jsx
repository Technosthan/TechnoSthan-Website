import { useState, useEffect } from "react";
import {
  Users,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Mail,
  Shield,
  Check,
  X,
} from "lucide-react";
import { getAllUsers, updateUserRole, deleteUser } from "./adminApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case "student":
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200";
      case "student":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions for your platform
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Users className="h-5 w-5 mr-2" />
          Refresh Users
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="student">Students Only</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
          <div className="flex items-center">
            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">
                Administrators
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((user) => user.role === "admin").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Students</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((user) => user.role === "student").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Users</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                User Accounts
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No users have registered yet."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mr-3">
                          {user.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-2 capitalize">{user.role}</span>
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {editingUser === user._id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          title="Cancel editing"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser(user._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit user role"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete user"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
