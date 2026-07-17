import prisma from "../../core/database/prisma.js";
const sanitize = (value) =>
  typeof value === "string" ? value.trim() : value;

const toInt = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(
    String(value).toLowerCase()
  );
};

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveSlug = (title, slug) => {
  const provided = sanitize(slug);
  if (provided) {
    return slugify(provided);
  }

  return slugify(title);
};

const mapService = (service) => ({
  id: service.id,
  title: service.title,
  slug: service.slug,
  shortDescription:
    service.shortDescription || service.description || "",
  description:
    service.description ||
    service.shortDescription ||
    "",
  iconKey: service.iconKey || null,
  category: service.category || "",
  route: service.route || null,
  displayOrder: service.displayOrder ?? 0,
  isActive: service.isActive ?? true,
  showInNavbar: service.showInNavbar ?? true,
  featured: service.featured ?? false,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
});

export const createService = async (data) => {
  return prisma.service.create({
    data,
  });
};

export const getAllServices = async ({
  activeOnly = false,
  navbarOnly = false,
} = {}) => {
  const services = await prisma.service.findMany({
    orderBy: [
      {
        title: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return services
    .map(mapService)
    .filter((service) =>
      activeOnly ? service.isActive !== false : true
    )
    .filter((service) =>
      navbarOnly ? service.showInNavbar !== false : true
    )
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.title.localeCompare(b.title) ||
        b.createdAt - a.createdAt
    );
};

export const createServiceRecord = async (data) => {
  const service = await prisma.service.create({
    data: {
      title: sanitize(data.title),
      slug: resolveSlug(data.title, data.slug),
      shortDescription: sanitize(data.shortDescription),
      iconKey: sanitize(data.iconKey) || null,
      category: sanitize(data.category),
      route: sanitize(data.route) || null,
      displayOrder: toInt(data.displayOrder, 0),
      isActive: toBoolean(data.isActive, true),
      showInNavbar: toBoolean(data.showInNavbar, true),
      featured: toBoolean(data.featured, false),
    },
  });

  return mapService(service);
};

export const updateServiceRecord = async (id, data) => {
  const existing = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  const service = await prisma.service.update({
    where: {
      id,
    },
    data: {
      title: sanitize(data.title) || existing.title,
      slug:
        data.slug === undefined
          ? existing.slug
          : resolveSlug(
              sanitize(data.title) || existing.title,
              data.slug
            ) || existing.slug,
      shortDescription:
        sanitize(data.shortDescription) ||
        existing.shortDescription,
      iconKey:
        data.iconKey === undefined
          ? existing.iconKey
          : sanitize(data.iconKey) || null,
      category:
        sanitize(data.category) || existing.category,
      route:
        data.route === undefined
          ? existing.route
          : sanitize(data.route) || null,
      displayOrder:
        data.displayOrder === undefined
          ? existing.displayOrder
          : toInt(data.displayOrder, existing.displayOrder),
      isActive:
        data.isActive === undefined
          ? existing.isActive
          : toBoolean(data.isActive, existing.isActive),
      showInNavbar:
        data.showInNavbar === undefined
          ? existing.showInNavbar
          : toBoolean(
              data.showInNavbar,
              existing.showInNavbar
            ),
      featured:
        data.featured === undefined
          ? existing.featured
          : toBoolean(data.featured, existing.featured),
    },
  });

  return mapService(service);
};

export const updateServiceStatus = async (
  id,
  isActive
) => {
  const service = await prisma.service.update({
    where: {
      id,
    },
    data: {
      isActive: toBoolean(isActive, true),
    },
  });

  return mapService(service);
};

export const deleteService = async (id) => {
  const existing = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.service.delete({
    where: {
      id,
    },
  });

  return { id };
};
