-- Add prayerCampaignId to PrayerRequest model
-- This allows prayer requests to be directly linked to prayer campaigns

-- Add the column
ALTER TABLE "PrayerRequest" ADD COLUMN "prayerCampaignId" TEXT;

-- Add foreign key constraint
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_prayerCampaignId_fkey" FOREIGN KEY ("prayerCampaignId") REFERENCES "PrayerCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for performance
CREATE INDEX "PrayerRequest_prayerCampaignId_idx" ON "PrayerRequest"("prayerCampaignId");
