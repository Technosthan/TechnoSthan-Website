import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCheck,
  ClipboardList,
  Gauge,
  Layers3,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout/AdminLayout";
import { getAssignments, getSubmissionMonitor } from "../../lib/assignments";
import { useToast } from "../Toast/ToastProvider";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import {
  DashboardActionLink,
  EmptyState,
  GlassPanel,
  MiniAnalyticsCard,
  NotificationPanel,
  PriorityBadge,
  SectionHeading,
  SkeletonList,
  StatCard,
  StatusBadge,
  Timeline,
} from "../Dashboard/DashboardWidgets";
import {
  buildAssignmentActivity,
  createSparklineData,
  getRelativeDeadlineLabel,
  getRelativeTimeLabel,
} from "../Dashboard/dashboardHelpers";

const HRDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canAccessFeature } = useWorkspaceAccess();
  const [analytics, setAnalytics] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const canAccessAssignments = canAccessFeature("assignmentsEnabled");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!canAccessAssignments) {
          setAnalytics(null);
          setRecentAssignments([]);
          setRecentSubmissions([]);
          return;
        }

        const [assignmentsResponse, submissionsResponse] = await Promise.all([
          getAssignments({
            page: 1,
            limit: 6,
            sortBy: "updatedAt",
            sortOrder: "desc",
          }),
          getSubmissionMonitor({ page: 1, limit: 6 }),
        ]);

        setAnalytics(assignmentsResponse.analytics);
        setRecentAssignments(assignmentsResponse.data || []);
        setRecentSubmissions(submissionsResponse.data || []);
      } catch (error) {
        showToast({
          title: "Unable to load HR dashboard",
          message: error.response?.data?.message || "Please try again shortly.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [canAccessAssignments, showToast]);

  const cards = useMemo(
    () => [
      {
        label: "Managed Assignments",
        value: analytics?.total ?? 0,
        tone: "from-sky-500/20 to-sky-400/5",
        trend: `${analytics?.completed ?? 0} completed`,
        hint: "Current workload in motion",
        icon: BriefcaseBusiness,
      },
      {
        label: "Review Queue",
        value: analytics?.submissions?.submitted ?? 0,
        tone: "from-violet-500/20 to-violet-400/5",
        trend: `${recentSubmissions.length} recent`,
        hint: "Needs response from HR",
        icon: ClipboardList,
      },
      {
        label: "Completion Rate",
        value:
          analytics?.total > 0
            ? `${Math.round(((analytics.completed ?? 0) / analytics.total) * 100)}%`
            : "0%",
        tone: "from-emerald-500/20 to-emerald-400/5",
        trend: `${analytics?.submissions?.approved ?? 0} approved`,
        hint: "Reviewed and cleared",
        icon: Gauge,
      },
      {
        label: "Rejection Rate",
        value:
          (analytics?.submissions?.submitted ?? 0) +
            (analytics?.submissions?.approved ?? 0) +
            (analytics?.submissions?.rejected ?? 0) >
          0
            ? `${Math.round(
                ((analytics?.submissions?.rejected ?? 0) /
                  ((analytics?.submissions?.submitted ?? 0) +
                    (analytics?.submissions?.approved ?? 0) +
                    (analytics?.submissions?.rejected ?? 0))) *
                  100,
              )}%`
            : "0%",
        tone: "from-rose-500/20 to-rose-400/5",
        trend: `${analytics?.submissions?.rejected ?? 0} rejected`,
        hint: "Needs coaching or revision",
        icon: TrendingUp,
      },
    ],
    [analytics, recentSubmissions.length],
  );

  const quickActions = [
    {
      label: "Create Assignment",
      description: "Launch new work for the team.",
      icon: BriefcaseBusiness,
      onClick: () => navigate("/hr/assignments"),
    },
    {
      label: "Review Submissions",
      description: "Clear the pending review queue.",
      icon: ClipboardList,
      onClick: () => navigate("/hr/assignments"),
    },
    {
      label: "Pending Reviews",
      description: `${analytics?.submissions?.submitted ?? 0} awaiting action.`,
      icon: CheckCheck,
      onClick: () => navigate("/hr/assignments"),
    },
    {
      label: "Employee Activity",
      description: "Check the latest delivery updates.",
      icon: Layers3,
      onClick: () => navigate("/hr/assignments"),
    },
    {
      label: "Team Performance",
      description: "See progress and completion rhythm.",
      icon: ListTodo,
      onClick: () => navigate("/hr/assignments"),
    },
  ];

  const analyticsCards = useMemo(
    () => [
      {
        label: "Active Assignments",
        value: `${Math.max(
          0,
          (analytics?.total ?? 0) - (analytics?.completed ?? 0),
        )}`,
        delta: `${analytics?.overdue ?? 0} overdue`,
        chartData: createSparklineData([
          analytics?.total ?? 0,
          analytics?.completed ?? 0,
          analytics?.submissions?.submitted ?? 0,
          analytics?.submissions?.approved ?? 0,
        ]),
        tone: "#38bdf8",
      },
      {
        label: "Approval Queue",
        value: `${analytics?.submissions?.approved ?? 0}`,
        delta: `${analytics?.submissions?.submitted ?? 0} pending`,
        chartData: createSparklineData([
          analytics?.submissions?.submitted ?? 0,
          analytics?.submissions?.approved ?? 0,
          analytics?.submissions?.rejected ?? 0,
          recentSubmissions.length,
        ]),
        tone: "#818cf8",
      },
    ],
    [analytics, recentSubmissions.length],
  );

  const activityItems = useMemo(
    () =>
      [
        ...recentAssignments.flatMap((assignment) =>
          buildAssignmentActivity(assignment, "HR"),
        ),
        ...recentSubmissions.map((submission) => ({
          id: submission._id,
          title: "Submission received",
          description: `${submission.userId?.name || "User"} submitted ${
            submission.assignmentId?.title || "an assignment"
          }.`,
          time: submission.submittedAt,
          tone: submission.status === "approved" ? "emerald" : "violet",
        })),
      ]
        .filter(Boolean)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6),
    [recentAssignments, recentSubmissions],
  );

  const notifications = useMemo(
    () =>
      [
        {
          id: "pending",
          title: "Pending submission reviews",
          message: `${analytics?.submissions?.submitted ?? 0} submissions need an HR decision.`,
          time: recentSubmissions[0]?.submittedAt || new Date().toISOString(),
          tone: "amber",
        },
        {
          id: "rejected",
          title: "Needs revision follow-up",
          message: `${analytics?.submissions?.rejected ?? 0} items require revision guidance.`,
          time: recentSubmissions.find((item) => item.status === "rejected")
            ?.submittedAt,
          tone: "rose",
        },
      ].filter((item) =>
        item.id === "pending"
          ? (analytics?.submissions?.submitted ?? 0) > 0
          : (analytics?.submissions?.rejected ?? 0) > 0,
      ),
    [analytics, recentSubmissions],
  );

  const priorityQueue = useMemo(
    () =>
      [...recentAssignments]
        .sort((a, b) => {
          const urgencyA =
            a.priority === "urgent" ? 2 : a.priority === "high" ? 1 : 0;
          const urgencyB =
            b.priority === "urgent" ? 2 : b.priority === "high" ? 1 : 0;
          if (urgencyA !== urgencyB) {
            return urgencyB - urgencyA;
          }
          return new Date(a.deadline) - new Date(b.deadline);
        })
        .slice(0, 5),
    [recentAssignments],
  );

  return (
    <AdminLayout
      title="HR Workspace"
      subtitle="Manage assignments, reviews, and team delivery from one focused workspace."
    >
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,0.12),_transparent_38%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.3em] text-violet-200/75">
                HR Operations
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Assignment & Review Center
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review queue, pending work, and team performance in one
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-4 text-xs font-medium text-slate-200 transition hover:bg-slate-950/75 sm:h-11 sm:px-5 sm:text-sm"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                className="inline-flex h-10 items-center rounded-full bg-cyan-500 px-4 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 sm:h-11 sm:px-5 sm:text-sm"
                onClick={() => navigate("/hr/assignments")}
              >
                Assignment Center
              </button>
            </div>
          </div>
        </GlassPanel>

        <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, index) => (
            <StatCard key={card.label} delay={index * 0.05} {...card} />
          ))}
        </div>

        <GlassPanel>
          <SectionHeading
            eyebrow="Quick Actions"
            title="HR shortcuts"
            className="gap-2"
          />
          <div className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -2 }}
                  className="rounded-[20px] border border-white/10 bg-slate-950/55 p-3 sm:p-4 text-left text-xs sm:text-sm transition hover:border-white/15 hover:bg-slate-950/70"
                  onClick={item.onClick}
                >
                  <span className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-violet-500/15 text-violet-100">
                    <Icon size={16} />
                  </span>
                  <p className="mt-2 sm:mt-3 font-semibold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 leading-5 text-slate-400">
                    {item.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </GlassPanel>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Recent Submissions"
              title="Review queue"
              description="See who submitted, what needs review, and where action is urgent."
              action={
                <DashboardActionLink
                  onClick={() => navigate("/hr/assignments")}
                >
                  Review all
                </DashboardActionLink>
              }
            />

            <div className="mt-5 space-y-3">
              {loading ? (
                <SkeletonList rows={4} />
              ) : !canAccessAssignments ? (
                <EmptyState
                  title="Assignments are disabled"
                  message="This workspace cannot access assignment workflows right now."
                />
              ) : recentSubmissions.length === 0 ? (
                <EmptyState
                  title="No submissions yet"
                  message="Once users submit their work, this queue will show employee, assignment, review status, and review shortcuts."
                />
              ) : (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-4 transition hover:border-white/15 hover:bg-slate-950/70"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {submission.assignmentId?.title || "Assignment"}
                          </p>
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
                        <p className="mt-2 text-sm text-slate-400">
                          {submission.userId?.name || "Employee"} submitted{" "}
                          {getRelativeTimeLabel(submission.submittedAt)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Review status:{" "}
                          {submission.status === "approved"
                            ? "Approved"
                            : submission.status === "rejected"
                              ? "Needs Revision"
                              : "Pending"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                          onClick={() => navigate("/hr/assignments")}
                        >
                          Quick Review
                        </button>
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
                eyebrow="HR Analytics"
                title="Performance snapshot"
              />
              <div className="mt-4 grid gap-3">
                {analyticsCards.map((card) => (
                  <MiniAnalyticsCard key={card.label} {...card} />
                ))}
              </div>
            </GlassPanel>

            <GlassPanel compact>
              <SectionHeading
                eyebrow="Notifications"
                title="Review workflow indicators"
              />
              <div className="mt-4">
                <NotificationPanel items={notifications} />
              </div>
            </GlassPanel>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Recent Assignment Updates"
              title="Activity feed"
              description="A live view of newly assigned, submitted, and reviewed work."
            />
            <div className="mt-4">
              <Timeline
                items={activityItems}
                emptyTitle="No recent updates"
                emptyMessage="Assignment updates and reviews will appear here once work starts moving."
              />
            </div>
          </GlassPanel>

          <div className="space-y-5">
            <GlassPanel compact>
              <SectionHeading
                eyebrow="Priority Queue"
                title="Urgent tasks first"
              />
              <div className="mt-4 space-y-3">
                {loading ? (
                  <SkeletonList rows={4} compact />
                ) : priorityQueue.length === 0 ? (
                  <EmptyState
                    title="No active queue"
                    message="Urgent and high-priority assignments will surface here automatically."
                  />
                ) : (
                  priorityQueue.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="rounded-[22px] border border-white/10 bg-slate-950/55 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {assignment.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {assignment.assignedTo?.name ||
                              assignment.assignedToRole}
                          </p>
                        </div>
                        <PriorityBadge priority={assignment.priority} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>
                          {getRelativeDeadlineLabel(assignment.deadline)}
                        </span>
                        <StatusBadge
                          status={assignment.status}
                          className="text-[11px]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>

            <GlassPanel compact>
              <SectionHeading
                eyebrow="Approval Queue"
                title="Recent assignment updates"
              />
              <div className="mt-4 space-y-3">
                {loading ? (
                  <SkeletonList rows={3} compact />
                ) : recentAssignments.length === 0 ? (
                  <EmptyState
                    title="No assignment updates"
                    message="As assignments are created or progress changes, recent updates will fill this queue."
                  />
                ) : (
                  recentAssignments.slice(0, 4).map((assignment) => (
                    <div
                      key={assignment._id}
                      className="rounded-[22px] border border-white/10 bg-slate-950/55 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {assignment.title}
                        </p>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Updated {getRelativeTimeLabel(assignment.updatedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HRDashboard;
