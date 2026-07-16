import { FiMoon, FiSun } from "react-icons/fi";
import useTheme from "../theme/useTheme";
import "./theme-toggle.css";

const ThemeToggle = ({ compact = false, className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? "compact" : ""} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
      </span>
      <span className="theme-toggle-label">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
};

export default ThemeToggle;
