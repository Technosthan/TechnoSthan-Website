const AdminNavbar = ({ title, subtitle }) => (
  <div className="mb-4 border-b border-white/10 pb-4">
    <h1 className="text-2xl font-semibold text-white md:text-[2rem]">{title}</h1>
    {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
  </div>
);

export default AdminNavbar;
