import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider, getInitialTheme, applyTheme } from "./shared/theme/theme-context";
import AppToaster from "./shared/components/AppToaster";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <AppToaster />
    </ThemeProvider>
  </StrictMode>,
);
