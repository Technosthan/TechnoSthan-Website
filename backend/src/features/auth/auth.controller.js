import { registerUser, loginUser, googleAuth } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { user } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
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

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    const result = await googleAuth(idToken);

    res.json({
      success: true,
      message: "Google authentication successful",
      data: result,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
};

export const getMe = (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};

// Update user contact
export const updateUserContact = async (req, res) => {
  try {
    const { userId, contactType, contact } = req.body;
    const result = await updateUserContactInfo(userId, contactType, contact);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
