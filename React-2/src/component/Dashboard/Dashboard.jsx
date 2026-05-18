import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAssignments } from "../../lib/assignments";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import AdminLayout from "../AdminLayout/AdminLayout";

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

  const role = normalizeRole(user?.role);

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
          limit: 6,
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

  const summaryCards = useMemo(
    () => [
      {
        label: "My Tasks",
        value: assignmentAnalytics.total ?? 0,
        tone: "from-cyan-500/20 to-cyan-400/5",
      },
      {
        label: "Submitted",
        value: assignmentAnalytics.submitted ?? 0,
        tone: "from-violet-500/20 to-violet-400/5",
      },
      {
        label: "Completed",
        value: assignmentAnalytics.completed ?? 0,
        tone: "from-emerald-500/20 to-emerald-400/5",
      },
      {
        label: "Overdue",
        value: assignmentAnalytics.overdue ?? 0,
        tone: "from-rose-500/20 to-rose-400/5",
      },
    ],
    [assignmentAnalytics],
  );

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your current tasks and progress."
    >
      <div className="space-y-5">

        {/* TOP HERO SECTION */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-5 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT CONTENT */}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Personal Workspace
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Welcome back, {user?.name || "Team Member"}
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Focus on your assignments, track submissions, and manage daily workflow efficiently.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2">

              {/* HOME BUTTON */}
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-cyan-400/30 hover:text-white"
              >
                ← Home
              </Link>

              {/* ASSIGNMENTS BUTTON */}
              {canAccessAssignments && (
                <Link
                  to="/my-assignments"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02]"
                >
                  Open My Assignments
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border border-white/10 bg-gradient-to-br ${card.tone} px-4 py-4 shadow-sm`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ASSIGNMENTS SECTION */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-sm">
          
          {/* SECTION HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Current Work
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Upcoming Assignments
              </h2>
            </div>

            {canAccessAssignments && (
              <Link
                to="/my-assignments"
                className="inline-flex items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-all duration-200 hover:bg-cyan-500/20"
              >
                View All Assignments
              </Link>
            )}
          </div>

          {/* ASSIGNMENT LIST */}
          <div className="mt-3 space-y-2">

            {loading ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                Loading assignments...
              </div>
            ) : !canAccessAssignments ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/45 p-4 text-sm text-slate-400">
                Assignments are not enabled for your account.
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/45 p-4 text-sm text-slate-400">
                No assignments yet.
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="flex items-start justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 transition-all duration-200 hover:border-cyan-400/20 hover:bg-slate-950/60"
                >

                  {/* LEFT SIDE */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {assignment.title}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {assignment.description}
                    </p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="ml-4 flex shrink-0 flex-col items-end gap-1">

                    <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-medium capitalize text-yellow-300">
                      {assignment.status?.replace("_", " ")}
                    </span>

                    <div className="text-[11px] text-slate-500">
                      Due{" "}
                      {assignment.deadline
                        ? new Date(
                            assignment.deadline
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
