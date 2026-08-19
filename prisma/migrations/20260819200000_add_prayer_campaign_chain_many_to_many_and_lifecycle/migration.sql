-- ============================================================
-- MIGRATION: Add PrayerCampaignChain Many-to-Many Relation & Chain Lifecycle
-- Date: 2026-08-19
-- Description:
--   1. Add lifecycle fields to PrayerChain (status, suspendedAt, archivedAt, deletedAt)
--   2. Create PrayerCampaignChain table for many-to-many relation
--   3. Migrate existing prayerCampaignId data to PrayerCampaignChain
--   4. Keep prayerCampaignId for backward compatibility (deprecated)
-- ============================================================

-- Step 1: Add lifecycle fields to PrayerChain (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'PrayerChain' AND column_name = 'status'
    ) THEN
        ALTER TABLE "PrayerChain"
        ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'PrayerChain' AND column_name = 'suspendedAt'
    ) THEN
        ALTER TABLE "PrayerChain"
        ADD COLUMN "suspendedAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'PrayerChain' AND column_name = 'archivedAt'
    ) THEN
        ALTER TABLE "PrayerChain"
        ADD COLUMN "archivedAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'PrayerChain' AND column_name = 'deletedAt'
    ) THEN
        ALTER TABLE "PrayerChain"
        ADD COLUMN "deletedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Step 2: Create PrayerCampaignChain table for many-to-many relation (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "PrayerCampaignChain" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerCampaignChain_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add foreign key constraints for PrayerCampaignChain (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'PrayerCampaignChain_campaignId_fkey'
    ) THEN
        ALTER TABLE "PrayerCampaignChain"
        ADD CONSTRAINT "PrayerCampaignChain_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "PrayerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'PrayerCampaignChain_chainId_fkey'
    ) THEN
        ALTER TABLE "PrayerCampaignChain"
        ADD CONSTRAINT "PrayerCampaignChain_chainId_fkey"
        FOREIGN KEY ("chainId") REFERENCES "PrayerChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 4: Add unique constraint on (campaignId, chainId) (if it doesn't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "PrayerCampaignChain_campaignId_chainId_key" ON "PrayerCampaignChain"("campaignId", "chainId");

-- Step 5: Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS "PrayerCampaignChain_campaignId_idx" ON "PrayerCampaignChain"("campaignId");
CREATE INDEX IF NOT EXISTS "PrayerCampaignChain_chainId_idx" ON "PrayerCampaignChain"("chainId");

-- Step 6: Migrate existing prayerCampaignId data to PrayerCampaignChain
-- This preserves all existing Campaign ↔ Chain relationships
-- Only insert if the association doesn't already exist
INSERT INTO "PrayerCampaignChain" ("id", "campaignId", "chainId", "joinedAt")
SELECT
    gen_random_uuid()::text as id,
    "prayerCampaignId" as "campaignId",
    "id" as "chainId",
    "createdAt" as "joinedAt"
FROM "PrayerChain"
WHERE "prayerCampaignId" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "PrayerCampaignChain"
    WHERE "PrayerCampaignChain"."chainId" = "PrayerChain"."id"
    AND "PrayerCampaignChain"."campaignId" = "PrayerChain"."prayerCampaignId"
);

-- Step 7: Add comment to mark prayerCampaignId as deprecated
COMMENT ON COLUMN "PrayerChain"."prayerCampaignId" IS 'DEPRECATED: Use PrayerCampaignChain table instead. Kept for backward compatibility.';
-- Note: "chains" is a virtual relation field in Prisma, not a physical column
