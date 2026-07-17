export const SERVICE_MENU_CATEGORIES = [
  {
    key: "development",
    label: "Development",
    description: "Product engineering and digital builds.",
  },
  {
    key: "cloud-infrastructure",
    label: "Cloud & Infrastructure",
    description: "Reliable hosting, DevOps, and migration.",
  },
  {
    key: "ai-data",
    label: "AI & Data",
    description: "Automation, analytics, and insights.",
  },
  {
    key: "security-design",
    label: "Security & Design",
    description: "Protection, UX, and product polish.",
  },
  {
    key: "industry-solutions",
    label: "Industry Solutions",
    description: "Tailored systems for specific sectors.",
  },
];

export const SERVICE_MENU_ITEMS_LIMIT = 3;

export const DEFAULT_SERVICE_MENU_ITEMS = [
  {
    id: "default-web-development",
    title: "Web Development",
    slug: "web-development",
    shortDescription: "Modern websites and web apps built for growth.",
    iconKey: "FiCode",
    category: "Development",
    route: "/services",
    displayOrder: 1,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    id: "default-mobile-app-development",
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription: "Native and cross-platform mobile experiences.",
    iconKey: "FiSmartphone",
    category: "Development",
    route: "/services",
    displayOrder: 2,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-cloud-solutions",
    title: "Cloud Solutions",
    slug: "cloud-solutions",
    shortDescription: "Scalable cloud architecture and migrations.",
    iconKey: "FiCloud",
    category: "Cloud & Infrastructure",
    route: "/services",
    displayOrder: 3,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    id: "default-devops",
    title: "DevOps",
    slug: "devops",
    shortDescription: "Automation, pipelines, and delivery reliability.",
    iconKey: "FiServer",
    category: "Cloud & Infrastructure",
    route: "/services",
    displayOrder: 4,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-ai-automation",
    title: "AI Automation",
    slug: "ai-automation",
    shortDescription: "Workflows powered by intelligent automation.",
    iconKey: "FiZap",
    category: "AI & Data",
    route: "/services",
    displayOrder: 5,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
  {
    id: "default-data-analytics",
    title: "Data Analytics",
    slug: "data-analytics",
    shortDescription: "Dashboards and decisions powered by data.",
    iconKey: "FiTrendingUp",
    category: "AI & Data",
    route: "/services",
    displayOrder: 6,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-cybersecurity",
    title: "Cybersecurity",
    slug: "cybersecurity",
    shortDescription: "Threat protection, audits, and secure systems.",
    iconKey: "FiShield",
    category: "Security & Design",
    route: "/services",
    displayOrder: 7,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-ui-ux-design",
    title: "UI/UX Design",
    slug: "ui-ux-design",
    shortDescription: "Elegant interfaces and product experiences.",
    iconKey: "FiLayers",
    category: "Security & Design",
    route: "/services",
    displayOrder: 8,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-education-technology",
    title: "Education Technology",
    slug: "education-technology",
    shortDescription: "Digital solutions for schools and learning.",
    iconKey: "FiMonitor",
    category: "Industry Solutions",
    route: "/services",
    displayOrder: 9,
    isActive: true,
    showInNavbar: true,
    featured: false,
  },
  {
    id: "default-retail-ecommerce",
    title: "Retail & Ecommerce",
    slug: "retail-ecommerce",
    shortDescription: "Conversion-focused commerce platforms.",
    iconKey: "FiShoppingCart",
    category: "Industry Solutions",
    route: "/services",
    displayOrder: 10,
    isActive: true,
    showInNavbar: true,
    featured: true,
  },
];

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeServiceRecord = (service) => ({
  ...service,
  title: service?.title || "",
  shortDescription:
    service?.shortDescription ||
    service?.description ||
    "",
  description:
    service?.description ||
    service?.shortDescription ||
    "",
  category: service?.category || "",
  route: service?.route || "/services",
  iconKey: service?.iconKey || "FiStar",
  displayOrder: Number(service?.displayOrder || 0),
  isActive: Boolean(service?.isActive),
  showInNavbar: Boolean(service?.showInNavbar),
  featured: Boolean(service?.featured),
});

export const getServiceMenuGroups = (
  services = [],
  { limit = SERVICE_MENU_ITEMS_LIMIT } = {}
) => {
  const normalized = services
    .map(normalizeServiceRecord)
    .filter((service) => service.isActive && service.showInNavbar)
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.title.localeCompare(b.title)
    );

  const source =
    normalized.length > 0
      ? normalized
      : DEFAULT_SERVICE_MENU_ITEMS.map(normalizeServiceRecord);

  return SERVICE_MENU_CATEGORIES.map((category) => {
    const categoryKey = normalizeCategoryKey(category.label);
    const items = source
      .filter(
        (service) =>
          normalizeCategoryKey(service.category) ===
          categoryKey
      )
      .slice(0, limit);

    return {
      ...category,
      items,
    };
  }).filter((group) => group.items.length > 0);
};

export const getFeaturedService = (services = []) => {
  const normalized = services
    .map(normalizeServiceRecord)
    .filter((service) => service.isActive);

  return (
    normalized.find((service) => service.featured) ||
    normalized[0] ||
    normalizeServiceRecord(DEFAULT_SERVICE_MENU_ITEMS[0])
  );
};
