import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDailyTaskBellNotifications from "../../hooks/useDailyTaskBellNotifications";
import { getDailyTasksPath, getStoredUser, normalizeRole } from "../../utils/auth";

const AdminNavbar = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = normalizeRole(user?.role);

  const { unreadCount, acknowledgeDailyTasks } =
    useDailyTaskBellNotifications({
      enabled: role !== "ADMIN",
    });

  const handleBellClick = async () => {
    try {
      await acknowledgeDailyTasks();
    } finally {
      navigate(getDailyTasksPath(role));
    }
  };

  return (
    <div className="mb-5 rounded-[24px] border border-white/8 bg-white/[0.02] px-4 py-4 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.95)] backdrop-blur sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 pl-12 xl:pl-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Workspace Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>

        {role !== "ADMIN" ? (
          <button
            type="button"
            onClick={handleBellClick}
            className="relative mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
            aria-label="Open daily task notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AdminNavbar;
