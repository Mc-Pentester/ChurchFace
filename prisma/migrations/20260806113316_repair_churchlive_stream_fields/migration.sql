-- Repair ChurchLive stream fields
-- Add rtmpUrl, streamKey, and egressId columns

DO $$
BEGIN
    -- Add rtmpUrl column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ChurchLive'
        AND column_name = 'rtmpUrl'
    ) THEN
        ALTER TABLE "ChurchLive"
        ADD COLUMN "rtmpUrl" TEXT;
    END IF;

    -- Add streamKey column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ChurchLive'
        AND column_name = 'streamKey'
    ) THEN
        ALTER TABLE "ChurchLive"
        ADD COLUMN "streamKey" TEXT;
        
        -- Create unique index for streamKey if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE tablename = 'ChurchLive'
            AND indexname = 'ChurchLive_streamKey_key'
        ) THEN
            CREATE UNIQUE INDEX "ChurchLive_streamKey_key" ON "ChurchLive"("streamKey");
        END IF;
    END IF;

    -- Add egressId column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ChurchLive'
        AND column_name = 'egressId'
    ) THEN
        ALTER TABLE "ChurchLive"
        ADD COLUMN "egressId" TEXT;
    END IF;
END $$;
