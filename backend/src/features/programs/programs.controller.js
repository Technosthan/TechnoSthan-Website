import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { prisma } from "../../config/db.js";
import {
  createProgram,
  deleteProgram,
  getProgramBySlug,
  listPrograms,
  seedProgramGraph,
  updateProgram,
} from "./programs.service.js";

export const getHeroController = asyncHandler(async (_req, res) => {
  const hero = await prisma.heroContent.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  return sendSuccess(res, 200, { hero });
});

export const getProgramsController = asyncHandler(async (_req, res) => {
  const programs = await listPrograms();
  return sendSuccess(res, 200, { programs });
});

export const getProgramController = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    return res.status(404).json({ message: "Program not found" });
  }

  return sendSuccess(res, 200, { program });
});

export const getWorkshopsController = asyncHandler(async (_req, res) => {
  const workshops = await prisma.workshop.findMany({
    where: { isActive: true },
    orderBy: { date: "asc" },
  });

  return sendSuccess(res, 200, { workshops });
});

export const createProgramController = asyncHandler(async (req, res) => {
  const program = await createProgram(req.body);
  await seedProgramGraph(program.id, req.body);
  return sendSuccess(res, 201, { program }, "Program created");
});

export const updateProgramController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await updateProgram(id, req.body);
  await seedProgramGraph(program.id, req.body);
  return sendSuccess(res, 200, { program }, "Program updated");
});

export const deleteProgramController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await deleteProgram(id);
  return sendSuccess(res, 200, { program }, "Program deleted");
});
