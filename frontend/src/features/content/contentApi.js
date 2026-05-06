import axiosInstance from "../../shared/lib/axiosInstance";

export const getAllContent = () => axiosInstance.get("/api/content");

export const getSingleContent = (id) => axiosInstance.get(`/api/content/${id}`);

export const summarizeContent = (content) =>
  axiosInstance.post("/api/content/summarize", { content });

// Quiz
export const getQuestionsByContentId = (contentId) =>
  axiosInstance.get(`/api/quiz/content/${contentId}`);
