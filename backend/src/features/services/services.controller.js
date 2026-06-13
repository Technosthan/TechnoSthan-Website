import {
  createService,
  getAllServices,
} from "./services.service.js";

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createService(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getAllServices();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};