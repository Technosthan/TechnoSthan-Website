import hospitalityIcon from "../assets/hospitality.png";
import innovationIcon from "../assets/innovation.png";
import agritechIcon from "../assets/agri.png";
import itIcon from "../assets/it.png";

export const DEFAULT_VERTICAL_IMAGE_MAP = {
  DEFAULT_HOSPITALITY: hospitalityIcon,
  DEFAULT_INNOVATION: innovationIcon,
  DEFAULT_AGRITECH: agritechIcon,
  DEFAULT_IT: itIcon,
};

export const DEFAULT_BUSINESS_VERTICALS = [
  {
    _id: "default-technosthan-hospitality",
    title: "TECHNOSTHAN HOSPITALITY",
    description:
      "Advanced hospitality platforms, booking systems, and management tools for hotels and resorts.",
    imageUrl: "DEFAULT_HOSPITALITY",
    image: hospitalityIcon,
    isDefault: true,
    path: "/services/technosthan-hospitality",
    sortOrder: 1,
  },
  {
    _id: "default-technosthan-innovations-hub",
    title: "TECHNOSTHAN INNOVATIONS HUB",
    description:
      "Product innovation, custom application development, and digital transformation solutions.",
    imageUrl: "DEFAULT_INNOVATION",
    image: innovationIcon,
    isDefault: true,
    path: "https://ih.technosthan.com",
    sortOrder: 2,
  },
  {
    _id: "default-technosthan-agritech",
    title: "TECHNOSTHAN AGRITECH",
    description:
      "Smart agri-tech solutions, farm automation, and data-driven agricultural growth services.",
    imageUrl: "DEFAULT_AGRITECH",
    image: agritechIcon,
    isDefault: true,
    path: "https://agritech.technosthan.com",
    sortOrder: 3,
  },
  {
    _id: "default-technosthan-it-services",
    title: "TECHNOSTHAN IT SERVICES",
    description:
      "Comprehensive IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
    imageUrl: "DEFAULT_IT",
    image: itIcon,
    isDefault: true,
    path: "https://it.technosthan.com",
    sortOrder: 4,
  },
];
