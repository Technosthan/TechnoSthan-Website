import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider, getInitialTheme, applyTheme } from "./shared/theme/theme-context";
import AppToaster from "./shared/components/AppToaster";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <AppToaster />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
