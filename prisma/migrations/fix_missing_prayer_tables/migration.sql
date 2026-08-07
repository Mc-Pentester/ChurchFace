DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'PrayerRequest'
        AND column_name = 'prayerChainId'
    ) THEN
        ALTER TABLE "PrayerRequest"
        ADD COLUMN "prayerChainId" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'PrayerLiveParticipant'
    ) THEN
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
    END IF;
END $$;