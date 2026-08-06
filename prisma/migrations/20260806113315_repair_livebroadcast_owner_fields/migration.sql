-- Repair LiveBroadcast owner fields
-- Add ownerType and ownerId columns with safe defaults

DO $$
BEGIN
    -- Add ownerType column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast'
        AND column_name = 'ownerType'
    ) THEN
        ALTER TABLE "LiveBroadcast"
        ADD COLUMN "ownerType" TEXT DEFAULT 'USER';
        
        -- Set existing records to 'USER' as default
        UPDATE "LiveBroadcast"
        SET "ownerType" = 'USER'
        WHERE "ownerType" IS NULL;
    END IF;

    -- Add ownerId column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast'
        AND column_name = 'ownerId'
    ) THEN
        ALTER TABLE "LiveBroadcast"
        ADD COLUMN "ownerId" TEXT;
        
        -- Set ownerId to authorId for existing records to maintain data integrity
        UPDATE "LiveBroadcast"
        SET "ownerId" = "authorId"
        WHERE "ownerId" IS NULL;
    END IF;
END $$;
