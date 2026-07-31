import { useEffect, useMemo, useState } from "react";

import { getHeroVisual } from "../../../api/hero-visual.api";
import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import { getTestimonials } from "../../../api/testimonials.api";
import herobanner from "../../../assets/images/hero/hero-optimized.jpg";
import {
  DEFAULT_SERVICE_MENU_ITEMS,
  getFeaturedService,
  getServiceMenuGroups,
} from "../../services/data/serviceCatalog";
import { getSafeImageUrl } from "../../../shared/utils";

const fallbackHero = {
  heroHeadingLines: ["Enterprise systems", "Designed like a brand experience"],
  heroSubtitle:
    "Technosthan builds software, cloud platforms, and digital experiences for teams that need clarity, speed, and trust.",
  heroDescription:
    "The public site now reads like an editorial technology magazine: large type, immersive images, and storytelling that moves with the scroll.",
  mainImageUrl: herobanner,
  mainImageAlt: "Technosthan editorial hero",
  features: DEFAULT_SERVICE_MENU_ITEMS.slice(0, 4).map((item, index) => ({
    id: item.id,
    title: item.title,
    shortDescription: item.shortDescription,
    iconKey: item.iconKey,
    displayOrder: index + 1,
    isActive: true,
  })),
};

const fallbackProjects = [
  {
    id: "fallback-project-1",
    title: "Enterprise Product Platform",
    description:
      "A high-trust digital product experience shaped around strategy, product, and scalable delivery.",
    imageUrl: herobanner,
    category: "Digital Experience",
    route: "/products",
  },
  {
    id: "fallback-project-2",
    title: "Cloud Delivery System",
    description:
      "A cloud-first implementation that balances governance, performance, and operational calm.",
    imageUrl: herobanner,
    category: "Cloud & Infrastructure",
    route: "/case-studies",
  },
  {
    id: "fallback-project-3",
    title: "AI-Assisted Operations",
    description:
      "An editorial product narrative for workflow automation, AI tooling, and measurable adoption.",
    imageUrl: herobanner,
    category: "AI & Data",
    route: "/technology",
  },
];

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeHero = (heroVisual) => ({
  ...fallbackHero,
  ...(heroVisual || {}),
  heroHeadingLines:
    Array.isArray(heroVisual?.heroHeadingLines) &&
    heroVisual.heroHeadingLines.length > 0
      ? heroVisual.heroHeadingLines.map((line) => normalizeText(line)).filter(Boolean)
      : fallbackHero.heroHeadingLines,
  heroSubtitle: normalizeText(heroVisual?.heroSubtitle, fallbackHero.heroSubtitle),
  heroDescription: normalizeText(
    heroVisual?.heroDescription,
    fallbackHero.heroDescription
  ),
  mainImageUrl: heroVisual?.mainImageUrl
    ? getSafeImageUrl(heroVisual.mainImageUrl)
    : fallbackHero.mainImageUrl,
  mainImageAlt: normalizeText(
    heroVisual?.mainImageAlt,
    fallbackHero.mainImageAlt
  ),
});

const normalizeProject = (project, index) => ({
  id: project?.id || `project-${index}`,
  title: normalizeText(project?.title, `Selected work ${index + 1}`),
  description: normalizeText(
    project?.description,
    "Editorial case study built for scale, clarity, and trust."
  ),
  imageUrl: project?.imageUrl ? getSafeImageUrl(project.imageUrl) : "",
  route: project?.route || "/products",
  category: normalizeText(project?.category, "Enterprise Product"),
});

const normalizeTestimonial = (testimonial, index) => ({
  id: testimonial?.id || `testimonial-${index}`,
  clientName: normalizeText(testimonial?.clientName),
  company: normalizeText(testimonial?.company),
  designation: normalizeText(testimonial?.designation),
  feedback: normalizeText(testimonial?.feedback),
  imageUrl: testimonial?.imageUrl ? getSafeImageUrl(testimonial.imageUrl) : "",
  rating: testimonial?.rating ?? testimonial?.stars ?? testimonial?.score ?? null,
  logoUrl: testimonial?.logoUrl ? getSafeImageUrl(testimonial.logoUrl) : "",
  displayOrder:
    testimonial?.displayOrder === undefined || testimonial?.displayOrder === null
      ? null
      : Number(testimonial.displayOrder),
  isActive: testimonial?.isActive !== false,
});

export default function useHomeEditorial() {
  const [heroVisual, setHeroVisual] = useState(normalizeHero());
  const [services, setServices] = useState(DEFAULT_SERVICE_MENU_ITEMS);
  const [projects, setProjects] = useState(fallbackProjects);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [heroRes, servicesRes, projectsRes, testimonialsRes] =
        await Promise.allSettled([
          getHeroVisual(),
          getServices(),
          getProjects(),
          getTestimonials(),
        ]);

      if (!mounted) {
        return;
      }

      if (heroRes.status === "fulfilled") {
        setHeroVisual(normalizeHero(heroRes.value.data?.data || null));
      }

      if (servicesRes.status === "fulfilled") {
        const nextServices = servicesRes.value.data?.data || [];
        setServices(
          nextServices.length > 0 ? nextServices : DEFAULT_SERVICE_MENU_ITEMS
        );
      }

      if (projectsRes.status === "fulfilled") {
        const nextProjects = projectsRes.value.data?.data || [];
        setProjects(
          nextProjects.length > 0
            ? nextProjects.map(normalizeProject)
            : fallbackProjects
        );
      }

      if (testimonialsRes.status === "fulfilled") {
        const nextTestimonials = testimonialsRes.value.data?.data || [];
        setTestimonials(
          nextTestimonials.length > 0
            ? nextTestimonials.map(normalizeTestimonial).filter(
                (item) => item && item.clientName && item.feedback
              )
            : []
        );
      }

      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredService = useMemo(
    () => getFeaturedService(services),
    [services]
  );

  const serviceGroups = useMemo(
    () => getServiceMenuGroups(services),
    [services]
  );

  const stats = useMemo(() => {
    const activeServices = services.filter((service) => service?.isActive !== false);
    return [
      {
        key: "projects",
        order: 1,
        label: "Projects shipped",
        value: projects.length,
        description:
          "Published project records currently visible in the CMS-backed portfolio.",
      },
      {
        key: "services",
        order: 2,
        label: "Active service lines",
        value: activeServices.length,
        description:
          "Live service offerings currently published for visitors to explore.",
      },
      {
        key: "testimonials",
        order: 3,
        label: "Client narratives",
        value: testimonials.length,
        description:
          "Verified testimonial entries currently available on the public site.",
      },
    ].filter((item) => item.label && item.value !== null && item.value !== undefined);
  }, [projects.length, services, testimonials.length]);

  return {
    heroVisual,
    services,
    serviceGroups,
    featuredService,
    projects,
    testimonials,
    stats,
    loading,
  };
}
