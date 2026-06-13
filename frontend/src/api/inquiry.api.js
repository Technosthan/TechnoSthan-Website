import api from "./axios";

export const createInquiry = (
  data
) => {
  return api.post(
    "/inquiry",
    data
  );
};