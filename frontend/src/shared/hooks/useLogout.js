import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "./useAuth";
import { LOGIN_ROUTE } from "../constants";

export default function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logoutAndRedirect = (
    destination = LOGIN_ROUTE
  ) => {
    logout();
    toast.success("Logged out successfully");
    navigate(destination, { replace: true });
  };

  return {
    logoutAndRedirect,
  };
}
