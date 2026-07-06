import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from "../shared/context/AuthContext";

function Providers() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default Providers;
