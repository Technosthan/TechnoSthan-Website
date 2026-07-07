import { prisma } from "../../config/db.js";
import { slugify } from "../../shared/utils/slug.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";

const toDecimal = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

const buildUniqueProgramSlug = async (title, preferredSlug = "", excludeId = null) => {
  const baseSource = String(preferredSlug || title || "").trim();
  const baseSlug = slugify(baseSource) || "program";
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.program.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const buildProgramData = async (payload, options = {}) => {
  const excludeId = options.excludeId || null;
  const title = String(payload.title || "").trim();
  const slug = await buildUniqueProgramSlug(title, payload.slug || "", excludeId);

  return {
    title,
    slug,
  shortDescription: payload.shortDescription,
  overview: payload.overview,
  thumbnailUrl: normalizeMediaUrl(payload.thumbnailUrl, "image") || null,
  heroImageUrl: normalizeMediaUrl(payload.heroImageUrl, "image") || null,
  heroVideoUrl: normalizeMediaUrl(payload.heroVideoUrl, "video") || null,
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
  mentorAvatarUrl: normalizeMediaUrl(payload.mentorAvatarUrl, "image") || null,
  faqs: payload.faqs || null,
  };
};

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

export const getProgramBySlugOrId = async (identifier) => {
  const normalizedIdentifier = String(identifier || "").trim();
  if (!normalizedIdentifier) {
    return null;
  }

  const programBySlug = await getProgramBySlug(normalizedIdentifier);
  if (programBySlug) {
    return programBySlug;
  }

  return getProgramById(normalizedIdentifier);
};

export const createProgram = async (payload) => {
  const data = await buildProgramData(payload);
  return prisma.program.create({ data });
};

export const updateProgram = async (id, payload) => {
  const data = await buildProgramData(payload, {
    excludeId: id,
  });
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
