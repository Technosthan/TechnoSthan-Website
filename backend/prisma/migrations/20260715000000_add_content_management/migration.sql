-- Add image/meta columns to Project
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "imageAssetId" TEXT,
ADD COLUMN IF NOT EXISTS "imageStorage" TEXT,
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add new testimonial fields
ALTER TABLE "Testimonial"
ADD COLUMN IF NOT EXISTS "designation" TEXT,
ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "imageAssetId" TEXT,
ADD COLUMN IF NOT EXISTS "imageStorage" TEXT,
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Hero visual singleton settings
CREATE TABLE IF NOT EXISTS "HeroVisualSetting" (
  "id" TEXT NOT NULL,
  "mainImage" TEXT,
  "mainImageUrl" TEXT,
  "mainImageAssetId" TEXT,
  "mainImageStorage" TEXT,
  "mainImageAlt" TEXT NOT NULL,
  "autoTransitionInterval" INTEGER NOT NULL DEFAULT 4000,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HeroVisualSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HeroVisualFeature" (
  "id" TEXT NOT NULL,
  "settingId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "iconKey" TEXT,
  "iconImage" TEXT,
  "iconImageUrl" TEXT,
  "iconImageAssetId" TEXT,
  "iconImageStorage" TEXT,
  "iconPosition" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "transitionDuration" INTEGER NOT NULL DEFAULT 4000,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HeroVisualFeature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HeroVisualFeature_settingId_idx" ON "HeroVisualFeature"("settingId");

ALTER TABLE "HeroVisualFeature"
ADD CONSTRAINT "HeroVisualFeature_settingId_fkey"
FOREIGN KEY ("settingId") REFERENCES "HeroVisualSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
