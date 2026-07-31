import {
  getCurrentAccount,
  loginUser,
  registerStudent,
  updateAccountProfile,
} from "./auth.service.js";

export const login = async (
  req,
  res,
  next
) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req,
  res,
  next
) => {
  try {
    const result = await registerStudent(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req,
  res,
  next
) => {
  try {
    const account = await getCurrentAccount(
      req.user.email
    );

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateAccountProfile(
      req.user.email,
      req.body,
      req.file
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
