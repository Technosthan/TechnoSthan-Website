import React from "react";

const ToggleSwitch = React.memo(
  ({
    checked,
    disabled = false,
    loading = false,
    label,
    onChange,
  }) => {
    const isDisabled = disabled || loading;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onChange(!checked);
          }
        }}
        className={`relative inline-flex shrink-0 items-center rounded-full border transition-none focus:outline-none ${
          checked
            ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500"
            : "border-slate-600 bg-slate-800"
        } ${
          isDisabled
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }`}
        style={{
          width: "48px",
          height: "28px",
          minWidth: "48px",
          minHeight: "28px",
          maxWidth: "48px",
          maxHeight: "28px",
          padding: "3px",
          boxSizing: "border-box",
          opacity: 1,
          filter: "none",
          animation: "none",
          transition: "none",
        }}
      >
        <span
          className="block shrink-0 rounded-full bg-white shadow-md"
          style={{
            width: "20px",
            height: "20px",
            transform: checked
              ? "translateX(20px)"
              : "translateX(0px)",
            transition: "transform 200ms ease-in-out",
          }}
        />

        <span className="sr-only">{label}</span>
      </button>
    );
  },
);

ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;