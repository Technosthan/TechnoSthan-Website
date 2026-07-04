export const sendSuccess = (res, statusCode, payload, message = "Success") => {
  return res.status(statusCode).json({ message, ...payload });
};

export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ message });
};
