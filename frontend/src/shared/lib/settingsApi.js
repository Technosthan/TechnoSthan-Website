import axiosInstance from "./axiosInstance";

export const getPublicSettings = () =>
  axiosInstance.get("/api/settings/public");
