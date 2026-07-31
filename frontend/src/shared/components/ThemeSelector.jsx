import { useEffect, useMemo, useState } from "react";
import useTheme from "../theme/useTheme";
import { ACCENT_THEMES } from "../theme/theme-context";
import "./theme-selector.css";

const THEME_SEQUENCE = [
  { label: "Dark", mode: "dark", accent: "mono", sublabel: "Dark / Mono" },
  { label: "Light", mode: "light", accent: "mono", sublabel: "Light / Mono" },
  { label: "Orange", mode: "dark", accent: "orange", sublabel: "Orange / Dark" },
  { label: "Blue", mode: "dark", accent: "blue", sublabel: "Blue / Dark" },
  { label: "Purple", mode: "dark", accent: "purple", sublabel: "Purple / Dark" },
  { label: "Green", mode: "dark", accent: "green", sublabel: "Green / Dark" },
  { label: "Red", mode: "dark", accent: "red", sublabel: "Red / Dark" },
  { label: "Gold", mode: "dark", accent: "gold", sublabel: "Gold / Dark" },
  { label: "Monochrome", mode: "light", accent: "mono", sublabel: "Monochrome / Light" },
  { label: "System", mode: "system", accent: "orange", sublabel: "System / Theme" },
];

const findInitialIndex = (mode, accentTheme) => {
  const exactIndex = THEME_SEQUENCE.findIndex(
    (item) => item.mode === mode && item.accent === accentTheme
  );

  if (exactIndex >= 0) {
    return exactIndex;
  }

  if (mode === "light") {
    return 1;
  }

  if (mode === "system") {
    return 9;
  }

  const accentIndex = THEME_SEQUENCE.findIndex((item) => item.accent === accentTheme);
  return accentIndex >= 0 ? accentIndex : 0;
};

const ThemeSelector = ({ className = "", compact = false, ...rest }) => {
  const { mode = "dark", resolvedMode = "dark", accentTheme, setMode, setAccentTheme } = useTheme();
  const [cycleIndex, setCycleIndex] = useState(() => findInitialIndex(mode, accentTheme));

  useEffect(() => {
    setCycleIndex(findInitialIndex(mode, accentTheme));
  }, [mode, accentTheme]);

  const selectedPreset = useMemo(
    () => THEME_SEQUENCE[cycleIndex] || THEME_SEQUENCE[0],
    [cycleIndex]
  );

  const selectedAccent = useMemo(
    () => ACCENT_THEMES.find((item) => item.key === selectedPreset.accent) || ACCENT_THEMES[0],
    [selectedPreset.accent]
  );

  const handleAdvance = () => {
    const nextIndex = (cycleIndex + 1) % THEME_SEQUENCE.length;
    const nextPreset = THEME_SEQUENCE[nextIndex];
    setCycleIndex(nextIndex);
    setMode(nextPreset.mode);
    setAccentTheme(nextPreset.accent);
  };

  return (
    <div className={`theme-selector ${className}`.trim()} {...rest}>
      <button
        type="button"
        className={`theme-selector-trigger ${compact ? "is-compact" : ""}`}
        onClick={handleAdvance}
        aria-label={`Theme ${selectedPreset.label}. Click to switch to the next theme.`}
        title={`${selectedPreset.label} theme`}
        data-cursor="open"
        data-magnetic
      >
        <span className="theme-selector-orbits" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <span
          className="theme-selector-swatch"
          style={{ background: "var(--accent-primary)" }}
        />
        <span className="theme-selector-copy">
          <strong>{selectedPreset.label}</strong>
          <small>
            {selectedPreset.mode === "system"
              ? `System / ${resolvedMode === "light" ? "Light" : "Dark"}`
              : selectedPreset.sublabel}
          </small>
        </span>
        <span className="theme-selector-indicator" aria-hidden="true">
          {selectedAccent.label}
        </span>
      </button>
    </div>
  );
};

export default ThemeSelector;
