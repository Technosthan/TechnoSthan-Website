import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCheck,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout/AdminLayout";
import api from "../../lib/api";
import { getAssignments, getSubmissionMonitor } from "../../lib/assignments";
import { useToast } from "../Toast/ToastProvider";
import useDashboardNotifications from "../../hooks/useDashboardNotifications";
import {
  DashboardActionLink,
  EmptyState,
  GlassPanel,
  MiniAnalyticsCard,
  NotificationPanel,
  SectionHeading,
  StatCard,
  Timeline,
} from "../Dashboard/DashboardWidgets";
import {
  buildAssignmentActivity,
  createSparklineData,
  getRelativeDeadlineLabel,
  getRelativeTimeLabel,
} from "../Dashboard/dashboardHelpers";
import { PriorityBadge, StatusBadge } from "../Dashboard/DashboardWidgets";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canAccessFeature } = useWorkspaceAccess();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [socialData, setSocialData] = useState([]);
  const [filteredSocialData, setFilteredSocialData] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState(null);
  const { notifications: taskNotifications } = useDashboardNotifications({
    enabled: true,
    onNewNotification: (notification) =>
      showToast({
        title: notification.title,
        message: notification.message,
        type: "info",
      }),
  });

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
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        getSubmissionMonitor({ page: 1, limit: 6 }),
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
        trend: `${userAnalytics?.admins ?? 0} admins`,
        hint: "Across all active roles",
        icon: Users,
      },
      {
        label: "Employees",
        value: userAnalytics?.users ?? "-",
        tone: "from-indigo-500/20 to-indigo-400/5",
        trend: `${userAnalytics?.hrs ?? 0} HR`,
        hint: "Delivery capacity today",
        icon: Sparkles,
      },
      {
        label: "Open Assignments",
        value:
          assignmentAnalytics == null
            ? "-"
            : (assignmentAnalytics.total || 0) -
              (assignmentAnalytics.completed || 0),
        tone: "from-violet-500/20 to-violet-400/5",
        trend: `${assignmentAnalytics?.overdue ?? 0} overdue`,
        hint: "Needs active follow-up",
        icon: Activity,
      },
      {
        label: "Pending Reviews",
        value: assignmentAnalytics?.submissions?.submitted ?? 0,
        tone: "from-amber-500/20 to-amber-400/5",
        trend: `${recentSubmissions.length} recent`,
        hint: "Submission queue awaiting action",
        icon: CheckCheck,
      },
    ],
    [assignmentAnalytics, recentSubmissions.length, userAnalytics],
  );

  const productivityCards = useMemo(
    () => [
      {
        label: "Completion Rate",
        value:
          assignmentAnalytics?.total > 0
            ? `${Math.round(
                ((assignmentAnalytics.completed || 0) /
                  assignmentAnalytics.total) *
                  100,
              )}%`
            : "0%",
        delta: `${assignmentAnalytics?.completed ?? 0} closed`,
        chartData: createSparklineData([
          assignmentAnalytics?.total ?? 0,
          assignmentAnalytics?.submitted ?? 0,
          assignmentAnalytics?.completed ?? 0,
          assignmentAnalytics?.submissions?.approved ?? 0,
        ]),
        tone: "#22d3ee",
      },
      {
        label: "Review Velocity",
        value: `${assignmentAnalytics?.submissions?.approved ?? 0}`,
        delta: `${assignmentAnalytics?.submissions?.submitted ?? 0} waiting`,
        chartData: createSparklineData([
          assignmentAnalytics?.submissions?.submitted ?? 0,
          assignmentAnalytics?.submissions?.approved ?? 0,
          assignmentAnalytics?.submissions?.rejected ?? 0,
          recentSubmissions.length,
        ]),
        tone: "#818cf8",
      },
    ],
    [assignmentAnalytics, recentSubmissions.length],
  );

  const activityItems = useMemo(
    () =>
      [
        ...recentAssignments.flatMap((assignment) =>
          buildAssignmentActivity(assignment, "Admin"),
        ),
        ...recentSubmissions.map((submission) => ({
          id: submission._id,
          title: "Submission reviewed queue updated",
          description: `${submission.userId?.name || "User"} submitted ${
            submission.assignmentId?.title || "an assignment"
          }.`,
          time: submission.submittedAt,
          tone: "violet",
        })),
      ]
        .filter(Boolean)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6),
    [recentAssignments, recentSubmissions],
  );

  const notifications = useMemo(() => {
    const items = [...taskNotifications];

    if ((assignmentAnalytics?.overdue ?? 0) > 0) {
      items.push({
        id: "overdue",
        title: `${assignmentAnalytics.overdue} overdue assignments`,
        message:
          "A few deadlines have slipped and need prioritization or reassignment.",
        time: new Date().toISOString(),
        tone: "rose",
      });
    }

    if ((assignmentAnalytics?.submissions?.submitted ?? 0) > 0) {
      items.push({
        id: "reviews",
        title: "Submission review queue active",
        message: `${assignmentAnalytics.submissions.submitted} submissions are waiting for feedback.`,
        time: recentSubmissions[0]?.submittedAt || new Date().toISOString(),
        tone: "amber",
      });
    }

    if (recentAssignments[0]) {
      items.push({
        id: "latest-assignment",
        title: "New assignment created",
        message: `${recentAssignments[0].title} was added to the operations queue.`,
        time: recentAssignments[0].createdAt,
        tone: "cyan",
      });
    }

    return items;
  }, [
    assignmentAnalytics,
    recentAssignments,
    recentSubmissions,
    taskNotifications,
  ]);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_35%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/75">
                Enterprise Operations
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Admin Control Center
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Assignments, submissions, team activity, and operations in one
                view.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 lg:justify-end">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-950/75 sm:h-11 sm:px-4 sm:text-sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-950/75 sm:h-11 sm:px-4 sm:text-sm"
                onClick={fetchData}
              >
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-950/75 sm:h-11 sm:px-4 sm:text-sm"
                onClick={exportCSV}
              >
                <Download size={15} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                className="inline-flex h-10 items-center rounded-full bg-cyan-500 px-3 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 sm:h-11 sm:px-5 sm:text-sm"
                disabled={!canAccessFeature("assignmentsEnabled")}
                onClick={() => navigate("/admin/assignments")}
              >
                <span className="hidden sm:inline">Assignment Center</span>
                <span className="sm:hidden">Assignments</span>
              </button>
            </div>
          </div>
        </GlassPanel>

        <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {summaryCards.map((card, index) => (
            <StatCard key={card.label} delay={index * 0.05} {...card} />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Assignment Pipeline"
              title="Latest operational work"
              description="Recent assignments, due dates, and role coverage at a glance."
              action={
                <DashboardActionLink
                  onClick={() => navigate("/admin/assignments")}
                >
                  View all
                </DashboardActionLink>
              }
            />

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-[22px] border border-white/8 bg-slate-950/55 px-4 py-4"
                    >
                      <div className="h-4 w-40 rounded-full bg-white/10" />
                      <div className="mt-3 h-3 w-full rounded-full bg-white/5" />
                      <div className="mt-2 h-3 w-2/3 rounded-full bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : recentAssignments.length === 0 ? (
                <EmptyState
                  title="No assignments created yet"
                  message="Create a first assignment to activate the workspace and start routing work to the team."
                  action={
                    canAccessFeature("assignmentsEnabled") ? (
                      <button
                        className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
                        onClick={() => navigate("/admin/assignments")}
                      >
                        Create assignment
                      </button>
                    ) : null
                  }
                />
              ) : (
                recentAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 transition hover:border-white/15 hover:bg-slate-950/70"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {assignment.title}
                          </p>
                          <PriorityBadge priority={assignment.priority} />
                          <StatusBadge status={assignment.status} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                          {assignment.description}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:min-w-[280px]">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Assignee
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {assignment.assignedTo?.name ||
                              assignment.assignedToRole}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Deadline
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {getRelativeDeadlineLabel(assignment.deadline)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          <div className="space-y-5">
            <GlassPanel compact>
              <SectionHeading
                eyebrow="Team Productivity"
                title="Operational health"
              />
              <div className="mt-4 grid gap-3">
                {productivityCards.map((card) => (
                  <MiniAnalyticsCard key={card.label} {...card} />
                ))}
              </div>
            </GlassPanel>

            <GlassPanel compact>
              <SectionHeading
                eyebrow="Notifications"
                title="System alerts"
                description="Keep an eye on delivery risk and review pressure."
              />
              <div className="mt-4">
                <NotificationPanel items={notifications} />
              </div>
            </GlassPanel>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Social Records"
              title="Recent user actions"
              description="Filter the latest social entries without leaving the dashboard."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search message, platform, or date"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-slate-950/65 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 lg:max-w-sm"
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Platforms</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                    {filteredSocialData.slice(0, 6).map((item) => (
                      <tr
                        key={item._id}
                        className="bg-slate-900/45 hover:bg-white/[0.03]"
                      >
                        <td className="max-w-[320px] px-4 py-3">
                          {(item.message || "").slice(0, 72)}
                          {(item.message || "").length > 72 ? "..." : ""}
                        </td>
                        <td className="px-4 py-3">
                          {(item.platforms || []).join(", ") || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getRelativeTimeLabel(item.createdAt)}
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
              {!loading && filteredSocialData.length === 0 ? (
                <div className="border-t border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
                  No social records matched the current search.
                </div>
              ) : null}
            </div>
          </GlassPanel>

          <div className="space-y-5">
            <GlassPanel compact>
              <SectionHeading
                eyebrow="Recent Activity"
                title="Admin activity timeline"
              />
              <div className="mt-4">
                <Timeline
                  items={activityItems}
                  emptyTitle="No recent activity"
                  emptyMessage="New assignment, review, and submission events will show up here."
                />
              </div>
            </GlassPanel>

            <GlassPanel compact>
              <SectionHeading
                eyebrow="Pending Review Summary"
                title="Recent submissions"
              />
              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-[22px] border border-white/8 bg-slate-950/55 px-4 py-4"
                      >
                        <div className="h-4 w-32 rounded-full bg-white/10" />
                        <div className="mt-3 h-3 w-full rounded-full bg-white/5" />
                      </div>
                    ))}
                  </div>
                ) : recentSubmissions.length === 0 ? (
                  <EmptyState
                    title="No submissions yet"
                    message="As users submit assignment work, the latest review queue will appear here."
                  />
                ) : (
                  recentSubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="rounded-[22px] border border-white/10 bg-slate-950/55 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {submission.assignmentId?.title || "Assignment"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {submission.userId?.name || "User"} submitted
                            revision {submission.revision}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            submission.status === "approved"
                              ? "completed"
                              : submission.status === "submitted"
                                ? "submitted"
                                : "rejected"
                          }
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>
                          {getRelativeTimeLabel(submission.submittedAt)}
                        </span>
                        <span>
                          {submission.assignmentId?.deadline
                            ? getRelativeDeadlineLabel(
                                submission.assignmentId.deadline,
                              )
                            : "No deadline"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>

      {selectedItem ? (
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
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;
