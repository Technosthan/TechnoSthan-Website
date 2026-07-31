import asyncHandler from "../../utils/asyncHandler.js";

import { createContact } from "./contact.service.js";

export const create = asyncHandler(async (req, res) => {
  const { services, ...payload } = req.body;
  const data = {
    ...payload,
    service: services ?? req.body.service,
  };

  console.log(data);
  const result = await createContact(data);

  res.status(201).json({
    success: true,
    data: result,
  });
});
