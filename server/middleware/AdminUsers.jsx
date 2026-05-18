import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import "./AdminUsers.css"; // Create this for styling

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/api/users");
      setUsers(data.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      // Update local state to reflect change immediately
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      alert("Role updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  if (loading) return <div className="loader">Loading Users...</div>;

  return (
    <div className="admin-users-container">
      <div className="header-section">
        <h1>User Management</h1>
        <p>Decide roles and manage permissions for all members</p>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-selector"
                  >
                    <option value="user">User / Intern</option>
                    <option value="hr">HR / Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
