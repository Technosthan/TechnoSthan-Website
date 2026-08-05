import { createContext, useContext, useMemo } from "react";

const defaultTheme = {
  bgGradient:
    "bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]",
  text: "text-slate-100",
  textSecondary: "text-slate-400",
  card: "bg-slate-900/70 backdrop-blur-xl",
  border: "border-white/10",
  input:
    "bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-0",
  accent: "bg-cyan-600 hover:bg-cyan-500",
  accentText: "text-cyan-300",
  button: "bg-cyan-600 hover:bg-cyan-500",
  buttonText: "text-white",
};

const defaultAppSettings = {
  appName: "TechnoSthan",
  logoUrl: "",
};

const ThemeContext = createContext({
  theme: defaultTheme,
  appSettings: defaultAppSettings,
});

export const ThemeProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      theme: defaultTheme,
      appSettings: defaultAppSettings,
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
