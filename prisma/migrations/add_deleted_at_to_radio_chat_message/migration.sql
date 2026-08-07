DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'RadioChatMessage'
        AND column_name = 'deletedAt'
    ) THEN
        ALTER TABLE "RadioChatMessage"
        ADD COLUMN "deletedAt" TIMESTAMP(3);
    END IF;
END $$;