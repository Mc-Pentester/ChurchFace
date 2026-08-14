-- ============================================================
-- ChurchFace - Repair migration
-- 20260814140000_repair_missing_studio_prayer_tables
--
-- Objectif :
--   - Restaurer les tables Studio et Prayer manquantes
--   - Migration totalement idempotente
--   - Ne pas recrÃ©er StudioOutput
--   - Ne pas recrÃ©er PrayerRoomParticipant
--   - Ne pas supprimer ni modifier les donnÃ©es existantes
-- ============================================================

-- ============================================================
-- STUDIO SCENE
-- ============================================================

CREATE TABLE IF NOT EXISTS "StudioScene" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "broadcastId" TEXT,
    "churchLiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioScene_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- STUDIO SOURCE
-- ============================================================

CREATE TABLE IF NOT EXISTS "StudioSource" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "settings" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "volume" INTEGER NOT NULL DEFAULT 100,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "sceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioSource_pkey" PRIMARY KEY ("id")
);

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

    CONSTRAINT "PrayerParticipant_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "PrayerSchedule_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "PrayerRoom_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "PrayerCampaign_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "PrayerEngagement_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- INDEXES - STUDIO
-- ============================================================

CREATE INDEX IF NOT EXISTS "StudioScene_broadcastId_idx"
    ON "StudioScene"("broadcastId");

CREATE INDEX IF NOT EXISTS "StudioScene_churchLiveId_idx"
    ON "StudioScene"("churchLiveId");

CREATE INDEX IF NOT EXISTS "StudioScene_order_idx"
    ON "StudioScene"("order");

CREATE INDEX IF NOT EXISTS "StudioSource_sceneId_idx"
    ON "StudioSource"("sceneId");

CREATE INDEX IF NOT EXISTS "StudioSource_type_idx"
    ON "StudioSource"("type");

