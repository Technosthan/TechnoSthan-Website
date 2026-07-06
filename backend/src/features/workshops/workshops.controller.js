import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { prisma } from "../../config/db.js";

export const getWorkshopsController = asyncHandler(async (_req, res) => {
  const workshops = await prisma.workshop.findMany({
    where: { isActive: true },
    orderBy: { date: "asc" },
  });

  return sendSuccess(res, 200, { workshops });
});

export const createWorkshopController = asyncHandler(async (req, res) => {
  const workshop = await prisma.workshop.create({
    data: {
      ...req.body,
      seatsLeft:
        req.body.seatsLeft !== undefined ? Number(req.body.seatsLeft) : Number(req.body.seats || 0),
      date: new Date(req.body.date),
      fees: Number(req.body.fees || 0),
      seats: Number(req.body.seats || 0),
    },
  });

  return sendSuccess(res, 201, { workshop }, "Workshop created");
});

export const updateWorkshopController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workshop = await prisma.workshop.update({
    where: { id },
    data: {
      ...req.body,
      seatsLeft:
        req.body.seatsLeft !== undefined ? Number(req.body.seatsLeft) : undefined,
      date: req.body.date ? new Date(req.body.date) : undefined,
      fees: req.body.fees !== undefined ? Number(req.body.fees) : undefined,
      seats: req.body.seats !== undefined ? Number(req.body.seats) : undefined,
    },
  });

  return sendSuccess(res, 200, { workshop }, "Workshop updated");
});

export const deleteWorkshopController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workshop = await prisma.workshop.delete({ where: { id } });
  return sendSuccess(res, 200, { workshop }, "Workshop deleted");
});
