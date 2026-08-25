-- Add readAt column to Notification table
ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);

-- Add index on userId and read for performance
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
