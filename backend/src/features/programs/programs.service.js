import { prisma } from "../../config/db.js";
import { slugify } from "../../shared/utils/slug.js";

const toDecimal = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

const buildProgramData = (payload, existingSlug = null) => ({
  title: payload.title,
  slug: payload.slug || existingSlug || slugify(payload.title),
  shortDescription: payload.shortDescription,
  overview: payload.overview,
  thumbnailUrl: payload.thumbnailUrl || null,
  heroImageUrl: payload.heroImageUrl || null,
  heroVideoUrl: payload.heroVideoUrl || null,
  duration: payload.duration,
  level: payload.level,
  mode: payload.mode || "ONLINE",
  fees: toDecimal(payload.fees) ?? 0,
  discountFees: toDecimal(payload.discountFees),
  category: payload.category || null,
  isFeatured: Boolean(payload.isFeatured),
  isActive: payload.isActive ?? true,
  certificateIncluded: payload.certificateIncluded ?? true,
  internshipSupport: payload.internshipSupport ?? false,
  placementSupport: payload.placementSupport || null,
  projectsCount: Number(payload.projectsCount || 0),
  whatYouWillLearn: payload.whatYouWillLearn || null,
  toolsCovered: payload.toolsCovered || null,
  mentorName: payload.mentorName || null,
  mentorRole: payload.mentorRole || null,
  mentorBio: payload.mentorBio || null,
  mentorAvatarUrl: payload.mentorAvatarUrl || null,
  faqs: payload.faqs || null,
});

const includeProgramGraph = {
  curriculumModules: {
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  },
  projects: true,
  enrollments: true,
  payments: true,
};

export const listPrograms = async ({ includeInactive = false } = {}) => {
  return prisma.program.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: includeProgramGraph,
  });
};

export const getProgramBySlug = async (slug) => {
  return prisma.program.findUnique({
    where: { slug },
    include: includeProgramGraph,
  });
};

export const getProgramById = async (id) => {
  return prisma.program.findUnique({
    where: { id },
    include: includeProgramGraph,
  });
};

export const createProgram = async (payload) => {
  const data = buildProgramData(payload);
  return prisma.program.create({ data });
};

export const updateProgram = async (id, payload) => {
  const existingProgram = await prisma.program.findUnique({ where: { id } });
  const data = buildProgramData(payload, existingProgram?.slug || null);
  return prisma.program.update({ where: { id }, data });
};

export const deleteProgram = async (id) => {
  return prisma.program.delete({ where: { id } });
};

export const upsertCurriculum = async (programId, modules = []) => {
  await prisma.curriculumModule.deleteMany({ where: { programId } });

  const createdModules = [];
  for (const modulePayload of modules) {
    const createdModule = await prisma.curriculumModule.create({
      data: {
        programId,
        title: modulePayload.title,
        description: modulePayload.description || null,
        order: Number(modulePayload.order || 0),
        lessons: {
          create: (modulePayload.lessons || []).map((lesson) => ({
            title: lesson.title,
            duration: lesson.duration || null,
            order: Number(lesson.order || 0),
            isPreview: Boolean(lesson.isPreview),
          })),
        },
      },
      include: { lessons: true },
    });

    createdModules.push(createdModule);
  }

  return createdModules;
};

export const upsertProjects = async (programId, projects = []) => {
  await prisma.project.deleteMany({ where: { programId } });

  return prisma.$transaction(
    projects.map((project) =>
      prisma.project.create({
        data: {
          programId,
          title: project.title,
          description: project.description || null,
          tools: project.tools || null,
        },
      }),
    ),
  );
};

export const seedProgramGraph = async (programId, payload) => {
  if (Array.isArray(payload.curriculumModules)) {
    await upsertCurriculum(programId, payload.curriculumModules);
  }

  if (Array.isArray(payload.projects)) {
    await upsertProjects(programId, payload.projects);
  }
};
