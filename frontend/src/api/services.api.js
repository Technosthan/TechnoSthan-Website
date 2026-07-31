import api from "./axios";

export const getServices = (params = {}) => {
  return api.get("/services", {
    params,
  });
};

export const getAdminServices = () => {
  return api.get("/admin/services");
};

export const createService = (formData) => {
  return api.post("/admin/services", formData);
};

export const updateService = (id, data) => {
  return api.put(`/admin/services/${id}`, data);
};

export const updateServiceStatus = (id, isActive) => {
  return api.patch(`/admin/services/${id}/status`, {
    isActive,
  });
};

export const deleteService = (id) => {
  return api.delete(`/admin/services/${id}`);
};
