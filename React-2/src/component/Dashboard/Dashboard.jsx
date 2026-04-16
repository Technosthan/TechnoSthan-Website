import axios from "axios";
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  // API CALL (Protected)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setData(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  //  Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">

      {/*  Navbar */}
      <div className="dashboard-navbar">
        <h2>Dashboard </h2>

        <div>
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">

        {/* User Info */}
        <div className="card">
          <h3>Welcome, {user?.name}</h3>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>

        {/*Admin Panel */}
        {user?.role === "admin" && (
          <div className="card">
            <h3>Admin Panel </h3>
            <p>You have admin access</p>
          </div>
        )}

        {/* API Data */}
        <div className="card">
          <h3>Server Data</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;