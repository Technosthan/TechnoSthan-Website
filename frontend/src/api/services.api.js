import api from "./axios";

export const getServices = () => {
  return api.get("/services");
};