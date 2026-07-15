import {
  createTestimonial,
  deleteTestimonial,
  listTestimonials,
  updateTestimonial,
  updateTestimonialStatus,
} from "./testimonials.service.js";

export const getPublic = async (
  req,
  res,
  next
) => {
  try {
    const result = await listTestimonials({
      activeOnly: true,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (
  req,
  res,
  next
) => {
  try {
    const result = await listTestimonials({
      activeOnly: false,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result = await createTestimonial(
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateTestimonial(
      req.params.id,
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

export const updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateTestimonialStatus(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req,
  res,
  next
) => {
  try {
    await deleteTestimonial(req.params.id);

    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
