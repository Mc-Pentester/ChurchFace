ALTER TABLE "PrayerRequest"
ADD COLUMN "prayerChainId" TEXT;

CREATE TABLE "PrayerLiveParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isMuted" BOOLEAN NOT NULL DEFAULT true,
    "hasHandRaised" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLiveParticipant_pkey"
    PRIMARY KEY ("id")
);