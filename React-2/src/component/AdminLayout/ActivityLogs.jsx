import { useEffect, useState, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [pagination, setPagination] = useState(null);

  const { showToast } = useToast();

  const fetchLogs = useCallback(
    async (p = page) => {
      try {
        setLoading(true);
        const params = { page: p, limit };
        const { data } = await api.get("/api/admin/activity-logs", { params });
        setLogs(data.data || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("Failed to load activity logs", err);
        showToast({
          title: "Error",
          message: "Unable to load activity logs",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [page, limit, showToast],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = () => {
    const href = `/api/admin/activity-logs?export=csv&page=${page}&limit=${limit}`;
    window.open(href, "_blank");
  };

  return (
    <AdminLayout
      title="Activity Logs"
      subtitle="System audit trail and operational history"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Showing recent activity</div>
          <div>
            <button
              onClick={handleExport}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300"
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[22px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
            Loading activity logs...
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase tracking-[0.22em]">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {logs.map((l) => (
                    <tr key={l._id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 align-top">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {l.userName || "-"}
                      </td>
                      <td className="px-4 py-3 align-top">{l.email || "-"}</td>
                      <td className="px-4 py-3 align-top">{l.role || "-"}</td>
                      <td className="px-4 py-3 align-top">{l.action}</td>
                      <td className="px-4 py-3 align-top">{l.module}</td>
                      <td className="px-4 py-3 align-top">
                        {l.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination ? (
          <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-slate-900/60 px-4 py-3">
            <p className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages} |{" "}
              {pagination.total} records
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;
