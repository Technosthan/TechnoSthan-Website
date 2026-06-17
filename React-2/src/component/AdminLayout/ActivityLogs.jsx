import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { RotateCcw, Search } from "lucide-react";
import AdminLayout from "./AdminLayout";
import "./ActivityLogs.css";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";

const headerFieldClassName =
  "w-full rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50";

const initialFilters = {
  userSearch: "",
  actionSearch: "",
  role: "",
  module: "",
  dateRange: "",
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "hr", label: "HR" },
  { value: "intern", label: "Intern" },
];

const moduleOptions = [
  { value: "Auth", label: "Auth" },
  { value: "Assignments", label: "Assignments" },
  { value: "Users", label: "Users" },
  { value: "WorkspaceServices", label: "Workspace Services" },
  { value: "Campaign", label: "Campaign Manager" },
  { value: "Files", label: "Files" },
  { value: "Settings", label: "Settings" },
];

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "30days", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [userSearchInput, setUserSearchInput] = useState("");
  const [actionSearchInput, setActionSearchInput] = useState("");
  const didMountRef = useRef(false);

  const { showToast } = useToast();

  const fetchLogs = useCallback(
    async ({
      pageNumber = page,
      filterParams = {},
      withLoading = true,
    } = {}) => {
      try {
        if (withLoading) {
          setLoading(true);
        }
        const params = {
          page: pageNumber,
          limit,
          ...filterParams,
        };
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
        if (withLoading) {
          setLoading(false);
        }
      }
    },
    [page, limit, showToast],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const filterParams = {
        ...(userSearchInput.trim() && {
          userName: userSearchInput.trim(),
          email: userSearchInput.trim(),
        }),
        ...(actionSearchInput.trim() && { action: actionSearchInput.trim() }),
        ...(filters.role && { role: filters.role }),
        ...(filters.module && { module: filters.module }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
      };
      fetchLogs({ pageNumber: 1, filterParams, withLoading: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchInput, actionSearchInput, filters, fetchLogs]);

  useEffect(() => {
    if (didMountRef.current) {
      fetchLogs({ pageNumber: page, withLoading: false });
    } else {
      fetchLogs({ pageNumber: page, withLoading: true });
      didMountRef.current = true;
    }
  }, [page, fetchLogs]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const filteredLogs = useMemo(() => {
    const userTerm = userSearchInput.trim().toLowerCase();
    const actionTerm = actionSearchInput.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesUser = userTerm
        ? [log.userName, log.email]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(userTerm))
        : true;

      const matchesAction = actionTerm
        ? log.action?.toLowerCase().includes(actionTerm)
        : true;

      const matchesRole = filters.role
        ? log.role?.toLowerCase() === filters.role.toLowerCase()
        : true;

      const matchesModule = filters.module
        ? log.module?.toLowerCase() === filters.module.toLowerCase()
        : true;

      return matchesUser && matchesAction && matchesRole && matchesModule;
    });
  }, [logs, userSearchInput, actionSearchInput, filters.role, filters.module]);

  const handleReset = () => {
    setFilters(initialFilters);
    setUserSearchInput("");
    setActionSearchInput("");
    setPage(1);
  };

  const handleExport = (format = "csv") => {
    const params = new URLSearchParams({
      export: format,
      page: page,
      limit: limit,
      ...(userSearchInput.trim() && { userName: userSearchInput.trim() }),
      ...(actionSearchInput.trim() && { action: actionSearchInput.trim() }),
      ...(filters.role && { role: filters.role }),
      ...(filters.module && { module: filters.module }),
      ...(filters.dateRange && { dateRange: filters.dateRange }),
    });
    window.open(`/api/admin/activity-logs?${params.toString()}`, "_blank");
  };

  return (
    <AdminLayout
      title="Activity Logs"
      subtitle="System audit trail and operational history"
    >
      <div className="space-y-4">
        {/* Export and Info Bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing page {pagination?.page || 1} of{" "}
            {pagination?.totalPages || 1} ({pagination?.total || 0} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
            >
              Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[22px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
            Loading activity logs...
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/30 backdrop-blur">
            <div className="max-h-[820px] activity-table-wrapper overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-full table-auto text-left activity-logs-table">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
                  <tr className="border-y border-white/10 bg-slate-950/75 align-top">
                    {/* Time */}
                    <th className="px-4 py-3">
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                          size={14}
                        />
                        <input
                          className={`${headerFieldClassName} pl-9`}
                          placeholder="Time"
                          disabled
                        />
                      </div>
                    </th>

                    {/* User Search */}
                    <th className="px-4 py-3">
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                          size={14}
                        />
                        <input
                          className={`${headerFieldClassName} pl-9`}
                          value={userSearchInput}
                          onChange={(e) => setUserSearchInput(e.target.value)}
                          placeholder="Search users"
                        />
                      </div>
                    </th>

                    {/* Action Search */}
                    <th className="px-4 py-3">
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                          size={14}
                        />
                        <input
                          className={`${headerFieldClassName} pl-9`}
                          value={actionSearchInput}
                          onChange={(e) => setActionSearchInput(e.target.value)}
                          placeholder="Search actions"
                        />
                      </div>
                    </th>

                    {/* Role Dropdown */}
                    <th className="px-4 py-3">
                      <select
                        className={headerFieldClassName}
                        value={filters.role}
                        onChange={(e) =>
                          handleFilterChange("role", e.target.value)
                        }
                      >
                        <option value="">All Roles</option>
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </th>

                    {/* Module Dropdown */}
                    <th className="px-4 py-3">
                      <select
                        className={headerFieldClassName}
                        value={filters.module}
                        onChange={(e) =>
                          handleFilterChange("module", e.target.value)
                        }
                      >
                        <option value="">All Modules</option>
                        {moduleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </th>

                    {/* Date Range Dropdown */}
                    <th className="px-4 py-3">
                      <select
                        className={headerFieldClassName}
                        value={filters.dateRange}
                        onChange={(e) =>
                          handleFilterChange("dateRange", e.target.value)
                        }
                      >
                        <option value="">All Dates</option>
                        {dateRangeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </th>

                    {/* Reset Button */}
                    <th className="px-4 py-3 text-right">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5"
                        onClick={handleReset}
                      >
                        <RotateCcw size={13} />
                        Reset
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredLogs.map((l) => (
                    <tr key={l._id} className="hover:bg-white/[0.02]">
                      <td data-label="Date" className="px-4 py-3 align-top">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td data-label="User" className="px-4 py-3 align-top">
                        {l.userName || "-"}
                      </td>
                      <td data-label="Action" className="px-4 py-3 align-top">
                        {l.action}
                      </td>
                      <td data-label="Role" className="px-4 py-3 align-top">
                        {l.role || "-"}
                      </td>
                      <td data-label="Module" className="px-4 py-3 align-top">
                        {l.module}
                      </td>
                      <td data-label="Email" className="px-4 py-3 align-top">
                        {l.email || "-"}
                      </td>
                      <td
                        data-label="Description"
                        className="px-4 py-3 align-top"
                      >
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
