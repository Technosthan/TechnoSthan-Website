export const validateLogin = (
  req,
  res,
  next
) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
};

export const validateRegister = (
  req,
  res,
  next
) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  next();
};

export const validateProfileUpdate = (
  req,
  res,
  next
) => {
  const { name } = req.body || {};

  if (
    name !== undefined &&
    String(name).trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Name cannot be empty",
    });
  }

  next();
};
