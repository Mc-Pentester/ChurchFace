-- Create BroadcastAccount table
CREATE TABLE "BroadcastAccount" (
    "id" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "userId" TEXT,
    "churchId" TEXT,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "BroadcastAccount_pkey" PRIMARY KEY ("id")
);

-- Create indexes for BroadcastAccount
CREATE INDEX "BroadcastAccount_ownerType_userId_idx" ON "BroadcastAccount"("ownerType", "userId");
CREATE INDEX "BroadcastAccount_ownerType_churchId_idx" ON "BroadcastAccount"("ownerType", "churchId");
CREATE INDEX "BroadcastAccount_platform_idx" ON "BroadcastAccount"("platform");
CREATE INDEX "BroadcastAccount_status_idx" ON "BroadcastAccount"("status");

-- Create BroadcastDestination table
CREATE TABLE "BroadcastDestination" (
    "id" TEXT NOT NULL,
    "broadcastAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastDestination_pkey" PRIMARY KEY ("id")
);

-- Create indexes for BroadcastDestination
CREATE INDEX "BroadcastDestination_broadcastAccountId_idx" ON "BroadcastDestination"("broadcastAccountId");
CREATE INDEX "BroadcastDestination_platform_idx" ON "BroadcastDestination"("platform");
CREATE INDEX "BroadcastDestination_enabled_idx" ON "BroadcastDestination"("enabled");

-- Create foreign key constraint
ALTER TABLE "BroadcastDestination" ADD CONSTRAINT "BroadcastDestination_broadcastAccountId_fkey" FOREIGN KEY ("broadcastAccountId") REFERENCES "BroadcastAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create BroadcastPermission table
CREATE TABLE "BroadcastPermission" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastPermission_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for BroadcastPermission
CREATE UNIQUE INDEX "BroadcastPermission_churchId_userId_key" ON "BroadcastPermission"("churchId", "userId");

-- Create indexes for BroadcastPermission
CREATE INDEX "BroadcastPermission_churchId_idx" ON "BroadcastPermission"("churchId");
CREATE INDEX "BroadcastPermission_userId_idx" ON "BroadcastPermission"("userId");
CREATE INDEX "BroadcastPermission_role_idx" ON "BroadcastPermission"("role");
