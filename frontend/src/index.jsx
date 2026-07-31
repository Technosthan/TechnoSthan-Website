import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider, getInitialTheme, applyTheme } from "./shared/theme/theme-context";
import AppToaster from "./shared/components/AppToaster";
import "./index.css";

applyTheme(getInitialTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <AppToaster />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
