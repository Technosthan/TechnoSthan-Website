import { loginUser, registerUser } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};
