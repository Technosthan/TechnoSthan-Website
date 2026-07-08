-- Add missing hero CTA columns for older databases that were created before
-- primary/secondary CTA links existed in the Prisma schema.
ALTER TABLE "HeroContent"
ADD COLUMN IF NOT EXISTS "primaryCtaLink" TEXT NOT NULL DEFAULT '/programs',
ADD COLUMN IF NOT EXISTS "secondaryCtaLink" TEXT NOT NULL DEFAULT '/contact';

