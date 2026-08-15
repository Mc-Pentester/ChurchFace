-- Add prayerCampaignId field to PrayerChain
ALTER TABLE "PrayerChain" 
ADD COLUMN IF NOT EXISTS "prayerCampaignId" TEXT;

-- Add foreign key constraint
ALTER TABLE "PrayerChain" 
ADD CONSTRAINT "PrayerChain_prayerCampaignId_fkey" 
FOREIGN KEY ("prayerCampaignId") REFERENCES "PrayerCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
