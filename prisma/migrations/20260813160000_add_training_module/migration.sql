-- CreateIndex
CREATE INDEX "TrainingRoom_isActive_idx" ON "TrainingRoom"("isActive");

-- CreateIndex
CREATE INDEX "TrainingRoom_isPublic_idx" ON "TrainingRoom"("isPublic");

-- CreateIndex
CREATE INDEX "TrainingRoom_instructorId_idx" ON "TrainingRoom"("instructorId");

-- CreateIndex
CREATE INDEX "TrainingRoom_churchId_idx" ON "TrainingRoom"("churchId");

-- CreateIndex
CREATE INDEX "TrainingRoom_scheduledStart_idx" ON "TrainingRoom"("scheduledStart");

-- CreateIndex
CREATE INDEX "TrainingRoom_roomType_idx" ON "TrainingRoom"("roomType");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRoomMember_trainingRoomId_userId_key" ON "TrainingRoomMember"("trainingRoomId", "userId");

-- CreateIndex
CREATE INDEX "TrainingRoomMember_trainingRoomId_idx" ON "TrainingRoomMember"("trainingRoomId");

-- CreateIndex
CREATE INDEX "TrainingRoomMember_userId_idx" ON "TrainingRoomMember"("userId");

-- CreateIndex
CREATE INDEX "TrainingSession_trainingRoomId_idx" ON "TrainingSession"("trainingRoomId");

-- CreateIndex
CREATE INDEX "TrainingSession_startedAt_idx" ON "TrainingSession"("startedAt");

-- CreateTable
CREATE TABLE "TrainingRoom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "roomType" TEXT NOT NULL DEFAULT 'VIDEO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT,
    "churchId" TEXT,
    "maxParticipants" INTEGER,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRoomMember" (
    "id" TEXT NOT NULL,
    "trainingRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "trainingRoomId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingRoom" ADD CONSTRAINT "TrainingRoom_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRoom" ADD CONSTRAINT "TrainingRoom_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRoomMember" ADD CONSTRAINT "TrainingRoomMember_trainingRoomId_fkey" FOREIGN KEY ("trainingRoomId") REFERENCES "TrainingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRoomMember" ADD CONSTRAINT "TrainingRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_trainingRoomId_fkey" FOREIGN KEY ("trainingRoomId") REFERENCES "TrainingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
