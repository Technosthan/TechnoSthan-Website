import api from "./axios";

export const createContact = (data) => {
  return api.post("/contact", data);
};
