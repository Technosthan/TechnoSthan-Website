import { getSafeImageUrl } from "../../../shared/utils";

export const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeLower = (value) => normalizeText(value).toLowerCase();

const PROJECT_THEME_RULES = [
  {
    key: "web",
    label: "Web",
    keywords: ["web", "website", "frontend", "ui", "ux", "portal", "dashboard"],
  },
  {
    key: "mobile",
    label: "Mobile",
    keywords: ["mobile", "app", "ios", "android", "tablet"],
  },
  {
    key: "cloud",
    label: "Cloud",
    keywords: ["cloud", "hosting", "infrastructure", "migration", "server"],
  },
  {
    key: "devops",
    label: "DevOps",
    keywords: ["devops", "pipeline", "release", "deployment", "ci", "cd", "ops"],
  },
  {
    key: "ai",
    label: "AI",
    keywords: ["ai", "automation", "intelligence", "machine learning", "ml"],
  },
  {
    key: "data",
    label: "Data",
    keywords: ["data", "analytics", "reporting", "insight", "dashboard"],
  },
  {
    key: "security",
    label: "Security",
    keywords: ["security", "secure", "cyber", "compliance", "protection", "threat"],
  },
  {
    key: "design",
    label: "Design",
    keywords: ["design", "experience", "brand", "interface", "visual"],
  },
  {
    key: "platform",
    label: "Platform",
    keywords: ["platform", "system", "solution", "product"],
  },
  {
    key: "enterprise",
    label: "Enterprise",
    keywords: ["enterprise", "business", "operations", "workflow", "scale"],
  },
];

const SERVICE_MATCH_RULES = [
  {
    key: "web",
    keywords: ["web", "website", "frontend", "ui", "ux", "portal", "dashboard"],
  },
  {
    key: "mobile",
    keywords: ["mobile", "app", "ios", "android"],
  },
  {
    key: "cloud",
    keywords: ["cloud", "hosting", "infrastructure", "migration", "server"],
  },
  {
    key: "devops",
    keywords: ["devops", "pipeline", "release", "deployment", "ci", "cd", "ops"],
  },
  {
    key: "ai",
    keywords: ["ai", "automation", "intelligence", "machine learning", "analytics"],
  },
  {
    key: "security",
    keywords: ["security", "secure", "cyber", "compliance", "protection"],
  },
  {
    key: "design",
    keywords: ["design", "experience", "brand", "interface", "visual"],
  },
  {
    key: "data",
    keywords: ["data", "analytics", "reporting", "insight"],
  },
];

export const normalizeProjectRecord = (project, index = 0) => {
  const title = normalizeText(project?.title, `Project ${index + 1}`);
  const description = normalizeText(
    project?.description,
    "This public record does not include a longer editorial summary."
  );
  const imageUrl = getSafeImageUrl(project?.imageUrl || project?.image || "");
  const themes = detectProjectThemes({
    title,
    description,
  });

  return {
    id: normalizeText(project?.id, `project-${index + 1}`),
    title,
    description,
    imageUrl,
    hasImage: Boolean(imageUrl),
    displayOrder:
      project?.displayOrder === undefined || project?.displayOrder === null
        ? null
        : Number(project.displayOrder),
    isActive: project?.isActive !== false,
    createdAt: project?.createdAt || null,
    updatedAt: project?.updatedAt || null,
    route: `/case-studies/${normalizeText(project?.id, `project-${index + 1}`)}`,
    themes,
    themeKeys: themes.map((theme) => theme.key),
    themeLabels: themes.map((theme) => theme.label),
    searchText: `${title} ${description}`.toLowerCase(),
  };
};

export const normalizeServiceRecord = (service, index = 0) => ({
  id: normalizeText(service?.id, `service-${index + 1}`),
  title: normalizeText(service?.title, `Service ${index + 1}`),
  shortDescription: normalizeText(
    service?.shortDescription || service?.description,
    "Live service record from the public catalog."
  ),
  description: normalizeText(
    service?.description || service?.shortDescription,
    "Live service record from the public catalog."
  ),
  category: normalizeText(service?.category, "General"),
  slug: normalizeText(service?.slug, ""),
  iconKey: normalizeText(service?.iconKey, ""),
  route: normalizeText(service?.route, "/services"),
  displayOrder:
    service?.displayOrder === undefined || service?.displayOrder === null
      ? 0
      : Number(service.displayOrder),
  isActive: service?.isActive !== false,
  searchText: `${normalizeText(service?.title)} ${normalizeText(
    service?.shortDescription || service?.description
  )} ${normalizeText(service?.category)}`.toLowerCase(),
});

export const sortProjects = (projects = []) =>
  [...projects].sort(
    (a, b) =>
      Number(a?.displayOrder ?? 0) - Number(b?.displayOrder ?? 0) ||
      normalizeText(a?.title).localeCompare(normalizeText(b?.title))
  );

export const getProjectThemes = (project) =>
  detectProjectThemes(project || {});

export const getThemeLabel = (key) =>
  PROJECT_THEME_RULES.find((rule) => rule.key === key)?.label || normalizeText(key, key);

export const detectProjectThemes = (project = {}) => {
  const corpus = normalizeLower(`${project?.title || ""} ${project?.description || ""}`);

  return PROJECT_THEME_RULES.filter((rule) =>
    rule.keywords.some((keyword) => corpus.includes(keyword))
  ).map((rule) => ({
    key: rule.key,
    label: rule.label,
  }));
};

