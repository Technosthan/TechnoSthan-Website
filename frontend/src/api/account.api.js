import api from "./axios";

export const getCurrentAccount = () =>
  api.get("/auth/me");

export const updateAccountProfile = (payload) => {
  const formData = new FormData();

  if (payload?.name !== undefined) {
    formData.append("name", payload.name);
  }

  if (payload?.profileImage) {
    formData.append(
      "profileImage",
      payload.profileImage
    );
  }

  return api.patch("/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
