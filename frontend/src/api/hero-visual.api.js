import api from "./axios";

export const getHeroVisual = () => {
  return api.get("/hero-visual");
};

export const getAdminHeroVisual = () => {
  return api.get("/admin/hero-visual");
};

export const saveHeroVisualSetting = (formData) => {
  return api.put("/admin/hero-visual", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createHeroVisualFeature = (formData) => {
  return api.post("/admin/hero-visual/features", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateHeroVisualFeature = (id, formData) => {
  return api.put(`/admin/hero-visual/features/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateHeroVisualFeatureStatus = (id, isActive) => {
  return api.patch(`/admin/hero-visual/features/${id}/status`, {
    isActive,
  });
};

export const deleteHeroVisualFeature = (id) => {
  return api.delete(`/admin/hero-visual/features/${id}`);
};
