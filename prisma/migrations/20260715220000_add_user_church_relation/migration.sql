ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "churchId" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'User_churchId_fkey'
    ) THEN

        ALTER TABLE "User"
        ADD CONSTRAINT "User_churchId_fkey"
        FOREIGN KEY ("churchId")
        REFERENCES "Church"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;

    END IF;
END $$;
