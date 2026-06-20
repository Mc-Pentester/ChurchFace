-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspendedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreachingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingSeries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreachingSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preaching" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "seriesId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preaching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingView" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "PreachingView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingLike" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreachingLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingComment" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreachingComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingBookmark" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreachingBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingNote" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreachingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingVerse" (
    "id" TEXT NOT NULL,
    "preachingId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreachingVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveBroadcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "streamUrl" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slogan" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "donationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "radioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "liveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchMember" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChurchMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchAdmin" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CHURCH_ADMIN',
    "appointedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchEvent" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "attendeeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchEventAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchEventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchMedia" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "title" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchRadio" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "radioId" TEXT,
    "name" TEXT NOT NULL,
    "streamUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchRadio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchLive" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "liveBroadcastId" TEXT,
    "title" TEXT NOT NULL,
    "streamUrl" TEXT,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchLive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchCourse" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructor" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "enrollCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchCourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChurchCourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchPost" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchPostLike" (
    "id" TEXT NOT NULL,
    "churchPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchPostComment" (
    "id" TEXT NOT NULL,
    "churchPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchFollow" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");

-- CreateIndex
CREATE INDEX "UserFollow_followingId_idx" ON "UserFollow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Report_targetType_status_idx" ON "Report"("targetType", "status");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_createdAt_idx" ON "Report"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_action_createdAt_idx" ON "AdminLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_targetType_createdAt_idx" ON "AdminLog"("targetType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingCategory_name_key" ON "PreachingCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingCategory_slug_key" ON "PreachingCategory"("slug");

-- CreateIndex
CREATE INDEX "PreachingCategory_order_idx" ON "PreachingCategory"("order");

-- CreateIndex
CREATE INDEX "PreachingSeries_authorId_createdAt_idx" ON "PreachingSeries"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Preaching_authorId_publishedAt_idx" ON "Preaching"("authorId", "publishedAt");

-- CreateIndex
CREATE INDEX "Preaching_categoryId_publishedAt_idx" ON "Preaching"("categoryId", "publishedAt");

-- CreateIndex
CREATE INDEX "Preaching_seriesId_publishedAt_idx" ON "Preaching"("seriesId", "publishedAt");

-- CreateIndex
CREATE INDEX "Preaching_publishedAt_idx" ON "Preaching"("publishedAt");

-- CreateIndex
CREATE INDEX "Preaching_views_idx" ON "Preaching"("views");

-- CreateIndex
CREATE INDEX "PreachingView_preachingId_watchedAt_idx" ON "PreachingView"("preachingId", "watchedAt");

-- CreateIndex
CREATE INDEX "PreachingView_userId_watchedAt_idx" ON "PreachingView"("userId", "watchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingView_preachingId_userId_key" ON "PreachingView"("preachingId", "userId");

-- CreateIndex
CREATE INDEX "PreachingLike_preachingId_idx" ON "PreachingLike"("preachingId");

-- CreateIndex
CREATE INDEX "PreachingLike_userId_idx" ON "PreachingLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingLike_preachingId_userId_key" ON "PreachingLike"("preachingId", "userId");

-- CreateIndex
CREATE INDEX "PreachingComment_preachingId_createdAt_idx" ON "PreachingComment"("preachingId", "createdAt");

-- CreateIndex
CREATE INDEX "PreachingComment_userId_createdAt_idx" ON "PreachingComment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PreachingComment_parentId_idx" ON "PreachingComment"("parentId");

-- CreateIndex
CREATE INDEX "PreachingBookmark_preachingId_idx" ON "PreachingBookmark"("preachingId");

-- CreateIndex
CREATE INDEX "PreachingBookmark_userId_createdAt_idx" ON "PreachingBookmark"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingBookmark_preachingId_userId_key" ON "PreachingBookmark"("preachingId", "userId");

-- CreateIndex
CREATE INDEX "PreachingNote_preachingId_userId_idx" ON "PreachingNote"("preachingId", "userId");

-- CreateIndex
CREATE INDEX "PreachingNote_userId_createdAt_idx" ON "PreachingNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PreachingVerse_preachingId_idx" ON "PreachingVerse"("preachingId");

-- CreateIndex
CREATE INDEX "PreachingVerse_book_chapter_idx" ON "PreachingVerse"("book", "chapter");

-- CreateIndex
CREATE INDEX "LiveBroadcast_authorId_status_idx" ON "LiveBroadcast"("authorId", "status");

-- CreateIndex
CREATE INDEX "LiveBroadcast_status_scheduledAt_idx" ON "LiveBroadcast"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "LiveBroadcast_status_startedAt_idx" ON "LiveBroadcast"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

-- CreateIndex
CREATE INDEX "Church_slug_idx" ON "Church"("slug");

-- CreateIndex
CREATE INDEX "Church_isVerified_idx" ON "Church"("isVerified");

-- CreateIndex
CREATE INDEX "Church_city_idx" ON "Church"("city");

-- CreateIndex
CREATE INDEX "Church_country_idx" ON "Church"("country");

-- CreateIndex
CREATE INDEX "ChurchMember_churchId_role_idx" ON "ChurchMember"("churchId", "role");

-- CreateIndex
CREATE INDEX "ChurchMember_userId_idx" ON "ChurchMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchMember_churchId_userId_key" ON "ChurchMember"("churchId", "userId");

-- CreateIndex
CREATE INDEX "ChurchAdmin_churchId_role_idx" ON "ChurchAdmin"("churchId", "role");

-- CreateIndex
CREATE INDEX "ChurchAdmin_userId_idx" ON "ChurchAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchAdmin_churchId_userId_key" ON "ChurchAdmin"("churchId", "userId");

-- CreateIndex
CREATE INDEX "ChurchEvent_churchId_startDate_idx" ON "ChurchEvent"("churchId", "startDate");

-- CreateIndex
CREATE INDEX "ChurchEvent_startDate_idx" ON "ChurchEvent"("startDate");

-- CreateIndex
CREATE INDEX "ChurchEvent_isPublic_idx" ON "ChurchEvent"("isPublic");

-- CreateIndex
CREATE INDEX "ChurchEventAttendee_eventId_idx" ON "ChurchEventAttendee"("eventId");

-- CreateIndex
CREATE INDEX "ChurchEventAttendee_userId_idx" ON "ChurchEventAttendee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchEventAttendee_eventId_userId_key" ON "ChurchEventAttendee"("eventId", "userId");

-- CreateIndex
CREATE INDEX "ChurchMedia_churchId_type_idx" ON "ChurchMedia"("churchId", "type");

-- CreateIndex
CREATE INDEX "ChurchMedia_churchId_order_idx" ON "ChurchMedia"("churchId", "order");

-- CreateIndex
CREATE INDEX "ChurchRadio_churchId_idx" ON "ChurchRadio"("churchId");

-- CreateIndex
CREATE INDEX "ChurchRadio_isActive_idx" ON "ChurchRadio"("isActive");

-- CreateIndex
CREATE INDEX "ChurchLive_churchId_status_idx" ON "ChurchLive"("churchId", "status");

-- CreateIndex
CREATE INDEX "ChurchLive_status_idx" ON "ChurchLive"("status");

-- CreateIndex
CREATE INDEX "ChurchCourse_churchId_isPublished_idx" ON "ChurchCourse"("churchId", "isPublished");

-- CreateIndex
CREATE INDEX "ChurchCourse_level_idx" ON "ChurchCourse"("level");

-- CreateIndex
CREATE INDEX "ChurchCourse_category_idx" ON "ChurchCourse"("category");

-- CreateIndex
CREATE INDEX "ChurchCourseEnrollment_courseId_idx" ON "ChurchCourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "ChurchCourseEnrollment_userId_idx" ON "ChurchCourseEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchCourseEnrollment_courseId_userId_key" ON "ChurchCourseEnrollment"("courseId", "userId");

-- CreateIndex
CREATE INDEX "ChurchPost_churchId_createdAt_idx" ON "ChurchPost"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "ChurchPost_isPinned_idx" ON "ChurchPost"("isPinned");

-- CreateIndex
CREATE INDEX "ChurchPostLike_churchPostId_idx" ON "ChurchPostLike"("churchPostId");

-- CreateIndex
CREATE INDEX "ChurchPostLike_userId_idx" ON "ChurchPostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchPostLike_churchPostId_userId_key" ON "ChurchPostLike"("churchPostId", "userId");

-- CreateIndex
CREATE INDEX "ChurchPostComment_churchPostId_createdAt_idx" ON "ChurchPostComment"("churchPostId", "createdAt");

-- CreateIndex
CREATE INDEX "ChurchPostComment_userId_createdAt_idx" ON "ChurchPostComment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ChurchPostComment_parentId_idx" ON "ChurchPostComment"("parentId");

-- CreateIndex
CREATE INDEX "ChurchFollow_churchId_idx" ON "ChurchFollow"("churchId");

-- CreateIndex
CREATE INDEX "ChurchFollow_userId_idx" ON "ChurchFollow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchFollow_churchId_userId_key" ON "ChurchFollow"("churchId", "userId");

-- CreateIndex
CREATE INDEX "Comment_isHidden_idx" ON "Comment"("isHidden");

-- CreateIndex
CREATE INDEX "Post_isHidden_idx" ON "Post"("isHidden");

-- CreateIndex
CREATE INDEX "Post_isPinned_idx" ON "Post"("isPinned");

-- CreateIndex
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");

-- CreateIndex
CREATE INDEX "Story_authorId_createdAt_idx" ON "Story"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Story_isHidden_idx" ON "Story"("isHidden");

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingSeries" ADD CONSTRAINT "PreachingSeries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preaching" ADD CONSTRAINT "Preaching_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preaching" ADD CONSTRAINT "Preaching_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PreachingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preaching" ADD CONSTRAINT "Preaching_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "PreachingSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingView" ADD CONSTRAINT "PreachingView_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingView" ADD CONSTRAINT "PreachingView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingLike" ADD CONSTRAINT "PreachingLike_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingLike" ADD CONSTRAINT "PreachingLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingComment" ADD CONSTRAINT "PreachingComment_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingComment" ADD CONSTRAINT "PreachingComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingComment" ADD CONSTRAINT "PreachingComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PreachingComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingBookmark" ADD CONSTRAINT "PreachingBookmark_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingBookmark" ADD CONSTRAINT "PreachingBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingNote" ADD CONSTRAINT "PreachingNote_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingNote" ADD CONSTRAINT "PreachingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingVerse" ADD CONSTRAINT "PreachingVerse_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES "Preaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveBroadcast" ADD CONSTRAINT "LiveBroadcast_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMember" ADD CONSTRAINT "ChurchMember_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMember" ADD CONSTRAINT "ChurchMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchAdmin" ADD CONSTRAINT "ChurchAdmin_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchAdmin" ADD CONSTRAINT "ChurchAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchEvent" ADD CONSTRAINT "ChurchEvent_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchEventAttendee" ADD CONSTRAINT "ChurchEventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ChurchEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchEventAttendee" ADD CONSTRAINT "ChurchEventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMedia" ADD CONSTRAINT "ChurchMedia_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchRadio" ADD CONSTRAINT "ChurchRadio_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchLive" ADD CONSTRAINT "ChurchLive_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchCourse" ADD CONSTRAINT "ChurchCourse_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchCourseEnrollment" ADD CONSTRAINT "ChurchCourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ChurchCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchCourseEnrollment" ADD CONSTRAINT "ChurchCourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPost" ADD CONSTRAINT "ChurchPost_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPostLike" ADD CONSTRAINT "ChurchPostLike_churchPostId_fkey" FOREIGN KEY ("churchPostId") REFERENCES "ChurchPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPostLike" ADD CONSTRAINT "ChurchPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPostComment" ADD CONSTRAINT "ChurchPostComment_churchPostId_fkey" FOREIGN KEY ("churchPostId") REFERENCES "ChurchPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPostComment" ADD CONSTRAINT "ChurchPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPostComment" ADD CONSTRAINT "ChurchPostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChurchPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchFollow" ADD CONSTRAINT "ChurchFollow_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchFollow" ADD CONSTRAINT "ChurchFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
