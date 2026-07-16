import { createContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "technosthan-theme";
const DEFAULT_THEME = "dark";

export const ThemeContext = createContext(null);

const applyTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return storedTheme === "light" ? "light" : DEFAULT_THEME;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",
      setTheme: (nextTheme) =>
        setThemeState(nextTheme === "light" ? "light" : "dark"),
      toggleTheme: () =>
        setThemeState((current) =>
          current === "dark" ? "light" : "dark"
        ),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { applyTheme, getInitialTheme, DEFAULT_THEME, STORAGE_KEY };
