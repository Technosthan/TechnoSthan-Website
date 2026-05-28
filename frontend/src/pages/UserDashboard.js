import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import StatsRow from "../components/StatsRow";
import ContactsTable from "../components/ContactsTable";
import {
  uploadFile,
  getMyStatus,
  deleteMyContacts,
  updateHeaders,
} from "../services/api";

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    sent: 0,
    failed: 0,
    waiting_approval: 0,
  });
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [headerLabels, setHeaderLabels] = useState({});
  const [headerEdits, setHeaderEdits] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageLimit] = useState(50);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);

  const fetchStatus = useCallback(
    async (search = "", page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: pageLimit };
        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;

        const res = await getMyStatus(params);
        setContacts(res.data.data.contacts || []);
        setHeaders(res.data.data.headers || []);
        setTotalRecords(res.data.pagination?.total || 0);
        setCurrentPage(page);

        const labels = {};
        (res.data.data.headers || []).forEach((header) => {
          labels[header.key] = header.label;
        });
        setHeaderLabels(labels);
        setHeaderEdits({});
        setStats(res.data.stats || {
          pending: 0,
          sent: 0,
          failed: 0,
          waiting_approval: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [pageLimit, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchStatus("", 1);
  }, [fetchStatus]);

 useEffect(() => {
  if (
    stats.pending > 0 ||
    stats.waiting_approval > 0
  ) {
    setPolling(true);

    const id = setInterval(() => {
      fetchStatus(
        searchTerm,
        currentPage,
      );
    }, 1000);

    return () => clearInterval(id);
  }

  setPolling(false);
}, [
  stats.pending,
  stats.waiting_approval,
  fetchStatus,
  searchTerm,
  currentPage,
]);

  const handleDelete = async () => {
    if (!window.confirm("Delete all your contacts? This cannot be undone."))
      return;
    try {
      const res = await deleteMyContacts();
      toast.success(res.data.message);
      setContacts([]);
      setStats({ pending: 0, sent: 0, failed: 0, waiting_approval: 0 });
      setCurrentPage(1);
      setTotalRecords(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a file first");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadFile(fd, (e) =>
        setProgress(Math.round((e.loaded * 100) / e.total))
      );
      toast.success(res.data.message);
      setFile(null);
      setCurrentPage(1);
      await fetchStatus(searchTerm, 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleHeaderLabelChange = (key, value) => {
    setHeaderLabels((prev) => ({ ...prev, [key]: value }));
    setHeaderEdits((prev) => ({ ...prev, [key]: value }));
  };

  const saveHeaderLabels = async () => {
    const updates = Object.keys(headerEdits).map((key) => ({
      key,
      label: headerEdits[key],
    }));
    if (!updates.length) {
      toast("No header updates to save.");
      return;
    }
    try {
      await updateHeaders(updates);
      toast.success("Header names saved successfully");
      setHeaderEdits({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStatus(searchTerm, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(totalRecords / pageLimit)) {
      setCurrentPage(newPage);
      fetchStatus(searchTerm, newPage);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageLimit);
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfWindow = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - halfWindow);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Upload Card */}
        <div className="card">
          <h2
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            📤 Upload Contacts
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginBottom: 18,
              lineHeight: 1.6,
            }}
          >
            Upload a CSV or Excel file. System auto-detects headers, merges
            duplicates intelligently, and preserves all fields.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            <label style={{ cursor: "pointer" }}>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files[0]) setFile(e.target.files[0]);
                }}
              />
              <span
                className="btn btn-ghost"
                style={{ display: "inline-flex" }}
              >
                {file ? `📄 ${file.name}` : "Choose File"}
              </span>
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <span className="spinner" />
                  Uploading...
                </>
              ) : (
                "Upload & Send"
              )}
            </button>
            {polling && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#34d399",
                  background: "rgba(34,197,94,.1)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: "1px solid rgba(34,197,94,.2)",
                }}
              >
                <span className="pulse-dot" />
                Live updating...
              </span>
            )}
          </div>
          {uploading && (
            <div
              style={{
                marginTop: 12,
                background: "#0f172a",
                borderRadius: 6,
                height: 6,
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  width: `${progress}%`,
                  transition: "width .3s",
                  borderRadius: 6,
                }}
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Table Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            background: "#1e293b",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              flex: 1,
              minWidth: 250,
            }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search all fields..."
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                minWidth: 240,
                flex: 1,
                fontSize: 13,
              }}
            />
            <button
              onClick={handleSearch}
              className="btn btn-ghost"
              style={{ padding: "8px 14px", fontSize: 12 }}
            >
              🔍 Search
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={saveHeaderLabels}
              className="btn btn-secondary"
              style={{
                padding: "8px 14px",
                fontSize: 12,
                opacity: Object.keys(headerEdits).length ? 1 : 0.5,
                cursor: Object.keys(headerEdits).length ? "pointer" : "default",
              }}
              disabled={!Object.keys(headerEdits).length}
            >
              💾 Save Headers
            </button>
            <button
              onClick={() => fetchStatus(searchTerm, currentPage)}
              className="btn btn-ghost"
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              🔃 Refresh
            </button>
            {contacts.length > 0 && (
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                🗑 Clear All
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #334155",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              📋 Delivery Status
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {loading && (
                <span style={{ fontSize: 12, color: "#818cf8" }}>
                  Refreshing...
                </span>
              )}
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {totalRecords} total
              </span>
            </div>
          </div>
          <ContactsTable
            data={contacts}
            loading={loading}
            headers={headers}
            headerLabels={headerLabels}
            editableHeaders={true}
            onHeaderLabelChange={handleHeaderLabelChange}
            onSortChange={handleSort}
            pagination={{ currentPage, totalPages, totalRecords, pageLimit }}
            onPageChange={handlePageChange}
          />
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "16px 20px",
                borderTop: "1px solid #334155",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-ghost"
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "default" : "pointer",
                }}
              >
                ← Prev
              </button>

              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span style={{ color: "#64748b", padding: "6px 4px" }}>
                      ...
                    </span>
                  )}
                </>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={
                    page === currentPage
                      ? "btn btn-primary"
                      : "btn btn-ghost"
                  }
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    minWidth: 32,
                  }}
                >
                  {page}
                </button>
              ))}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span style={{ color: "#64748b", padding: "6px 4px" }}>
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-ghost"
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? "default" : "pointer",
                }}
              >
                Next →
              </button>

              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginLeft: 12,
                  padding: "6px 12px",
                  background: "rgba(148,163,184,.1)",
                  borderRadius: 8,
                }}
              >
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
