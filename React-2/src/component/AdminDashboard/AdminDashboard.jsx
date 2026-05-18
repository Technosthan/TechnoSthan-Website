import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  Eye,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout/AdminLayout";
import api from "../../lib/api";
import { getAssignments, getSubmissionMonitor } from "../../lib/assignments";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [socialData, setSocialData] = useState([]);
  const [filteredSocialData, setFilteredSocialData] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        socialResponse,
        usersResponse,
        assignmentsResponse,
        submissionsResponse,
      ] = await Promise.all([
        api.get("/api/social"),
        api.get("/api/users/analytics"),
        getAssignments({
          page: 1,
          limit: 5,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        getSubmissionMonitor({ page: 1, limit: 5 }),
      ]);

      const socialItems = socialResponse.data || [];
      setSocialData(socialItems);
      setFilteredSocialData(socialItems);
      setUserAnalytics(usersResponse.data?.data || null);
      setRecentAssignments(assignmentsResponse.data || []);
      setAssignmentAnalytics(assignmentsResponse.analytics || null);
      setRecentSubmissions(submissionsResponse.data || []);
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      setFilteredSocialData(socialData);
      return;
    }

    setFilteredSocialData(
      socialData.filter((item) => {
        const message = item.message?.toLowerCase() || "";
        const platforms = (item.platforms || []).join(" ").toLowerCase();
        const createdAt = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString().toLowerCase()
          : "";

        return (
          message.includes(search) ||
          platforms.includes(search) ||
          createdAt.includes(search)
        );
      }),
    );
  }, [searchTerm, socialData]);

  const exportCSV = () => {
    const csv = [
      ["Message", "Platforms", "Date"].join(","),
      ...filteredSocialData.map((item) =>
        [
          `"${item.message || ""}"`,
          `"${(item.platforms || []).join("; ")}"`,
          new Date(item.createdAt).toLocaleString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `social-data-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) {
      return;
    }

    try {
      await api.delete(`/api/social/${id}`);
      setSocialData((current) => current.filter((item) => item._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Team Members",
        value: userAnalytics?.total ?? "-",
        tone: "from-cyan-500/20 to-cyan-400/5",
      },
      {
        label: "Employees",
        value: userAnalytics?.users ?? "-",
        tone: "from-indigo-500/20 to-indigo-400/5",
      },
      {
        label: "Open Assignments",
        value:
          assignmentAnalytics == null
            ? "-"
            : (assignmentAnalytics.total || 0) -
              (assignmentAnalytics.completed || 0),
        tone: "from-violet-500/20 to-violet-400/5",
      },
      {
        label: "Pending Reviews",
        value: assignmentAnalytics?.submissions?.submitted ?? 0,
        tone: "from-amber-500/20 to-amber-400/5",
      },
    ],
    [assignmentAnalytics, userAnalytics],
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="flex flex-col gap-5 rounded-[24px] border border-white/10 bg-slate-900/55 px-5 py-5 shadow-xl shadow-slate-950/20 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-300">
              Operations Control Center
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              A tighter view of delivery, people operations, and recent
              submission activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-5 text-sm font-medium text-slate-200 transition hover:bg-slate-950/80"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-5 text-sm font-medium text-slate-200 transition hover:bg-slate-950/80"
              onClick={fetchData}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-5 text-sm font-medium text-slate-200 transition hover:bg-slate-950/80"
              onClick={exportCSV}
            >
              <Download size={16} />
              Export
            </button>

            <button
              className="inline-flex h-11 items-center rounded-full bg-cyan-500 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
              onClick={() => navigate("/admin/assignments")}
            >
              Assignment Center
            </button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.tone} px-4 py-4 shadow-lg shadow-slate-950/25`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Recent Assignments
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Latest operational work
                  </h3>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                  onClick={() => navigate("/admin/assignments")}
                >
                  View all
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                    Loading assignments...
                  </div>
                ) : recentAssignments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 p-5 text-sm text-slate-400">
                    No assignments available yet.
                  </div>
                ) : (
                  recentAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-white">
                            {assignment.title}
                          </h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {assignment.assignedTo?.name ||
                              assignment.assignedToRole}{" "}
                            • Due{" "}
                            {new Date(assignment.deadline).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-100">
                            {assignment.priority}
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                            {assignment.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Social Records
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Latest social submissions
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Search records"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-slate-950/70 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Message</th>
                        <th className="px-4 py-3">Platforms</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                      {filteredSocialData.slice(0, 6).map((item) => (
                        <tr key={item._id} className="bg-slate-900/45">
                          <td className="max-w-[320px] px-4 py-3">
                            {(item.message || "").slice(0, 72)}
                            {(item.message || "").length > 72 ? "..." : ""}
                          </td>
                          <td className="px-4 py-3">
                            {(item.platforms || []).join(", ") || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                className="rounded-full bg-emerald-500/15 p-2 text-emerald-100 transition hover:bg-emerald-500/25"
                                onClick={() => setSelectedItem(item)}
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="rounded-full bg-rose-500/15 p-2 text-rose-100 transition hover:bg-rose-500/25"
                                onClick={() => handleDelete(item._id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!loading && filteredSocialData.length === 0 && (
                  <div className="border-t border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
                    No social records matched the current search.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Quick Actions
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Core admin routes
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <button
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-left text-sm text-slate-200 transition hover:bg-slate-950/75"
                  onClick={() => navigate("/admin/assignments")}
                >
                  <span>Manage assignments</span>
                  <ArrowRight size={15} className="text-slate-500" />
                </button>
                <button
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-left text-sm text-slate-200 transition hover:bg-slate-950/75"
                  onClick={() => navigate("/admin/users")}
                >
                  <span>Manage users</span>
                  <ArrowRight size={15} className="text-slate-500" />
                </button>
                <button
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-left text-sm text-slate-200 transition hover:bg-slate-950/75"
                  onClick={() => navigate("/social")}
                >
                  <span>Open social post form</span>
                  <ArrowRight size={15} className="text-slate-500" />
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Pending Reviews
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Recent submissions
              </h3>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                    Loading submissions...
                  </div>
                ) : recentSubmissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 p-5 text-sm text-slate-400">
                    No submissions available yet.
                  </div>
                ) : (
                  recentSubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {submission.assignmentId?.title || "Assignment"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {submission.userId?.name || "User"} • Revision{" "}
                        {submission.revision}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-100">
                          {submission.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/50">
            <h2 className="text-xl font-semibold text-white">
              Submission Details
            </h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Message
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white">
                  {selectedItem.message || "No message provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Platforms
                </p>
                <p className="mt-2">
                  {(selectedItem.platforms || []).join(", ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Created
                </p>
                <p className="mt-2">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
