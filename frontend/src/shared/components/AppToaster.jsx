import { Toaster } from "react-hot-toast";
import useTheme from "../theme/useTheme";

const AppToaster = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface-secondary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        },
        success: {
          style: {
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          },
        },
        error: {
          style: {
            background: "var(--danger-bg)",
            color: "var(--danger-text)",
            border: "1px solid var(--danger-border)",
          },
        },
      }}
      containerStyle={{
        zIndex: 2000,
      }}
      gutter={12}
      reverseOrder={false}
      theme={theme}
    />
  );
};

export default AppToaster;
