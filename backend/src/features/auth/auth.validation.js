import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().min(7).required(),
  password: Joi.string().min(6).required(),
  category: Joi.string().trim().required(),
  avatar: Joi.string().allow("", null).optional(),
});

export const loginSchema = Joi.object({
  emailOrPhone: Joi.string().trim().required(),
  password: Joi.string().required(),
});
