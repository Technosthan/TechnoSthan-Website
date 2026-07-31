import {
  detectProjectThemes,
  formatProjectDate,
  getProjectMediaVariant,
  getProjectMetricSnippets,
  getRelatedProjects,
  getRelatedServices,
  normalizeText,
  sortProjects,
} from "../../portfolio/data/portfolioData";

const normalizeLower = (value) => normalizeText(value).toLowerCase();

export const normalizeProductRecord = (project, index = 0) => {
  const normalized = {
    id: normalizeText(project?.id, `product-${index + 1}`),
    title: normalizeText(project?.title, `Product ${index + 1}`),
    description: normalizeText(
      project?.description,
      "This public record does not include a longer editorial summary."
    ),
    imageUrl: normalizeText(project?.imageUrl || project?.image, ""),
    displayOrder:
      project?.displayOrder === undefined || project?.displayOrder === null
        ? null
        : Number(project.displayOrder),
    isActive: project?.isActive !== false,
    createdAt: project?.createdAt || null,
    updatedAt: project?.updatedAt || null,
  };

  const themes = detectProjectThemes(normalized);

  return {
    ...normalized,
    hasImage: Boolean(normalized.imageUrl),
    route: `/products/${normalized.id}`,
    themes,
    themeKeys: themes.map((theme) => theme.key),
    themeLabels: themes.map((theme) => theme.label),
    focusLabel: themes[0]?.label || "Enterprise product",
    variant: getProjectMediaVariant(normalized),
    searchText: `${normalized.title} ${normalized.description}`.toLowerCase(),
  };
};

export const sortProducts = (products = []) => sortProjects(products);

export const buildProductFilters = (products = []) => {
  const activeProducts = sortProducts(products.filter((product) => product?.isActive !== false));
  const counts = new Map();

  activeProducts.forEach((product) => {
    product.themeLabels.forEach((label, index) => {
      const key = product.themeKeys[index];
      if (!key) {
        return;
      }

      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });

  const filters = [
    { key: "all", label: "All products", count: activeProducts.length, type: "base" },
    { key: "with-image", label: "With images", count: activeProducts.filter((product) => product.hasImage).length, type: "media" },
    { key: "without-image", label: "Fallback visual", count: activeProducts.filter((product) => !product.hasImage).length, type: "media" },
  ];

  const themeFilters = Array.from(counts.entries())
    .map(([key, count]) => ({
      key: `theme:${key}`,
      label: key
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      count,
      type: "theme",
    }))
    .filter((filter) => filter.count > 0);

  return [...filters, ...themeFilters];
};

export const filterProducts = (
  products = [],
  { filterKey = "all", search = "" } = {}
) => {
  const searchValue = normalizeLower(search);

  return sortProducts(products).filter((product) => {
    if (filterKey === "with-image" && !product.hasImage) {
      return false;
    }

    if (filterKey === "without-image" && product.hasImage) {
      return false;
    }

    if (filterKey.startsWith("theme:")) {
      const key = filterKey.replace("theme:", "");
      if (!product.themeKeys.includes(key)) {
        return false;
      }
    }

    if (searchValue && !product.searchText.includes(searchValue)) {
      return false;
    }

    return true;
  });
};

export const getProductNarrative = (product) => {
  const themes = detectProjectThemes(product || {});
  const themeLabels = themes.map((theme) => theme.label).join(", ");
  const focus = themeLabels || "enterprise product delivery";

  return {
    summary:
      product?.description ||
      "This public record does not include a longer editorial summary.",
    challenge: `The record suggests a product focus around ${focus}.`,
    solution:
      "The page keeps the public story grounded in the stored title, description, and image where available.",
    approach:
      "The experience presents the CMS-managed product record with clear ordering, status, and visual hierarchy.",
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

export const getProductFocusLabel = (product) => {
  const themes = detectProjectThemes(product);
  return themes[0]?.label || "Enterprise product";
};

export const getProductMetricSnippets = getProjectMetricSnippets;
export const getProductMediaVariant = getProjectMediaVariant;
export const getProductThemes = detectProjectThemes;
export const getProductDate = formatProjectDate;
export { normalizeText, formatProjectDate };
export const getProductRelatedProjects = getRelatedProjects;
export const getProductRelatedServices = getRelatedServices;
