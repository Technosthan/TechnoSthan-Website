export const validateService = (
  req,
  res,
  next
) => {
  const {
    title,
    shortDescription,
    category,
  } = req.body || {};

  if (!title || !shortDescription || !category) {
    return res.status(400).json({
      success: false,
      message:
        "Title, short description, and category are required",
    });
  }

  next();
};
