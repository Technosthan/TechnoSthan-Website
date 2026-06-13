export const validateContact = (req, res, next) => {
  const {
    name,
    email,
    message,
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message:
        "Name, email and message are required",
    });
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  next();
};