import axiosInstance from "../../shared/lib/axiosInstance";

export const sendChatMessage = (message, history = []) =>
  axiosInstance.post("/api/chat", { message, history });

export const uploadFile = (file, message = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (message) formData.append("message", message);

  return axiosInstance.post("/api/chat/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getChatHistory = () => axiosInstance.get("/api/chat/history");
