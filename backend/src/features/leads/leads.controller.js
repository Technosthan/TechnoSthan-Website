import asyncHandler from "../../utils/asyncHandler.js";
import { getLeadOverview } from "./leads.service.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await getLeadOverview();

  res.json({
    success: true,
    data: result,
  });
});
