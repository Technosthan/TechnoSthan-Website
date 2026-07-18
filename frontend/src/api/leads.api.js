import api from "./axios";

export const getAdminLeads = () => {
  return api.get("/admin/leads");
};
