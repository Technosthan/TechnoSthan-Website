import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@technosthan.com"
  ).trim().toLowerCase();
  const adminPassword =
    process.env.ADMIN_PASSWORD || "change-me";
  const adminPasswordHash = await bcrypt.hash(
    adminPassword,
    10
  );

  await prisma.student.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: "TechnoSthan Account",
      role: "admin",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "TechnoSthan Account",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const testimonialCount =
    await prisma.testimonial.count();

  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          clientName: "Aarav Sharma",
          designation: "Founder",
          company: "BluePeak Retail",
          feedback:
            "Technosthan delivered a reliable platform and stayed proactive throughout the project.",
          displayOrder: 1,
          isActive: true,
        },
        {
          clientName: "Neha Gupta",
          designation: "Operations Head",
          company: "CareGrid Health",
          feedback:
            "The team understood our workflow quickly and shipped a polished product on time.",
          displayOrder: 2,
          isActive: true,
        },
      ],
    });
  }

  const heroCount =
    await prisma.heroVisualSetting.count();

  if (heroCount === 0) {
    const setting =
      await prisma.heroVisualSetting.create({
        data: {
          mainImageAlt:
            "Technosthan premium hero visual",
          heroHeadingLines: [
            "Transforming Businesses",
            "Through Modern",
            "Technology",
          ],
          autoTransitionInterval: 4000,
          isActive: true,
        },
      });

    await prisma.heroVisualFeature.createMany({
      data: [
        {
          settingId: setting.id,
          title: "Enterprise",
          iconKey: "FiBriefcase",
          iconPosition: "top-left",
          displayOrder: 1,
          transitionDuration: 3500,
          isActive: true,
        },
        {
          settingId: setting.id,
          title: "Innovative",
          iconKey: "FiCpu",
          iconPosition: "bottom-right",
          displayOrder: 2,
          transitionDuration: 4200,
          isActive: true,
        },
        {
          settingId: setting.id,
          title: "Fast & Secure",
          iconKey: "FiShield",
          iconPosition: "center-right",
          displayOrder: 3,
          transitionDuration: 3900,
          isActive: true,
        },
      ],
    });
  }

  const defaultServices = [
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

  for (const service of defaultServices) {
    await prisma.service.upsert({
      where: {
        slug: service.slug,
      },
      update: service,
      create: service,
    });
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
