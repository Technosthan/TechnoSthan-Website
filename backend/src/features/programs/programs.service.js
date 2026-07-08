import { prisma } from "../../config/db.js";
import { slugify } from "../../shared/utils/slug.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";

const toDecimal = (value) => (value === null || value === undefined || value === "" ? null : Number(value));
const toBoolean = (value, fallback = false) => (value === undefined ? fallback : Boolean(value));
const toNullableString = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
};
const toEnumLike = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const buildUniqueSlug = async (modelName, title, preferredSlug = "", excludeId = null) => {
  const baseSource = String(preferredSlug || title || "").trim();
  const baseSlug = slugify(baseSource) || modelName;
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma[modelName].findFirst({
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
  const slug = await buildUniqueSlug("program", title, payload.slug || "", excludeId);

  return {
    title,
    slug,
    specialisationId: toNullableString(payload.specialisationId),
    programType: toNullableString(toEnumLike(payload.programType)),
    certificationLevel: toNullableString(toEnumLike(payload.certificationLevel)),
    shortDescription: String(payload.shortDescription || "").trim(),
    overview: String(payload.overview || "").trim(),
    thumbnailUrl: normalizeMediaUrl(payload.thumbnailUrl, "image") || null,
    heroImageUrl: normalizeMediaUrl(payload.heroImageUrl, "image") || null,
    heroVideoUrl: normalizeMediaUrl(payload.heroVideoUrl, "video") || null,
    duration: String(payload.duration || "").trim(),
    level: String(payload.level || "").trim(),
    mode: toEnumLike(payload.mode) || "ONLINE",
    fees: toDecimal(payload.fees) ?? 0,
    discountFees: toDecimal(payload.discountFees),
    category: toNullableString(payload.category),
    showOnHome: toBoolean(payload.showOnHome, false),
    isFeatured: toBoolean(payload.isFeatured, false),
    isActive: toBoolean(payload.isActive, true),
    certificateIncluded: toBoolean(payload.certificateIncluded, true),
    internshipSupport: toBoolean(payload.internshipSupport, false),
    placementSupport: toNullableString(payload.placementSupport),
    projectsCount: Number(payload.projectsCount || 0),
    whatYouWillLearn: payload.whatYouWillLearn || null,
    toolsCovered: payload.toolsCovered || null,
    mentorName: toNullableString(payload.mentorName),
    mentorRole: toNullableString(payload.mentorRole),
    mentorBio: toNullableString(payload.mentorBio),
    mentorAvatarUrl: normalizeMediaUrl(payload.mentorAvatarUrl, "image") || null,
    faqs: payload.faqs || null,
  };
};

const includeProgramGraph = {
  specialisation: true,
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

const buildProgramWhere = (filters = {}) => {
  const where = {};

  if (!filters.includeInactive) {
    where.isActive = true;
  }

  if (filters.showOnHome) {
    where.showOnHome = true;
  }

  if (filters.specialisationId) {
    where.specialisationId = filters.specialisationId;
  }

  if (filters.specialisationSlug) {
    where.specialisation = {
      slug: filters.specialisationSlug,
      isActive: true,
    };
  }

  if (filters.programType) {
    where.programType = toEnumLike(filters.programType);
  }

  if (filters.certificationLevel) {
    where.certificationLevel = toEnumLike(filters.certificationLevel);
  }

  if (filters.mode) {
    where.mode = toEnumLike(filters.mode);
  }

  if (filters.level) {
    where.level = filters.level;
  }

  if (filters.duration) {
    where.duration = { contains: filters.duration, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
      { overview: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const hasFeesMin = filters.feesMin !== undefined && filters.feesMin !== "";
  const hasFeesMax = filters.feesMax !== undefined && filters.feesMax !== "";

  if (hasFeesMin || hasFeesMax) {
    where.fees = {};
    if (hasFeesMin) {
      where.fees.gte = Number(filters.feesMin);
    }
    if (hasFeesMax) {
      where.fees.lte = Number(filters.feesMax);
    }
  }

  return where;
};

export const listPrograms = async (filters = {}) => {
  return prisma.program.findMany({
    where: buildProgramWhere(filters),
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

export const getProgramBySpecialisationAndSlug = async (specialisationSlug, programSlug) => {
  const normalizedSpecialisationSlug = String(specialisationSlug || "").trim();
  const normalizedProgramSlug = String(programSlug || "").trim();

  if (!normalizedSpecialisationSlug || !normalizedProgramSlug) {
    return null;
  }

  return prisma.program.findFirst({
    where: {
      slug: normalizedProgramSlug,
      specialisation: {
        slug: normalizedSpecialisationSlug,
      },
    },
    include: includeProgramGraph,
  });
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
