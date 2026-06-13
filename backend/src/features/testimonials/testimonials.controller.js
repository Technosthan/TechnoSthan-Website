import {
  createTestimonial,
  getAllTestimonials,
} from "./testimonials.service.js";

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createTestimonial(req.body);

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
      await getAllTestimonials();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};