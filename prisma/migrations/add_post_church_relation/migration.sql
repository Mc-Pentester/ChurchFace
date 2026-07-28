ALTER TABLE "Post"
ADD COLUMN "churchId" TEXT;

CREATE INDEX "Post_churchId_idx"
ON "Post"("churchId");

ALTER TABLE "Post"
ADD CONSTRAINT "Post_churchId_fkey"
FOREIGN KEY ("churchId")
REFERENCES "Church"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;