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

const DEFAULT_SERVICE_LIBRARY = [
  {
    title: "Web Development",
    slug: "web-development",
    shortDescription:
      "Modern websites and web apps built for growth.",
    iconKey: "FiCode",
    category: "Development",
    route: "/services",
    displayOrder: 1,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription:
      "Native and cross-platform apps for Android and iOS.",
    iconKey: "FiSmartphone",
    category: "Development",
    route: "/services",
    displayOrder: 2,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "Cloud Solutions",
    slug: "cloud-solutions",
    shortDescription:
      "Cloud architecture, migrations, and scalable hosting.",
    iconKey: "FiCloud",
    category: "Cloud & Infrastructure",
    route: "/services",
    displayOrder: 3,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    title: "DevOps",
    slug: "devops",
    shortDescription:
      "Automation, pipelines, and release reliability.",
    iconKey: "FiServer",
    category: "Cloud & Infrastructure",
    route: "/services",
    displayOrder: 4,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "AI Automation",
    slug: "ai-automation",
    shortDescription:
      "Workflows powered by intelligent automation.",
    iconKey: "FiZap",
    category: "AI & Data",
    route: "/services",
    displayOrder: 5,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    shortDescription:
      "Dashboards and decision support from your data.",
    iconKey: "FiTrendingUp",
    category: "AI & Data",
    route: "/services",
    displayOrder: 6,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "Cybersecurity",
    slug: "cybersecurity",
    shortDescription:
      "Threat protection, audits, and secure systems.",
    iconKey: "FiShield",
    category: "Security & Design",
    route: "/services",
    displayOrder: 7,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    shortDescription:
      "Elegant interfaces and product experiences.",
    iconKey: "FiLayers",
    category: "Security & Design",
    route: "/services",
    displayOrder: 8,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "Education Technology",
    slug: "education-technology",
    shortDescription:
      "Digital solutions for schools, platforms, and learning.",
    iconKey: "FiMonitor",
    category: "Industry Solutions",
    route: "/services",
    displayOrder: 9,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    title: "Retail & Ecommerce",
    slug: "retail-ecommerce",
    shortDescription:
      "Commerce platforms with conversion-focused UX.",
    iconKey: "FiShoppingCart",
    category: "Industry Solutions",
    route: "/services",
    displayOrder: 10,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
];

const DEFAULT_SERVICE_BY_KEY = new Map(
  DEFAULT_SERVICE_LIBRARY.map((service) => [
    slugify(service.title),
    service,
  ])
);

let serviceSchemaPromise = null;

const getServiceSchema = async () => {
  if (!serviceSchemaPromise) {
    serviceSchemaPromise = prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Service'
    `.then((rows) => {
      const columns = new Set(
        rows.map((row) => String(row.column_name))
      );

      return {
        columns,
        hasModernSchema: columns.has("slug"),
      };
    });
  }

  return serviceSchemaPromise;
};

const deriveCategory = (title = "") => {
  const normalized = String(title).toLowerCase();

  if (
    normalized.includes("mobile") ||
    normalized.includes("web")
  ) {
    return "Development";
  }

  if (
    normalized.includes("cloud") ||
    normalized.includes("devops")
  ) {
    return "Cloud & Infrastructure";
  }

  if (
    normalized.includes("ai") ||
    normalized.includes("data")
  ) {
    return "AI & Data";
  }

  if (
    normalized.includes("security") ||
    normalized.includes("ux") ||
    normalized.includes("ui")
  ) {
    return "Security & Design";
  }

  return "Industry Solutions";
};

const mapService = (service) => {
  const title = service?.title || "";
  const defaultRecord =
    DEFAULT_SERVICE_BY_KEY.get(slugify(title)) || {};

  return {
    id: service?.id,
    title,
    slug:
      service?.slug ||
      defaultRecord.slug ||
      slugify(title),
    shortDescription:
      service?.shortDescription ||
      service?.description ||
      defaultRecord.shortDescription ||
      "",
    description:
      service?.description ||
      service?.shortDescription ||
      defaultRecord.shortDescription ||
      "",
    iconKey:
      service?.iconKey ||
      defaultRecord.iconKey ||
      null,
    category:
      service?.category ||
      defaultRecord.category ||
      deriveCategory(title),
    route: service?.route || defaultRecord.route || "/services",
    displayOrder:
      service?.displayOrder ?? defaultRecord.displayOrder ?? 0,
    isActive: service?.isActive ?? defaultRecord.isActive ?? true,
    showInNavbar:
      service?.showInNavbar ??
      defaultRecord.showInNavbar ??
      true,
    featured:
      service?.featured ?? defaultRecord.featured ?? false,
    createdAt: service?.createdAt || null,
    updatedAt:
      service?.updatedAt ||
      service?.createdAt ||
      null,
  };
};

const mergeWithDefaults = (records) => {
  const byKey = new Map(
    records.map((record) => [slugify(record.title), record])
  );

  for (const defaultRecord of DEFAULT_SERVICE_LIBRARY) {
    const key = slugify(defaultRecord.title);

    if (!byKey.has(key)) {
      byKey.set(key, defaultRecord);
    }
  }

  return Array.from(byKey.values());
};

export const getAllServices = async ({
  activeOnly = false,
  navbarOnly = false,
} = {}) => {
  const schema = await getServiceSchema();

  const rows = schema.hasModernSchema
    ? await prisma.$queryRaw`
        SELECT
          "id",
          "title",
          "slug",
          COALESCE("shortDescription", "description", '') AS "shortDescription",
          COALESCE("description", "shortDescription", '') AS "description",
          "iconKey",
          COALESCE("category", '') AS "category",
          COALESCE("route", '/services') AS "route",
          COALESCE("displayOrder", 0) AS "displayOrder",
          COALESCE("isActive", true) AS "isActive",
          COALESCE("showInNavbar", true) AS "showInNavbar",
          COALESCE("featured", false) AS "featured",
          "createdAt",
          COALESCE("updatedAt", "createdAt") AS "updatedAt"
        FROM "Service"
      `
    : await prisma.$queryRaw`
        SELECT
          "id",
          "title",
          "description" AS "shortDescription",
          "description",
          NULL::text AS "iconKey",
          ''::text AS "category",
          '/services'::text AS "route",
          0::int AS "displayOrder",
          true AS "isActive",
          true AS "showInNavbar",
          false AS "featured",
          "createdAt",
          "createdAt" AS "updatedAt"
        FROM "Service"
      `;

  const services = mergeWithDefaults(rows.map(mapService));

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
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
};

export const createServiceRecord = async (data) => {
  const schema = await getServiceSchema();

  if (schema.hasModernSchema) {
    const service = await prisma.service.create({
      data: {
        title: sanitize(data.title),
        slug: slugify(sanitize(data.slug) || data.title),
        shortDescription: sanitize(data.shortDescription),
        iconKey: sanitize(data.iconKey) || null,
        category: sanitize(data.category) || deriveCategory(data.title),
        route: sanitize(data.route) || "/services",
        displayOrder: toInt(data.displayOrder, 0),
        isActive: toBoolean(data.isActive, true),
        showInNavbar: toBoolean(data.showInNavbar, true),
        featured: toBoolean(data.featured, false),
      },
    });

    return mapService(service);
  }

  const [service] = await prisma.$queryRaw`
    INSERT INTO "Service" ("title", "description", "createdAt")
    VALUES (
      ${sanitize(data.title)},
      ${sanitize(data.shortDescription) || sanitize(data.description) || ""},
      CURRENT_TIMESTAMP
    )
    RETURNING "id", "title", "description", "createdAt"
  `;

  return mapService(service);
};

export const updateServiceRecord = async (id, data) => {
  const schema = await getServiceSchema();

  if (schema.hasModernSchema) {
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
            : slugify(
                sanitize(data.title) || existing.title
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
  }

  const existingRows = await prisma.$queryRaw`
    SELECT "id", "title", "description", "createdAt"
    FROM "Service"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  if (!existingRows.length) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  const [service] = await prisma.$queryRaw`
    UPDATE "Service"
    SET
      "title" = ${sanitize(data.title) || existingRows[0].title},
      "description" = ${sanitize(data.shortDescription) || sanitize(data.description) || existingRows[0].description || ""}
    WHERE "id" = ${id}
    RETURNING "id", "title", "description", "createdAt"
  `;

  return mapService(service);
};

export const updateServiceStatus = async (id, isActive) => {
  const schema = await getServiceSchema();

  if (schema.hasModernSchema) {
    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        isActive: toBoolean(isActive, true),
      },
    });

    return mapService(service);
  }

  const rows = await prisma.$queryRaw`
    SELECT "id", "title", "description", "createdAt"
    FROM "Service"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  if (!rows.length) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  return mapService(rows[0]);
};

export const deleteService = async (id) => {
  const schema = await getServiceSchema();

  if (schema.hasModernSchema) {
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
  }

  const result = await prisma.$executeRaw`
    DELETE FROM "Service"
    WHERE "id" = ${id}
  `;

  if (!result) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
