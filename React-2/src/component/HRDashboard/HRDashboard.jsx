import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../AdminLayout/AdminLayout";
import { getAssignments } from "../../lib/assignments";
import { useToast } from "../Toast/ToastProvider";

const HRDashboard = () => {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getAssignments({ page: 1, limit: 5 });
        setAnalytics(response.analytics);
        setRecentAssignments(response.data || []);
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
  }, [showToast]);

  const cards = useMemo(
    () => [
      { label: "Managed Assignments", value: analytics?.total ?? 0, tone: "from-sky-500/20 to-sky-400/5" },
      { label: "Submitted Work", value: analytics?.submissions?.submitted ?? 0, tone: "from-violet-500/20 to-violet-400/5" },
      { label: "Approved Work", value: analytics?.submissions?.approved ?? 0, tone: "from-emerald-500/20 to-emerald-400/5" },
      { label: "Rejected Work", value: analytics?.submissions?.rejected ?? 0, tone: "from-rose-500/20 to-rose-400/5" },
    ],
    [analytics],
  );

  return (
    <AdminLayout
      title="HR Workspace"
     
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.tone} px-4 py-4 shadow-lg shadow-slate-950/25`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recent Assignment Activity</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Live managed workload</h2>
              </div>
              <Link
                to="/hr/assignments"
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25"
              >
                Open Assignment Center
              </Link>
              <Link
      to="/"
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-cyan-400/30 hover:text-white"
    >
      ← Back to Home
    </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Loading activity...
                </div>
              ) : recentAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-sm text-slate-400">
                  No assignments are available yet.
                </div>
              ) : (
                recentAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">{assignment.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Deadline {new Date(assignment.deadline).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                          {assignment.assignedToRole}
                        </span>
                        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-100">
                          {assignment.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">HR Focus</p>
            <h2 className="mt-2 text-lg font-semibold text-white">What needs attention</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                <p className="text-slate-500">Pending submission reviews</p>
                <p className="mt-1 text-2xl font-semibold text-white">{analytics?.submissions?.submitted ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                <p className="text-slate-500">Rejected work to revisit</p>
                <p className="mt-1 text-2xl font-semibold text-white">{analytics?.submissions?.rejected ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
                <p className="text-slate-500">Approved work completed</p>
                <p className="mt-1 text-2xl font-semibold text-white">{analytics?.submissions?.approved ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HRDashboard;
