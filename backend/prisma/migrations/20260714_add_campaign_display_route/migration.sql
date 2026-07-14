-- Add route-based targeting to campaigns.
ALTER TABLE "Campaign"
ADD COLUMN IF NOT EXISTS "displayRoute" TEXT;

CREATE INDEX IF NOT EXISTS "Campaign_displayRoute_idx"
ON "Campaign" ("displayRoute");

CREATE UNIQUE INDEX IF NOT EXISTS "Campaign_active_displayRoute_key"
ON "Campaign" ("displayRoute")
WHERE "isActive" = true AND "displayRoute" IS NOT NULL;
