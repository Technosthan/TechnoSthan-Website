import { useContext, useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  STORAGE_KEY,
  ThemeContext,
} from "./theme-context";

const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "light"
    ? "light"
    : DEFAULT_THEME;
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  const [fallbackTheme, setFallbackTheme] = useState(
    getStoredTheme
  );

  useEffect(() => {
    if (context) {
      return undefined;
    }

    applyThemeToDocument(fallbackTheme);
    window.localStorage.setItem(STORAGE_KEY, fallbackTheme);
  }, [context, fallbackTheme]);

  if (context) {
    return context;
  }

  return {
    theme: fallbackTheme,
    isDark: fallbackTheme === "dark",
    isLight: fallbackTheme === "light",
    setTheme: (nextTheme) =>
      setFallbackTheme(
        nextTheme === "light" ? "light" : "dark"
      ),
    toggleTheme: () =>
      setFallbackTheme((current) =>
        current === "dark" ? "light" : "dark"
      ),
  };
};

export default useTheme;
