-- ============================================================
-- ChurchFace
-- 20260814140000_repair_missing_studio_prayer_tables
--
-- Repair migration
-- Basée sur l'état réel de la base staging.
--
-- IMPORTANT :
-- - aucune donnée existante n'est supprimée
-- - aucune table existante n'est recréée
-- - aucune colonne existante n'est modifiée
-- - StudioOutput / PrayerRoomParticipant ne sont pas recréés
-- ============================================================


-- ============================================================
-- PRAYER PARTICIPANT
-- ============================================================

CREATE TABLE IF NOT EXISTS "PrayerParticipant" (
    "id" TEXT NOT NULL,
    "prayerChainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPrayedAt" TIMESTAMP(3),
    "prayerCount" INTEGER NOT NULL DEFAULT 0,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrayerParticipant_pkey"
        PRIMARY KEY ("id")
);


-- ============================================================
-- PRAYER SCHEDULE
-- ============================================================

CREATE TABLE IF NOT EXISTS "PrayerSchedule" (
    "id" TEXT NOT NULL,
    "prayerChainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "dayOfWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerSchedule_pkey"
        PRIMARY KEY ("id")
);


-- ============================================================
-- PRAYER ROOM
-- ============================================================

CREATE TABLE IF NOT EXISTS "PrayerRoom" (
    "id" TEXT NOT NULL,
    "prayerChainId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "roomType" TEXT NOT NULL DEFAULT 'TEXT',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moderatorId" TEXT NOT NULL,
    "maxParticipants" INTEGER,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PrayerRoom_pkey"
        PRIMARY KEY ("id")
);


-- ============================================================
-- PRAYER CAMPAIGN
-- ============================================================

CREATE TABLE IF NOT EXISTS "PrayerCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "churchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerCampaign_pkey"
        PRIMARY KEY ("id")
);


-- ============================================================
-- PRAYER ENGAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS "PrayerEngagement" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerEngagement_pkey"
        PRIMARY KEY ("id")
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS
    "PrayerParticipant_prayerChainId_idx"
ON "PrayerParticipant"("prayerChainId");

CREATE INDEX IF NOT EXISTS
    "PrayerParticipant_userId_idx"
ON "PrayerParticipant"("userId");

CREATE INDEX IF NOT EXISTS
    "PrayerParticipant_role_idx"
ON "PrayerParticipant"("role");

CREATE UNIQUE INDEX IF NOT EXISTS
    "PrayerParticipant_prayerChainId_userId_key"
ON "PrayerParticipant"("prayerChainId", "userId");


CREATE INDEX IF NOT EXISTS
    "PrayerSchedule_prayerChainId_idx"
ON "PrayerSchedule"("prayerChainId");

CREATE INDEX IF NOT EXISTS
    "PrayerSchedule_userId_idx"
ON "PrayerSchedule"("userId");

CREATE INDEX IF NOT EXISTS
    "PrayerSchedule_hour_idx"
ON "PrayerSchedule"("hour");

CREATE UNIQUE INDEX IF NOT EXISTS
    "PrayerSchedule_prayerChainId_userId_hour_dayOfWeek_key"
ON "PrayerSchedule"(
    "prayerChainId",
    "userId",
    "hour",
    "dayOfWeek"
);


CREATE INDEX IF NOT EXISTS
    "PrayerRoom_prayerChainId_idx"
ON "PrayerRoom"("prayerChainId");

CREATE INDEX IF NOT EXISTS
    "PrayerRoom_moderatorId_idx"
ON "PrayerRoom"("moderatorId");

CREATE INDEX IF NOT EXISTS
    "PrayerRoom_isActive_idx"
ON "PrayerRoom"("isActive");

CREATE INDEX IF NOT EXISTS
    "PrayerRoom_scheduledStart_idx"
ON "PrayerRoom"("scheduledStart");


CREATE INDEX IF NOT EXISTS
    "PrayerCampaign_churchId_idx"
ON "PrayerCampaign"("churchId");

CREATE INDEX IF NOT EXISTS
    "PrayerCampaign_createdBy_idx"
ON "PrayerCampaign"("createdBy");

CREATE INDEX IF NOT EXISTS
    "PrayerCampaign_startDate_endDate_idx"
ON "PrayerCampaign"("startDate", "endDate");

CREATE INDEX IF NOT EXISTS
    "PrayerCampaign_type_idx"
ON "PrayerCampaign"("type");

CREATE INDEX IF NOT EXISTS
    "PrayerCampaign_isActive_idx"
ON "PrayerCampaign"("isActive");


CREATE INDEX IF NOT EXISTS
    "PrayerEngagement_prayerRequestId_idx"
ON "PrayerEngagement"("prayerRequestId");

CREATE INDEX IF NOT EXISTS
    "PrayerEngagement_userId_idx"
ON "PrayerEngagement"("userId");

CREATE INDEX IF NOT EXISTS
    "PrayerEngagement_type_idx"
ON "PrayerEngagement"("type");

CREATE INDEX IF NOT EXISTS
    "PrayerEngagement_createdAt_idx"
ON "PrayerEngagement"("createdAt");


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

DO $$
BEGIN

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


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerRoom_prayerChainId_fkey'
    ) THEN
        ALTER TABLE "PrayerRoom"
        ADD CONSTRAINT "PrayerRoom_prayerChainId_fkey"
        FOREIGN KEY ("prayerChainId")
        REFERENCES "PrayerChain"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


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


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'PrayerCampaign_churchId_fkey'
    ) THEN
        ALTER TABLE "PrayerCampaign"
        ADD CONSTRAINT "PrayerCampaign_churchId_fkey"
        FOREIGN KEY ("churchId")
        REFERENCES "Church"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


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