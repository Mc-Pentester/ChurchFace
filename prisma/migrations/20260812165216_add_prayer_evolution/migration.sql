-- Migration manuelle pour l'évolution du module Prières
-- Date: 2026-08-12
-- Description: Ajout des nouveaux modèles et extensions pour le module Prières (100% rétrocompatible)

-- ============================================
-- EXTENSIONS DE TABLES EXISTANTES
-- ============================================

-- Extension de PrayerRequest (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'groupId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "groupId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'ministryId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "ministryId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'eventId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "eventId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'liveBroadcastId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "liveBroadcastId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'prayerCampaignId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "prayerCampaignId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'prayerRoomId') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "prayerRoomId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'scheduledAt') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "scheduledAt" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerRequest' AND column_name = 'status') THEN
        ALTER TABLE "PrayerRequest" ADD COLUMN "status" TEXT DEFAULT 'ACTIVE';
    END IF;
END $$;

-- Extension de PrayerChain (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'ownerId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "ownerId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'ownerType') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "ownerType" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'churchId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "churchId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'groupId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "groupId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'ministryId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "ministryId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'eventId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "eventId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'imageUrl') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "imageUrl" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'visibility') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "visibility" TEXT DEFAULT 'PUBLIC';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'prayerCampaignId') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "prayerCampaignId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'scheduledStart') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "scheduledStart" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChain' AND column_name = 'scheduledEnd') THEN
        ALTER TABLE "PrayerChain" ADD COLUMN "scheduledEnd" TIMESTAMP(3);
    END IF;
END $$;

