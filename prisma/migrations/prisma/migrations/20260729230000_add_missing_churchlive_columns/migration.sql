-- Add missing ChurchLive columns

ALTER TABLE "ChurchLive"
ADD COLUMN IF NOT EXISTS "description" TEXT;