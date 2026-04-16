import axiosInstance from "../../shared/lib/axiosInstance";

export const sendChatMessage = (message, history = []) =>
  axiosInstance.post("/api/chat", { message, history });

export const getChatHistory = () => axiosInstance.get("/api/chat/history");
