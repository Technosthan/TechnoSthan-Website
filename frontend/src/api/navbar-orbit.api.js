import api from "./axios";

export const getNavbarOrbitItems = () => api.get("/navbar-orbit-items");

export const getAdminNavbarOrbitItems = () =>
  api.get("/admin/navbar-orbit-items");

export const createNavbarOrbitItem = (payload) =>
  api.post("/admin/navbar-orbit-items", payload);

export const updateNavbarOrbitItem = (id, payload) =>
  api.put(`/admin/navbar-orbit-items/${id}`, payload);

export const updateNavbarOrbitItemStatus = (id, isActive) =>
  api.patch(`/admin/navbar-orbit-items/${id}/status`, {
    isActive,
  });

export const reorderNavbarOrbitItems = (groupKey, orderedIds) =>
  api.patch("/admin/navbar-orbit-items/reorder", {
    groupKey,
    orderedIds,
  });

export const resetNavbarOrbitGroup = (groupKey) =>
  api.post("/admin/navbar-orbit-items/reset", {
    groupKey,
  });

export const deleteNavbarOrbitItem = (id) =>
  api.delete(`/admin/navbar-orbit-items/${id}`);

