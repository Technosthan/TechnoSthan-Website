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
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
