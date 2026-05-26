import axiosInstance from "../../shared/lib/axiosInstance";

export const sendChatMessage = (message, history = [], conversationId, title) =>
  axiosInstance.post("/api/chat", {
    message,
    history,
    conversationId,
    title,
  });

export const createChatConversation = (title) =>
  axiosInstance.post("/api/chat/conversations", { title });

export const getConversationMessages = (conversationId) =>
  axiosInstance.get(`/api/chat/conversations/${conversationId}`);

export const deleteChatConversation = (conversationId) =>
  axiosInstance.delete(`/api/chat/conversations/${conversationId}`);

export const uploadFile = (file, message = "", conversationId, title) => {
  const formData = new FormData();
  formData.append("file", file);
  if (message) formData.append("message", message);
  if (conversationId) formData.append("conversationId", conversationId);
  if (title) formData.append("title", title);

  return axiosInstance.post("/api/chat/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getChatHistory = () => axiosInstance.get("/api/chat/history");
