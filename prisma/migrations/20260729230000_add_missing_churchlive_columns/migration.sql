-- Add missing ChurchLive columns

ALTER TABLE "Church"
ADD COLUMN IF NOT EXISTS "schedule" TEXT;

ALTER TABLE "ChurchLive"
ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "metadata" JSONB;