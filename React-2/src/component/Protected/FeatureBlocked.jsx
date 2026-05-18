const FeatureBlocked = ({
  title = "Feature unavailable",
  message = "This workspace feature is currently disabled or unavailable for your account.",
}) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-10 text-white">
    <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-slate-900/75 p-8 shadow-2xl shadow-slate-950/40">
      <p className="text-xs uppercase tracking-[0.28em] text-indigo-300/80">
        Workspace Access
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-400">{message}</p>
    </div>
  </div>
);

export default FeatureBlocked;
