-- Bring the legacy Service table in line with the current Prisma model.
-- The current database still has the old `description`-based shape, which
-- causes Prisma queries to fail as soon as the app reads `Service.slug`.

ALTER TABLE "Service"
ADD COLUMN IF NOT EXISTS "slug" TEXT,
ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
ADD COLUMN IF NOT EXISTS "iconKey" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "route" TEXT,
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "showInNavbar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Service"
SET
  "slug" = COALESCE(
    NULLIF("slug", ''),
    lower(regexp_replace(trim("title"), '[^a-zA-Z0-9]+', '-', 'g'))
  ),
  "shortDescription" = COALESCE(
    NULLIF("shortDescription", ''),
    NULLIF("description", ''),
    CASE
      WHEN "title" = 'Web Development' THEN 'Modern websites and web apps built for growth.'
      WHEN "title" = 'Mobile App Development' THEN 'Native and cross-platform apps for Android and iOS.'
      WHEN "title" = 'Cloud Solutions' THEN 'Cloud architecture, migrations, and scalable hosting.'
      WHEN "title" = 'DevOps' THEN 'Automation, pipelines, and release reliability.'
      WHEN "title" = 'AI Automation' THEN 'Workflows powered by intelligent automation.'
      WHEN "title" = 'Data Analytics' THEN 'Dashboards and decision support from your data.'
      WHEN "title" = 'Cybersecurity' THEN 'Threat protection, audits, and secure systems.'
      WHEN "title" = 'UI/UX Design' THEN 'Elegant interfaces and product experiences.'
      WHEN "title" = 'Education Technology' THEN 'Digital solutions for schools, platforms, and learning.'
      WHEN "title" = 'Retail & Ecommerce' THEN 'Commerce platforms with conversion-focused UX.'
      ELSE ''
    END
  ),
  "iconKey" = COALESCE(
    NULLIF("iconKey", ''),
    CASE
      WHEN "title" = 'Web Development' THEN 'FiCode'
      WHEN "title" = 'Mobile App Development' THEN 'FiSmartphone'
      WHEN "title" = 'Cloud Solutions' THEN 'FiCloud'
      WHEN "title" = 'DevOps' THEN 'FiServer'
      WHEN "title" = 'AI Automation' THEN 'FiZap'
      WHEN "title" = 'Data Analytics' THEN 'FiTrendingUp'
      WHEN "title" = 'Cybersecurity' THEN 'FiShield'
      WHEN "title" = 'UI/UX Design' THEN 'FiLayers'
      WHEN "title" = 'Education Technology' THEN 'FiMonitor'
      WHEN "title" = 'Retail & Ecommerce' THEN 'FiShoppingCart'
      ELSE NULL
    END
  ),
  "category" = COALESCE(
    NULLIF("category", ''),
    CASE
      WHEN "title" IN ('Web Development', 'Mobile App Development') THEN 'Development'
      WHEN "title" IN ('Cloud Solutions', 'DevOps') THEN 'Cloud & Infrastructure'
      WHEN "title" IN ('AI Automation', 'Data Analytics') THEN 'AI & Data'
      WHEN "title" IN ('Cybersecurity', 'UI/UX Design') THEN 'Security & Design'
      WHEN "title" IN ('Education Technology', 'Retail & Ecommerce') THEN 'Industry Solutions'
      ELSE 'Development'
    END
  ),
  "route" = COALESCE(NULLIF("route", ''), '/services'),
  "displayOrder" = CASE
    WHEN "title" = 'Web Development' THEN 1
    WHEN "title" = 'Mobile App Development' THEN 2
    WHEN "title" = 'Cloud Solutions' THEN 3
    WHEN "title" = 'DevOps' THEN 4
    WHEN "title" = 'AI Automation' THEN 5
    WHEN "title" = 'Data Analytics' THEN 6
    WHEN "title" = 'Cybersecurity' THEN 7
    WHEN "title" = 'UI/UX Design' THEN 8
    WHEN "title" = 'Education Technology' THEN 9
    WHEN "title" = 'Retail & Ecommerce' THEN 10
    ELSE COALESCE("displayOrder", 0)
  END,
  "isActive" = COALESCE("isActive", true),
  "showInNavbar" = COALESCE("showInNavbar", true),
  "featured" = CASE
    WHEN "title" IN ('Web Development', 'Cloud Solutions', 'AI Automation', 'Retail & Ecommerce') THEN true
    ELSE COALESCE("featured", false)
  END,
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "Service"
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "shortDescription" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

WITH slug_ranks AS (
  SELECT
    "id",
    "slug",
    ROW_NUMBER() OVER (
      PARTITION BY "slug"
      ORDER BY "createdAt", "id"
    ) AS "slug_rank"
  FROM "Service"
)
UPDATE "Service" AS service
SET "slug" = CASE
  WHEN slug_ranks."slug_rank" = 1 THEN service."slug"
  ELSE service."slug" || '-' || slug_ranks."slug_rank"
END
FROM slug_ranks
WHERE service."id" = slug_ranks."id"
  AND slug_ranks."slug_rank" > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");
