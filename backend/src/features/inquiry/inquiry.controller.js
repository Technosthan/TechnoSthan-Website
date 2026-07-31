import { createInquiry } from "./inquiry.service.js";

export const create = async (req, res, next) => {
  try {
    const result = await createInquiry(req.body);

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};