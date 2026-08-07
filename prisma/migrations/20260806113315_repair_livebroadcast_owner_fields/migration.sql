-- Repair LiveBroadcast owner fields
-- Add ownerType and ownerId columns safely

DO $$
BEGIN

    -- Add ownerType column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast'
        AND column_name = 'ownerType'
    ) THEN

        ALTER TABLE "LiveBroadcast"
        ADD COLUMN "ownerType" TEXT DEFAULT 'USER';

    END IF;


    -- Add ownerId column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast'
        AND column_name = 'ownerId'
    ) THEN

        ALTER TABLE "LiveBroadcast"
        ADD COLUMN "ownerId" TEXT;

    END IF;


    -- Migration compatibility:
    -- Copy authorId only if it still exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'LiveBroadcast'
        AND column_name = 'authorId'
    ) THEN

        UPDATE "LiveBroadcast"
        SET "ownerId" = "authorId"
        WHERE "ownerId" IS NULL;

    END IF;


    -- Default owner type
    UPDATE "LiveBroadcast"
    SET "ownerType" = 'USER'
    WHERE "ownerType" IS NULL;


END $$;