export const getProjectMediaVariant = (project = {}) => {
  const corpus = normalizeLower(`${project?.title || ""} ${project?.description || ""}`);

  if (corpus.includes("mobile")) return "mobile";
  if (corpus.includes("cloud") || corpus.includes("infrastructure")) return "cloud";
  if (corpus.includes("devops") || corpus.includes("deployment")) return "devops";
  if (corpus.includes("ai") || corpus.includes("automation")) return "ai";
  if (corpus.includes("security") || corpus.includes("cyber")) return "security";
  if (corpus.includes("data") || corpus.includes("analytics")) return "data";
  return "web";
};

export const buildProjectFilters = (projects = []) => {
  const activeProjects = sortProjects(
    projects.filter((project) => project?.isActive !== false)
  );

  const themeCounts = new Map();
  activeProjects.forEach((project) => {
    getProjectThemes(project).forEach((theme) => {
      themeCounts.set(theme.key, (themeCounts.get(theme.key) || 0) + 1);
    });
  });

  const filters = [
    {
      key: "all",
      label: "All",
      count: activeProjects.length,
      type: "base",
    },
    {
      key: "with-image",
      label: "With images",
      count: activeProjects.filter((project) => project.hasImage).length,
      type: "media",
    },
    {
      key: "without-image",
      label: "Fallback visual",
      count: activeProjects.filter((project) => !project.hasImage).length,
      type: "media",
    },
  ];

  PROJECT_THEME_RULES.forEach((rule) => {
    const count = themeCounts.get(rule.key) || 0;
    if (count > 0) {
      filters.push({
        key: `theme:${rule.key}`,
        label: rule.label,
        count,
        type: "theme",
      });
    }
  });

  return filters.filter((filter) => filter.count > 0 || filter.key === "all");
};

export const filterProjects = (
  projects = [],
  { filterKey = "all", search = "" } = {}
) => {
  const searchValue = normalizeLower(search);

  return sortProjects(projects).filter((project) => {
    if (filterKey === "with-image" && !project.hasImage) {
      return false;
    }

    if (filterKey === "without-image" && project.hasImage) {
      return false;
    }

    if (filterKey.startsWith("theme:")) {
      const key = filterKey.replace("theme:", "");
      if (!project.themeKeys.includes(key)) {
        return false;
      }
    }

    if (searchValue && !project.title.toLowerCase().includes(searchValue)) {
      return false;
    }

    return true;
  });
};

export const getProjectFocusLabel = (project) => {
  const themes = getProjectThemes(project);
  return themes[0]?.label || "Enterprise delivery";
};

export const getProjectNarrative = (project) => {
  const themes = getProjectThemes(project);
  const themeLabels = themes.map((theme) => theme.label).join(", ");
  const focus = themeLabels || "enterprise delivery";

  return {
    summary:
      project?.description ||
      "This public record does not include a longer editorial summary.",
    challenge: `The public summary suggests a delivery focus around ${focus}.`,
    solution: `The live record keeps that story grounded in the project title, description, and image where available.`,
    approach: `The page presents a CMS-managed case-study view with a clear order, status, and visual hierarchy.`,
    scope: [
      "Public title",
      "Public description",
      "Optional image",
      "Display order",
      "Active status",
    ],
    themes,
  };
};

export const getProjectMetricSnippets = (project) => {
  const text = normalizeText(project?.description, "");
  if (!text) {
    return [];
  }

  const matches = text.match(/(?:\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\b\d{1,3}(?:,\d{3})+\b)/gi);
  if (!matches) {
    return [];
  }

  return Array.from(new Set(matches)).slice(0, 4).map((value) => ({
    label: "Quoted figure",
    value,
  }));
};

export const getRelatedServices = (project, services = []) => {
  const corpus = normalizeLower(`${project?.title || ""} ${project?.description || ""}`);
  const normalizedServices = services
    .map(normalizeServiceRecord)
    .filter((service) => service.isActive)
    .sort(
      (a, b) =>
        Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
        a.title.localeCompare(b.title)
    );

  return normalizedServices
    .map((service) => {
      const score = SERVICE_MATCH_RULES.reduce((total, rule) => {
        const matchesProject = rule.keywords.some((keyword) => corpus.includes(keyword));
        const serviceCorpus = normalizeLower(
          `${service.title} ${service.shortDescription} ${service.category} ${service.slug}`
        );
        const matchesService = rule.keywords.some((keyword) => serviceCorpus.includes(keyword));
        return total + (matchesProject && matchesService ? 1 : 0);
      }, 0);

      return {
        ...service,
        score,
      };
    })
    .filter((service) => service.score > 0)
    .sort((a, b) => b.score - a.score || a.displayOrder - b.displayOrder)
    .slice(0, 4);
};

export const getRelatedProjects = (project, projects = []) => {
  const corpus = normalizeLower(`${project?.title || ""} ${project?.description || ""}`);
  const currentThemes = getProjectThemes(project);
  const activeProjects = sortProjects(projects.filter((item) => item?.isActive !== false));

  return activeProjects
    .filter((candidate) => candidate.id !== project?.id)
    .map((candidate) => {
      const sharedThemes = candidate.themes.filter((theme) => corpus.includes(theme.key));
      const sharedKeywords = candidate.themes.filter((theme) =>
        currentThemes.some((currentTheme) => currentTheme.key === theme.key)
      );
      const score = sharedThemes.length + sharedKeywords.length;
      return {
        ...candidate,
        score,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.displayOrder - b.displayOrder)
    .slice(0, 3);
};

export const formatRelativeDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatProjectDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
