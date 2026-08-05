import api from "../lib/api";

const pickString = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const pickArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

export const mapProject = (project) => ({
  id: project._id || project.id || project.slug,
  slug: pickString(project.slug, "project"),
  title: pickString(project.title, "Untitled Project"),
  category: pickString(project.category, "Project"),
  city: pickString(project.city, "City"),
  state: pickString(project.state, "State"),
  status: pickString(project.status, "Planning"),
  area: pickString(project.area, ""),
  developmentType: pickString(project.developmentType, ""),
  timeline: pickString(project.timeline, ""),
  summary: pickString(project.summary, project.description || ""),
  image:
    pickString(project.imageUrl, "") ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
  gallery: pickArray(project.gallery),
  brochureUrl: pickString(project.brochureUrl, ""),
  facts: pickArray(project.facts),
  featured: Boolean(project.featured),
  isActive: project.isActive !== false,
  raw: project,
});

export const mapInsight = (insight) => ({
  id: insight._id || insight.id || insight.slug,
  slug: pickString(insight.slug, "insight"),
  title: pickString(insight.title, "Untitled Insight"),
  category: pickString(insight.category, "Insight"),
  date: insight.publishDate
    ? new Date(insight.publishDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Editable date",
  summary: pickString(insight.summary, insight.body || ""),
  body: pickString(insight.body, ""),
  image:
    pickString(insight.imageUrl, "") ||
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
  tags: pickArray(insight.tags),
  featured: Boolean(insight.featured),
  isActive: insight.isActive !== false,
  raw: insight,
});

export const mapPartnership = (item) => ({
  id: item._id || item.id || item.slug,
  slug: pickString(item.slug, "partnership"),
  title: pickString(item.title, "Partnership"),
  type: pickString(item.type, "Partnership"),
  description: pickString(item.description, ""),
  benefits: pickArray(item.benefits),
  process: pickArray(item.process),
  logoUrl: pickString(item.logoUrl, ""),
  featured: Boolean(item.featured),
  isActive: item.isActive !== false,
  raw: item,
});

export const fetchCmsCollection = async (path) => {
  const response = await api.get(path);
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const fetchCmsItem = async (path) => {
  const response = await api.get(path);
  return response.data?.data || null;
};

