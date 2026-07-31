import { createSubscriber, getAllSubscribers } from "./subscribers.service.js";

export const create = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await createSubscriber(email);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Prisma unique constraint code is P2002
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await getAllSubscribers();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
