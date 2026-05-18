import api from "./api";

export const getAssignments = async (params = {}) => {
  const { data } = await api.get("/api/assignments", { params });
  return data;
};

export const getAssignmentById = async (id) => {
  const { data } = await api.get(`/api/assignments/${id}`);
  return data;
};

export const getMyAssignments = async (params = {}) => {
  const { data } = await api.get("/api/assignments/my", { params });
  return data;
};

export const getAssignableUsers = async () => {
  const { data } = await api.get("/api/assignments/assignees/list");
  return data;
};

export const getSubmissionMonitor = async (params = {}) => {
  const { data } = await api.get("/api/assignments/submissions/all", { params });
  return data;
};

export const createAssignment = async (payload) => {
  const { data } = await api.post("/api/assignments", payload);
  return data;
};

export const updateAssignment = async (id, payload) => {
  const { data } = await api.put(`/api/assignments/${id}`, payload);
  return data;
};

export const deleteAssignment = async (id) => {
  const { data } = await api.delete(`/api/assignments/${id}`);
  return data;
};

export const submitAssignment = async (id, payload) => {
  const { data } = await api.patch(`/api/assignments/${id}/submit`, payload);
  return data;
};

export const updateAssignmentStatus = async (id, payload) => {
  const { data } = await api.patch(`/api/assignments/${id}/status`, payload);
  return data;
};

export const addAssignmentFeedback = async (id, payload) => {
  const { data } = await api.post(`/api/assignments/${id}/feedback`, payload);
  return data;
};

export const reviewSubmission = async (submissionId, payload) => {
  const { data } = await api.patch(
    `/api/assignments/submissions/${submissionId}/review`,
    payload,
  );
  return data;
};

export const uploadAssignmentFile = async (file, onUploadProgress) => {
  const toBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const payload = {
    file: await toBase64(file),
    fileName: file.name,
    mimeType: file.type,
  };

  const { data } = await api.post("/api/assignments/upload", payload, {
    onUploadProgress,
  });
  return data;
};
