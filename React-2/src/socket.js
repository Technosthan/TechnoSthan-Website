import { io } from "socket.io-client";
import { getStoredToken } from "./utils/auth";

const socket = io(
  import.meta.env.VITE_API_BASE || "http://localhost:5000",
  {
    transports: ["websocket"],
    auth: {
      token: getStoredToken(),
    },
  },
);

export default socket;
