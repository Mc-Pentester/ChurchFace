-- Repair all runtime columns missing from PostgreSQL
-- This migration adds all streaming, monitoring, and recording fields
-- that are in Prisma schema but not in the database

DO $$
BEGIN
    -- ============================================
    -- LIVEBROADCAST TABLE - 27 missing fields
    -- ============================================
    
    -- Owner fields (Priority 1 - Critical)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'ownerType'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "ownerType" TEXT DEFAULT 'USER';
        UPDATE "LiveBroadcast" SET "ownerType" = 'USER' WHERE "ownerType" IS NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'ownerId'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "ownerId" TEXT;
        UPDATE "LiveBroadcast" SET "ownerId" = "authorId" WHERE "ownerId" IS NULL;
    END IF;
    
    -- Recording fields (Priority 1 - Critical)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'replayUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "replayUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'recordingEnabled'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "recordingEnabled" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'recordingUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "recordingUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'recordingStatus'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "recordingStatus" TEXT DEFAULT 'STOPPED';
    END IF;
    
    -- WebRTC fields (Priority 1 - Critical)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'webrtcUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "webrtcUrl" TEXT;
    END IF;
    
    -- Stream identifiers (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'streamId'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "streamId" TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'LiveBroadcast' AND indexname = 'LiveBroadcast_streamId_key'
        ) THEN
            CREATE UNIQUE INDEX "LiveBroadcast_streamId_key" ON "LiveBroadcast"("streamId");
        END IF;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'streamKey'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "streamKey" TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'LiveBroadcast' AND indexname = 'LiveBroadcast_streamKey_key'
        ) THEN
            CREATE UNIQUE INDEX "LiveBroadcast_streamKey_key" ON "LiveBroadcast"("streamKey");
        END IF;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'ingestUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "ingestUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'playbackUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "playbackUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'rtmpsUrl'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "rtmpsUrl" TEXT;
    END IF;
    
    -- LiveKit fields (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'livekitRoom'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "livekitRoom" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'livekitToken'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "livekitToken" TEXT;
    END IF;
    
    -- Relay configuration (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'relayEnabled'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "relayEnabled" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'relayStatus'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "relayStatus" TEXT DEFAULT 'DISABLED';
    END IF;
    
    -- Encoder configuration (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'encoder'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "encoder" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'ingestProtocol'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "ingestProtocol" TEXT DEFAULT 'RTMP';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'playbackProtocol'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "playbackProtocol" TEXT DEFAULT 'WEBRTC';
    END IF;
    
    -- Monitoring data (Priority 3 - Monitoring)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'heartbeatAt'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "heartbeatAt" TIMESTAMP(3);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'ingestStatus'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "ingestStatus" TEXT DEFAULT 'OFFLINE';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'duration'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "duration" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'peakViewerCount'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "peakViewerCount" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'bitrate'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "bitrate" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'bandwidth'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "bandwidth" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'packetLoss'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "packetLoss" DOUBLE PRECISION DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'droppedFrames'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "droppedFrames" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast' AND column_name = 'cpuUsage'
    ) THEN
        ALTER TABLE "LiveBroadcast" ADD COLUMN "cpuUsage" DOUBLE PRECISION DEFAULT 0;
    END IF;
    
    -- ============================================
    -- CHURCHLIVE TABLE - 30 missing fields
    -- ============================================
    
    -- WebRTC fields (Priority 1 - Critical)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'webrtcUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "webrtcUrl" TEXT;
    END IF;
    
    -- RTMP fields (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'rtmpUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "rtmpUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'streamMode'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "streamMode" TEXT;
    END IF;
    
    -- Stream identifiers (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'streamId'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "streamId" TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'ChurchLive' AND indexname = 'ChurchLive_streamId_key'
        ) THEN
            CREATE UNIQUE INDEX "ChurchLive_streamId_key" ON "ChurchLive"("streamId");
        END IF;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'streamKey'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "streamKey" TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'ChurchLive' AND indexname = 'ChurchLive_streamKey_key'
        ) THEN
            CREATE UNIQUE INDEX "ChurchLive_streamKey_key" ON "ChurchLive"("streamKey");
        END IF;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'ingestUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "ingestUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'playbackUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "playbackUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'rtmpsUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "rtmpsUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'playUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "playUrl" TEXT;
    END IF;
    
    -- LiveKit fields (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'livekitRoom'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "livekitRoom" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'livekitToken'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "livekitToken" TEXT;
    END IF;
    
    -- Output destinations (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'outputDestinations'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "outputDestinations" JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'studioConfig'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "studioConfig" JSONB;
    END IF;
    
    -- Relay configuration (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'relayEnabled'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "relayEnabled" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'relayStatus'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "relayStatus" TEXT DEFAULT 'DISABLED';
    END IF;
    
    -- Encoder configuration (Priority 2 - Mobile Live)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'encoder'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "encoder" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'ingestProtocol'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "ingestProtocol" TEXT DEFAULT 'RTMP';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'playbackProtocol'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "playbackProtocol" TEXT DEFAULT 'WEBRTC';
    END IF;
    
    -- Monitoring data (Priority 3 - Monitoring)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'heartbeatAt'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "heartbeatAt" TIMESTAMP(3);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'ingestStatus'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "ingestStatus" TEXT DEFAULT 'OFFLINE';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'duration'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "duration" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'peakViewerCount'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "peakViewerCount" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'bitrate'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "bitrate" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'bandwidth'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "bandwidth" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'packetLoss'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "packetLoss" DOUBLE PRECISION DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'droppedFrames'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "droppedFrames" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'cpuUsage'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "cpuUsage" DOUBLE PRECISION DEFAULT 0;
    END IF;
    
    -- Recording fields (Priority 3 - Recording)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'recordingEnabled'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "recordingEnabled" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'recordingUrl'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "recordingUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchLive' AND column_name = 'recordingStatus'
    ) THEN
        ALTER TABLE "ChurchLive" ADD COLUMN "recordingStatus" TEXT DEFAULT 'STOPPED';
    END IF;
    
    -- ============================================
    -- CHURCHMEMBER TABLE - 1 missing field
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ChurchMember' AND column_name = 'notificationPreferences'
    ) THEN
        ALTER TABLE "ChurchMember" ADD COLUMN "notificationPreferences" JSONB DEFAULT '{}';
        UPDATE "ChurchMember" SET "notificationPreferences" = '{}'::jsonb WHERE "notificationPreferences" IS NULL;
    END IF;
    
    -- ============================================
    -- PRAYERLIVEROOMPARTICIPANT TABLE - Create entire table
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'PrayerLiveRoomParticipant'
    ) THEN
        CREATE TABLE "PrayerLiveRoomParticipant" (
            "id" TEXT NOT NULL,
            "roomId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "PrayerLiveRoomParticipant_pkey" PRIMARY KEY ("id")
        );
        
        -- Create indexes
        CREATE UNIQUE INDEX "PrayerLiveRoomParticipant_roomId_userId_key" 
        ON "PrayerLiveRoomParticipant"("roomId", "userId");
        
        CREATE INDEX "PrayerLiveRoomParticipant_roomId_idx" 
        ON "PrayerLiveRoomParticipant"("roomId");
        
        CREATE INDEX "PrayerLiveRoomParticipant_userId_idx" 
        ON "PrayerLiveRoomParticipant"("userId");
        
        -- Add foreign keys
        ALTER TABLE "PrayerLiveRoomParticipant"
        ADD CONSTRAINT "PrayerLiveRoomParticipant_roomId_fkey"
        FOREIGN KEY ("roomId")
        REFERENCES "PrayerLiveRoom"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
        
        ALTER TABLE "PrayerLiveRoomParticipant"
        ADD CONSTRAINT "PrayerLiveRoomParticipant_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
    
END $$;
