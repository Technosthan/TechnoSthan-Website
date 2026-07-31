import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import useTheme from "../theme/useTheme";
import "./theme-toggle.css";

const THEME_CYCLE = ["dark", "light", "system"];

const getThemeIcon = (mode) => {
  switch (mode) {
    case "light":
      return FiSun;
    case "system":
      return FiMonitor;
    case "dark":
    default:
      return FiMoon;
  }
};

const ThemeToggle = ({ compact = false, className = "", ...rest }) => {
  const { mode = "dark", resolvedMode = "dark", setMode } = useTheme();
  const currentIndex = THEME_CYCLE.indexOf(mode);
  const nextMode = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
  const Icon = getThemeIcon(mode);
  const label =
    mode === "system"
      ? `System theme, currently ${resolvedMode}. Click to switch to ${nextMode} mode.`
      : `${mode[0].toUpperCase()}${mode.slice(1)} mode. Click to switch to ${nextMode} mode.`;

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? "compact" : ""} ${className}`.trim()}
      onClick={() => setMode(nextMode)}
      aria-label={label}
      title={label}
      data-mode={mode}
      data-cursor="open"
      {...rest}
    >
      <span className="theme-toggle-orbits" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>

      <span className="theme-toggle-icon" aria-hidden="true">
        <Icon size={16} />
      </span>
    </button>
  );
};

export default ThemeToggle;
