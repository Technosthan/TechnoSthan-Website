const AdminNavbar = ({ title, subtitle }) => (
  <div className="mb-5 rounded-[24px] border border-white/8 bg-white/[0.02] px-4 py-4 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.95)] backdrop-blur sm:px-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
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
    </div>
  </div>
);

export default AdminNavbar;
