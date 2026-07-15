import api from "./axios";

export const getTestimonials =
  () => {
    return api.get(
      "/testimonials"
    );
  };

export const getAdminTestimonials = () => {
  return api.get("/admin/testimonials");
};

export const createTestimonial = (formData) => {
  return api.post("/admin/testimonials", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateTestimonial = (id, formData) => {
  return api.put(`/admin/testimonials/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateTestimonialStatus = (id, isActive) => {
  return api.patch(`/admin/testimonials/${id}/status`, { isActive });
};

export const deleteTestimonial = (id) => {
  return api.delete(`/admin/testimonials/${id}`);
};
