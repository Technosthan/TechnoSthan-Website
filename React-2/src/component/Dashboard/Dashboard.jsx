import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  FolderUp,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMyAssignments } from "../../lib/assignments";
import { getStoredUser } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import AdminLayout from "../AdminLayout/AdminLayout";
import {
  EmptyState,
  GlassPanel,
  NotificationPanel,
  ProgressCard,
  PriorityBadge,
  SectionHeading,
  SkeletonList,
  StatCard,
  StatusBadge,
  Timeline,
} from "./DashboardWidgets";
import {
  buildAssignmentActivity,
  getProgressValue,
  getRelativeDeadlineLabel,
} from "./dashboardHelpers";

function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState({
    total: 0,
    submitted: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(getStoredUser());
  const { canAccessFeature } = useWorkspaceAccess();
  const canAccessAssignments = canAccessFeature("assignmentsEnabled");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setUser(getStoredUser());

        if (!canAccessAssignments) {
          setAssignments([]);
          setAssignmentAnalytics({
            total: 0,
            submitted: 0,
            completed: 0,
            overdue: 0,
          });
          return;
        }

        const assignmentsResponse = await getMyAssignments({
          page: 1,
          limit: 8,
          sortBy: "deadline",
          sortOrder: "asc",
        });

        setAssignments(assignmentsResponse.data || []);
        setAssignmentAnalytics(assignmentsResponse.analytics || {});
      } catch (error) {
        console.error("Dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [canAccessAssignments]);

  const inProgressCount = useMemo(
    () =>
      assignments.filter((assignment) => assignment.status === "in_progress")
        .length,
    [assignments],
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Assigned",
        value: assignmentAnalytics.total ?? 0,
        tone: "from-cyan-500/20 to-cyan-400/5",
        trend: "Active workload",
        hint: "All current assignments",
        icon: BriefcaseBusiness,
      },
      {
        label: "In Progress",
        value: inProgressCount,
        tone: "from-blue-500/20 to-blue-400/5",
        trend: "Momentum",
        hint: "Tasks you are actively moving",
        icon: Sparkles,
      },
      {
        label: "Submitted",
        value: assignmentAnalytics.submitted ?? 0,
        tone: "from-violet-500/20 to-violet-400/5",
        trend: "Awaiting review",
        hint: "Shared with HR for feedback",
        icon: FolderUp,
      },
      {
        label: "Completed",
        value: assignmentAnalytics.completed ?? 0,
        tone: "from-emerald-500/20 to-emerald-400/5",
        trend: "Closed tasks",
        hint: "Finished and approved work",
        icon: CircleCheckBig,
      },
      {
        label: "Overdue",
        value: assignmentAnalytics.overdue ?? 0,
        tone: "from-rose-500/20 to-rose-400/5",
        trend: "Needs attention",
        hint: "Deadlines that have slipped",
        icon: Clock3,
      },
    ],
    [assignmentAnalytics, inProgressCount],
  );

  const upcomingAssignments = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 4),
    [assignments],
  );

  const activityItems = useMemo(
    () =>
      assignments
        .flatMap((assignment) => buildAssignmentActivity(assignment, "HR"))
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6),
    [assignments],
  );

  const notifications = useMemo(() => {
    const items = [];
    const now = new Date().getTime();

    const overdueAssignment = assignments.find((assignment) => {
      const deadline = assignment.deadline
        ? new Date(assignment.deadline).getTime()
        : null;
      return deadline && deadline < now && assignment.status !== "completed";
    });

    if (overdueAssignment) {
      items.push({
        id: "overdue",
        title: "An assignment is overdue",
        message: `${overdueAssignment.title} needs attention right away.`,
        time: overdueAssignment.deadline,
        tone: "rose",
        icon: <Bell size={16} />,
      });
    }

    const submittedAssignment = assignments.find(
      (assignment) => assignment.status === "submitted",
    );
    if (submittedAssignment) {
      items.push({
        id: "submitted",
        title: "Submission waiting for review",
        message: `${submittedAssignment.title} has been submitted and is waiting for HR feedback.`,
        time:
          submittedAssignment.lastSubmittedAt || submittedAssignment.updatedAt,
        tone: "violet",
      });
    }

    const completedAssignment = assignments.find(
      (assignment) => assignment.status === "completed",
    );
    if (completedAssignment) {
      items.push({
        id: "completed",
        title: "Task approved",
        message: `${completedAssignment.title} was marked completed.`,
        time: completedAssignment.completedAt || completedAssignment.updatedAt,
        tone: "emerald",
      });
    }

    return items;
  }, [assignments]);

  const progressCards = useMemo(
    () =>
      upcomingAssignments.slice(0, 3).map((assignment) => ({
        title: assignment.title,
        value: getProgressValue(assignment),
        meta:
          assignment.status === "submitted"
            ? "Submitted and waiting for review"
            : getRelativeDeadlineLabel(assignment.deadline),
      })),
    [upcomingAssignments],
  );

  return (
    <AdminLayout
      
    >
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_36%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/75">
                Personal Workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Welcome back, {user?.name || "Team Member"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Track assignments, submit work, and monitor your progress from
                one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:text-white sm:h-11 sm:px-5 sm:text-sm"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>

              {canAccessAssignments ? (
                <Link
                  to="/my-assignments"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-cyan-500 px-4 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01] sm:h-11 sm:px-5 sm:text-sm"
                >
                  My Assignments
                  <ArrowRight size={14} className="hidden sm:inline" />
                </Link>
              ) : null}
            </div>
          </div>
        </GlassPanel>

        <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {summaryCards.map((card, index) => (
            <StatCard key={card.label} delay={index * 0.04} {...card} />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Upcoming Assignments"
              title="Your next priorities"
              description="Deadlines and progress at a glance."
              action={
                canAccessAssignments ? (
                  <Link
                    to="/my-assignments"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] sm:px-4 sm:py-2"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>
                ) : null
              }
            />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="md:col-span-1">
                    <SkeletonList rows={1} />
                  </div>
                ))
              ) : !canAccessAssignments ? (
                <div className="md:col-span-2">
                  <EmptyState
                    title="Assignments are unavailable"
                    message="This workspace does not currently have assignment access enabled."
                  />
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="md:col-span-2">
                  <EmptyState
                    title="No assignments yet"
                    message="When new work is assigned, it will appear here with progress tracking and quick access."
                  />
                </div>
              ) : (
                upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-[24px] border border-white/10 bg-slate-950/55 p-3.5 transition hover:border-white/15 hover:bg-slate-950/70 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {assignment.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {getRelativeDeadlineLabel(assignment.deadline)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-wrap justify-end gap-1">
                        <PriorityBadge
                          priority={assignment.priority}
                          className="text-[10px]"
                        />
                        <StatusBadge
                          status={assignment.status}
                          className="text-[10px]"
                        />
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                      {assignment.description}
                    </p>

                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <span>Progress</span>
                        <span className="font-medium text-slate-200">
                          {getProgressValue(assignment)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                          style={{ width: `${getProgressValue(assignment)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">
                        {assignment.status === "submitted"
                          ? "HR review"
                          : assignment.status === "completed"
                            ? "Done"
                            : "In progress"}
                      </span>
                      <Link
                        to="/my-assignments"
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        Open
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          <div className="space-y-5">
            <GlassPanel compact>
              <SectionHeading
                eyebrow="Alerts"
                title="Stay on track"
                className="gap-2 sm:gap-3"
              />
              <div className="mt-3">
                <NotificationPanel items={notifications} />
              </div>
            </GlassPanel>

            <GlassPanel compact>
              <SectionHeading
                eyebrow="Progress"
                title="Top tasks"
                className="gap-2 sm:gap-3"
              />
              <div className="mt-3 space-y-2">
                {progressCards.length > 0 ? (
                  progressCards.map((card) => (
                    <ProgressCard key={card.title} {...card} />
                  ))
                ) : (
                  <EmptyState
                    title="No tasks"
                    message="Active assignments will appear here."
                  />
                )}
              </div>
            </GlassPanel>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Activity Timeline"
              title="Recent movement"
              description="Track submissions, reviews, and completions in sequence."
            />
            <div className="mt-4">
              <Timeline
                items={activityItems}
                emptyTitle="No activity yet"
                emptyMessage="Assignment events will show here as work progresses."
              />
            </div>
          </GlassPanel>

          <GlassPanel compact>
            <SectionHeading
              eyebrow="Quick Tips"
              title="Workspace guide"
              className="gap-2"
            />
            <div className="mt-3 space-y-2">
              <div className="rounded-[18px] border border-white/10 bg-slate-950/50 px-3 py-2.5 text-xs leading-5 text-slate-300">
                <p className="font-semibold text-white">📤 Upload files</p>
                <p className="mt-0.5">
                  Open assignments to drag, drop, and resubmit work.
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-slate-950/50 px-3 py-2.5 text-xs leading-5 text-slate-300">
                <p className="font-semibold text-white">✏️ Track status</p>
                <p className="mt-0.5">
                  Pending, approved, and revision states are visible.
                </p>
              </div>
              <Link
                to="/my-assignments"
                className="sticky bottom-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
              >
                Open workspace
                <ArrowRight size={13} />
              </Link>
            </div>
          </GlassPanel>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
