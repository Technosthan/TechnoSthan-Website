import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./app/AppRoutes";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoutes />
    <Toaster position="top-right" />
  </React.StrictMode>,
);
