-- Add authorId column to LiveBroadcast
ALTER TABLE "LiveBroadcast" ADD COLUMN "authorId" TEXT NOT NULL;

-- Add relation to User model
ALTER TABLE "LiveBroadcast" ADD CONSTRAINT "LiveBroadcast_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
