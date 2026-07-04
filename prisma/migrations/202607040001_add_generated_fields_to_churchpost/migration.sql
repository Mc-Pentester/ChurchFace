-- Migration: add generated fields to ChurchPost

ALTER TABLE "ChurchPost"
ADD COLUMN IF NOT EXISTS "generated" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ChurchPost"
ADD COLUMN IF NOT EXISTS "generatedType" TEXT;

ALTER TABLE "ChurchPost"
ADD COLUMN IF NOT EXISTS "generatedId" TEXT;

CREATE INDEX IF NOT EXISTS "ChurchPost_generatedType_generatedId_idx" ON "ChurchPost" ("generatedType", "generatedId");
