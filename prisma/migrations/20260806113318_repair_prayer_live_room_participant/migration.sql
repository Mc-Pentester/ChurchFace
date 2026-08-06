-- Repair PrayerLiveRoomParticipant table
-- Create PrayerLiveRoomParticipant table if it doesn't exist
-- Note: Schema has both PrayerLiveRoomMember and PrayerLiveRoomParticipant

DO $$
BEGIN
    -- Create PrayerLiveRoomParticipant table if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
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
