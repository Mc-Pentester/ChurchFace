-- Add visibility field to PrayerChain
ALTER TABLE "PrayerChain" 
ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT 'PUBLIC';
