import axios from "axios";
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  // 🔥 FETCH DATA (social data)
  const fetchData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await axios.get(`${API_BASE}/api/social`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      await axios.delete(`${API_BASE}/api/social/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <h2>Dashboard</h2>

        <div className="nav-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">

        {/* USER CARD */}
        <div className="card">
          <h3>Welcome, {user?.name}</h3>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>

        {/* ADMIN PANEL */}
        {user?.role === "admin" && (
          <div className="card">
            <h3>Admin Panel</h3>
            <p>You have full access</p>
          </div>
        )}

        {/* 🔥 DATA TABLE */}
        <div className="card">
          <h3>Social Media Data</h3>

          {data.length === 0 ? (
            <p>No data found</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Platforms</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>

                      <td>
                        {item.platforms.join(", ")}
                      </td>

                      <td>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;