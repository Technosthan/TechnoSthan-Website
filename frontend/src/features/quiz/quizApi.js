import axiosInstance from "../../shared/lib/axiosInstance";

export const getQuestions = () => axiosInstance.get("/api/quiz/questions");

export const submitQuiz = (answers) =>
  axiosInstance.post("/api/quiz/submit", { answers });

export const getQuizResults = () => axiosInstance.get("/api/quiz/results");

export const getQuestionsByContentId = (contentId) =>
  axiosInstance.get(`/api/quiz/content/${contentId}`);
