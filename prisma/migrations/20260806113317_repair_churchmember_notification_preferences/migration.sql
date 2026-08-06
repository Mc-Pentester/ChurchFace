-- Repair ChurchMember notification preferences
-- Add notificationPreferences column with default empty JSON object

DO $$
BEGIN
    -- Add notificationPreferences column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ChurchMember'
        AND column_name = 'notificationPreferences'
    ) THEN
        ALTER TABLE "ChurchMember"
        ADD COLUMN "notificationPreferences" JSONB DEFAULT '{}';
        
        -- Set existing records to empty JSON object
        UPDATE "ChurchMember"
        SET "notificationPreferences" = '{}'::jsonb
        WHERE "notificationPreferences" IS NULL;
    END IF;
END $$;
