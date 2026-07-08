import { prisma } from "../../config/db.js";
import { slugify } from "../../shared/utils/slug.js";

export const DEFAULT_SPECIALISATIONS = [
  {
    id: "techno",
    name: "Techno",
    slug: "techno",
    shortDescription: "Technology and digital innovation programs.",
    description:
      "Technology, software, AI, data, cybersecurity, robotics, IoT, cloud, and digital skills programs.",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "agrosthan",
    name: "AgroSthan",
    slug: "agrosthan",
    shortDescription: "Agritech and rural innovation programs.",
    description:
      "Agritech, smart farming, food processing, dairy technology, farm automation, and rural innovation programs.",
    isActive: true,
    sortOrder: 2,
  },
];

const buildUniqueSpecialisationSlug = async (name, preferredSlug = "", excludeId = null) => {
  const baseSource = String(preferredSlug || name || "").trim();
  const baseSlug = slugify(baseSource) || "specialisation";
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.specialisation.findFirst({
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

const buildSpecialisationData = async (payload, options = {}) => {
  const excludeId = options.excludeId || null;
  const name = String(payload.name || "").trim();
  const slug = await buildUniqueSpecialisationSlug(name, payload.slug || "", excludeId);

  return {
    name,
    slug,
    shortDescription: String(payload.shortDescription || "").trim() || null,
    description: String(payload.description || "").trim() || null,
    iconUrl: String(payload.iconUrl || "").trim() || null,
    bannerImageUrl: String(payload.bannerImageUrl || "").trim() || null,
    isActive: payload.isActive ?? true,
    sortOrder: Number(payload.sortOrder || 0),
  };
};

export const listSpecialisations = async ({ includeInactive = false } = {}) => {
  return prisma.specialisation.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      programs: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: { specialisation: true },
      },
    },
  });
};

export const getDefaultSpecialisations = async () => {
  const existing = await prisma.specialisation.findMany({
    where: {
      slug: { in: DEFAULT_SPECIALISATIONS.map((item) => item.slug) },
    },
    include: {
      programs: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: { specialisation: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return DEFAULT_SPECIALISATIONS.map((fallback) => existing.find((item) => item.slug === fallback.slug) || fallback);
};

export const seedDefaultSpecialisations = async () => {
  const tables = await prisma.$queryRaw`
    SELECT to_regclass('public."Specialisation"')::text AS specialisation_table
  `;
  const tableExists = Boolean(tables?.[0]?.specialisation_table);

  if (!tableExists) {
    return false;
  }

  for (const specialisation of DEFAULT_SPECIALISATIONS) {
    await prisma.$executeRaw`
      INSERT INTO "Specialisation" (
        "id",
        "name",
        "slug",
        "shortDescription",
        "description",
        "isActive",
        "sortOrder",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${specialisation.id},
        ${specialisation.name},
        ${specialisation.slug},
        ${specialisation.shortDescription},
        ${specialisation.description},
        ${specialisation.isActive},
        ${specialisation.sortOrder},
        NOW(),
        NOW()
      )
      ON CONFLICT ("slug")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "shortDescription" = EXCLUDED."shortDescription",
        "description" = EXCLUDED."description",
        "isActive" = EXCLUDED."isActive",
        "sortOrder" = EXCLUDED."sortOrder",
        "updatedAt" = NOW()
    `;
  }

  return true;
};

export const getSpecialisationBySlug = async (slug) => {
  return prisma.specialisation.findUnique({
    where: { slug },
    include: {
      programs: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: { specialisation: true },
      },
    },
  });
};

export const getSpecialisationById = async (id) => {
  return prisma.specialisation.findUnique({
    where: { id },
    include: {
      programs: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: { specialisation: true },
      },
    },
  });
};

export const createSpecialisation = async (payload) => {
  const data = await buildSpecialisationData(payload);
  return prisma.specialisation.create({ data });
};

export const updateSpecialisation = async (id, payload) => {
  const data = await buildSpecialisationData(payload, { excludeId: id });
  return prisma.specialisation.update({ where: { id }, data });
};

export const deleteSpecialisation = async (id) => {
  const specialisation = await prisma.specialisation.findUnique({ where: { id } });
  if (specialisation && DEFAULT_SPECIALISATIONS.some((item) => item.slug === specialisation.slug)) {
    const error = new Error("Default specialisations cannot be deleted");
    error.status = 400;
    throw error;
  }

  return prisma.specialisation.delete({ where: { id } });
};
