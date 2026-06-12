-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT;

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Radio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isAutoDJ" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "listenerCount" INTEGER NOT NULL DEFAULT 0,
    "peakListeners" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "streamUrl" TEXT,
    "rtmpUrl" TEXT,
    "currentTrackId" TEXT,
    "userId" TEXT NOT NULL,
    "playlistId" TEXT,

    CONSTRAINT "Radio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isAutoDJ" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "loop" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AUDIO',
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerResponse" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerReaction" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerVerse" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTestimony" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerTestimony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerChain" (
    "id" TEXT NOT NULL,
    "prayerRequestId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerChain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerChainLink" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerChainLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLiveRoom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moderatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PrayerLiveRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerRoomParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isMuted" BOOLEAN NOT NULL DEFAULT true,
    "hasHandRaised" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerRoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "album" TEXT,
    "url" TEXT NOT NULL,
    "coverUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'MUSIC',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioSchedule" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "playlistId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hostName" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 60,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioChatMessage" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadioChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stream_isLive_startedAt_idx" ON "Stream"("isLive", "startedAt");

-- CreateIndex
CREATE INDEX "Stream_userId_idx" ON "Stream"("userId");

-- CreateIndex
CREATE INDEX "Radio_isLive_startedAt_idx" ON "Radio"("isLive", "startedAt");

-- CreateIndex
CREATE INDEX "Radio_userId_idx" ON "Radio"("userId");

-- CreateIndex
CREATE INDEX "Playlist_isAutoDJ_isActive_idx" ON "Playlist"("isAutoDJ", "isActive");

-- CreateIndex
CREATE INDEX "Playlist_category_idx" ON "Playlist"("category");

-- CreateIndex
CREATE INDEX "PlaylistItem_playlistId_order_idx" ON "PlaylistItem"("playlistId", "order");

-- CreateIndex
CREATE INDEX "PrayerRequest_userId_createdAt_idx" ON "PrayerRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_category_createdAt_idx" ON "PrayerRequest"("category", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_isUrgent_createdAt_idx" ON "PrayerRequest"("isUrgent", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_isAnswered_createdAt_idx" ON "PrayerRequest"("isAnswered", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerResponse_prayerRequestId_createdAt_idx" ON "PrayerResponse"("prayerRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerResponse_userId_idx" ON "PrayerResponse"("userId");

-- CreateIndex
CREATE INDEX "PrayerReaction_prayerRequestId_type_idx" ON "PrayerReaction"("prayerRequestId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerReaction_userId_prayerRequestId_type_key" ON "PrayerReaction"("userId", "prayerRequestId", "type");

-- CreateIndex
CREATE INDEX "PrayerVerse_prayerRequestId_idx" ON "PrayerVerse"("prayerRequestId");

-- CreateIndex
CREATE INDEX "PrayerVerse_userId_idx" ON "PrayerVerse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTestimony_prayerRequestId_key" ON "PrayerTestimony"("prayerRequestId");

-- CreateIndex
CREATE INDEX "PrayerTestimony_userId_createdAt_idx" ON "PrayerTestimony"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerTestimony_createdAt_idx" ON "PrayerTestimony"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerChain_prayerRequestId_key" ON "PrayerChain"("prayerRequestId");

-- CreateIndex
CREATE INDEX "PrayerChain_isActive_createdAt_idx" ON "PrayerChain"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerChainLink_chainId_createdAt_idx" ON "PrayerChainLink"("chainId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerChainLink_userId_idx" ON "PrayerChainLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerChainLink_chainId_userId_key" ON "PrayerChainLink"("chainId", "userId");

-- CreateIndex
CREATE INDEX "PrayerLiveRoom_isActive_createdAt_idx" ON "PrayerLiveRoom"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerLiveRoom_isPublic_isActive_idx" ON "PrayerLiveRoom"("isPublic", "isActive");

-- CreateIndex
CREATE INDEX "PrayerRoomParticipant_roomId_joinedAt_idx" ON "PrayerRoomParticipant"("roomId", "joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerRoomParticipant_roomId_userId_key" ON "PrayerRoomParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "AudioTrack_type_category_idx" ON "AudioTrack"("type", "category");

-- CreateIndex
CREATE INDEX "AudioTrack_isActive_createdAt_idx" ON "AudioTrack"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "AudioTrack_playCount_idx" ON "AudioTrack"("playCount");

-- CreateIndex
CREATE INDEX "RadioSchedule_radioId_startTime_idx" ON "RadioSchedule"("radioId", "startTime");

-- CreateIndex
CREATE INDEX "RadioSchedule_isActive_startTime_idx" ON "RadioSchedule"("isActive", "startTime");

-- CreateIndex
CREATE INDEX "RadioSchedule_isLive_idx" ON "RadioSchedule"("isLive");

-- CreateIndex
CREATE INDEX "RadioChatMessage_radioId_createdAt_idx" ON "RadioChatMessage"("radioId", "createdAt");

-- CreateIndex
CREATE INDEX "RadioChatMessage_isPinned_idx" ON "RadioChatMessage"("isPinned");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerResponse" ADD CONSTRAINT "PrayerResponse_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerResponse" ADD CONSTRAINT "PrayerResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerReaction" ADD CONSTRAINT "PrayerReaction_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerReaction" ADD CONSTRAINT "PrayerReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerVerse" ADD CONSTRAINT "PrayerVerse_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerVerse" ADD CONSTRAINT "PrayerVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTestimony" ADD CONSTRAINT "PrayerTestimony_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTestimony" ADD CONSTRAINT "PrayerTestimony_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerChain" ADD CONSTRAINT "PrayerChain_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerChainLink" ADD CONSTRAINT "PrayerChainLink_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "PrayerChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerChainLink" ADD CONSTRAINT "PrayerChainLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRoomParticipant" ADD CONSTRAINT "PrayerRoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerLiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRoomParticipant" ADD CONSTRAINT "PrayerRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioSchedule" ADD CONSTRAINT "RadioSchedule_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "Radio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioSchedule" ADD CONSTRAINT "RadioSchedule_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioChatMessage" ADD CONSTRAINT "RadioChatMessage_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "Radio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