-- ============================================================
-- INDEXES - PRAYER REQUEST
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerRequest_groupId_idx"
    ON "PrayerRequest"("groupId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_ministryId_idx"
    ON "PrayerRequest"("ministryId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_eventId_idx"
    ON "PrayerRequest"("eventId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_liveBroadcastId_idx"
    ON "PrayerRequest"("liveBroadcastId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_prayerCampaignId_idx"
    ON "PrayerRequest"("prayerCampaignId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_prayerRoomId_idx"
    ON "PrayerRequest"("prayerRoomId");

CREATE INDEX IF NOT EXISTS "PrayerRequest_scheduledAt_idx"
    ON "PrayerRequest"("scheduledAt");

CREATE INDEX IF NOT EXISTS "PrayerRequest_status_idx"
    ON "PrayerRequest"("status");

-- ============================================================
-- INDEXES - PRAYER CHAIN
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerChain_ownerId_idx"
    ON "PrayerChain"("ownerId");

CREATE INDEX IF NOT EXISTS "PrayerChain_churchId_idx"
    ON "PrayerChain"("churchId");

CREATE INDEX IF NOT EXISTS "PrayerChain_groupId_idx"
    ON "PrayerChain"("groupId");

CREATE INDEX IF NOT EXISTS "PrayerChain_ministryId_idx"
    ON "PrayerChain"("ministryId");

CREATE INDEX IF NOT EXISTS "PrayerChain_eventId_idx"
    ON "PrayerChain"("eventId");

CREATE INDEX IF NOT EXISTS "PrayerChain_prayerCampaignId_idx"
    ON "PrayerChain"("prayerCampaignId");

CREATE INDEX IF NOT EXISTS "PrayerChain_visibility_idx"
    ON "PrayerChain"("visibility");

CREATE INDEX IF NOT EXISTS "PrayerChain_scheduledStart_idx"
    ON "PrayerChain"("scheduledStart");

-- ============================================================
-- INDEXES - PRAYER PARTICIPANT
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerParticipant_prayerChainId_idx"
    ON "PrayerParticipant"("prayerChainId");

CREATE INDEX IF NOT EXISTS "PrayerParticipant_userId_idx"
    ON "PrayerParticipant"("userId");

CREATE INDEX IF NOT EXISTS "PrayerParticipant_role_idx"
    ON "PrayerParticipant"("role");

CREATE UNIQUE INDEX IF NOT EXISTS
    "PrayerParticipant_prayerChainId_userId_key"
    ON "PrayerParticipant"("prayerChainId", "userId");

-- ============================================================
-- INDEXES - PRAYER SCHEDULE
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerSchedule_prayerChainId_idx"
    ON "PrayerSchedule"("prayerChainId");

CREATE INDEX IF NOT EXISTS "PrayerSchedule_userId_idx"
    ON "PrayerSchedule"("userId");

CREATE INDEX IF NOT EXISTS "PrayerSchedule_hour_idx"
    ON "PrayerSchedule"("hour");

CREATE UNIQUE INDEX IF NOT EXISTS
    "PrayerSchedule_prayerChainId_userId_hour_dayOfWeek_key"
    ON "PrayerSchedule"(
        "prayerChainId",
        "userId",
        "hour",
        "dayOfWeek"
    );

-- ============================================================
-- INDEXES - PRAYER ROOM
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerRoom_prayerChainId_idx"
    ON "PrayerRoom"("prayerChainId");

CREATE INDEX IF NOT EXISTS "PrayerRoom_moderatorId_idx"
    ON "PrayerRoom"("moderatorId");

CREATE INDEX IF NOT EXISTS "PrayerRoom_isActive_idx"
    ON "PrayerRoom"("isActive");

CREATE INDEX IF NOT EXISTS "PrayerRoom_scheduledStart_idx"
    ON "PrayerRoom"("scheduledStart");

-- ============================================================
-- INDEXES - PRAYER ROOM PARTICIPANT
-- Cette table existe dÃ©jÃ  en staging.
-- On crÃ©e seulement les index manquants.
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerRoomParticipant_roomId_idx"
    ON "PrayerRoomParticipant"("roomId");

CREATE INDEX IF NOT EXISTS "PrayerRoomParticipant_userId_idx"
    ON "PrayerRoomParticipant"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS
    "PrayerRoomParticipant_roomId_userId_key"
    ON "PrayerRoomParticipant"("roomId", "userId");

-- ============================================================
-- INDEXES - PRAYER CAMPAIGN
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerCampaign_churchId_idx"
    ON "PrayerCampaign"("churchId");

CREATE INDEX IF NOT EXISTS "PrayerCampaign_createdBy_idx"
    ON "PrayerCampaign"("createdBy");

CREATE INDEX IF NOT EXISTS "PrayerCampaign_startDate_endDate_idx"
    ON "PrayerCampaign"("startDate", "endDate");

CREATE INDEX IF NOT EXISTS "PrayerCampaign_type_idx"
    ON "PrayerCampaign"("type");

CREATE INDEX IF NOT EXISTS "PrayerCampaign_isActive_idx"
    ON "PrayerCampaign"("isActive");

-- ============================================================
-- INDEXES - PRAYER ENGAGEMENT
-- ============================================================

CREATE INDEX IF NOT EXISTS "PrayerEngagement_prayerRequestId_idx"
    ON "PrayerEngagement"("prayerRequestId");

CREATE INDEX IF NOT EXISTS "PrayerEngagement_userId_idx"
    ON "PrayerEngagement"("userId");

CREATE INDEX IF NOT EXISTS "PrayerEngagement_type_idx"
    ON "PrayerEngagement"("type");

CREATE INDEX IF NOT EXISTS "PrayerEngagement_createdAt_idx"
    ON "PrayerEngagement"("createdAt");

-- ============================================================
-- FOREIGN KEYS
-- AjoutÃ©es uniquement si elles n'existent pas.
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'StudioScene_broadcastId_fkey'
    ) THEN
        ALTER TABLE "StudioScene"
        ADD CONSTRAINT "StudioScene_broadcastId_fkey"
        FOREIGN KEY ("broadcastId")
        REFERENCES "LiveBroadcast"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'StudioScene_churchLiveId_fkey'
    ) THEN
        ALTER TABLE "StudioScene"
        ADD CONSTRAINT "StudioScene_churchLiveId_fkey"
        FOREIGN KEY ("churchLiveId")
        REFERENCES "ChurchLive"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'StudioSource_sceneId_fkey'
    ) THEN
        ALTER TABLE "StudioSource"
        ADD CONSTRAINT "StudioSource_sceneId_fkey"
        FOREIGN KEY ("sceneId")
        REFERENCES "StudioScene"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;

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
