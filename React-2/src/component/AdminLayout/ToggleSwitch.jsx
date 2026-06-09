import React from "react";

const ToggleSwitch = ({ checked, disabled, loading, label, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && !loading && onChange(!checked)}
      className={`inline-flex h-10 w-20 items-center rounded-full border px-1 ${
        checked
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent"
          : "bg-slate-800 border-slate-700"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`inline-flex h-8 w-8 flex-shrink-0 rounded-full bg-white ${
          checked ? "ml-auto" : "mr-auto"
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default ToggleSwitch;
