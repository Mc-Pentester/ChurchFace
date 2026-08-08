# Prisma Schema Audit Report

Generated: 2026-08-08T21:43:59.621Z

## Summary

- Prisma Models: 73
- PostgreSQL Tables: 74
- Missing Tables: 0
- Extra Tables: 1
- Missing Columns: 674
- Type Mismatches: 0
- Nullable Mismatches: 0
- Missing Foreign Keys: 0
- Missing Indexes: 0

## Migration Status

- Total Migrations: 28
- Applied: 51
- Pending: -23
- Failed: 10

Failed Migrations:
- 20260715213222_add_user_church_relation
- 20260715213222_add_user_church_relation
- 20260806150000_add_profile_social_system
- 20260807123302_add_authorId_to_livebroadcast
- 20260807123302_add_authorId_to_livebroadcast
- add_missing_prayer_live_room_member
- add_missing_prayer_live_room_member
- add_prayer_request_church_id
- add_prayer_request_church_id
- add_schedule_to_church

## Critical Issues

### MISSING_COLUMN
Column "id" missing from table "User"

```json
{
  "table": "User",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "email" missing from table "User"

```json
{
  "table": "User",
  "column": "email",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "password" missing from table "User"

```json
{
  "table": "User",
  "column": "password",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "User"

```json
{
  "table": "User",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "image" missing from table "User"

```json
{
  "table": "User",
  "column": "image",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "User"

```json
{
  "table": "User",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "bio" missing from table "User"

```json
{
  "table": "User",
  "column": "bio",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "role" missing from table "User"

```json
{
  "table": "User",
  "column": "role",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "city" missing from table "User"

```json
{
  "table": "User",
  "column": "city",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isBanned" missing from table "User"

```json
{
  "table": "User",
  "column": "isBanned",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isSuspended" missing from table "User"

```json
{
  "table": "User",
  "column": "isSuspended",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "suspendedAt" missing from table "User"

```json
{
  "table": "User",
  "column": "suspendedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "User"

```json
{
  "table": "User",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "permissions" missing from table "User"

```json
{
  "table": "User",
  "column": "permissions",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "coverImage" missing from table "User"

```json
{
  "table": "User",
  "column": "coverImage",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "firstName" missing from table "User"

```json
{
  "table": "User",
  "column": "firstName",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "lastName" missing from table "User"

```json
{
  "table": "User",
  "column": "lastName",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "country" missing from table "User"

```json
{
  "table": "User",
  "column": "country",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "language" missing from table "User"

```json
{
  "table": "User",
  "column": "language",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ministry" missing from table "User"

```json
{
  "table": "User",
  "column": "ministry",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "username" missing from table "User"

```json
{
  "table": "User",
  "column": "username",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Account"

```json
{
  "table": "Account",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Account"

```json
{
  "table": "Account",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "Account"

```json
{
  "table": "Account",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "provider" missing from table "Account"

```json
{
  "table": "Account",
  "column": "provider",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "providerAccountId" missing from table "Account"

```json
{
  "table": "Account",
  "column": "providerAccountId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "refresh_token" missing from table "Account"

```json
{
  "table": "Account",
  "column": "refresh_token",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "access_token" missing from table "Account"

```json
{
  "table": "Account",
  "column": "access_token",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "expires_at" missing from table "Account"

```json
{
  "table": "Account",
  "column": "expires_at",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "token_type" missing from table "Account"

```json
{
  "table": "Account",
  "column": "token_type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "scope" missing from table "Account"

```json
{
  "table": "Account",
  "column": "scope",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id_token" missing from table "Account"

```json
{
  "table": "Account",
  "column": "id_token",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "session_state" missing from table "Account"

```json
{
  "table": "Account",
  "column": "session_state",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Session"

```json
{
  "table": "Session",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "sessionToken" missing from table "Session"

```json
{
  "table": "Session",
  "column": "sessionToken",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Session"

```json
{
  "table": "Session",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "expires" missing from table "Session"

```json
{
  "table": "Session",
  "column": "expires",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "identifier" missing from table "VerificationToken"

```json
{
  "table": "VerificationToken",
  "column": "identifier",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "token" missing from table "VerificationToken"

```json
{
  "table": "VerificationToken",
  "column": "token",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "expires" missing from table "VerificationToken"

```json
{
  "table": "VerificationToken",
  "column": "expires",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "token" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "token",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "deviceInfo" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "deviceInfo",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "revoked" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "revoked",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "expiresAt" missing from table "RefreshToken"

```json
{
  "table": "RefreshToken",
  "column": "expiresAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Post"

```json
{
  "table": "Post",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "Post"

```json
{
  "table": "Post",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Post"

```json
{
  "table": "Post",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "authorId" missing from table "Post"

```json
{
  "table": "Post",
  "column": "authorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "hashtags" missing from table "Post"

```json
{
  "table": "Post",
  "column": "hashtags",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "Post"

```json
{
  "table": "Post",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "videoUrl" missing from table "Post"

```json
{
  "table": "Post",
  "column": "videoUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isHidden" missing from table "Post"

```json
{
  "table": "Post",
  "column": "isHidden",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "likes" missing from table "Post"

```json
{
  "table": "Post",
  "column": "likes",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "Post"

```json
{
  "table": "Post",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "generatedId" missing from table "Post"

```json
{
  "table": "Post",
  "column": "generatedId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "generatedType" missing from table "Post"

```json
{
  "table": "Post",
  "column": "generatedType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "postId" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "postId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "parentId" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "parentId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isHidden" missing from table "Comment"

```json
{
  "table": "Comment",
  "column": "isHidden",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "id" missing from table "Like"

```json
{
  "table": "Like",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Like"

```json
{
  "table": "Like",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "postId" missing from table "Like"

```json
{
  "table": "Like",
  "column": "postId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Like"

```json
{
  "table": "Like",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Share"

```json
{
  "table": "Share",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Share"

```json
{
  "table": "Share",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "postId" missing from table "Share"

```json
{
  "table": "Share",
  "column": "postId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Share"

```json
{
  "table": "Share",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Story"

```json
{
  "table": "Story",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "Story"

```json
{
  "table": "Story",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "videoUrl" missing from table "Story"

```json
{
  "table": "Story",
  "column": "videoUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "Story"

```json
{
  "table": "Story",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Story"

```json
{
  "table": "Story",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "expiresAt" missing from table "Story"

```json
{
  "table": "Story",
  "column": "expiresAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "authorId" missing from table "Story"

```json
{
  "table": "Story",
  "column": "authorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "StoryView"

```json
{
  "table": "StoryView",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "storyId" missing from table "StoryView"

```json
{
  "table": "StoryView",
  "column": "storyId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "StoryView"

```json
{
  "table": "StoryView",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "StoryView"

```json
{
  "table": "StoryView",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Chat"

```json
{
  "table": "Chat",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isGroup" missing from table "Chat"

```json
{
  "table": "Chat",
  "column": "isGroup",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "name" missing from table "Chat"

```json
{
  "table": "Chat",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Chat"

```json
{
  "table": "Chat",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChatMember"

```json
{
  "table": "ChatMember",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChatMember"

```json
{
  "table": "ChatMember",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "chatId" missing from table "ChatMember"

```json
{
  "table": "ChatMember",
  "column": "chatId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isTyping" missing from table "ChatMember"

```json
{
  "table": "ChatMember",
  "column": "isTyping",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "lastSeen" missing from table "ChatMember"

```json
{
  "table": "ChatMember",
  "column": "lastSeen",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Message"

```json
{
  "table": "Message",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "Message"

```json
{
  "table": "Message",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Message"

```json
{
  "table": "Message",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "chatId" missing from table "Message"

```json
{
  "table": "Message",
  "column": "chatId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "senderId" missing from table "Message"

```json
{
  "table": "Message",
  "column": "senderId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "MessageSeen"

```json
{
  "table": "MessageSeen",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "messageId" missing from table "MessageSeen"

```json
{
  "table": "MessageSeen",
  "column": "messageId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "MessageSeen"

```json
{
  "table": "MessageSeen",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "seenAt" missing from table "MessageSeen"

```json
{
  "table": "MessageSeen",
  "column": "seenAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "message" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "message",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "senderId" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "senderId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "entityId" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "entityId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "entityType" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "entityType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "read" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "read",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "metadata" missing from table "Notification"

```json
{
  "table": "Notification",
  "column": "metadata",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "id" missing from table "PushSubscription"

```json
{
  "table": "PushSubscription",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PushSubscription"

```json
{
  "table": "PushSubscription",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "endpoint" missing from table "PushSubscription"

```json
{
  "table": "PushSubscription",
  "column": "endpoint",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PushSubscription"

```json
{
  "table": "PushSubscription",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "keys" missing from table "PushSubscription"

```json
{
  "table": "PushSubscription",
  "column": "keys",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "id" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "senderId" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "senderId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "receiverId" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "receiverId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "status" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Friendship"

```json
{
  "table": "Friendship",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "UserFollow"

```json
{
  "table": "UserFollow",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "followerId" missing from table "UserFollow"

```json
{
  "table": "UserFollow",
  "column": "followerId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "followingId" missing from table "UserFollow"

```json
{
  "table": "UserFollow",
  "column": "followingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "UserFollow"

```json
{
  "table": "UserFollow",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Report"

```json
{
  "table": "Report",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "reporterId" missing from table "Report"

```json
{
  "table": "Report",
  "column": "reporterId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "targetId" missing from table "Report"

```json
{
  "table": "Report",
  "column": "targetId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "targetType" missing from table "Report"

```json
{
  "table": "Report",
  "column": "targetType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "reason" missing from table "Report"

```json
{
  "table": "Report",
  "column": "reason",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Report"

```json
{
  "table": "Report",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "status" missing from table "Report"

```json
{
  "table": "Report",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Report"

```json
{
  "table": "Report",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "resolvedAt" missing from table "Report"

```json
{
  "table": "Report",
  "column": "resolvedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "resolvedBy" missing from table "Report"

```json
{
  "table": "Report",
  "column": "resolvedBy",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Report"

```json
{
  "table": "Report",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "AdminLog"

```json
{
  "table": "AdminLog",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "adminId" missing from table "AdminLog"

```json
{
  "table": "AdminLog",
  "column": "adminId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "action" missing from table "AdminLog"

```json
{
  "table": "AdminLog",
  "column": "action",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "details" missing from table "AdminLog"

```json
{
  "table": "AdminLog",
  "column": "details",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "AdminLog"

```json
{
  "table": "AdminLog",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "slug" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "slug",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "icon" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "icon",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "order" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "banner" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "banner",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "color" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "color",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "PreachingCategory"

```json
{
  "table": "PreachingCategory",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "thumbnail" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "thumbnail",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "authorId" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "authorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "banner" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "banner",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "categoryId" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "categoryId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isFeatured" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "isFeatured",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isPublished" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "isPublished",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "order" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "publishedAt" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "publishedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "slug" missing from table "PreachingSeries"

```json
{
  "table": "PreachingSeries",
  "column": "slug",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "thumbnail" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "thumbnail",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "videoUrl" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "videoUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "duration" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "authorId" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "authorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "categoryId" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "categoryId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "seriesId" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "seriesId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "publishedAt" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "publishedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "allowComments" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "allowComments",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "allowDownload" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "allowDownload",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "allowSharing" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "allowSharing",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "audioUrl" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "audioUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "banner" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "banner",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "bookmarkCount" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "bookmarkCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "commentCount" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "commentCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "isFeatured" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "isFeatured",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isPinned" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "isPinned",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isPublished" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "isPublished",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "language" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "language",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "likeCount" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "likeCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "seoDescription" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "seoDescription",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "seoTitle" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "seoTitle",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "shareCount" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "shareCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "slug" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "slug",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "tags" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "tags",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "viewCount" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "viewCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "visibility" missing from table "Preaching"

```json
{
  "table": "Preaching",
  "column": "visibility",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "watchedAt" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "watchedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "completed" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "completed",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "device" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "device",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ipAddress" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "ipAddress",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "platform" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "platform",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "watchDuration" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "watchDuration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "watchPercent" missing from table "PreachingView"

```json
{
  "table": "PreachingView",
  "column": "watchPercent",
  "expectedType": "Float"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingLike"

```json
{
  "table": "PreachingLike",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingLike"

```json
{
  "table": "PreachingLike",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingLike"

```json
{
  "table": "PreachingLike",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingLike"

```json
{
  "table": "PreachingLike",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "parentId" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "parentId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "isEdited" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "isEdited",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isHidden" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "isHidden",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "likeCount" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "likeCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "replyCount" missing from table "PreachingComment"

```json
{
  "table": "PreachingComment",
  "column": "replyCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingBookmark"

```json
{
  "table": "PreachingBookmark",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingBookmark"

```json
{
  "table": "PreachingBookmark",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingBookmark"

```json
{
  "table": "PreachingBookmark",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingBookmark"

```json
{
  "table": "PreachingBookmark",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "timestamp" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "timestamp",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "color" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "color",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PreachingNote"

```json
{
  "table": "PreachingNote",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "preachingId" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "preachingId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "book" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "book",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "chapter" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "chapter",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "text" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "text",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "reference" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "reference",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "translation" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "translation",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "verseEnd" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "verseEnd",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "verseStart" missing from table "PreachingVerse"

```json
{
  "table": "PreachingVerse",
  "column": "verseStart",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "id" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "thumbnail" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "thumbnail",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "authorId" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "authorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ownerType" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "ownerType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ownerId" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "ownerId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "viewerCount" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "viewerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "status" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "scheduledAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "scheduledAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "startedAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "startedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "endedAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "endedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "rtmpUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "rtmpUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamMode" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "streamMode",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "webrtcUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "webrtcUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "outputDestinations" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "outputDestinations",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "studioConfig" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "studioConfig",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "streamId" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "streamId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamKey" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "streamKey",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ingestUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "ingestUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playbackUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "playbackUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "rtmpsUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "rtmpsUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "livekitRoom" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "livekitRoom",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "livekitToken" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "livekitToken",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "relayEnabled" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "relayEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "relayStatus" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "relayStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "encoder" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "encoder",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ingestProtocol" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "ingestProtocol",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playbackProtocol" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "playbackProtocol",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "heartbeatAt" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "heartbeatAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "ingestStatus" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "ingestStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "duration" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "peakViewerCount" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "peakViewerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "bitrate" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "bitrate",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "bandwidth" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "bandwidth",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "packetLoss" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "packetLoss",
  "expectedType": "Float"
}
```

### MISSING_COLUMN
Column "droppedFrames" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "droppedFrames",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "cpuUsage" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "cpuUsage",
  "expectedType": "Float"
}
```

### MISSING_COLUMN
Column "recordingEnabled" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "recordingEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "recordingUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "recordingUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "recordingStatus" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "recordingStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "replayUrl" missing from table "LiveBroadcast"

```json
{
  "table": "LiveBroadcast",
  "column": "replayUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Church"

```json
{
  "table": "Church",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "slug" missing from table "Church"

```json
{
  "table": "Church",
  "column": "slug",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "Church"

```json
{
  "table": "Church",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Church"

```json
{
  "table": "Church",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "slogan" missing from table "Church"

```json
{
  "table": "Church",
  "column": "slogan",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "logo" missing from table "Church"

```json
{
  "table": "Church",
  "column": "logo",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "coverImage" missing from table "Church"

```json
{
  "table": "Church",
  "column": "coverImage",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "website" missing from table "Church"

```json
{
  "table": "Church",
  "column": "website",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "email" missing from table "Church"

```json
{
  "table": "Church",
  "column": "email",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "phone" missing from table "Church"

```json
{
  "table": "Church",
  "column": "phone",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "address" missing from table "Church"

```json
{
  "table": "Church",
  "column": "address",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "city" missing from table "Church"

```json
{
  "table": "Church",
  "column": "city",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "country" missing from table "Church"

```json
{
  "table": "Church",
  "column": "country",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "donationEnabled" missing from table "Church"

```json
{
  "table": "Church",
  "column": "donationEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "radioEnabled" missing from table "Church"

```json
{
  "table": "Church",
  "column": "radioEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Church"

```json
{
  "table": "Church",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Church"

```json
{
  "table": "Church",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "schedule" missing from table "Church"

```json
{
  "table": "Church",
  "column": "schedule",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "role" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "role",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "joinedAt" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "joinedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "notificationPreferences" missing from table "ChurchMember"

```json
{
  "table": "ChurchMember",
  "column": "notificationPreferences",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchAdmin"

```json
{
  "table": "ChurchAdmin",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchAdmin"

```json
{
  "table": "ChurchAdmin",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchAdmin"

```json
{
  "table": "ChurchAdmin",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "role" missing from table "ChurchAdmin"

```json
{
  "table": "ChurchAdmin",
  "column": "role",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "appointedAt" missing from table "ChurchAdmin"

```json
{
  "table": "ChurchAdmin",
  "column": "appointedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "startDate" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "startDate",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "endDate" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "endDate",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "location" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "location",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isPublic" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "isPublic",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "attendeeCount" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "attendeeCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchEvent"

```json
{
  "table": "ChurchEvent",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchEventAttendee"

```json
{
  "table": "ChurchEventAttendee",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "eventId" missing from table "ChurchEventAttendee"

```json
{
  "table": "ChurchEventAttendee",
  "column": "eventId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchEventAttendee"

```json
{
  "table": "ChurchEventAttendee",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchEventAttendee"

```json
{
  "table": "ChurchEventAttendee",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "status" missing from table "ChurchEventAttendee"

```json
{
  "table": "ChurchEventAttendee",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "url" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "url",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "order" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "caption" missing from table "ChurchMedia"

```json
{
  "table": "ChurchMedia",
  "column": "caption",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "radioId" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "radioId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "playlistId" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "playlistId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "schedule" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "schedule",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "ChurchRadio"

```json
{
  "table": "ChurchRadio",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "liveBroadcastId" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "liveBroadcastId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "thumbnail" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "thumbnail",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "viewerCount" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "viewerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "status" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "scheduledAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "scheduledAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "scheduledStart" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "scheduledStart",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "scheduledEnd" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "scheduledEnd",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "startedAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "startedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "endedAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "endedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "rtmpUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "rtmpUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamMode" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "streamMode",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "webrtcUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "webrtcUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "outputDestinations" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "outputDestinations",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "studioConfig" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "studioConfig",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "playUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "playUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamId" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "streamId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamKey" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "streamKey",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ingestUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "ingestUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playbackUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "playbackUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "rtmpsUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "rtmpsUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "livekitRoom" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "livekitRoom",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "livekitToken" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "livekitToken",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "relayEnabled" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "relayEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "relayStatus" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "relayStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "encoder" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "encoder",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ingestProtocol" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "ingestProtocol",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playbackProtocol" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "playbackProtocol",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "heartbeatAt" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "heartbeatAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "ingestStatus" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "ingestStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "duration" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "peakViewerCount" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "peakViewerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "bitrate" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "bitrate",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "bandwidth" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "bandwidth",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "packetLoss" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "packetLoss",
  "expectedType": "Float"
}
```

### MISSING_COLUMN
Column "droppedFrames" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "droppedFrames",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "cpuUsage" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "cpuUsage",
  "expectedType": "Float"
}
```

### MISSING_COLUMN
Column "recordingEnabled" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "recordingEnabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "recordingUrl" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "recordingUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "recordingStatus" missing from table "ChurchLive"

```json
{
  "table": "ChurchLive",
  "column": "recordingStatus",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isPublished" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "isPublished",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "enrollCount" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "enrollCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "ChurchCourse"

```json
{
  "table": "ChurchCourse",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchCourseEnrollment"

```json
{
  "table": "ChurchCourseEnrollment",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "courseId" missing from table "ChurchCourseEnrollment"

```json
{
  "table": "ChurchCourseEnrollment",
  "column": "courseId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchCourseEnrollment"

```json
{
  "table": "ChurchCourseEnrollment",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "progress" missing from table "ChurchCourseEnrollment"

```json
{
  "table": "ChurchCourseEnrollment",
  "column": "progress",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchCourseEnrollment"

```json
{
  "table": "ChurchCourseEnrollment",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "videoUrl" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "videoUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "generated" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "generated",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "generatedType" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "generatedType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "generatedId" missing from table "ChurchPost"

```json
{
  "table": "ChurchPost",
  "column": "generatedId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchPostLike"

```json
{
  "table": "ChurchPostLike",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchPostId" missing from table "ChurchPostLike"

```json
{
  "table": "ChurchPostLike",
  "column": "churchPostId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchPostLike"

```json
{
  "table": "ChurchPostLike",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchPostLike"

```json
{
  "table": "ChurchPostLike",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchPostComment"

```json
{
  "table": "ChurchPostComment",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchPostId" missing from table "ChurchPostComment"

```json
{
  "table": "ChurchPostComment",
  "column": "churchPostId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchPostComment"

```json
{
  "table": "ChurchPostComment",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "ChurchPostComment"

```json
{
  "table": "ChurchPostComment",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchPostComment"

```json
{
  "table": "ChurchPostComment",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ChurchFollow"

```json
{
  "table": "ChurchFollow",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "ChurchFollow"

```json
{
  "table": "ChurchFollow",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ChurchFollow"

```json
{
  "table": "ChurchFollow",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ChurchFollow"

```json
{
  "table": "ChurchFollow",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isLive" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "isLive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "startedAt" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "startedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "viewerCount" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "viewerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "status" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "Stream"

```json
{
  "table": "Stream",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isLive" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "isLive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isAutoDJ" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "isAutoDJ",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "startedAt" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "startedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "endedAt" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "endedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "listenerCount" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "listenerCount",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "peakListeners" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "peakListeners",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "totalDuration" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "totalDuration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "rtmpUrl" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "rtmpUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "currentTrackId" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "currentTrackId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playlistId" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "playlistId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "currentTrack" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "currentTrack",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "status" missing from table "Radio"

```json
{
  "table": "Radio",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "category" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "category",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "Playlist"

```json
{
  "table": "Playlist",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "url" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "url",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "duration" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "order" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "playlistId" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "playlistId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PlaylistItem"

```json
{
  "table": "PlaylistItem",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "category" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "category",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isUrgent" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "isUrgent",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isAnswered" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "isAnswered",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "prayerChainId" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "prayerChainId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "PrayerRequest"

```json
{
  "table": "PrayerRequest",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isPublic" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "isPublic",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "moderatorId" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "moderatorId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerLiveRoom"

```json
{
  "table": "PrayerLiveRoom",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerLiveParticipant"

```json
{
  "table": "PrayerLiveParticipant",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "roomId" missing from table "PrayerLiveParticipant"

```json
{
  "table": "PrayerLiveParticipant",
  "column": "roomId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerLiveParticipant"

```json
{
  "table": "PrayerLiveParticipant",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "joinedAt" missing from table "PrayerLiveParticipant"

```json
{
  "table": "PrayerLiveParticipant",
  "column": "joinedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerLiveRoomMember"

```json
{
  "table": "PrayerLiveRoomMember",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "roomId" missing from table "PrayerLiveRoomMember"

```json
{
  "table": "PrayerLiveRoomMember",
  "column": "roomId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerLiveRoomMember"

```json
{
  "table": "PrayerLiveRoomMember",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "joinedAt" missing from table "PrayerLiveRoomMember"

```json
{
  "table": "PrayerLiveRoomMember",
  "column": "joinedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerLiveRoomParticipant"

```json
{
  "table": "PrayerLiveRoomParticipant",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "roomId" missing from table "PrayerLiveRoomParticipant"

```json
{
  "table": "PrayerLiveRoomParticipant",
  "column": "roomId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerLiveRoomParticipant"

```json
{
  "table": "PrayerLiveRoomParticipant",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "joinedAt" missing from table "PrayerLiveRoomParticipant"

```json
{
  "table": "PrayerLiveRoomParticipant",
  "column": "joinedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "prayerRequestId" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "prayerRequestId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerChain"

```json
{
  "table": "PrayerChain",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerChainLink"

```json
{
  "table": "PrayerChainLink",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "chainId" missing from table "PrayerChainLink"

```json
{
  "table": "PrayerChainLink",
  "column": "chainId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerChainLink"

```json
{
  "table": "PrayerChainLink",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "message" missing from table "PrayerChainLink"

```json
{
  "table": "PrayerChainLink",
  "column": "message",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerChainLink"

```json
{
  "table": "PrayerChainLink",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerReaction"

```json
{
  "table": "PrayerReaction",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "prayerRequestId" missing from table "PrayerReaction"

```json
{
  "table": "PrayerReaction",
  "column": "prayerRequestId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerReaction"

```json
{
  "table": "PrayerReaction",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "PrayerReaction"

```json
{
  "table": "PrayerReaction",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerReaction"

```json
{
  "table": "PrayerReaction",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "prayerRequestId" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "prayerRequestId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerResponse"

```json
{
  "table": "PrayerResponse",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "prayerRequestId" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "prayerRequestId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "reference" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "reference",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "text" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "text",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerVerse"

```json
{
  "table": "PrayerVerse",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "prayerRequestId" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "prayerRequestId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "imageUrl" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "imageUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "PrayerTestimony"

```json
{
  "table": "PrayerTestimony",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "artist" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "artist",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "album" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "album",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "url" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "url",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "coverUrl" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "coverUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "duration" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "type" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "category" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "category",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "uploadedBy" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "uploadedBy",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "AudioTrack"

```json
{
  "table": "AudioTrack",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "radioId" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "radioId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "playlistId" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "playlistId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "title" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "title",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "hostName" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "hostName",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "startTime" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "startTime",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "endTime" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "endTime",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "duration" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "duration",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "isRecurring" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "isRecurring",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "recurrence" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "recurrence",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "RadioSchedule"

```json
{
  "table": "RadioSchedule",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "radioId" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "radioId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "content" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "content",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "isPinned" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "isPinned",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isDeleted" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "isDeleted",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "deletedAt" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "deletedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "pinnedAt" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "pinnedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "RadioChatMessage"

```json
{
  "table": "RadioChatMessage",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "description" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "description",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "order" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "isActive" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "isActive",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "broadcastId" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "broadcastId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchLiveId" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "churchLiveId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "StudioScene"

```json
{
  "table": "StudioScene",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "url" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "url",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "settings" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "settings",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "order" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "order",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "isVisible" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "isVisible",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "volume" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "volume",
  "expectedType": "Int"
}
```

### MISSING_COLUMN
Column "muted" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "muted",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "sceneId" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "sceneId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "StudioSource"

```json
{
  "table": "StudioSource",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "platform" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "platform",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "enabled" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "enabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isPrimary" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "isPrimary",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "config" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "config",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "streamKey" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "streamKey",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "streamUrl" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "streamUrl",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "status" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "broadcastId" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "broadcastId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "StudioOutput"

```json
{
  "table": "StudioOutput",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "ownerType" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "ownerType",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "platform" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "platform",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "accountName" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "accountName",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "accessTokenEncrypted" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "accessTokenEncrypted",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "refreshTokenEncrypted" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "refreshTokenEncrypted",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "status" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "status",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "metadata" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "metadata",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "lastUsedAt" missing from table "BroadcastAccount"

```json
{
  "table": "BroadcastAccount",
  "column": "lastUsedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "broadcastAccountId" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "broadcastAccountId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "platform" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "platform",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "enabled" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "enabled",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "isDefault" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "isDefault",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "configuration" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "configuration",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "BroadcastDestination"

```json
{
  "table": "BroadcastDestination",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "churchId" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "churchId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "role" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "role",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "permissions" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "permissions",
  "expectedType": "Json"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "BroadcastPermission"

```json
{
  "table": "BroadcastPermission",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "profileLocked" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "profileLocked",
  "expectedType": "Boolean"
}
```

### MISSING_COLUMN
Column "postVisibility" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "postVisibility",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "friendVisibility" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "friendVisibility",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "followPermission" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "followPermission",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "ProfilePrivacy"

```json
{
  "table": "ProfilePrivacy",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Album"

```json
{
  "table": "Album",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Album"

```json
{
  "table": "Album",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "name" missing from table "Album"

```json
{
  "table": "Album",
  "column": "name",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "Album"

```json
{
  "table": "Album",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "visibility" missing from table "Album"

```json
{
  "table": "Album",
  "column": "visibility",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Album"

```json
{
  "table": "Album",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "updatedAt" missing from table "Album"

```json
{
  "table": "Album",
  "column": "updatedAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Media"

```json
{
  "table": "Media",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "userId" missing from table "Media"

```json
{
  "table": "Media",
  "column": "userId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "albumId" missing from table "Media"

```json
{
  "table": "Media",
  "column": "albumId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "type" missing from table "Media"

```json
{
  "table": "Media",
  "column": "type",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "url" missing from table "Media"

```json
{
  "table": "Media",
  "column": "url",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "thumbnail" missing from table "Media"

```json
{
  "table": "Media",
  "column": "thumbnail",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "caption" missing from table "Media"

```json
{
  "table": "Media",
  "column": "caption",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "visibility" missing from table "Media"

```json
{
  "table": "Media",
  "column": "visibility",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Media"

```json
{
  "table": "Media",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

### MISSING_COLUMN
Column "id" missing from table "Block"

```json
{
  "table": "Block",
  "column": "id",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "blockerId" missing from table "Block"

```json
{
  "table": "Block",
  "column": "blockerId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "blockedId" missing from table "Block"

```json
{
  "table": "Block",
  "column": "blockedId",
  "expectedType": "String"
}
```

### MISSING_COLUMN
Column "createdAt" missing from table "Block"

```json
{
  "table": "Block",
  "column": "createdAt",
  "expectedType": "DateTime"
}
```

## High Priority Issues

No high priority issues found.

## Medium Priority Issues

### EXTRA_TABLE
Table "_prisma_migrations" exists in PostgreSQL but not in Prisma schema

```json
{
  "tableName": "_prisma_migrations"
}
```

## Low Priority Issues

No low priority issues found.

