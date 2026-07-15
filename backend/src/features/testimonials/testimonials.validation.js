export const validateTestimonialPayload = (
  req,
  res,
  next
) => {
  const {
    clientName,
    feedback,
  } = req.body || {};

  if (!clientName || !feedback) {
    return res.status(400).json({
      success: false,
      message:
        "Client name and testimonial text are required",
    });
  }

  next();
};

export const validateTestimonialStatus = (
  req,
  res,
  next
) => {
  if (req.body?.isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  next();
};
