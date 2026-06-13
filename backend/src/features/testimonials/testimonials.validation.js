export const validateTestimonial = (
  req,
  res,
  next
) => {
  const {
    clientName,
    feedback,
  } = req.body;

  if (!clientName || !feedback) {
    return res.status(400).json({
      success: false,
      message:
        "Client name and feedback are required",
    });
  }

  next();
};