-- Extension de PrayerChainLink (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChainLink' AND column_name = 'role') THEN
        ALTER TABLE "PrayerChainLink" ADD COLUMN "role" TEXT DEFAULT 'PARTICIPANT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChainLink' AND column_name = 'joinedAt') THEN
        ALTER TABLE "PrayerChainLink" ADD COLUMN "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChainLink' AND column_name = 'lastPrayedAt') THEN
        ALTER TABLE "PrayerChainLink" ADD COLUMN "lastPrayedAt" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChainLink' AND column_name = 'prayerCount') THEN
        ALTER TABLE "PrayerChainLink" ADD COLUMN "prayerCount" INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerChainLink' AND column_name = 'notificationEnabled') THEN
        ALTER TABLE "PrayerChainLink" ADD COLUMN "notificationEnabled" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Extension de PrayerTestimony (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PrayerTestimony' AND column_name = 'videoUrl') THEN
        ALTER TABLE "PrayerTestimony" ADD COLUMN "videoUrl" TEXT;
    END IF;
END $$;

-- ============================================
-- CRÉATION DES NOUVELLES TABLES
-- ============================================

-- PrayerParticipant - Système de participation avancé aux chaînes de prière
CREATE TABLE IF NOT EXISTS "PrayerParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerChainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPrayedAt" TIMESTAMP(3),
    "prayerCount" INTEGER NOT NULL DEFAULT 0,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PrayerParticipant_prayerChainId_fkey" FOREIGN KEY ("prayerChainId") REFERENCES "PrayerChain"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PrayerSchedule - Calendrier d'intercession
CREATE TABLE IF NOT EXISTS "PrayerSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerChainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "dayOfWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerSchedule_prayerChainId_fkey" FOREIGN KEY ("prayerChainId") REFERENCES "PrayerChain"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PrayerRoom - Salles de prière étendues (text/audio/video)
CREATE TABLE IF NOT EXISTS "PrayerRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "PrayerRoom_prayerChainId_fkey" FOREIGN KEY ("prayerChainId") REFERENCES "PrayerChain"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrayerRoom_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PrayerRoomParticipant - Participants aux salles de prière
CREATE TABLE IF NOT EXISTS "PrayerRoomParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "hasHandRaised" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PrayerRoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PrayerCampaign - Campagnes de prière (jeûne, veillée, etc.)
CREATE TABLE IF NOT EXISTS "PrayerCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "PrayerCampaign_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrayerCampaign_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PrayerEngagement - Nouveaux types d'engagement
CREATE TABLE IF NOT EXISTS "PrayerEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerEngagement_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- CRÉATION DES INDEXES (idempotent)
-- ============================================

-- Indexes pour PrayerRequest
CREATE INDEX IF NOT EXISTS "PrayerRequest_groupId_idx" ON "PrayerRequest"("groupId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_ministryId_idx" ON "PrayerRequest"("ministryId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_eventId_idx" ON "PrayerRequest"("eventId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_liveBroadcastId_idx" ON "PrayerRequest"("liveBroadcastId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_prayerCampaignId_idx" ON "PrayerRequest"("prayerCampaignId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_prayerRoomId_idx" ON "PrayerRequest"("prayerRoomId");
CREATE INDEX IF NOT EXISTS "PrayerRequest_scheduledAt_idx" ON "PrayerRequest"("scheduledAt");
CREATE INDEX IF NOT EXISTS "PrayerRequest_status_idx" ON "PrayerRequest"("status");

-- Indexes pour PrayerChain
CREATE INDEX IF NOT EXISTS "PrayerChain_ownerId_idx" ON "PrayerChain"("ownerId");
CREATE INDEX IF NOT EXISTS "PrayerChain_churchId_idx" ON "PrayerChain"("churchId");
CREATE INDEX IF NOT EXISTS "PrayerChain_groupId_idx" ON "PrayerChain"("groupId");
CREATE INDEX IF NOT EXISTS "PrayerChain_ministryId_idx" ON "PrayerChain"("ministryId");
CREATE INDEX IF NOT EXISTS "PrayerChain_eventId_idx" ON "PrayerChain"("eventId");
CREATE INDEX IF NOT EXISTS "PrayerChain_prayerCampaignId_idx" ON "PrayerChain"("prayerCampaignId");
CREATE INDEX IF NOT EXISTS "PrayerChain_visibility_idx" ON "PrayerChain"("visibility");
CREATE INDEX IF NOT EXISTS "PrayerChain_scheduledStart_idx" ON "PrayerChain"("scheduledStart");

-- Indexes pour PrayerParticipant
CREATE INDEX IF NOT EXISTS "PrayerParticipant_prayerChainId_idx" ON "PrayerParticipant"("prayerChainId");
CREATE INDEX IF NOT EXISTS "PrayerParticipant_userId_idx" ON "PrayerParticipant"("userId");
CREATE INDEX IF NOT EXISTS "PrayerParticipant_role_idx" ON "PrayerParticipant"("role");

-- Indexes pour PrayerSchedule
CREATE INDEX IF NOT EXISTS "PrayerSchedule_prayerChainId_idx" ON "PrayerSchedule"("prayerChainId");
CREATE INDEX IF NOT EXISTS "PrayerSchedule_userId_idx" ON "PrayerSchedule"("userId");
CREATE INDEX IF NOT EXISTS "PrayerSchedule_hour_idx" ON "PrayerSchedule"("hour");

-- Indexes pour PrayerRoom
CREATE INDEX IF NOT EXISTS "PrayerRoom_prayerChainId_idx" ON "PrayerRoom"("prayerChainId");
CREATE INDEX IF NOT EXISTS "PrayerRoom_moderatorId_idx" ON "PrayerRoom"("moderatorId");
CREATE INDEX IF NOT EXISTS "PrayerRoom_isActive_idx" ON "PrayerRoom"("isActive");
CREATE INDEX IF NOT EXISTS "PrayerRoom_scheduledStart_idx" ON "PrayerRoom"("scheduledStart");

-- Indexes pour PrayerRoomParticipant
CREATE INDEX IF NOT EXISTS "PrayerRoomParticipant_roomId_idx" ON "PrayerRoomParticipant"("roomId");
CREATE INDEX IF NOT EXISTS "PrayerRoomParticipant_userId_idx" ON "PrayerRoomParticipant"("userId");

-- Indexes pour PrayerCampaign
CREATE INDEX IF NOT EXISTS "PrayerCampaign_churchId_idx" ON "PrayerCampaign"("churchId");
CREATE INDEX IF NOT EXISTS "PrayerCampaign_createdBy_idx" ON "PrayerCampaign"("createdBy");
CREATE INDEX IF NOT EXISTS "PrayerCampaign_startDate_endDate_idx" ON "PrayerCampaign"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "PrayerCampaign_type_idx" ON "PrayerCampaign"("type");
CREATE INDEX IF NOT EXISTS "PrayerCampaign_isActive_idx" ON "PrayerCampaign"("isActive");

-- Indexes pour PrayerEngagement
CREATE INDEX IF NOT EXISTS "PrayerEngagement_prayerRequestId_idx" ON "PrayerEngagement"("prayerRequestId");
CREATE INDEX IF NOT EXISTS "PrayerEngagement_userId_idx" ON "PrayerEngagement"("userId");
CREATE INDEX IF NOT EXISTS "PrayerEngagement_type_idx" ON "PrayerEngagement"("type");
CREATE INDEX IF NOT EXISTS "PrayerEngagement_createdAt_idx" ON "PrayerEngagement"("createdAt");

-- ============================================
-- CRÉATION DES CONTRAINTES D'UNICITÉ (idempotent)
-- ============================================

-- Contrainte d'unicité pour PrayerParticipant
CREATE UNIQUE INDEX IF NOT EXISTS "PrayerParticipant_prayerChainId_userId_key" ON "PrayerParticipant"("prayerChainId", "userId");

-- Contrainte d'unicité pour PrayerSchedule
CREATE UNIQUE INDEX IF NOT EXISTS "PrayerSchedule_prayerChainId_userId_hour_dayOfWeek_key" ON "PrayerSchedule"("prayerChainId", "userId", "hour", "dayOfWeek");

-- Contrainte d'unicité pour PrayerRoomParticipant
CREATE UNIQUE INDEX IF NOT EXISTS "PrayerRoomParticipant_roomId_userId_key" ON "PrayerRoomParticipant"("roomId", "userId");
