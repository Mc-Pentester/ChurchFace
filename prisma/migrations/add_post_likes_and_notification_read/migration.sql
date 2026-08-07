DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Post'
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE "Post"
        ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Notification'
        AND column_name = 'read'
    ) THEN
        ALTER TABLE "Notification"
        ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;