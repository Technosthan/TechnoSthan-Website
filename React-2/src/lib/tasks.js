import api from "./api";

export const getTaskTemplates = async (params = {}) => {
  const { data } = await api.get("/api/tasks/templates", { params });
  return data;
};

export const createTaskTemplate = async (payload) => {
  const { data } = await api.post("/api/tasks/templates", payload);
  return data;
};

export const getTaskInstances = async (params = {}) => {
  const { data } = await api.get("/api/tasks/instances", { params });
  return data;
};

export const completeTaskInstance = async (id) => {
  const { data } = await api.patch(`/api/tasks/instances/${id}/complete`);
  return data;
};

export const ensureTodayTaskInstances = async () => {
  const { data } = await api.post("/api/tasks/instances/ensure-today");
  return data;
};
