DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'RadioChatMessage'
        AND column_name = 'pinnedAt'
    ) THEN
        ALTER TABLE "RadioChatMessage"
        ADD COLUMN "pinnedAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'RadioChatMessage'
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "RadioChatMessage"
        ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;