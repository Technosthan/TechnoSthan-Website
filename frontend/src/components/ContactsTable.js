import React, { useState, useMemo } from "react";
import StatusBadge from "./StatusBadge";

const msgColor = {
  sent: "#34d399",
  failed: "#f87171",
  waiting_approval: "#60a5fa",
  pending: "#fbbf24",
};

const defaultLabel = (key) => {
  if (key === "email") return "Email";
  if (key === "phone") return "Phone";
  if (key === "name") return "Name";
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ContactsTable({
  data,
  loading,
  showUploader = false,
  onApprove,
  onReject,
  headers = [],
  headerLabels = {},
  editableHeaders = false,
  onHeaderLabelChange,
  pagination = {},
  onPageChange,
  onSortChange,
}) {
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState(-1);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 1 ? -1 : 1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
    if (onSortChange) onSortChange(key, sortKey === key ? -sortDir : -1);
  };

  if (loading && !data.length)
    return (
      <div
        style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}
      >
        <div
          className="spinner"
          style={{
            margin: "0 auto 12px",
            width: 32,
            height: 32,
            borderWidth: 3,
          }}
        />
        <p>Loading...</p>
      </div>
    );

  if (!data.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#475569",
          fontSize: 15,
        }}
      >
        📭 No records yet.
      </div>
    );

  if (!headers.length && data.length > 0)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#e74c3c",
          fontSize: 13,
        }}
      >
        ⚠️ Headers not yet configured. Please upload a file.
      </div>
    );

  const rowData = data.map((item) => ({ data: item.data || {}, ...item }));
  const dynamicKeys = Array.from(new Set(headers.map((h) => h.key)));

  const orderedKeys = [];
  ["email", "phone", "name"].forEach((key) => {
    if (dynamicKeys.includes(key)) orderedKeys.push(key);
  });
  dynamicKeys.forEach((key) => {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  });

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span style={{ opacity: 0.4 }}>⇅</span>;
    return sortDir === 1 ? "↑" : "↓";
  };

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid #334155",
      }}
    >
      <table
        className="data-table"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #334155" }}>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#e2e8f0",
                background: "#1e293b",
              }}
            >
              #
            </th>
            {orderedKeys.map((key) => (
              <th
                key={key}
                onClick={() => !editableHeaders && handleSort(key)}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  background: "#1e293b",
                  cursor: !editableHeaders ? "pointer" : "default",
                  userSelect: "none",
                  minWidth: 120,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    {editableHeaders && onHeaderLabelChange ? (
                      <input
                        value={headerLabels[key] ?? defaultLabel(key)}
                        onChange={(e) =>
                          onHeaderLabelChange(key, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%",
                          minWidth: 80,
                          border: "1px solid #475569",
                          borderRadius: 6,
                          padding: "6px 8px",
                          background: "#0f172a",
                          color: "#e2e8f0",
                          fontSize: 12,
                        }}
                      />
                    ) : (
                      (headerLabels[key] ?? defaultLabel(key))
                    )}
                  </div>
                  {!editableHeaders && <SortIcon column={key} />}
                </div>
              </th>
            ))}
            {showUploader && (
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  background: "#1e293b",
                }}
              >
                Uploaded By
              </th>
            )}
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#e2e8f0",
                background: "#1e293b",
              }}
            >
              Status
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#e2e8f0",
                background: "#1e293b",
              }}
            >
              Message
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#e2e8f0",
                background: "#1e293b",
              }}
            >
              Sent At
            </th>
            {showUploader && (
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  background: "#1e293b",
                }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rowData.map((c, i) => (
            <tr
              key={c._id || `${i}-${c.email}-${c.phone}`}
              style={{
                borderBottom: "1px solid #334155",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#334155")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <td
                style={{
                  color: "#475569",
                  fontSize: 12,
                  padding: "12px 16px",
                }}
              >
                {i + 1}
              </td>
              {orderedKeys.map((key) => {
                const rawValue = c.data?.[key];
                let value = "";
                if (rawValue === null || rawValue === undefined) {
                  value = "";
                } else if (Array.isArray(rawValue)) {
                  value = rawValue.join(", ");
                } else {
                  value = String(rawValue).trim();
                }
                return (
                  <td
                    key={key}
                    style={{
                      color: key === "email" ? "#f1f5f9" : "#94a3b8",
                      fontWeight: key === "email" ? 600 : 400,
                      fontSize: 13,
                      padding: "12px 16px",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={value}
                  >
                    {value || "—"}
                  </td>
                );
              })}
              {showUploader && (
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, color: "#f1f5f9" }}>
                    {c.uploadedBy?.name || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {c.uploadedBy?.email || ""}
                  </div>
                </td>
              )}
              <td style={{ padding: "12px 16px" }}>
                <StatusBadge status={c.status} />
              </td>
              <td
                style={{
                  fontSize: 12,
                  color: msgColor[c.status] || "#94a3b8",
                  padding: "12px 16px",
                }}
              >
                {c.message || "—"}
              </td>
              <td
                style={{
                  fontSize: 11,
                  color: "#475569",
                  padding: "12px 16px",
                  whiteSpace: "nowrap",
                }}
              >
                {c.sentAt ? new Date(c.sentAt).toLocaleString() : "—"}
              </td>
              {showUploader && (
                <td style={{ padding: "12px 16px" }}>
                  {c.status === "waiting_approval" ? (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() =>
                          onApprove(c.uploadedBy?._id || c.uploadedBy)
                        }
                        className="btn btn-success"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          onReject(c.uploadedBy?._id || c.uploadedBy)
                        }
                        className="btn btn-danger"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
