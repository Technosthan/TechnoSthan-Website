import api from "./axios";

export const subscribe = (data) => {
  return api.post("/subscribers", data);
};

export const getSubscribers = () => {
  return api.get("/subscribers");
};
