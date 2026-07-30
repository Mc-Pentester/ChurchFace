-- CreateTable
CREATE TABLE "PrayerLiveRoomMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLiveRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLiveRoomMember_roomId_userId_key"
ON "PrayerLiveRoomMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "PrayerLiveRoomMember_roomId_idx"
ON "PrayerLiveRoomMember"("roomId");

-- CreateIndex
CREATE INDEX "PrayerLiveRoomMember_userId_idx"
ON "PrayerLiveRoomMember"("userId");

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomMember"
ADD CONSTRAINT "PrayerLiveRoomMember_roomId_fkey"
FOREIGN KEY ("roomId")
REFERENCES "PrayerLiveRoom"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomMember"
ADD CONSTRAINT "PrayerLiveRoomMember_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;