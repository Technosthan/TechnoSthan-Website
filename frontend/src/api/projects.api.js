import api from "./axios";

export const getProjects = () => {
  return api.get("/projects");
};

export const getAdminProjects = () => {
  return api.get("/admin/projects");
};

export const createProject = (formData) => {
  return api.post("/admin/projects", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProject = (id, formData) => {
  return api.put(`/admin/projects/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProjectStatus = (id, isActive) => {
  return api.patch(`/admin/projects/${id}/status`, { isActive });
};

export const deleteProject = (id) => {
  return api.delete(`/admin/projects/${id}`);
};
