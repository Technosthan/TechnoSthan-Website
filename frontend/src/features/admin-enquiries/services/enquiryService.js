import { apiClient } from "../../../shared/services/apiClient";

export const getEnquiries = () => apiClient.get("/enquiries");
export const updateEnquiryStatus = (id, status) =>
  apiClient.patch(`/enquiries/${id}/status`, { status });
export const deleteEnquiry = (id) => apiClient.delete(`/enquiries/${id}`);
