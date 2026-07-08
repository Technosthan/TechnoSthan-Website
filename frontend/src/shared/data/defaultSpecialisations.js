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

export const mergeDefaultSpecialisations = (items = []) => {
  const list = Array.isArray(items) ? items : [];
  const existingSlugs = new Set(list.map((item) => String(item?.slug || "").trim()));
  return [...list, ...DEFAULT_SPECIALISATIONS.filter((item) => !existingSlugs.has(item.slug))];
};
