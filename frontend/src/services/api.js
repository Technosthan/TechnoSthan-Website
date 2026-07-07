import { buildApiUrl } from "../shared/services/apiBase";

export const api = {
  async getEnquiries() {
    const response = await fetch(buildApiUrl("/enquiries"));
    if (!response.ok) throw new Error("Failed to fetch enquiries");
    return response.json();
  },

  async createEnquiry(payload) {
    const response = await fetch(buildApiUrl("/enquiries"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to submit enquiry");
    return data;
  },

  async updateEnquiryStatus(id, status) {
    const response = await fetch(buildApiUrl(`/enquiries/${id}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update status");
    return data;
  },

  async deleteEnquiry(id) {
    const response = await fetch(buildApiUrl(`/enquiries/${id}`), {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to delete enquiry");
    return data;
  },
};
