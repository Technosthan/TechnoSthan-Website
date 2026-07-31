import api from "./axios";

export const loginUser = (payload) =>
  api.post("/auth/login", payload);

export const registerStudent = (payload) =>
  api.post("/auth/register", payload);
