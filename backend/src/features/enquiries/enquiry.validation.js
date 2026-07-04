import Joi from "joi";

export const enquiryValidationSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  category: Joi.string().required(),
  interestedArea: Joi.string().required(),
  message: Joi.string().required(),
});
