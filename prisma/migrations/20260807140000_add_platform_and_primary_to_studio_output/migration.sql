-- Add platform and isPrimary fields to StudioOutput
ALTER TABLE "StudioOutput" ADD COLUMN "platform" TEXT;
ALTER TABLE "StudioOutput" ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- Update enabled default to true
ALTER TABLE "StudioOutput" ALTER COLUMN "enabled" SET DEFAULT true;

-- Add indexes for new fields
CREATE INDEX "StudioOutput_isPrimary_idx" ON "StudioOutput"("isPrimary");
CREATE INDEX "StudioOutput_platform_idx" ON "StudioOutput"("platform");

-- Update existing records: set ChurchFace outputs as primary
UPDATE "StudioOutput" SET "isPrimary" = true WHERE "type" = 'CHURCHFACE' OR "type" = 'WEBRTC';
