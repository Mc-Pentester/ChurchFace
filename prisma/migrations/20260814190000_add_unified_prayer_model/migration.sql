-- Create unified Prayer table for Phase 1 migration
-- This table will eventually replace PrayerRequest, PrayerChain, PrayerCampaign, and PrayerRoom

CREATE TABLE IF NOT EXISTS "Prayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "visibility" TEXT,
    "churchId" TEXT,
    "groupId" TEXT,
    "ministryId" TEXT,
    "eventId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Individual prayer fields (type = "INDIVIDUAL")
    "content" TEXT,
    "category" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    
    -- Collaborative fields (type = "COLLABORATIVE_CHAIN" | "COLLABORATIVE_CAMPAIGN" | "LIVE_ROOM")
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roomType" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "maxParticipants" INTEGER,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    
    -- Campaign fields (type = "COLLABORATIVE_CAMPAIGN")
    "campaignType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    
    -- Hierarchical relations (for chains in campaigns)
    "parentPrayerId" TEXT,
    
    CONSTRAINT "Prayer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prayer_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prayer_parentPrayerId_fkey" FOREIGN KEY ("parentPrayerId") REFERENCES "Prayer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Prayer_type_idx" ON "Prayer"("type");
CREATE INDEX IF NOT EXISTS "Prayer_churchId_idx" ON "Prayer"("churchId");
CREATE INDEX IF NOT EXISTS "Prayer_createdBy_idx" ON "Prayer"("createdBy");
CREATE INDEX IF NOT EXISTS "Prayer_isActive_idx" ON "Prayer"("isActive");
CREATE INDEX IF NOT EXISTS "Prayer_parentPrayerId_idx" ON "Prayer"("parentPrayerId");
