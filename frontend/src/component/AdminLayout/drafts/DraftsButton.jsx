const DraftsButton = ({ count = 0, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
    >
      <span>Your Drafts</span>
      {count > 0 ? (
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-200">
          {count}
        </span>
      ) : null}
    </button>
  );
};

export default DraftsButton;
