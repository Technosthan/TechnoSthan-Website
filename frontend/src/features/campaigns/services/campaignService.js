import { apiClient } from "../../../shared/services/apiClient";

export const campaignService = {
  getActive: () => apiClient.get("/campaigns/active"),
  getAll: () => apiClient.get("/admin/campaigns"),
  create: (payload) => apiClient.post("/admin/campaigns", payload),
  update: (id, payload) => apiClient.put(`/admin/campaigns/${id}`, payload),
  activate: (id) => apiClient.patch(`/admin/campaigns/${id}/activate`, {}),
  deactivate: (id) => apiClient.patch(`/admin/campaigns/${id}/deactivate`, {}),
  remove: (id) => apiClient.delete(`/admin/campaigns/${id}`),
};
