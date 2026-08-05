import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FolderOpenDot,
  Sparkles,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  getPriorityStyle,
  getStatusStyle,
} from "../Assignments/assignmentUtils";
import {
  formatCompactDate,
  getRelativeTimeLabel,
  getUserInitials,
} from "./dashboardHelpers";

const toneClasses = {
  cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
  emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  amber: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  violet: "border-violet-400/20 bg-violet-500/10 text-violet-100",
  rose: "border-rose-400/20 bg-rose-500/10 text-rose-100",
  slate: "border-white/10 bg-white/5 text-slate-100",
};

const iconTones = {
  cyan: "bg-cyan-500/15 text-cyan-200",
  emerald: "bg-emerald-500/15 text-emerald-200",
  amber: "bg-amber-500/15 text-amber-200",
  violet: "bg-violet-500/15 text-violet-200",
  rose: "bg-rose-500/15 text-rose-200",
  slate: "bg-white/10 text-slate-200",
};

export const GlassPanel = ({
  children,
  className = "",
  compact = false,
}) => (
  <section
    className={`relative rounded-[26px] border border-white/10 bg-slate-900/70 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.9)] backdrop-blur-xl ${compact ? "p-4" : "p-5 lg:p-6"} ${className}`}
  >
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    <div className="relative">{children}</div>
  </section>
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  className = "",
}) => (
  <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}>
    <div className="min-w-0">
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const StatCard = ({
  label,
  value,
  tone = "from-cyan-500/20 to-cyan-400/5",
  trend,
  hint,
  icon: Icon = Sparkles,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ y: -3 }}
    className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${tone} p-4 shadow-[0_18px_60px_-30px_rgba(56,189,248,0.35)] transition duration-300 hover:border-white/15`}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_40%)] opacity-70" />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">
          {label}
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {value}
        </p>
        {(trend || hint) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {trend ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-slate-100">
                {trend}
              </span>
            ) : null}
            {hint ? <span className="text-slate-300">{hint}</span> : null}
          </div>
        )}
      </div>
      <span className="rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-white/90 transition duration-300 group-hover:scale-105 group-hover:bg-slate-950/45">
        <Icon size={18} />
      </span>
    </div>
  </motion.div>
);

export const StatusBadge = ({ status, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusStyle(
      status,
    )} ${className}`}
  >
    {String(status || "pending").replace("_", " ")}
  </span>
);

export const PriorityBadge = ({ priority, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getPriorityStyle(
      priority,
    )} ${className}`}
  >
    {priority || "medium"}
  </span>
);

export const AvatarStackItem = ({
  name,
  avatar,
  subtitle,
  trailing,
}) => (
  <div className="flex items-center gap-3">
    {avatar ? (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
      />
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100">
        {getUserInitials(name)}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white">{name}</p>
      {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
    </div>
    {trailing ? <div className="shrink-0">{trailing}</div> : null}
  </div>
);

export const ProgressStrip = ({
  value = 0,
  tone = "from-cyan-400 to-blue-500",
  label,
  compact = false,
}) => (
  <div>
    {label ? (
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-medium text-slate-200">{value}%</span>
      </div>
    ) : null}
    <div className={`overflow-hidden rounded-full bg-white/8 ${compact ? "h-2" : "h-2.5"}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tone} transition-[width] duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

export const EmptyState = ({
  icon: Icon = FolderOpenDot,
  title,
  message,
  action,
}) => (
  <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/45 px-5 py-8 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200">
      <Icon size={22} />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
      {message}
    </p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const Timeline = ({ items = [], emptyTitle, emptyMessage }) => {
  if (!items.length) {
    return (
      <EmptyState
        icon={Clock3}
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id || `${item.title}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClasses[item.tone || "slate"]}`}
            >
              {item.icon || <Clock3 size={16} />}
            </span>
            {index !== items.length - 1 ? (
              <span className="mt-2 h-full w-px bg-gradient-to-b from-white/15 to-transparent" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <span className="text-xs text-slate-500">
                {getRelativeTimeLabel(item.time)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationPanel = ({ items = [] }) => {
  if (!items.length) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        message="You are fully caught up. New alerts will appear here when action is needed."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id || `${item.title}-${index}`}
          className="rounded-[22px] border border-white/10 bg-slate-950/55 px-4 py-3.5 transition hover:border-white/15 hover:bg-slate-950/70"
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${iconTones[item.tone || "slate"]}`}
            >
              {item.icon || (item.tone === "rose" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <span className="text-xs text-slate-500">
                  {getRelativeTimeLabel(item.time)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                {item.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MiniAnalyticsCard = ({
  label,
  value,
  delta,
  chartData = [],
  tone = "#22d3ee",
}) => {
  const chartId = `mini-${String(label).replace(/\s+/g, "-").toLowerCase()}`;

  return (
  <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </div>
      {delta ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
          {delta}
        </span>
      ) : null}
    </div>
    <div className="mt-4 h-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={tone} stopOpacity={0.45} />
              <stop offset="95%" stopColor={tone} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={tone}
            strokeWidth={2}
            fill={`url(#${chartId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export const ProgressCard = ({
  title,
  value,
  meta,
  tone = "from-cyan-400 to-blue-500",
}) => (
  <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
      </div>
      <span className="text-lg font-semibold text-white">{value}%</span>
    </div>
    <div className="mt-4">
      <ProgressStrip value={value} tone={tone} />
    </div>
  </div>
);

export const SkeletonList = ({ rows = 3, compact = false }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse rounded-[22px] border border-white/8 bg-slate-950/55 ${compact ? "px-4 py-3" : "px-4 py-4"}`}
      >
        <div className="h-4 w-40 rounded-full bg-white/10" />
        <div className="mt-3 h-3 w-full rounded-full bg-white/5" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-white/5" />
      </div>
    ))}
  </div>
);

export const DashboardActionLink = ({ children, onClick, toLabel = "Open" }) => (
  <button
    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
    onClick={onClick}
  >
    {children || toLabel}
    <ArrowRight size={15} />
  </button>
);

export const DueDateText = ({ value, emphasize = false }) => (
  <span className={`${emphasize ? "text-rose-300" : "text-slate-400"} text-xs`}>
    {formatCompactDate(value)}
  </span>
);
