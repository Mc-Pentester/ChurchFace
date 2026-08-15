-- Create PrayerCampaignRoom junction table
CREATE TABLE IF NOT EXISTS "PrayerCampaignRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerCampaignRoom_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PrayerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerCampaignRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "PrayerCampaignRoom_campaignId_roomId_key" ON "PrayerCampaignRoom"("campaignId", "roomId");

-- Add indexes
CREATE INDEX IF NOT EXISTS "PrayerCampaignRoom_campaignId_idx" ON "PrayerCampaignRoom"("campaignId");
CREATE INDEX IF NOT EXISTS "PrayerCampaignRoom_roomId_idx" ON "PrayerCampaignRoom"("roomId");
