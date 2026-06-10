// Prisma seed placeholder
// Purpose: Seed initial data for development/production
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  // TODO: Add seed logic
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
