-- Add configurable CTA button fields to Campaign model
ALTER TABLE "Campaign"
ADD COLUMN IF NOT EXISTS "buttonText" TEXT,
ADD COLUMN IF NOT EXISTS "redirectUrl" TEXT,
ADD COLUMN IF NOT EXISTS "buttonText2" TEXT,
ADD COLUMN IF NOT EXISTS "redirectUrl2" TEXT;
