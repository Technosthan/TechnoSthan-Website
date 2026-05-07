import React, { useEffect, useState } from "react";
import axios from "axios";
import"./AdminDashboard.css";
import { Search, Trash2, Eye, Download, Filter, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

function AdminDashboard() {
  const [socialData, setSocialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateData, setDateData] = useState([]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await axios.get(`${API_BASE}/api/social`);
      setSocialData(res.data);
      setFilteredData(res.data);
      
      // Process chart data
      const countMap = {};
      const dateMap = {};

      res.data.forEach(item => {
        if (item.platforms) {
          item.platforms.forEach(p => {
            countMap[p] = (countMap[p] || 0) + 1;
          });
        }
        
        const date = new Date(item.createdAt).toLocaleDateString();
        dateMap[date] = (dateMap[date] || 0) + 1;
      });

      setChartData(Object.keys(countMap).map(k => ({ name: k, value: countMap[k] })));
      setDateData(Object.keys(dateMap).map(k => ({ date: k, count: dateMap[k] })));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = socialData.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        (item.message && item.message.toLowerCase().includes(search)) ||
        (item.platforms && item.platforms.some(p => p.toLowerCase().includes(search))) ||
        (item.createdAt && new Date(item.createdAt).toLocaleDateString().includes(search))
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, socialData]);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      await axios.delete(`${API_BASE}/api/social/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const csv = [
      ["Message", "Platforms", "Date"].join(","),
      ...filteredData.map(item => [
        `"${item.message || ""}"`,
        `"${(item.platforms || []).join("; ")}"`,
        new Date(item.createdAt).toLocaleString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>📊 Admin Dashboard</h1>
          <span className="badge">{filteredData.length} Records</span>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button className="btn-icon" onClick={exportCSV} title="Export CSV">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by message, platform, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>
        <div className="filter-tags">
          <Filter size={16} />
          {chartData.map((item, i) => (
            <span key={i} className="tag" style={{ background: COLORS[i % COLORS.length] }}>
              {item.name}: {item.value}
            </span>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Platform Pie Chart</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Submissions Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dateData}>
              <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>📋 Social Submissions</h3>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <p>No records found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Message</th>
                  <th>Platforms</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td className="message-cell">
                      {item.message?.substring(0, 50)}
                      {item.message?.length > 50 && "..."}
                    </td>
                    <td>
                      <div className="platform-tags">
                        {(item.platforms || []).map((p, i) => (
                          <span key={i} className="platform-tag">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action view" 
                          onClick={() => setSelectedItem(item)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-action delete" 
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Modal for View Details */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Submission Details</h2>
            <div className="modal-body">
              <p><strong>Message:</strong></p>
              <p className="message-full">{selectedItem.message}</p>
              <p><strong>Platforms:</strong></p>
              <div className="platform-tags">
                {(selectedItem.platforms || []).map((p, i) => (
                  <span key={i} className="platform-tag">{p}</span>
                ))}
              </div>
              <p><strong>Date:</strong> {new Date(selectedItem.createdAt).toLocaleString()}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;