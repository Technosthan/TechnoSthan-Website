import { apiClient } from "../../../shared/services/apiClient";

export const submitContactForm = (payload) =>
  apiClient.post("/enquiries", payload);
