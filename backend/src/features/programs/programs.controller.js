import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { prisma } from "../../config/db.js";
import {
  createProgram,
  deleteProgram,
  getProgramBySpecialisationAndSlug,
  getProgramBySlugOrId,
  listPrograms,
  seedProgramGraph,
  updateProgram,
} from "./programs.service.js";

export const getHeroController = asyncHandler(async (_req, res) => {
  const hero = await prisma.heroContent.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  return sendSuccess(res, 200, {
    hero: hero
      ? {
          ...hero,
          backgroundVideo: hero.backgroundVideoUrl,
          backgroundImage: hero.backgroundImageUrl,
          primaryCtaLink: hero.primaryCtaLink || "/programs",
          secondaryCtaLink: hero.secondaryCtaLink || "/contact",
        }
      : null,
  });
});

export const getProgramsController = asyncHandler(async (req, res) => {
  const programs = await listPrograms({
    includeInactive: req.query.includeInactive === "true",
    specialisationSlug: req.query.specialisationSlug,
    specialisationId: req.query.specialisationId,
    programType: req.query.type || req.query.programType,
    certificationLevel: req.query.certificationLevel,
    mode: req.query.mode,
    level: req.query.level,
    duration: req.query.duration,
    search: req.query.search,
    feesMin: req.query.feesMin,
    feesMax: req.query.feesMax,
  });
  return sendSuccess(res, 200, { programs });
});

export const getHomeProgramsController = asyncHandler(async (_req, res) => {
  const programs = await listPrograms({ showOnHome: true });
  return sendSuccess(res, 200, { programs });
});

export const getSpecialisationProgramsController = asyncHandler(async (req, res) => {
  const { specialisationSlug } = req.params;
  const programs = await listPrograms({ specialisationSlug });
  return sendSuccess(res, 200, { programs });
});

export const getSpecialisationProgramController = asyncHandler(async (req, res) => {
  const { specialisationSlug, programSlug } = req.params;
  const program = await getProgramBySpecialisationAndSlug(specialisationSlug, programSlug);

  if (!program) {
    return res.status(404).json({ message: "Program not found" });
  }

  return sendSuccess(res, 200, { program });
});

export const getProgramController = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let decodedIdentifier = String(slug || "").trim();
  try {
    decodedIdentifier = decodeURIComponent(decodedIdentifier);
  } catch (_error) {
    // keep the raw identifier if decoding fails
  }
  const program = await getProgramBySlugOrId(decodedIdentifier);

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
