-- Keep the legacy Service.description column compatible with the newer Prisma model.
-- Prisma no longer supplies this field on inserts, so we give it a harmless default.

ALTER TABLE "Service"
ALTER COLUMN "description" SET DEFAULT '';
