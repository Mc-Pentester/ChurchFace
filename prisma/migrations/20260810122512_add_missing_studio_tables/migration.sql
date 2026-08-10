-- CreateTable
CREATE TABLE "StudioScene" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "broadcastId" TEXT,
    "churchLiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioSource" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "settings" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "volume" INTEGER NOT NULL DEFAULT 100,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "sceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioOutput" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "streamKey" TEXT,
    "streamUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "broadcastId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioOutput_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "StudioScene_broadcastId_idx"
    ON "StudioScene"("broadcastId");

CREATE INDEX "StudioScene_churchLiveId_idx"
    ON "StudioScene"("churchLiveId");

CREATE INDEX "StudioScene_order_idx"
    ON "StudioScene"("order");

CREATE INDEX "StudioSource_sceneId_idx"
    ON "StudioSource"("sceneId");

CREATE INDEX "StudioSource_type_idx"
    ON "StudioSource"("type");

CREATE INDEX "StudioOutput_broadcastId_idx"
    ON "StudioOutput"("broadcastId");

CREATE INDEX "StudioOutput_type_idx"
    ON "StudioOutput"("type");

CREATE INDEX "StudioOutput_enabled_idx"
    ON "StudioOutput"("enabled");

CREATE INDEX "StudioOutput_isPrimary_idx"
    ON "StudioOutput"("isPrimary");

CREATE INDEX "StudioOutput_platform_idx"
    ON "StudioOutput"("platform");

-- Foreign keys
ALTER TABLE "StudioScene"
ADD CONSTRAINT "StudioScene_broadcastId_fkey"
FOREIGN KEY ("broadcastId")
REFERENCES "LiveBroadcast"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "StudioScene"
ADD CONSTRAINT "StudioScene_churchLiveId_fkey"
FOREIGN KEY ("churchLiveId")
REFERENCES "ChurchLive"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "StudioSource"
ADD CONSTRAINT "StudioSource_sceneId_fkey"
FOREIGN KEY ("sceneId")
REFERENCES "StudioScene"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "StudioOutput"
ADD CONSTRAINT "StudioOutput_broadcastId_fkey"
FOREIGN KEY ("broadcastId")
REFERENCES "LiveBroadcast"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
