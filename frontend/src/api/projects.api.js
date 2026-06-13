import api from "./axios";

export const getProjects = () => {
  return api.get("/projects");
};