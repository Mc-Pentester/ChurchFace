-- ============================================================
-- MIGRATION: Add Prayer Model Relations
-- Date: 2026-08-14
-- Description: Add foreign keys and missing columns to Prayer models
--              that were created in migration 20260814140000_repair_missing_studio_prayer_tables
-- ============================================================

-- ============================================================
-- PRAYER PARTICIPANT - Add Foreign Keys
-- ============================================================

DO $$
BEGIN
    -- Add prayerChainId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerParticipant_prayerChainId_fkey'
    ) THEN
        ALTER TABLE "PrayerParticipant"
        ADD CONSTRAINT "PrayerParticipant_prayerChainId_fkey"
        FOREIGN KEY ("prayerChainId")
        REFERENCES "PrayerChain"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add userId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerParticipant_userId_fkey'
    ) THEN
        ALTER TABLE "PrayerParticipant"
        ADD CONSTRAINT "PrayerParticipant_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PRAYER SCHEDULE - Add Foreign Keys
-- ============================================================

DO $$
BEGIN
    -- Add prayerChainId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerSchedule_prayerChainId_fkey'
    ) THEN
        ALTER TABLE "PrayerSchedule"
        ADD CONSTRAINT "PrayerSchedule_prayerChainId_fkey"
        FOREIGN KEY ("prayerChainId")
        REFERENCES "PrayerChain"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add userId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerSchedule_userId_fkey'
    ) THEN
        ALTER TABLE "PrayerSchedule"
        ADD CONSTRAINT "PrayerSchedule_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PRAYER ROOM - Add Missing Columns and Foreign Keys
-- ============================================================

-- Add churchId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'PrayerRoom'
        AND column_name = 'churchId'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD COLUMN "churchId" TEXT;
    END IF;
END $$;

-- Add endedAt column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'PrayerRoom'
        AND column_name = 'endedAt'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD COLUMN "endedAt" TIMESTAMP(3);
    END IF;
END $$;

DO $$
BEGIN
    -- Add prayerChainId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoom_prayerChainId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD CONSTRAINT "PrayerRoom_prayerChainId_fkey"
        FOREIGN KEY ("prayerChainId")
        REFERENCES "PrayerChain"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add churchId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoom_churchId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD CONSTRAINT "PrayerRoom_churchId_fkey"
        FOREIGN KEY ("churchId")
        REFERENCES "Church"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add moderatorId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoom_moderatorId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD CONSTRAINT "PrayerRoom_moderatorId_fkey"
        FOREIGN KEY ("moderatorId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Add index for churchId
CREATE INDEX IF NOT EXISTS "PrayerRoom_churchId_idx"
    ON "PrayerRoom"("churchId");

-- ============================================================
-- PRAYER ROOM PARTICIPANT - Add Foreign Keys
-- ============================================================

DO $$
BEGIN
    -- Add roomId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoomParticipant_roomId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoomParticipant"
        ADD CONSTRAINT "PrayerRoomParticipant_roomId_fkey"
        FOREIGN KEY ("roomId")
        REFERENCES "PrayerRoom"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add userId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoomParticipant_userId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoomParticipant"
        ADD CONSTRAINT "PrayerRoomParticipant_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PRAYER CAMPAIGN - Add Foreign Keys
-- ============================================================

DO $$
BEGIN
    -- Add churchId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerCampaign_churchId_fkey'
    ) THEN
        ALTER TABLE "PrayerCampaign"
        ADD CONSTRAINT "PrayerCampaign_churchId_fkey"
        FOREIGN KEY ("churchId")
        REFERENCES "Church"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add createdBy foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerCampaign_createdBy_fkey'
    ) THEN
        ALTER TABLE "PrayerCampaign"
        ADD CONSTRAINT "PrayerCampaign_createdBy_fkey"
        FOREIGN KEY ("createdBy")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PRAYER ENGAGEMENT - Add Foreign Keys
-- ============================================================

DO $$
BEGIN
    -- Add prayerRequestId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerEngagement_prayerRequestId_fkey'
    ) THEN
        ALTER TABLE "PrayerEngagement"
        ADD CONSTRAINT "PrayerEngagement_prayerRequestId_fkey"
        FOREIGN KEY ("prayerRequestId")
        REFERENCES "PrayerRequest"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

    -- Add userId foreign key
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerEngagement_userId_fkey'
    ) THEN
        ALTER TABLE "PrayerEngagement"
        ADD CONSTRAINT "PrayerEngagement_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- PRAYER CHAIN - Add relation fields for new models
-- ============================================================

-- Note: PrayerChain already exists and has prayerChainId in PrayerParticipant and PrayerSchedule
-- No changes needed to PrayerChain table itself

-- ============================================================
-- CHURCH - Add relation fields for new models
-- ============================================================

-- Note: Church already exists and has churchId in PrayerRoom and PrayerCampaign
-- No changes needed to Church table itself

-- ============================================================
-- USER - Add relation fields for new models
-- ============================================================

-- Note: User already exists and has userId in all prayer models
-- No changes needed to User table itself

-- ============================================================
-- PRAYER REQUEST - Add relation for PrayerEngagement
-- ============================================================

-- Note: PrayerRequest already exists and has prayerRequestId in PrayerEngagement
-- No changes needed to PrayerRequest table itself
