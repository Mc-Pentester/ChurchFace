/*
  Warnings:

  - You are about to drop the column `targetId` on the `AdminLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `AdminLog` table. All the data in the column will be lost.
  - You are about to drop the column `playCount` on the `AudioTrack` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AudioTrack` table. All the data in the column will be lost.
  - You are about to drop the column `followerCount` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `liveEnabled` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `memberCount` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Church` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `instructor` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChurchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `ChurchCourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `ChurchCourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `enrolledAt` on the `ChurchCourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChurchEvent` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `ChurchEventAttendee` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `ChurchLive` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChurchLive` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `ChurchMedia` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ChurchMedia` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `ChurchPost` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChurchPost` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `ChurchPostComment` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `LiveBroadcast` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `LiveBroadcast` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `LiveBroadcast` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LiveBroadcast` table. All the data in the column will be lost.
  - You are about to drop the column `viewerCount` on the `LiveBroadcast` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `isAutoDJ` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `loop` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `shuffle` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PrayerChain` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `PrayerLiveRoom` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PrayerRequest` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Preaching` table. All the data in the column will be lost.
  - You are about to drop the column `verse` on the `PreachingVerse` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `PreachingView` table. All the data in the column will be lost.
  - You are about to drop the column `auth` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `p256dh` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentTrackId` on the `Radio` table. All the data in the column will be lost.
  - You are about to drop the column `rtmpUrl` on the `Radio` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuration` on the `Radio` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RadioChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `RadioSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `isLive` on the `RadioSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `bannedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `church` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrayerRoomParticipant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[postId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Preaching` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `PreachingSeries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Preaching` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `PreachingSeries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `PreachingVerse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PreachingVerse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verseStart` to the `PreachingVerse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keys` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RadioChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChurchPostComment" DROP CONSTRAINT "ChurchPostComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "LiveBroadcast" DROP CONSTRAINT "LiveBroadcast_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MessageSeen" DROP CONSTRAINT "MessageSeen_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageSeen" DROP CONSTRAINT "MessageSeen_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerChain" DROP CONSTRAINT "PrayerChain_prayerRequestId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerChainLink" DROP CONSTRAINT "PrayerChainLink_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerReaction" DROP CONSTRAINT "PrayerReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerRequest" DROP CONSTRAINT "PrayerRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerResponse" DROP CONSTRAINT "PrayerResponse_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerRoomParticipant" DROP CONSTRAINT "PrayerRoomParticipant_roomId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerRoomParticipant" DROP CONSTRAINT "PrayerRoomParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerTestimony" DROP CONSTRAINT "PrayerTestimony_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerVerse" DROP CONSTRAINT "PrayerVerse_userId_fkey";

-- DropForeignKey
ALTER TABLE "Preaching" DROP CONSTRAINT "Preaching_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "PreachingComment" DROP CONSTRAINT "PreachingComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Radio" DROP CONSTRAINT "Radio_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_postId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_userId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_authorId_fkey";

-- DropForeignKey
ALTER TABLE "StoryView" DROP CONSTRAINT "StoryView_storyId_fkey";

-- DropForeignKey
ALTER TABLE "StoryView" DROP CONSTRAINT "StoryView_userId_fkey";

-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_userId_fkey";

-- DropIndex
DROP INDEX "AdminLog_action_createdAt_idx";

-- DropIndex
DROP INDEX "AdminLog_adminId_createdAt_idx";

-- DropIndex
DROP INDEX "AdminLog_targetType_createdAt_idx";

-- DropIndex
DROP INDEX "AudioTrack_isActive_createdAt_idx";

-- DropIndex
DROP INDEX "AudioTrack_playCount_idx";

-- DropIndex
DROP INDEX "AudioTrack_type_category_idx";

-- DropIndex
DROP INDEX "Church_city_idx";

-- DropIndex
DROP INDEX "Church_country_idx";

-- DropIndex
DROP INDEX "Church_isVerified_idx";

-- DropIndex
DROP INDEX "Church_slug_idx";

-- DropIndex
DROP INDEX "ChurchAdmin_churchId_role_idx";

-- DropIndex
DROP INDEX "ChurchAdmin_userId_idx";

-- DropIndex
DROP INDEX "ChurchCourse_category_idx";

-- DropIndex
DROP INDEX "ChurchCourse_churchId_isPublished_idx";

-- DropIndex
DROP INDEX "ChurchCourse_level_idx";

-- DropIndex
DROP INDEX "ChurchCourseEnrollment_courseId_idx";

-- DropIndex
DROP INDEX "ChurchCourseEnrollment_userId_idx";

-- DropIndex
DROP INDEX "ChurchEvent_churchId_startDate_idx";

-- DropIndex
DROP INDEX "ChurchEvent_isPublic_idx";

-- DropIndex
DROP INDEX "ChurchEvent_startDate_idx";

-- DropIndex
DROP INDEX "ChurchEventAttendee_eventId_idx";

-- DropIndex
DROP INDEX "ChurchEventAttendee_userId_idx";

-- DropIndex
DROP INDEX "ChurchFollow_churchId_idx";

-- DropIndex
DROP INDEX "ChurchFollow_userId_idx";

-- DropIndex
DROP INDEX "ChurchLive_churchId_status_idx";

-- DropIndex
DROP INDEX "ChurchLive_status_idx";

-- DropIndex
DROP INDEX "ChurchMedia_churchId_order_idx";

-- DropIndex
DROP INDEX "ChurchMedia_churchId_type_idx";

-- DropIndex
DROP INDEX "ChurchMember_churchId_role_idx";

-- DropIndex
DROP INDEX "ChurchMember_userId_idx";

-- DropIndex
DROP INDEX "ChurchPost_churchId_createdAt_idx";

-- DropIndex
DROP INDEX "ChurchPost_isPinned_idx";

-- DropIndex
DROP INDEX "ChurchPostComment_churchPostId_createdAt_idx";

-- DropIndex
DROP INDEX "ChurchPostComment_parentId_idx";

-- DropIndex
DROP INDEX "ChurchPostComment_userId_createdAt_idx";

-- DropIndex
DROP INDEX "ChurchPostLike_churchPostId_idx";

-- DropIndex
DROP INDEX "ChurchPostLike_userId_idx";

-- DropIndex
DROP INDEX "ChurchRadio_churchId_idx";

-- DropIndex
DROP INDEX "ChurchRadio_isActive_idx";

-- DropIndex
DROP INDEX "Comment_isHidden_idx";

-- DropIndex
DROP INDEX "Friendship_receiverId_status_idx";

-- DropIndex
DROP INDEX "Friendship_senderId_status_idx";

-- DropIndex
DROP INDEX "Friendship_status_createdAt_idx";

-- DropIndex
DROP INDEX "Like_userId_postId_key";

-- DropIndex
DROP INDEX "LiveBroadcast_authorId_status_idx";

-- DropIndex
DROP INDEX "LiveBroadcast_status_scheduledAt_idx";

-- DropIndex
DROP INDEX "LiveBroadcast_status_startedAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- DropIndex
DROP INDEX "Playlist_category_idx";

-- DropIndex
DROP INDEX "Playlist_isAutoDJ_isActive_idx";

-- DropIndex
DROP INDEX "PlaylistItem_playlistId_order_idx";

-- DropIndex
DROP INDEX "Post_isPinned_idx";

-- DropIndex
DROP INDEX "PrayerChain_isActive_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerChain_prayerRequestId_key";

-- DropIndex
DROP INDEX "PrayerChainLink_chainId_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerChainLink_userId_idx";

-- DropIndex
DROP INDEX "PrayerLiveRoom_isActive_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerLiveRoom_isPublic_isActive_idx";

-- DropIndex
DROP INDEX "PrayerReaction_prayerRequestId_type_idx";

-- DropIndex
DROP INDEX "PrayerRequest_category_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerRequest_isAnswered_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerRequest_isUrgent_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerRequest_userId_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerResponse_prayerRequestId_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerResponse_userId_idx";

-- DropIndex
DROP INDEX "PrayerTestimony_createdAt_idx";

-- DropIndex
DROP INDEX "PrayerTestimony_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Preaching_authorId_publishedAt_idx";

-- DropIndex
DROP INDEX "Preaching_views_idx";

-- DropIndex
DROP INDEX "PreachingBookmark_userId_createdAt_idx";

-- DropIndex
DROP INDEX "PreachingCategory_name_key";

-- DropIndex
DROP INDEX "PreachingComment_preachingId_createdAt_idx";

-- DropIndex
DROP INDEX "PreachingComment_userId_createdAt_idx";

-- DropIndex
DROP INDEX "PreachingNote_preachingId_userId_idx";

-- DropIndex
DROP INDEX "PreachingNote_userId_createdAt_idx";

-- DropIndex
DROP INDEX "PreachingSeries_authorId_createdAt_idx";

-- DropIndex
DROP INDEX "PreachingVerse_book_chapter_idx";

-- DropIndex
DROP INDEX "PreachingView_preachingId_watchedAt_idx";

-- DropIndex
DROP INDEX "PreachingView_userId_watchedAt_idx";

-- DropIndex
DROP INDEX "PushSubscription_endpoint_key";

-- DropIndex
DROP INDEX "PushSubscription_userId_idx";

-- DropIndex
DROP INDEX "Radio_isLive_startedAt_idx";

-- DropIndex
DROP INDEX "Radio_userId_idx";

-- DropIndex
DROP INDEX "RadioChatMessage_isPinned_idx";

-- DropIndex
DROP INDEX "RadioChatMessage_radioId_createdAt_idx";

-- DropIndex
DROP INDEX "RadioSchedule_isActive_startTime_idx";

-- DropIndex
DROP INDEX "RadioSchedule_isLive_idx";

-- DropIndex
DROP INDEX "RadioSchedule_radioId_startTime_idx";

-- DropIndex
DROP INDEX "Report_reporterId_createdAt_idx";

-- DropIndex
DROP INDEX "Report_status_createdAt_idx";

-- DropIndex
DROP INDEX "Report_targetType_status_idx";

-- DropIndex
DROP INDEX "Story_authorId_createdAt_idx";

-- DropIndex
DROP INDEX "Story_expiresAt_idx";

-- DropIndex
DROP INDEX "Story_isHidden_idx";

-- DropIndex
DROP INDEX "Stream_isLive_startedAt_idx";

-- DropIndex
DROP INDEX "Stream_userId_idx";

-- DropIndex
DROP INDEX "UserFollow_followerId_idx";

-- DropIndex
DROP INDEX "UserFollow_followingId_idx";

-- AlterTable
ALTER TABLE "AdminLog" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ALTER COLUMN "details" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "AudioTrack" DROP COLUMN "playCount",
DROP COLUMN "updatedAt",
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" DROP DEFAULT,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "category" DROP DEFAULT,
ALTER COLUMN "uploadedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Church" DROP COLUMN "followerCount",
DROP COLUMN "isVerified",
DROP COLUMN "liveEnabled",
DROP COLUMN "memberCount",
DROP COLUMN "updatedAt",
DROP COLUMN "viewCount",
ADD COLUMN     "schedule" TEXT;

-- AlterTable
ALTER TABLE "ChurchCourse" DROP COLUMN "category",
DROP COLUMN "duration",
DROP COLUMN "instructor",
DROP COLUMN "level",
DROP COLUMN "thumbnail",
DROP COLUMN "updatedAt",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ChurchCourseEnrollment" DROP COLUMN "completed",
DROP COLUMN "completedAt",
DROP COLUMN "enrolledAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ChurchEvent" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "ChurchEventAttendee" DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'GOING';

-- AlterTable
ALTER TABLE "ChurchLive" DROP COLUMN "scheduledAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "playUrl" TEXT,
ADD COLUMN     "scheduledEnd" TIMESTAMP(3),
ADD COLUMN     "scheduledStart" TIMESTAMP(3),
ADD COLUMN     "streamMode" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "ChurchMedia" DROP COLUMN "thumbnail",
DROP COLUMN "title",
ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "ChurchPost" DROP COLUMN "isPinned",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "ChurchPostComment" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "ChurchRadio" ADD COLUMN     "description" TEXT,
ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LiveBroadcast" DROP COLUMN "authorId",
DROP COLUMN "scheduledAt",
DROP COLUMN "thumbnail",
DROP COLUMN "updatedAt",
DROP COLUMN "viewerCount",
ADD COLUMN     "rtmpUrl" TEXT,
ADD COLUMN     "streamMode" TEXT NOT NULL DEFAULT 'RTMP',
ADD COLUMN     "webrtcUrl" TEXT,
ALTER COLUMN "streamUrl" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OFFLINE';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "data",
DROP COLUMN "isRead",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "isActive",
DROP COLUMN "isAutoDJ",
DROP COLUMN "loop",
DROP COLUMN "shuffle";

-- AlterTable
ALTER TABLE "PlaylistItem" ALTER COLUMN "playlistId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isPinned",
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PrayerChain" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "PrayerLiveRoom" DROP COLUMN "endedAt";

-- AlterTable
ALTER TABLE "PrayerReaction" ALTER COLUMN "type" SET DEFAULT 'PRAY';

-- AlterTable
ALTER TABLE "PrayerRequest" DROP COLUMN "updatedAt",
ADD COLUMN     "prayerChainId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PrayerResponse" ALTER COLUMN "type" SET DEFAULT 'PRAYER';

-- AlterTable
ALTER TABLE "Preaching" DROP COLUMN "views",
ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowDownload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowSharing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr',
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "thumbnail" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "publishedAt" DROP NOT NULL,
ALTER COLUMN "publishedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PreachingCategory" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PreachingComment" ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PreachingNote" ADD COLUMN     "color" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "PreachingSeries" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PreachingVerse" DROP COLUMN "verse",
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "translation" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "verseEnd" INTEGER,
ADD COLUMN     "verseStart" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PreachingView" DROP COLUMN "duration",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "watchDuration" INTEGER,
ADD COLUMN     "watchPercent" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "auth",
DROP COLUMN "p256dh",
ADD COLUMN     "keys" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Radio" DROP COLUMN "currentTrackId",
DROP COLUMN "rtmpUrl",
DROP COLUMN "totalDuration",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentTrack" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OFFLINE',
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RadioChatMessage" DROP COLUMN "name",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "pinnedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RadioSchedule" DROP COLUMN "isActive",
DROP COLUMN "isLive";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "isHidden";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "endedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "streamUrl" TEXT,
ALTER COLUMN "isLive" SET DEFAULT false,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannedAt",
DROP COLUMN "church",
ADD COLUMN     "churchId" TEXT;

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "PrayerRoomParticipant";

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchPlaylist" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchPlaylistItem" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AUDIO',
    "mediaType" TEXT NOT NULL DEFAULT 'AUDIO',
    "artist" TEXT,
    "album" TEXT,
    "coverImage" TEXT,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchPlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLiveParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLiveParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLiveRoomMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLiveRoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLiveRoomParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLiveRoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "ChurchPlaylist_churchId_idx" ON "ChurchPlaylist"("churchId");

-- CreateIndex
CREATE INDEX "ChurchPlaylistItem_playlistId_idx" ON "ChurchPlaylistItem"("playlistId");

-- CreateIndex
CREATE INDEX "ChurchPlaylistItem_mediaType_idx" ON "ChurchPlaylistItem"("mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLiveParticipant_roomId_userId_key" ON "PrayerLiveParticipant"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLiveRoomMember_roomId_userId_key" ON "PrayerLiveRoomMember"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLiveRoomParticipant_roomId_userId_key" ON "PrayerLiveRoomParticipant"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_postId_userId_key" ON "Like"("postId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- CreateIndex
CREATE INDEX "Post_likes_idx" ON "Post"("likes");

-- CreateIndex
CREATE UNIQUE INDEX "Preaching_slug_key" ON "Preaching"("slug");

-- CreateIndex
CREATE INDEX "Preaching_slug_idx" ON "Preaching"("slug");

-- CreateIndex
CREATE INDEX "Preaching_authorId_idx" ON "Preaching"("authorId");

-- CreateIndex
CREATE INDEX "Preaching_categoryId_idx" ON "Preaching"("categoryId");

-- CreateIndex
CREATE INDEX "Preaching_seriesId_idx" ON "Preaching"("seriesId");

-- CreateIndex
CREATE INDEX "Preaching_createdAt_idx" ON "Preaching"("createdAt");

-- CreateIndex
CREATE INDEX "Preaching_updatedAt_idx" ON "Preaching"("updatedAt");

-- CreateIndex
CREATE INDEX "Preaching_isPublished_idx" ON "Preaching"("isPublished");

-- CreateIndex
CREATE INDEX "Preaching_isFeatured_idx" ON "Preaching"("isFeatured");

-- CreateIndex
CREATE INDEX "Preaching_visibility_idx" ON "Preaching"("visibility");

-- CreateIndex
CREATE INDEX "Preaching_language_idx" ON "Preaching"("language");

-- CreateIndex
CREATE INDEX "Preaching_viewCount_idx" ON "Preaching"("viewCount");

-- CreateIndex
CREATE INDEX "Preaching_likeCount_idx" ON "Preaching"("likeCount");

-- CreateIndex
CREATE INDEX "Preaching_commentCount_idx" ON "Preaching"("commentCount");

-- CreateIndex
CREATE INDEX "Preaching_bookmarkCount_idx" ON "Preaching"("bookmarkCount");

-- CreateIndex
CREATE INDEX "Preaching_authorId_createdAt_idx" ON "Preaching"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Preaching_isPublished_publishedAt_idx" ON "Preaching"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "Preaching_isFeatured_publishedAt_idx" ON "Preaching"("isFeatured", "publishedAt");

-- CreateIndex
CREATE INDEX "PreachingBookmark_userId_idx" ON "PreachingBookmark"("userId");

-- CreateIndex
CREATE INDEX "PreachingCategory_isActive_idx" ON "PreachingCategory"("isActive");

-- CreateIndex
CREATE INDEX "PreachingCategory_name_idx" ON "PreachingCategory"("name");

-- CreateIndex
CREATE INDEX "PreachingCategory_slug_idx" ON "PreachingCategory"("slug");

-- CreateIndex
CREATE INDEX "PreachingComment_preachingId_idx" ON "PreachingComment"("preachingId");

-- CreateIndex
CREATE INDEX "PreachingComment_userId_idx" ON "PreachingComment"("userId");

-- CreateIndex
CREATE INDEX "PreachingComment_createdAt_idx" ON "PreachingComment"("createdAt");

-- CreateIndex
CREATE INDEX "PreachingNote_userId_idx" ON "PreachingNote"("userId");

-- CreateIndex
CREATE INDEX "PreachingNote_preachingId_idx" ON "PreachingNote"("preachingId");

-- CreateIndex
CREATE UNIQUE INDEX "PreachingSeries_slug_key" ON "PreachingSeries"("slug");

-- CreateIndex
CREATE INDEX "PreachingSeries_authorId_idx" ON "PreachingSeries"("authorId");

-- CreateIndex
CREATE INDEX "PreachingSeries_categoryId_idx" ON "PreachingSeries"("categoryId");

-- CreateIndex
CREATE INDEX "PreachingSeries_slug_idx" ON "PreachingSeries"("slug");

-- CreateIndex
CREATE INDEX "PreachingSeries_order_idx" ON "PreachingSeries"("order");

-- CreateIndex
CREATE INDEX "PreachingSeries_isFeatured_idx" ON "PreachingSeries"("isFeatured");

-- CreateIndex
CREATE INDEX "PreachingSeries_isPublished_idx" ON "PreachingSeries"("isPublished");

-- CreateIndex
CREATE INDEX "PreachingSeries_publishedAt_idx" ON "PreachingSeries"("publishedAt");

-- CreateIndex
CREATE INDEX "PreachingSeries_categoryId_order_idx" ON "PreachingSeries"("categoryId", "order");

-- CreateIndex
CREATE INDEX "PreachingSeries_categoryId_isPublished_idx" ON "PreachingSeries"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "PreachingVerse_userId_idx" ON "PreachingVerse"("userId");

-- CreateIndex
CREATE INDEX "PreachingVerse_reference_idx" ON "PreachingVerse"("reference");

-- CreateIndex
CREATE INDEX "PreachingView_userId_idx" ON "PreachingView"("userId");

-- CreateIndex
CREATE INDEX "PreachingView_preachingId_idx" ON "PreachingView"("preachingId");

-- CreateIndex
CREATE INDEX "PreachingView_watchedAt_idx" ON "PreachingView"("watchedAt");

-- CreateIndex
CREATE INDEX "PreachingView_completed_idx" ON "PreachingView"("completed");

-- CreateIndex
CREATE INDEX "Radio_status_idx" ON "Radio"("status");

-- CreateIndex
CREATE INDEX "Radio_isLive_idx" ON "Radio"("isLive");

-- CreateIndex
CREATE INDEX "RadioChatMessage_radioId_idx" ON "RadioChatMessage"("radioId");

-- CreateIndex
CREATE INDEX "RadioChatMessage_userId_idx" ON "RadioChatMessage"("userId");

-- CreateIndex
CREATE INDEX "RadioChatMessage_createdAt_idx" ON "RadioChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "RadioSchedule_radioId_idx" ON "RadioSchedule"("radioId");

-- CreateIndex
CREATE INDEX "RadioSchedule_startTime_idx" ON "RadioSchedule"("startTime");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_targetId_idx" ON "Report"("targetId");

-- CreateIndex
CREATE INDEX "Report_targetType_idx" ON "Report"("targetType");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSeen" ADD CONSTRAINT "MessageSeen_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSeen" ADD CONSTRAINT "MessageSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingSeries" ADD CONSTRAINT "PreachingSeries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PreachingCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preaching" ADD CONSTRAINT "Preaching_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PreachingCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingComment" ADD CONSTRAINT "PreachingComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PreachingComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingVerse" ADD CONSTRAINT "PreachingVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchRadio" ADD CONSTRAINT "ChurchRadio_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "ChurchPlaylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchRadio" ADD CONSTRAINT "ChurchRadio_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "Radio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPlaylist" ADD CONSTRAINT "ChurchPlaylist_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchPlaylistItem" ADD CONSTRAINT "ChurchPlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "ChurchPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchLive" ADD CONSTRAINT "ChurchLive_liveBroadcastId_fkey" FOREIGN KEY ("liveBroadcastId") REFERENCES "LiveBroadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_prayerChainId_fkey" FOREIGN KEY ("prayerChainId") REFERENCES "PrayerChain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoom" ADD CONSTRAINT "PrayerLiveRoom_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveParticipant" ADD CONSTRAINT "PrayerLiveParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerLiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveParticipant" ADD CONSTRAINT "PrayerLiveParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomMember" ADD CONSTRAINT "PrayerLiveRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerLiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomMember" ADD CONSTRAINT "PrayerLiveRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomParticipant" ADD CONSTRAINT "PrayerLiveRoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerLiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLiveRoomParticipant" ADD CONSTRAINT "PrayerLiveRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerChainLink" ADD CONSTRAINT "PrayerChainLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerReaction" ADD CONSTRAINT "PrayerReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerResponse" ADD CONSTRAINT "PrayerResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerVerse" ADD CONSTRAINT "PrayerVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTestimony" ADD CONSTRAINT "PrayerTestimony_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioChatMessage" ADD CONSTRAINT "RadioChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
