import axiosInstance from "../../shared/lib/axiosInstance";

export const getAllContent = () => axiosInstance.get("/api/content");

export const getSingleContent = (id) =>
  axiosInstance.get(`/api/content/${id}`);
