--
-- PostgreSQL database dump
--

\restrict F7038RvQPvNnLvngYzUofPjTztyqq8l5NpXgypeSfeag9IDhRhsH6YGd0P1cAFk

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: AdminLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminLog" (
    id text NOT NULL,
    "adminId" text NOT NULL,
    action text NOT NULL,
    "targetId" text,
    "targetType" text,
    details jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AudioTrack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AudioTrack" (
    id text NOT NULL,
    title text NOT NULL,
    artist text,
    album text,
    url text NOT NULL,
    "coverUrl" text,
    duration integer DEFAULT 0 NOT NULL,
    type text DEFAULT 'MUSIC'::text NOT NULL,
    category text DEFAULT 'GENERAL'::text NOT NULL,
    "playCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "uploadedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Chat" (
    id text NOT NULL,
    "isGroup" boolean DEFAULT false NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChatMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMember" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chatId" text NOT NULL,
    "isTyping" boolean DEFAULT false NOT NULL,
    "lastSeen" timestamp(3) without time zone
);


--
-- Name: Church; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Church" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    slogan text,
    logo text,
    "coverImage" text,
    website text,
    email text,
    phone text,
    address text,
    city text,
    country text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "memberCount" integer DEFAULT 0 NOT NULL,
    "followerCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "donationEnabled" boolean DEFAULT false NOT NULL,
    "radioEnabled" boolean DEFAULT false NOT NULL,
    "liveEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ChurchAdmin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchAdmin" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'CHURCH_ADMIN'::text NOT NULL,
    "appointedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchCourse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchCourse" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    title text NOT NULL,
    description text,
    instructor text,
    thumbnail text,
    duration integer,
    level text DEFAULT 'BEGINNER'::text NOT NULL,
    category text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "enrollCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ChurchCourseEnrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchCourseEnrollment" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "userId" text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: ChurchEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchEvent" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    title text NOT NULL,
    description text,
    "imageUrl" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    location text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "attendeeCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ChurchEventAttendee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchEventAttendee" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchFollow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchFollow" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchLive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchLive" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    "liveBroadcastId" text,
    title text NOT NULL,
    "streamUrl" text,
    thumbnail text,
    status text DEFAULT 'OFFLINE'::text NOT NULL,
    "viewerCount" integer DEFAULT 0 NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ChurchMedia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchMedia" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    type text DEFAULT 'IMAGE'::text NOT NULL,
    title text,
    url text NOT NULL,
    thumbnail text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchMember" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'MEMBER'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: ChurchPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchPost" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    content text,
    "imageUrl" text,
    "videoUrl" text,
    "isPinned" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    generated boolean DEFAULT false NOT NULL,
    "generatedType" text,
    "generatedId" text
);


--
-- Name: ChurchPostComment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchPostComment" (
    id text NOT NULL,
    "churchPostId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchPostLike; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchPostLike" (
    id text NOT NULL,
    "churchPostId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChurchRadio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChurchRadio" (
    id text NOT NULL,
    "churchId" text NOT NULL,
    "radioId" text,
    name text NOT NULL,
    "streamUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    content text NOT NULL,
    "userId" text NOT NULL,
    "postId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "parentId" text,
    "isHidden" boolean DEFAULT false NOT NULL
);


--
-- Name: Event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Friendship; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Friendship" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Like" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "postId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LiveBroadcast; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LiveBroadcast" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail text,
    "streamUrl" text NOT NULL,
    "authorId" text NOT NULL,
    "viewerCount" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "chatId" text NOT NULL,
    "senderId" text NOT NULL
);


--
-- Name: MessageSeen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MessageSeen" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    "userId" text NOT NULL,
    "seenAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "senderId" text,
    data jsonb,
    "entityId" text,
    "entityType" text
);


--
-- Name: Playlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Playlist" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isAutoDJ" boolean DEFAULT false NOT NULL,
    category text DEFAULT 'GENERAL'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    shuffle boolean DEFAULT false NOT NULL,
    loop boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PlaylistItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlaylistItem" (
    id text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    type text DEFAULT 'AUDIO'::text NOT NULL,
    duration integer,
    "order" integer DEFAULT 0 NOT NULL,
    "playlistId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    content text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "authorId" text NOT NULL,
    hashtags text[] DEFAULT ARRAY[]::text[],
    "imageUrl" text,
    "videoUrl" text,
    "isHidden" boolean DEFAULT false NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL
);


--
-- Name: PrayerChain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerChain" (
    id text NOT NULL,
    "prayerRequestId" text,
    title text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PrayerChainLink; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerChainLink" (
    id text NOT NULL,
    "chainId" text NOT NULL,
    "userId" text NOT NULL,
    message text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrayerLiveRoom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerLiveRoom" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "moderatorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone
);


--
-- Name: PrayerReaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerReaction" (
    id text NOT NULL,
    "prayerRequestId" text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrayerRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    "isUrgent" boolean DEFAULT false NOT NULL,
    "isAnswered" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PrayerResponse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerResponse" (
    id text NOT NULL,
    "prayerRequestId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'COMMENT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrayerRoomParticipant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerRoomParticipant" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    "userId" text NOT NULL,
    "isMuted" boolean DEFAULT true NOT NULL,
    "hasHandRaised" boolean DEFAULT false NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrayerTestimony; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerTestimony" (
    id text NOT NULL,
    "prayerRequestId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrayerVerse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrayerVerse" (
    id text NOT NULL,
    "prayerRequestId" text NOT NULL,
    "userId" text NOT NULL,
    reference text NOT NULL,
    text text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Preaching; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Preaching" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    thumbnail text NOT NULL,
    "videoUrl" text NOT NULL,
    duration integer NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "authorId" text NOT NULL,
    "categoryId" text NOT NULL,
    "seriesId" text,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PreachingBookmark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingBookmark" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PreachingCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PreachingComment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingComment" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PreachingLike; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingLike" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PreachingNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingNote" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "timestamp" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PreachingSeries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingSeries" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail text,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PreachingVerse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingVerse" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    book text NOT NULL,
    chapter integer NOT NULL,
    verse text NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PreachingView; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PreachingView" (
    id text NOT NULL,
    "preachingId" text NOT NULL,
    "userId" text NOT NULL,
    "watchedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration integer
);


--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Radio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Radio" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isLive" boolean DEFAULT false NOT NULL,
    "isAutoDJ" boolean DEFAULT false NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    "listenerCount" integer DEFAULT 0 NOT NULL,
    "peakListeners" integer DEFAULT 0 NOT NULL,
    "totalDuration" integer DEFAULT 0 NOT NULL,
    "streamUrl" text,
    "rtmpUrl" text,
    "currentTrackId" text,
    "userId" text NOT NULL,
    "playlistId" text
);


--
-- Name: RadioChatMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RadioChatMessage" (
    id text NOT NULL,
    "radioId" text NOT NULL,
    "userId" text,
    name text,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RadioSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RadioSchedule" (
    id text NOT NULL,
    "radioId" text NOT NULL,
    "playlistId" text,
    title text NOT NULL,
    description text,
    "hostName" text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    duration integer DEFAULT 60 NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    recurrence text,
    "isLive" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Report" (
    id text NOT NULL,
    "reporterId" text NOT NULL,
    "targetId" text NOT NULL,
    "targetType" text NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Share; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Share" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "postId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Story; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Story" (
    id text NOT NULL,
    "imageUrl" text,
    "videoUrl" text,
    content text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "isHidden" boolean DEFAULT false NOT NULL
);


--
-- Name: StoryView; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StoryView" (
    id text NOT NULL,
    "storyId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Stream; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Stream" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isLive" boolean DEFAULT true NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    "viewerCount" integer DEFAULT 0 NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    image text,
    name text,
    bio text,
    role text DEFAULT 'USER'::text NOT NULL,
    church text,
    city text,
    "bannedAt" timestamp(3) without time zone,
    "isBanned" boolean DEFAULT false NOT NULL,
    "isSuspended" boolean DEFAULT false NOT NULL,
    "suspendedAt" timestamp(3) without time zone
);


--
-- Name: UserFollow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserFollow" (
    id text NOT NULL,
    "followerId" text NOT NULL,
    "followingId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: AdminLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminLog" (id, "adminId", action, "targetId", "targetType", details, "createdAt") FROM stdin;
\.


--
-- Data for Name: AudioTrack; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AudioTrack" (id, title, artist, album, url, "coverUrl", duration, type, category, "playCount", "isActive", "uploadedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Chat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Chat" (id, "isGroup", name, "createdAt") FROM stdin;
cmq6zgrwy0000vkiaoftf0d5d	t	Chat Global	2026-06-09 18:38:37.138
cmql0j3nt0000yagn1ygq5zd8	f	\N	2026-06-19 14:17:27.72
cmql5z45g000cw7jlw2fnopla	f	\N	2026-06-19 17:12:34.27
cmql0k0ez000cyagnuv7rew40	f	\N	2026-06-19 17:32:35.382
cmql39rh20004z08g3qejan8a	f	\N	2026-06-19 22:57:00.984
cmql0qjot000oyagn3bv05wqx	f	\N	2026-06-19 23:37:18.699
cmql105vc000uyagnkjdr7htg	f	\N	2026-06-20 15:59:24.264
\.


--
-- Data for Name: ChatMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatMember" (id, "userId", "chatId", "isTyping", "lastSeen") FROM stdin;
cmql0j3nt0003yagnl8i9dmof	cmq772mjb0002pxuodunvxjd0	cmql0j3nt0000yagn1ygq5zd8	f	\N
cmql0k0f0000fyagneuj3btnl	cmq77dloo000bpxuowxpsldav	cmql0k0ez000cyagnuv7rew40	f	\N
cmql0j3nt0002yagnsgx1zitc	cmq730pur00001ocoehlt7oy5	cmql0j3nt0000yagn1ygq5zd8	f	2026-06-19 14:18:40.959
cmql0qjot000ryagn18ut6wat	cmq7khlek000062b1q0akn0zl	cmql0qjot000oyagn3bv05wqx	f	\N
cmql5z45g000ew7jl2azmbso4	cmqfqc5r8000011rrsw26a8p5	cmql5z45g000cw7jlw2fnopla	f	2026-06-20 13:31:17.033
cmql39rh20007z08g5zxtkxf7	cmq77acgv0006pxuov2w22d15	cmql39rh20004z08g3qejan8a	f	2026-06-19 15:42:46.986
cmql105vc000wyagn2tb5k9k0	cmqfqc5r8000011rrsw26a8p5	cmql105vc000uyagnkjdr7htg	f	2026-06-20 15:59:33.01
cmql105vc000xyagnkzvku07y	cmq730pur00001ocoehlt7oy5	cmql105vc000uyagnkjdr7htg	f	2026-06-20 15:59:55.309
cmql5z45g000fw7jlc36x2agh	cmqk21mao00001dj663osgrex	cmql5z45g000cw7jlw2fnopla	f	\N
cmql0k0f0000eyagnj7k7x31h	cmq730pur00001ocoehlt7oy5	cmql0k0ez000cyagnuv7rew40	f	2026-06-19 22:12:22.349
cmql0qjot000qyagnpsz945qo	cmq730pur00001ocoehlt7oy5	cmql0qjot000oyagn3bv05wqx	f	2026-06-20 02:05:06.698
cmql39rh20006z08g5lm6tgof	cmq730pur00001ocoehlt7oy5	cmql39rh20004z08g3qejan8a	f	2026-06-20 02:06:00.729
\.


--
-- Data for Name: Church; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Church" (id, slug, name, description, slogan, logo, "coverImage", website, email, phone, address, city, country, "isVerified", "memberCount", "followerCount", "viewCount", "donationEnabled", "radioEnabled", "liveEnabled", "createdAt", "updatedAt") FROM stdin;
cmqkzmevs00087xlnssyww7yk	edmarc	Église de Dieu Maison de Refuge de cazeau	Mission\nNotre mission est de glorifier Dieu en annonçant fidèlement l'Évangile de Jésus-Christ, en faisant des disciples engagés, en favorisant la croissance spirituelle des croyants et en servant la communauté de Tabarre avec amour, compassion et intégrité selon les principes bibliques.\n\nVision\nNotre vision est de devenir une église influente et accueillante qui transforme des vies par la puissance de l'Évangile, forme une génération de disciples solides dans la foi et contribue au développement spirituel, moral et social de la commune de Tabarre, d'Haïti et au-delà.\n\nDescription de l'Église\nSituée dans la commune de Tabarre, notre église est une communauté chrétienne dédiée à l'adoration de Dieu, à l'enseignement de Sa Parole et au service de notre prochain. Nous accueillons les personnes de tous âges et de tous horizons dans un environnement chaleureux où chacun peut grandir dans sa relation avec Jésus-Christ. À travers nos cultes, nos programmes de formation, nos activités de jeunesse, nos actions sociales et nos initiatives d'évangélisation, nous cherchons à être une lumière et une source d'espérance pour notre communauté.	Une église pour toute une communauté	\N	\N		mcintoshfr@gmail.com	+50931914332	32, BLVD 15 OCTOBRE, EN FACE TABARRE 13	TABARRE	Haiti	f	0	0	0	f	f	f	2026-06-19 13:51:46.648	2026-06-19 13:51:46.648
\.


--
-- Data for Name: ChurchAdmin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchAdmin" (id, "churchId", "userId", role, "appointedAt") FROM stdin;
cmqkzmew0000a7xlna3z5df38	cmqkzmevs00087xlnssyww7yk	cmq730pur00001ocoehlt7oy5	PASTOR	2026-06-19 13:51:46.656
\.


--
-- Data for Name: ChurchCourse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchCourse" (id, "churchId", title, description, instructor, thumbnail, duration, level, category, "isPublished", "enrollCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChurchCourseEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchCourseEnrollment" (id, "courseId", "userId", progress, completed, "enrolledAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: ChurchEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchEvent" (id, "churchId", title, description, "imageUrl", "startDate", "endDate", location, "isPublic", "attendeeCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChurchEventAttendee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchEventAttendee" (id, "eventId", "userId", "joinedAt") FROM stdin;
\.


--
-- Data for Name: ChurchFollow; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchFollow" (id, "churchId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChurchLive; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchLive" (id, "churchId", "liveBroadcastId", title, "streamUrl", thumbnail, status, "viewerCount", "scheduledAt", "startedAt", "endedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChurchMedia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchMedia" (id, "churchId", type, title, url, thumbnail, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChurchMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchMember" (id, "churchId", "userId", role, "joinedAt", "isActive") FROM stdin;
\.


--
-- Data for Name: ChurchPost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchPost" (id, "churchId", content, "imageUrl", "videoUrl", "isPinned", "createdAt", "updatedAt", generated, "generatedType", "generatedId") FROM stdin;
\.


--
-- Data for Name: ChurchPostComment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchPostComment" (id, "churchPostId", "userId", content, "parentId", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChurchPostLike; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchPostLike" (id, "churchPostId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChurchRadio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChurchRadio" (id, "churchId", "radioId", name, "streamUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Comment" (id, content, "userId", "postId", "createdAt", "parentId", "isHidden") FROM stdin;
cmq77aztc0008pxuobi7zy5xo	Bon travail pasteur Mac-Intoch	cmq77acgv0006pxuov2w22d15	cmq76nysc0001pxuoyy3ebs0o	2026-06-09 22:18:04.369	\N	f
cmq87y32d000bd5lamc6xbi9z	Merci monami	cmq730pur00001ocoehlt7oy5	cmq76nysc0001pxuoyy3ebs0o	2026-06-10 15:23:47.846	cmq77aztc0008pxuobi7zy5xo	f
cmq8damd400017i3lzr1bq61d	Ça marche	cmq730pur00001ocoehlt7oy5	cmq76nysc0001pxuoyy3ebs0o	2026-06-10 17:53:30.808	\N	f
cmq8za4sp0003r3fb62i6ut0r	C'est un outil important	cmq77yvut0008bcet0c0nyn58	cmq76l0lp0000pxuo513i5ui2	2026-06-11 04:08:59.594	\N	f
cmq9l32u70001btd49jqkyk1q	Amen	cmq7dmrnw00086yd893iticrr	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-11 14:19:22.015	\N	f
cmqb2d8li0001qow8jq37crdw	amen	cmq730pur00001ocoehlt7oy5	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-12 15:10:55.687	\N	f
cmqb5yvgs000312v6j984bmfm	amen	cmq730pur00001ocoehlt7oy5	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-12 16:51:43.948	\N	f
cmqejrhl30007129t8vg91v4v	Oui tu as raison mon cher.	cmq730pur00001ocoehlt7oy5	cmq76l0lp0000pxuo513i5ui2	2026-06-15 01:41:12.52	cmq8za4sp0003r3fb62i6ut0r	f
cmqfqdzmu000311rr5ulvhten	Bonne fete temah	cmqfqc5r8000011rrsw26a8p5	cmqb63858000412v6660mjmiw	2026-06-15 21:34:26.214	\N	f
cmqfqq3gg000511rrx2mfr4wl	Sa ki pase la a menm ?	cmqfqc5r8000011rrsw26a8p5	cmqb63858000412v6660mjmiw	2026-06-15 21:43:51.04	\N	f
cmqik2gxy000113krtyf7is9i	Venez en foule	cmqfqc5r8000011rrsw26a8p5	cmq8qtoty00052h1caos1htse	2026-06-17 21:00:49.606	\N	f
cmqjnom8x00152me1u05fb1bf	Hello	cmq7khlek000062b1q0akn0zl	cmqfqchb3000111rry83avuc8	2026-06-18 15:29:47.938	\N	f
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Event" (id, title, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: Friendship; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Friendship" (id, "senderId", "receiverId", status, "createdAt", "updatedAt") FROM stdin;
cmqh8yadh00015dp32kkfl480	cmq730pur00001ocoehlt7oy5	cmq772mjb0002pxuodunvxjd0	PENDING	2026-06-16 23:01:52.517	2026-06-16 23:01:52.517
cmqh8yf7y00055dp3c5b2zyfc	cmq730pur00001ocoehlt7oy5	cmq7768k70003pxuoieu51r9z	PENDING	2026-06-16 23:01:58.798	2026-06-16 23:01:58.798
cmqhepuj70005cgjkvxqisom2	cmq730pur00001ocoehlt7oy5	cmq77yvut0008bcet0c0nyn58	PENDING	2026-06-17 01:43:16.436	2026-06-17 01:43:16.436
cmqhepvok0009cgjkxxh4hfns	cmq730pur00001ocoehlt7oy5	cmq78cx9n000bbceti8ts85va	PENDING	2026-06-17 01:43:17.925	2026-06-17 01:43:17.925
cmqhepx3k000dcgjk626l98i5	cmq730pur00001ocoehlt7oy5	cmq78hj2u000cbcetcrawney2	PENDING	2026-06-17 01:43:19.761	2026-06-17 01:43:19.761
cmqhepy1p000hcgjkv62tywmk	cmq730pur00001ocoehlt7oy5	cmq7c06pk00046yd8vfiyh2w9	PENDING	2026-06-17 01:43:20.989	2026-06-17 01:43:20.989
cmqhepzdu000lcgjkb6g44fgq	cmq730pur00001ocoehlt7oy5	cmq7cr0dl00076yd8ea9oqoqw	PENDING	2026-06-17 01:43:22.722	2026-06-17 01:43:22.722
cmqheq0wj000pcgjki1fatsui	cmq730pur00001ocoehlt7oy5	cmq7bvapj00036yd8jau70m95	PENDING	2026-06-17 01:43:24.691	2026-06-17 01:43:24.691
cmqi6sv1e0001qjtv98lm1tex	cmq730pur00001ocoehlt7oy5	cmqe1yibx0003129tp8v5rwkp	PENDING	2026-06-17 14:49:26.102	2026-06-17 14:49:26.102
cmqi6t3fy0005qjtvq6zydaio	cmq730pur00001ocoehlt7oy5	cmqfqc5r8000011rrsw26a8p5	ACCEPTED	2026-06-17 14:49:37.199	2026-06-17 14:50:56.681
cmqiodthd0005x15niuyzfhro	cmq7dmrnw00086yd893iticrr	cmq730pur00001ocoehlt7oy5	ACCEPTED	2026-06-17 23:01:37.538	2026-06-17 23:03:42.2
cmqjn49fo00012me17t7ycrtq	cmqfqc5r8000011rrsw26a8p5	cmq7dmrnw00086yd893iticrr	PENDING	2026-06-18 15:13:58.212	2026-06-18 15:13:58.212
cmqjn4gw600052me1dmhi3i6l	cmqfqc5r8000011rrsw26a8p5	cmq772mjb0002pxuodunvxjd0	PENDING	2026-06-18 15:14:07.878	2026-06-18 15:14:07.878
cmqjn4i2a00092me1q8r2va57	cmqfqc5r8000011rrsw26a8p5	cmq7768k70003pxuoieu51r9z	PENDING	2026-06-18 15:14:09.394	2026-06-18 15:14:09.394
cmqjn4k0o000l2me1dlgvv4c9	cmqfqc5r8000011rrsw26a8p5	cmq77yvut0008bcet0c0nyn58	PENDING	2026-06-18 15:14:11.928	2026-06-18 15:14:11.928
cmqjn4klx000p2me1jnfzz4ou	cmqfqc5r8000011rrsw26a8p5	cmq78cx9n000bbceti8ts85va	PENDING	2026-06-18 15:14:12.694	2026-06-18 15:14:12.694
cmqjn4l6n000t2me1zljacvob	cmqfqc5r8000011rrsw26a8p5	cmq78hj2u000cbcetcrawney2	PENDING	2026-06-18 15:14:13.439	2026-06-18 15:14:13.439
cmqjn4mc6000x2me1tfun3u7z	cmqfqc5r8000011rrsw26a8p5	cmq7bvapj00036yd8jau70m95	PENDING	2026-06-18 15:14:14.935	2026-06-18 15:14:14.935
cmqjn4nc500112me1o0ptec94	cmqfqc5r8000011rrsw26a8p5	cmq7c06pk00046yd8vfiyh2w9	PENDING	2026-06-18 15:14:16.229	2026-06-18 15:14:16.229
cmqjntixe001d2me1zq8oczg4	cmq7khlek000062b1q0akn0zl	cmq772mjb0002pxuodunvxjd0	PENDING	2026-06-18 15:33:36.914	2026-06-18 15:33:36.914
cmqjntkx6001h2me1mzef2z0x	cmq7khlek000062b1q0akn0zl	cmq7768k70003pxuoieu51r9z	PENDING	2026-06-18 15:33:39.499	2026-06-18 15:33:39.499
cmqjntqod001l2me189knkvwe	cmq7khlek000062b1q0akn0zl	cmq7bvapj00036yd8jau70m95	PENDING	2026-06-18 15:33:46.957	2026-06-18 15:33:46.957
cmqjntyip001p2me12vlili5d	cmq7khlek000062b1q0akn0zl	cmq78hj2u000cbcetcrawney2	PENDING	2026-06-18 15:33:57.122	2026-06-18 15:33:57.122
cmqjnu6mk00212me1rjon3b4i	cmq7khlek000062b1q0akn0zl	cmq78cx9n000bbceti8ts85va	PENDING	2026-06-18 15:34:07.628	2026-06-18 15:34:07.628
cmqjnu7wm00252me1pm1c6h5q	cmq7khlek000062b1q0akn0zl	cmq7c06pk00046yd8vfiyh2w9	PENDING	2026-06-18 15:34:09.286	2026-06-18 15:34:09.286
cmqjnu2x8001x2me16vgccow6	cmq7khlek000062b1q0akn0zl	cmq77acgv0006pxuov2w22d15	ACCEPTED	2026-06-18 15:34:02.828	2026-06-18 16:00:35.666
cmqjn4ita000d2me1ekmkiqco	cmqfqc5r8000011rrsw26a8p5	cmq77acgv0006pxuov2w22d15	ACCEPTED	2026-06-18 15:14:10.367	2026-06-18 16:00:37.454
cmqh90cn400095dp3xl6e6b04	cmq730pur00001ocoehlt7oy5	cmq77acgv0006pxuov2w22d15	ACCEPTED	2026-06-16 23:03:28.769	2026-06-18 16:00:38.623
cmqjosdiv000d14hamntznyv6	cmq77acgv0006pxuov2w22d15	cmq772mjb0002pxuodunvxjd0	PENDING	2026-06-18 16:00:42.871	2026-06-18 16:00:42.871
cmqjoseig000h14ha36yy1xsa	cmq77acgv0006pxuov2w22d15	cmq7768k70003pxuoieu51r9z	PENDING	2026-06-18 16:00:44.152	2026-06-18 16:00:44.152
cmqjosgbt000p14hazq7haykn	cmq77acgv0006pxuov2w22d15	cmq77yvut0008bcet0c0nyn58	PENDING	2026-06-18 16:00:46.506	2026-06-18 16:00:46.506
cmqjoshdu000t14haw3k59lsd	cmq77acgv0006pxuov2w22d15	cmq78cx9n000bbceti8ts85va	PENDING	2026-06-18 16:00:47.874	2026-06-18 16:00:47.874
cmqjosi7f000x14han9p98t2j	cmq77acgv0006pxuov2w22d15	cmq78hj2u000cbcetcrawney2	PENDING	2026-06-18 16:00:48.939	2026-06-18 16:00:48.939
cmqjosiyj001114ha9elkm2co	cmq77acgv0006pxuov2w22d15	cmq7bvapj00036yd8jau70m95	PENDING	2026-06-18 16:00:49.915	2026-06-18 16:00:49.915
cmqjosjzz001514hazfunq69g	cmq77acgv0006pxuov2w22d15	cmq7c06pk00046yd8vfiyh2w9	PENDING	2026-06-18 16:00:51.263	2026-06-18 16:00:51.263
cmqjosmbr001914has676wowr	cmq77acgv0006pxuov2w22d15	cmq7cr0dl00076yd8ea9oqoqw	PENDING	2026-06-18 16:00:54.28	2026-06-18 16:00:54.28
cmqk23tn100021dj6hud17ihe	cmqk21mao00001dj663osgrex	cmq730pur00001ocoehlt7oy5	ACCEPTED	2026-06-18 22:13:31.981	2026-06-19 00:32:32.101
cmqjoscgh000914ha58zg9ohj	cmq77acgv0006pxuov2w22d15	cmq730pur00001ocoehlt7oy5	ACCEPTED	2026-06-18 16:00:41.49	2026-06-19 00:32:33.965
cmqjntgn800192me1if1a7zpd	cmq7khlek000062b1q0akn0zl	cmq730pur00001ocoehlt7oy5	ACCEPTED	2026-06-18 15:33:33.956	2026-06-19 00:32:35.557
cmqjn4jgm000h2me1hg01ysio	cmqfqc5r8000011rrsw26a8p5	cmq77dloo000bpxuowxpsldav	ACCEPTED	2026-06-18 15:14:11.206	2026-06-19 00:53:19.52
cmqjnu1ts001t2me1g71s5jpx	cmq7khlek000062b1q0akn0zl	cmq77dloo000bpxuowxpsldav	ACCEPTED	2026-06-18 15:34:01.408	2026-06-19 00:53:21.519
cmqheprg20001cgjkvz2hgt12	cmq730pur00001ocoehlt7oy5	cmq77dloo000bpxuowxpsldav	ACCEPTED	2026-06-17 01:43:12.434	2026-06-19 00:53:28.287
cmqjosfgo000l14haqlr69kov	cmq77acgv0006pxuov2w22d15	cmq77dloo000bpxuowxpsldav	ACCEPTED	2026-06-18 16:00:45.384	2026-06-19 00:53:30.053
cmqk7tnq200138hl65bn78kfk	cmq77dloo000bpxuowxpsldav	cmq772mjb0002pxuodunvxjd0	PENDING	2026-06-19 00:53:35.45	2026-06-19 00:53:35.45
cmqk7tom400178hl63y0i35ol	cmq77dloo000bpxuowxpsldav	cmq7768k70003pxuoieu51r9z	PENDING	2026-06-19 00:53:36.604	2026-06-19 00:53:36.604
cmqk7ts4i001b8hl6ebwbpron	cmq77dloo000bpxuowxpsldav	cmq77yvut0008bcet0c0nyn58	PENDING	2026-06-19 00:53:41.154	2026-06-19 00:53:41.154
cmqk7tlkq000z8hl634ilfubx	cmq77dloo000bpxuowxpsldav	cmq730pur00001ocoehlt7oy5	ACCEPTED	2026-06-19 00:53:32.667	2026-06-19 01:20:37.051
cmqkblwbn000514i98ci7kc0s	cmq7khlek000062b1q0akn0zl	cmq7dmrnw00086yd893iticrr	PENDING	2026-06-19 02:39:31.812	2026-06-19 02:39:31.812
cmqkbm62j000914i9o4cj0y2l	cmq7khlek000062b1q0akn0zl	cmqk21mao00001dj663osgrex	PENDING	2026-06-19 02:39:44.443	2026-06-19 02:39:44.443
cmqkyx0l200017xln1x43tvaz	cmq730pur00001ocoehlt7oy5	cmq89ibbd000011dhpkx3gd47	PENDING	2026-06-19 13:32:01.719	2026-06-19 13:32:01.719
cmqkyx27j00057xln8l85c2ih	cmq730pur00001ocoehlt7oy5	cmq8qomn200002h1ck4ruh6zk	PENDING	2026-06-19 13:32:03.824	2026-06-19 13:32:03.824
cmqkbltm2000114i9piifttcm	cmq7khlek000062b1q0akn0zl	cmqfqc5r8000011rrsw26a8p5	ACCEPTED	2026-06-19 02:39:28.298	2026-06-19 14:29:39.739
\.


--
-- Data for Name: Like; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Like" (id, "userId", "postId", "createdAt") FROM stdin;
cmq87pmqs0005d5la4mofuq59	cmq730pur00001ocoehlt7oy5	cmq76l0lp0000pxuo513i5ui2	2026-06-10 15:17:13.444
cmq8ew61400047i3lh7kgw77k	cmq7dmrnw00086yd893iticrr	cmq8djb3k00027i3l03wquwnl	2026-06-10 18:38:15.688
cmq8ew9gj00067i3lxzwhpjol	cmq7dmrnw00086yd893iticrr	cmq7bh0pj00026yd89vlwmvjf	2026-06-10 18:38:20.132
cmq8ewc3300087i3lp96qhktw	cmq7dmrnw00086yd893iticrr	cmq76nysc0001pxuoyy3ebs0o	2026-06-10 18:38:23.535
cmq8ewezs000a7i3lhd1uhrnq	cmq7dmrnw00086yd893iticrr	cmq76l0lp0000pxuo513i5ui2	2026-06-10 18:38:27.304
cmq8ewh02000c7i3lc703fn46	cmq7dmrnw00086yd893iticrr	cmq7334xd00011oco76exdmta	2026-06-10 18:38:29.906
cmq8i9wu10001fmjlb6l50pmk	cmq7khlek000062b1q0akn0zl	cmq76l0lp0000pxuo513i5ui2	2026-06-10 20:12:55.801
cmq8i9zme0003fmjlifr36v8n	cmq7khlek000062b1q0akn0zl	cmq7334xd00011oco76exdmta	2026-06-10 20:12:59.414
cmq8j8vl0000ifmjlfggis2uh	cmq7khlek000062b1q0akn0zl	cmq8j2cpe000cfmjlyy1q1o2a	2026-06-10 20:40:07.141
cmq8j91xc000kfmjl89jumuic	cmq7khlek000062b1q0akn0zl	cmq8djb3k00027i3l03wquwnl	2026-06-10 20:40:15.361
cmq8j96e7000ofmjlwj4m2fb6	cmq7khlek000062b1q0akn0zl	cmq7drsrd00096yd8fw7cltor	2026-06-10 20:40:21.151
cmq8j99jk000qfmjliuzdjfjv	cmq7khlek000062b1q0akn0zl	cmq7bh0pj00026yd89vlwmvjf	2026-06-10 20:40:25.232
cmq8j9d0e000sfmjlnxdau5fm	cmq7khlek000062b1q0akn0zl	cmq76nysc0001pxuoyy3ebs0o	2026-06-10 20:40:29.726
cmq8kk8yu000vfmjl263qyt67	cmq730pur00001ocoehlt7oy5	cmq8kik9q000tfmjl4pj5m5py	2026-06-10 21:16:57.318
cmq8qsy3500022h1c04kegfhn	cmq7dmrnw00086yd893iticrr	cmq8j2cpe000cfmjlyy1q1o2a	2026-06-11 00:11:40.817
cmq8qt39200042h1crh56gjxc	cmq7dmrnw00086yd893iticrr	cmq8kik9q000tfmjl4pj5m5py	2026-06-11 00:11:47.511
cmq8vgj2j0003ao4ysta1st4p	cmq7khlek000062b1q0akn0zl	cmq8qtoty00052h1caos1htse	2026-06-11 02:21:59.564
cmq8vgmel0005ao4y2w25xqzx	cmq7khlek000062b1q0akn0zl	cmq8kik9q000tfmjl4pj5m5py	2026-06-11 02:22:03.885
cmq8vmujp0008ao4yva6mc01a	cmq7khlek000062b1q0akn0zl	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-11 02:26:54.373
cmq9hue2h0001mv7m6qve34z1	cmq7dmrnw00086yd893iticrr	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-11 12:48:37.817
cmq9huhn70003mv7mxsza7hn6	cmq7dmrnw00086yd893iticrr	cmq8qtoty00052h1caos1htse	2026-06-11 12:48:42.451
cmq9l49fc0003btd4xh5h4mcw	cmq730pur00001ocoehlt7oy5	cmq8vmmjw0006ao4y1uzfvxk1	2026-06-11 14:20:17.208
cmqbml8bd0004o330jq3teoeu	cmq730pur00001ocoehlt7oy5	cmq76nysc0001pxuoyy3ebs0o	2026-06-13 00:37:00.889
cmqbmlupk0006o330rpogiu62	cmq730pur00001ocoehlt7oy5	cmq8djb3k00027i3l03wquwnl	2026-06-13 00:37:29.913
cmqejkr1v0005129tiqw3r2lc	cmq730pur00001ocoehlt7oy5	cmq8j2cpe000cfmjlyy1q1o2a	2026-06-15 01:35:58.194
cmqkd9gze0001xejg4u0o14bx	cmq730pur00001ocoehlt7oy5	cmqkcbfu8000c14i9fe9zctht	2026-06-19 03:25:51.291
\.


--
-- Data for Name: LiveBroadcast; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LiveBroadcast" (id, title, description, thumbnail, "streamUrl", "authorId", "viewerCount", status, "scheduledAt", "startedAt", "endedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, content, "createdAt", "chatId", "senderId") FROM stdin;
cmq77btk6000apxuog1oyy3mr	Zanmi 	2026-06-09 22:18:42.916	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmq77nel90003bcetyg4x0yk3	Slt	2026-06-09 22:27:43.35	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmq77oiqv0005bcettcwetde3	Je pense que tout va bien	2026-06-09 22:28:35.43	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmq77vz350007bcet3my2p2h6	Je pense que les chrétiens avaient besoin d'un tél outil 	2026-06-09 22:34:23.119	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmq783sf6000abcetzvb8vko9	Good work brother 	2026-06-09 22:40:27.794	cmq6zgrwy0000vkiaoftf0d5d	cmq77yvut0008bcet0c0nyn58
cmq7c8ex700066yd8s56o3kj9	Bonsoir à tous! Bon travail pasteur Mc!	2026-06-10 00:36:02.013	cmq6zgrwy0000vkiaoftf0d5d	cmq7c06pk00046yd8vfiyh2w9
cmq842ael00038uz5g1nkknzp	Bonjour mes amis 	2026-06-10 13:35:05.475	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmq842nta00058uz591igp0u1	Merci pour votre encouragenmebt	2026-06-10 13:35:22.893	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmq8444zo00078uz5c288501c	Whatsapp bloke kont mwen yè swa wi	2026-06-10 13:36:31.811	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmq84adau00098uz5i8eia6er	Verifye pou mwen si Nou fè publication	2026-06-10 13:41:22.486	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqb5ykqc000112v6a73v9xgm	salut tout le monde	2026-06-12 16:51:30.021	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqi6ygwd000bqjtvua62t5mi	Hi	2026-06-17 14:53:47.892	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqio64dh0001x15nqlfn6jel	Yoo!	2026-06-17 22:55:38.319	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqio6nu30003x15n7gqhefgk	Y a quoi	2026-06-17 22:56:03.627	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqirpqqj0001y82w26irh0eb	Salut on amour	2026-06-18 00:34:52.659	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqjnr5yp00172me12dwstltw	Hello	2026-06-18 15:31:46.763	cmq6zgrwy0000vkiaoftf0d5d	cmq7khlek000062b1q0akn0zl
cmqjor8mb000114hana5da2qx	Fanmim yo kòman nou ye?	2026-06-18 15:59:49.843	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmqjouak9001d14harox3rpjr	Kòman nou pase jour yo?	2026-06-18 16:02:12.343	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmqk699bg00038hl6rwb6twzq	Salut tout le monde	2026-06-19 00:09:44.043	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmqk6a6m100058hl6a97ksheq	Mwen panse Nou tout anfòm 	2026-06-19 00:10:27.16	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmqk73f8p000d8hl6h2lax91m	Bsr Agena	2026-06-19 00:33:11.387	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk73rvc000f8hl6xp0a9pfk	Gras a Dieu Nou anfom wi	2026-06-19 00:33:27.767	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk7500g000h8hl6cwdn8h8q	Kounye a Nou ka utilize système mesajri instantané a wi. Pou ekri zanmi w spesifikman	2026-06-19 00:34:24.975	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk76vtw000j8hl6wiba5dl5	Klike sou menu an an  nan jwenn siperyè dwat la epi voye demain amis nan lis suggestion yo	2026-06-19 00:35:52.866	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk79g9c000l8hl6rkhs3sxy	ok. Eskize m. Mwen poko active mesajri enstantane anon. Li enplemante men l poko aktive	2026-06-19 00:37:52.655	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk7am8q000n8hl6w3eazdc7	Ann atandan akspte demain ami m voye ba Nou yo epi voye demain bay moun a pati de digestion yo nan paj amis a	2026-06-19 00:38:47.046	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmqk7bcua000p8hl6v4amz712	Demen si Dieu veut wap gen om mesajri menm jan ak Messenger sou ChurchFace	2026-06-19 00:39:21.537	cmq6zgrwy0000vkiaoftf0d5d	cmq730pur00001ocoehlt7oy5
cmql0j9ue0005yagn6h75tma2	hEY	2026-06-19 14:17:19.767	cmql0j3nt0000yagn1ygq5zd8	cmq730pur00001ocoehlt7oy5
cmql0ja6p0007yagn85gn4sx8	hEY	2026-06-19 14:17:20.209	cmql0j3nt0000yagn1ygq5zd8	cmq730pur00001ocoehlt7oy5
cmql0jfyt0009yagn3i6v2vlc	wHAT'S UP ?	2026-06-19 14:17:27.701	cmql0j3nt0000yagn1ygq5zd8	cmq730pur00001ocoehlt7oy5
cmql0jgdi000byagnnc3rbbgi	wHAT'S UP ?	2026-06-19 14:17:28.23	cmql0j3nt0000yagn1ygq5zd8	cmq730pur00001ocoehlt7oy5
cmql0k7zh000hyagnavkvwmo4	Hello mon pote	2026-06-19 14:18:04.014	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql0k8dj000jyagn22cr6o2o	Hello mon pote	2026-06-19 14:18:04.518	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql0kplk000lyagnsvae4g7h	Comment a été la nuiit ?	2026-06-19 14:18:26.841	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql0kpve000nyagnth0exh86	Comment a été la nuiit ?	2026-06-19 14:18:27.191	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql10dk7000zyagnvl4mwar4	Salut Mc	2026-06-19 14:30:37.736	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql10dub0011yagnjmurh673	Salut Mc	2026-06-19 14:30:38.081	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql12dot0013yagn3m9hz0jy	Bonjour	2026-06-19 14:32:11.213	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql12e0s0015yagn3exx8lmu	Bonjour	2026-06-19 14:32:11.643	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql2hcnn0001z08g0h86bhdc	Fanmim yo kòman nou ye?	2026-06-19 15:11:49.316	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmql3a0nm0009z08gnju460ql	Hi	2026-06-19 15:34:06.803	cmql39rh20004z08g3qejan8a	cmq730pur00001ocoehlt7oy5
cmql3a1kv000bz08gn25t1oui	Hi	2026-06-19 15:34:07.963	cmql39rh20004z08g3qejan8a	cmq730pur00001ocoehlt7oy5
cmql3dod4000dz08gkuo496gw	Kòman ou ye ?	2026-06-19 15:36:57.496	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmql3e8z3000fz08gj3p5kdkr	Anfom et ou menm 	2026-06-19 15:37:24.205	cmq6zgrwy0000vkiaoftf0d5d	cmq77acgv0006pxuov2w22d15
cmql3gx34000jz08gvbprwyxz	Zanmi m	2026-06-19 15:39:28.768	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql3gx95000lz08g7sh6kjy6	Zanmi m	2026-06-19 15:39:28.957	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql3i862000nz08guj9oxo2m	Fanmim	2026-06-19 15:40:29.787	cmql39rh20004z08g3qejan8a	cmq77acgv0006pxuov2w22d15
cmql3i8bw000pz08gfk50c5za	Fanmim	2026-06-19 15:40:29.995	cmql39rh20004z08g3qejan8a	cmq77acgv0006pxuov2w22d15
cmql4k9rz0001syr9ackvi6rx	ou en st on ?	2026-06-19 16:10:04.799	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql4ka8i0003syr98cye5bu2	ou en st on ?	2026-06-19 16:10:05.393	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql53v480003fvvqx87zu3no	quel resultat ?	2026-06-19 16:25:18.92	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql53v8y0005fvvq6y7vx6q0	quel resultat ?	2026-06-19 16:25:19.089	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql54qfp0007fvvqc0ea9gbh	Rien ne va	2026-06-19 16:25:59.51	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql54qsp0009fvvq6djmbhbi	Rien ne va	2026-06-19 16:25:59.976	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql5km580001w7jl3mbcmvj1	Hi	2026-06-19 16:38:20.444	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql5kmqn0003w7jl9zlvpg6l	Hi	2026-06-19 16:38:21.214	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql5nye60005w7jl280dp15c	m pa konprann anyen	2026-06-19 16:40:56.286	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql5nysd0007w7jlz9jnqy3l	m pa konprann anyen	2026-06-19 16:40:56.795	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql5tr090009w7jlc86xrhkf	Hello	2026-06-19 16:45:26.65	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql5trag000bw7jlb343a790	Hello	2026-06-19 16:45:27	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql65oqc000hw7jlznrnmeh8	Mwen espere nou anfòm	2026-06-19 16:54:43.52	cmq6zgrwy0000vkiaoftf0d5d	cmq77dloo000bpxuowxpsldav
cmql6rqnw000jw7jlg10zmylj	dis si ca fonctionne	2026-06-19 17:11:52.508	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql6rqws000lw7jly5kon8ec	dis si ca fonctionne	2026-06-19 17:11:52.747	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql6smvp000nw7jl327f4cki	Mon ami	2026-06-19 17:12:34.261	cmql5z45g000cw7jlw2fnopla	cmqfqc5r8000011rrsw26a8p5
cmql6sn1q000pw7jlnnrxxfvb	Mon ami	2026-06-19 17:12:34.477	cmql5z45g000cw7jlw2fnopla	cmqfqc5r8000011rrsw26a8p5
cmql7cay90001oqgajmf2l4qa	Mwen la wi	2026-06-19 17:27:51.92	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql7f6ca0003oqgaqeuet5jq	Ok	2026-06-19 17:30:05.915	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql7idnp0005oqga6justuwr	Li pa 2 non la a	2026-06-19 17:32:35.366	cmql0k0ez000cyagnuv7rew40	cmq730pur00001ocoehlt7oy5
cmql7ju5f0007oqgauv4uagv7	nap vanse	2026-06-19 17:33:43.396	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql8d080000112yaxqqg3lru	et maintenant	2026-06-19 17:56:24.288	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmql8duuq000312yakil74mwm	Ça donne quoi	2026-06-19 17:57:03.986	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql8gtpu000512yaer6728xj	Et vre	2026-06-19 17:59:22.482	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmql8msx9000712yaahu6wom4	kòve	2026-06-19 18:04:01.39	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqlj3lez00044woy6qvi6mle	Yo w	2026-06-19 22:57:00.971	cmql39rh20004z08g3qejan8a	cmq730pur00001ocoehlt7oy5
cmqlkj0ts00064woyc6u4fa6e	Sa kap fet ?	2026-06-19 23:37:00.401	cmql0qjot000oyagn3bv05wqx	cmq730pur00001ocoehlt7oy5
cmqlkjexl00084woy19gjb75g	Nap avance wi la a	2026-06-19 23:37:18.682	cmql0qjot000oyagn3bv05wqx	cmq730pur00001ocoehlt7oy5
cmqmdm9pp0001gn4t7vaixnjp	Allo	2026-06-20 13:11:20.749	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmqmdq6n40003gn4t64ya7l44	M pa resevwa w non boss	2026-06-20 13:14:23.393	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqme9k580005gn4tw8m75by7	Et maintenant	2026-06-20 13:29:27.357	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmea2dm0007gn4t16ch8k7q	koman sa ye ?	2026-06-20 13:29:50.986	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmebktp0009gn4t1ygoefv4	Problème	2026-06-20 13:31:01.549	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmqmedcum000bgn4tbajek1oz	nap kontinye gade	2026-06-20 13:32:24.526	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmeq5d60001t49n5ai9ho1a	sA SA AP BAY KOUNYE A ?	2026-06-20 13:42:21.354	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmesqel0003t49nwsgu5k34	Napp siv	2026-06-20 13:44:21.933	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmqmevteb0005t49nhzdibj9d	OK	2026-06-20 13:46:45.78	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmexv8x0007t49niz3j6bpm	TET CHAJE	2026-06-20 13:48:21.49	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmeycq50009t49n8tfh1jzz	SALUT	2026-06-20 13:48:44.141	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmf3k5m000bt49njyopin40	SA K PASE LA A MENM	2026-06-20 13:52:47.05	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmf9bdq000dt49n1tn3vqk1	MENM BAGAY ATO	2026-06-20 13:57:15.614	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmfv2tl0001x6inhb9jnclv	sa l ye kounye a	2026-06-20 14:14:10.949	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmfwjfk0003x6ine0bkfcvj	Interessant	2026-06-20 14:15:19.136	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
cmqmgelqh0001127eswpp5e0i	mhh	2026-06-20 14:29:21.929	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmgws510001jauocyuivsne	m antrave	2026-06-20 14:43:30.038	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmgxaeq0003jauo3900wd1l	anmweyyyyy	2026-06-20 14:43:53.714	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmh6ra400011ai4talp15on	se mele m mele	2026-06-20 14:51:15.484	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmhfbpq0001ewxrn2yi3trh	pote-m sekou nou seyè	2026-06-20 14:57:55.211	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmhhhon0003ewxrp163r095	Jezi oooo	2026-06-20 14:59:36.263	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmhhtss0005ewxrtub6ep1n	Anmeyyyy	2026-06-20 14:59:51.964	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmifnp00001x5pux561rbel	pote m sekou Bondyeeeeeeee	2026-06-20 15:26:10.356	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmjlv100001k0bgu72p3uim	Jezi k konnen	2026-06-20 15:58:59.412	cmql105vc000uyagnkjdr7htg	cmqfqc5r8000011rrsw26a8p5
cmqmjme720003k0bg3mokbqih	Anyen pa tonbe	2026-06-20 15:59:24.255	cmql105vc000uyagnkjdr7htg	cmq730pur00001ocoehlt7oy5
\.


--
-- Data for Name: MessageSeen; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MessageSeen" (id, "messageId", "userId", "seenAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, type, message, "isRead", "userId", "createdAt", "senderId", data, "entityId", "entityType") FROM stdin;
cmqh8yae800035dp3q5jz2dg2	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq772mjb0002pxuodunvxjd0	2026-06-16 23:01:52.545	cmq730pur00001ocoehlt7oy5	\N	cmqh8yadh00015dp32kkfl480	friendship
cmqh8yf8500075dp3tqc63obm	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq7768k70003pxuoieu51r9z	2026-06-16 23:01:58.806	cmq730pur00001ocoehlt7oy5	\N	cmqh8yf7y00055dp3c5b2zyfc	friendship
cmqhepujl0007cgjk6uhptg9t	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq77yvut0008bcet0c0nyn58	2026-06-17 01:43:16.45	cmq730pur00001ocoehlt7oy5	\N	cmqhepuj70005cgjkvxqisom2	friendship
cmqhepvou000bcgjkxjf9z9ej	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq78cx9n000bbceti8ts85va	2026-06-17 01:43:17.935	cmq730pur00001ocoehlt7oy5	\N	cmqhepvok0009cgjkxxh4hfns	friendship
cmqhepx3u000fcgjkm4vneqbw	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq78hj2u000cbcetcrawney2	2026-06-17 01:43:19.771	cmq730pur00001ocoehlt7oy5	\N	cmqhepx3k000dcgjk626l98i5	friendship
cmqhepy1y000jcgjki1eeq64e	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq7c06pk00046yd8vfiyh2w9	2026-06-17 01:43:20.998	cmq730pur00001ocoehlt7oy5	\N	cmqhepy1p000hcgjkv62tywmk	friendship
cmqhepze8000ncgjk8pxtugma	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq7cr0dl00076yd8ea9oqoqw	2026-06-17 01:43:22.737	cmq730pur00001ocoehlt7oy5	\N	cmqhepzdu000lcgjkb6g44fgq	friendship
cmqheq0wt000rcgjkpj8bexsh	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq7bvapj00036yd8jau70m95	2026-06-17 01:43:24.701	cmq730pur00001ocoehlt7oy5	\N	cmqheq0wj000pcgjki1fatsui	friendship
cmqi6sv9i0003qjtvic59gm3w	FRIEND_REQUEST	Mc-Pentester  wants to be your friend	f	cmqe1yibx0003129tp8v5rwkp	2026-06-17 14:49:26.598	cmq730pur00001ocoehlt7oy5	\N	cmqi6sv1e0001qjtv98lm1tex	friendship
cmqi6t3g70007qjtvd5c8ujn5	FRIEND_REQUEST	Mc-Pentester  wants to be your friend	t	cmqfqc5r8000011rrsw26a8p5	2026-06-17 14:49:37.207	cmq730pur00001ocoehlt7oy5	\N	cmqi6t3fy0005qjtvq6zydaio	friendship
cmqi6ussc0009qjtvjutc3j6c	FRIEND_ACCEPTED	ChurchFace a accepté votre demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-17 14:50:56.7	cmqfqc5r8000011rrsw26a8p5	\N	cmqi6t3fy0005qjtvq6zydaio	friendship
cmqiodthr0007x15nzn5qvuq3	FRIEND_REQUEST	Babe vous a envoyé une demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-17 23:01:37.551	cmq7dmrnw00086yd893iticrr	\N	cmqiodthd0005x15niuyzfhro	friendship
cmqioghon0009x15nuhgo7urs	FRIEND_ACCEPTED	Mc-Pentester  a accepté votre demande d'ami	t	cmq7dmrnw00086yd893iticrr	2026-06-17 23:03:42.216	cmq730pur00001ocoehlt7oy5	\N	cmqiodthd0005x15niuyzfhro	friendship
cmqjn4gwf00072me101ausgl2	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq772mjb0002pxuodunvxjd0	2026-06-18 15:14:07.888	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4gw600052me1dmhi3i6l	friendship
cmqjn4i2k000b2me1efa24e7u	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq7768k70003pxuoieu51r9z	2026-06-18 15:14:09.404	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4i2a00092me1q8r2va57	friendship
cmqjn4k0z000n2me1axmv9t0o	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq77yvut0008bcet0c0nyn58	2026-06-18 15:14:11.94	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4k0o000l2me1dlgvv4c9	friendship
cmqjn4km8000r2me1qoeerm4d	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq78cx9n000bbceti8ts85va	2026-06-18 15:14:12.705	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4klx000p2me1jnfzz4ou	friendship
cmqjn4l6x000v2me19gtc8hsj	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq78hj2u000cbcetcrawney2	2026-06-18 15:14:13.449	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4l6n000t2me1zljacvob	friendship
cmqjn4mcg000z2me19y7v4l6f	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq7bvapj00036yd8jau70m95	2026-06-18 15:14:14.944	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4mc6000x2me1tfun3u7z	friendship
cmqjn4ncf00132me11y0f2aop	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	f	cmq7c06pk00046yd8vfiyh2w9	2026-06-18 15:14:16.239	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4nc500112me1o0ptec94	friendship
cmqjntixr001f2me1hckwesxk	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq772mjb0002pxuodunvxjd0	2026-06-18 15:33:36.927	cmq7khlek000062b1q0akn0zl	\N	cmqjntixe001d2me1zq8oczg4	friendship
cmqjntkxq001j2me1yiilj53b	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq7768k70003pxuoieu51r9z	2026-06-18 15:33:39.518	cmq7khlek000062b1q0akn0zl	\N	cmqjntkx6001h2me1mzef2z0x	friendship
cmqjntqoo001n2me1w1apugmv	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq7bvapj00036yd8jau70m95	2026-06-18 15:33:46.968	cmq7khlek000062b1q0akn0zl	\N	cmqjntqod001l2me189knkvwe	friendship
cmqjntyj4001r2me1zaug68yk	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq78hj2u000cbcetcrawney2	2026-06-18 15:33:57.136	cmq7khlek000062b1q0akn0zl	\N	cmqjntyip001p2me12vlili5d	friendship
cmqjn4jh4000j2me1qwwgm99s	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	t	cmq77dloo000bpxuowxpsldav	2026-06-18 15:14:11.224	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4jgm000h2me1hg01ysio	friendship
cmqjn4itk000f2me1guagvc1z	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	t	cmq77acgv0006pxuov2w22d15	2026-06-18 15:14:10.377	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn4ita000d2me1ekmkiqco	friendship
cmqhepri60003cgjkdliampzf	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	t	cmq77dloo000bpxuowxpsldav	2026-06-17 01:43:12.51	cmq730pur00001ocoehlt7oy5	\N	cmqheprg20001cgjkvz2hgt12	friendship
cmqjntgno001b2me15xbg2w0h	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-18 15:33:33.973	cmq7khlek000062b1q0akn0zl	\N	cmqjntgn800192me1if1a7zpd	friendship
cmqh90cng000b5dp307o1mnxd	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	t	cmq77acgv0006pxuov2w22d15	2026-06-16 23:03:28.781	cmq730pur00001ocoehlt7oy5	\N	cmqh90cn400095dp3xl6e6b04	friendship
cmqjn49g400032me15o50jrtr	FRIEND_REQUEST	ChurchFace vous a envoyé une demande d'ami	t	cmq7dmrnw00086yd893iticrr	2026-06-18 15:13:58.228	cmqfqc5r8000011rrsw26a8p5	\N	cmqjn49fo00012me17t7ycrtq	friendship
cmqjnu6mv00232me1zcujw3x0	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq78cx9n000bbceti8ts85va	2026-06-18 15:34:07.639	cmq7khlek000062b1q0akn0zl	\N	cmqjnu6mk00212me1rjon3b4i	friendship
cmqjnu7wx00272me1d83e3xvw	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmq7c06pk00046yd8vfiyh2w9	2026-06-18 15:34:09.298	cmq7khlek000062b1q0akn0zl	\N	cmqjnu7wm00252me1pm1c6h5q	friendship
cmqk7ti7e000v8hl6wmj5z29d	FRIEND_ACCEPTED	AGENA Jean Rony a accepté votre demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-19 00:53:28.298	cmq77dloo000bpxuowxpsldav	\N	cmqheprg20001cgjkvz2hgt12	friendship
cmqjnu2xj001z2me1xm35agab	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	t	cmq77acgv0006pxuov2w22d15	2026-06-18 15:34:02.84	cmq7khlek000062b1q0akn0zl	\N	cmqjnu2x8001x2me16vgccow6	friendship
cmqjosdj4000f14ha6dm7z3fe	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq772mjb0002pxuodunvxjd0	2026-06-18 16:00:42.88	cmq77acgv0006pxuov2w22d15	\N	cmqjosdiv000d14hamntznyv6	friendship
cmqjoseip000j14haqchmprd5	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq7768k70003pxuoieu51r9z	2026-06-18 16:00:44.161	cmq77acgv0006pxuov2w22d15	\N	cmqjoseig000h14ha36yy1xsa	friendship
cmqjosgcb000r14ha936rizw8	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq77yvut0008bcet0c0nyn58	2026-06-18 16:00:46.523	cmq77acgv0006pxuov2w22d15	\N	cmqjosgbt000p14hazq7haykn	friendship
cmqjoshe3000v14haykg8ioz2	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq78cx9n000bbceti8ts85va	2026-06-18 16:00:47.883	cmq77acgv0006pxuov2w22d15	\N	cmqjoshdu000t14haw3k59lsd	friendship
cmqjosi8k000z14hat3y8yqha	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq78hj2u000cbcetcrawney2	2026-06-18 16:00:48.981	cmq77acgv0006pxuov2w22d15	\N	cmqjosi7f000x14han9p98t2j	friendship
cmqjosiyx001314ha5xgoh55s	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq7bvapj00036yd8jau70m95	2026-06-18 16:00:49.928	cmq77acgv0006pxuov2w22d15	\N	cmqjosiyj001114ha9elkm2co	friendship
cmqjosk0b001714halsho1xym	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq7c06pk00046yd8vfiyh2w9	2026-06-18 16:00:51.276	cmq77acgv0006pxuov2w22d15	\N	cmqjosjzz001514hazfunq69g	friendship
cmqjosmc3001b14haadip8rk3	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	f	cmq7cr0dl00076yd8ea9oqoqw	2026-06-18 16:00:54.292	cmq77acgv0006pxuov2w22d15	\N	cmqjosmbr001914has676wowr	friendship
cmqk72nla000b8hl6zv35kca0	FRIEND_ACCEPTED	Mc-Pentester  a accepté votre demande d'ami	t	cmq7khlek000062b1q0akn0zl	2026-06-19 00:32:35.566	cmq730pur00001ocoehlt7oy5	\N	cmqjntgn800192me1if1a7zpd	friendship
cmqjosfh9000n14had7agf040	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	t	cmq77dloo000bpxuowxpsldav	2026-06-18 16:00:45.405	cmq77acgv0006pxuov2w22d15	\N	cmqjosfgo000l14haqlr69kov	friendship
cmqk23tnh00041dj6mlzb95n5	FRIEND_REQUEST	ST-Eloi Osée vous a envoyé une demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-18 22:13:31.997	cmqk21mao00001dj663osgrex	\N	cmqk23tn100021dj6hud17ihe	friendship
cmqk72kxj00078hl6p8ffbbep	FRIEND_ACCEPTED	Mc-Pentester  a accepté votre demande d'ami	f	cmqk21mao00001dj663osgrex	2026-06-19 00:32:32.12	cmq730pur00001ocoehlt7oy5	\N	cmqk23tn100021dj6hud17ihe	friendship
cmqjosa9d000714hanacmzz5d	FRIEND_ACCEPTED	PASCAL Eliphète  a accepté votre demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-18 16:00:38.641	cmq77acgv0006pxuov2w22d15	\N	cmqh90cn400095dp3xl6e6b04	friendship
cmqjoscgr000b14hadqu0p3ya	FRIEND_REQUEST	PASCAL Eliphète  vous a envoyé une demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-18 16:00:41.499	cmq77acgv0006pxuov2w22d15	\N	cmqjoscgh000914ha58zg9ohj	friendship
cmqjnu1u1001v2me1v1dd5l16	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	t	cmq77dloo000bpxuowxpsldav	2026-06-18 15:34:01.417	cmq7khlek000062b1q0akn0zl	\N	cmqjnu1ts001t2me1g71s5jpx	friendship
cmqk7tcze000t8hl629gaco5w	FRIEND_ACCEPTED	AGENA Jean Rony a accepté votre demande d'ami	t	cmq7khlek000062b1q0akn0zl	2026-06-19 00:53:21.53	cmq77dloo000bpxuowxpsldav	\N	cmqjnu1ts001t2me1g71s5jpx	friendship
cmqjos7z3000314hany4861rj	FRIEND_ACCEPTED	PASCAL Eliphète  a accepté votre demande d'ami	t	cmq7khlek000062b1q0akn0zl	2026-06-18 16:00:35.679	cmq77acgv0006pxuov2w22d15	\N	cmqjnu2x8001x2me16vgccow6	friendship
cmqk7tbga000r8hl61jtwscyy	FRIEND_ACCEPTED	AGENA Jean Rony a accepté votre demande d'ami	t	cmqfqc5r8000011rrsw26a8p5	2026-06-19 00:53:19.546	cmq77dloo000bpxuowxpsldav	\N	cmqjn4jgm000h2me1hg01ysio	friendship
cmqjos9cm000514ha0bshtupc	FRIEND_ACCEPTED	PASCAL Eliphète  a accepté votre demande d'ami	t	cmqfqc5r8000011rrsw26a8p5	2026-06-18 16:00:37.462	cmq77acgv0006pxuov2w22d15	\N	cmqjn4ita000d2me1ekmkiqco	friendship
cmqk7tjku000x8hl67fo5blxh	FRIEND_ACCEPTED	AGENA Jean Rony a accepté votre demande d'ami	t	cmq77acgv0006pxuov2w22d15	2026-06-19 00:53:30.078	cmq77dloo000bpxuowxpsldav	\N	cmqjosfgo000l14haqlr69kov	friendship
cmqk72md900098hl6qwfunep6	FRIEND_ACCEPTED	Mc-Pentester  a accepté votre demande d'ami	t	cmq77acgv0006pxuov2w22d15	2026-06-19 00:32:33.981	cmq730pur00001ocoehlt7oy5	\N	cmqjoscgh000914ha58zg9ohj	friendship
cmqk7tnqa00158hl6drr30528	FRIEND_REQUEST	AGENA Jean Rony vous a envoyé une demande d'ami	f	cmq772mjb0002pxuodunvxjd0	2026-06-19 00:53:35.459	cmq77dloo000bpxuowxpsldav	\N	cmqk7tnq200138hl65bn78kfk	friendship
cmqk7tomc00198hl6zmifi23z	FRIEND_REQUEST	AGENA Jean Rony vous a envoyé une demande d'ami	f	cmq7768k70003pxuoieu51r9z	2026-06-19 00:53:36.612	cmq77dloo000bpxuowxpsldav	\N	cmqk7tom400178hl63y0i35ol	friendship
cmqk7ts4p001d8hl6lzlelpyl	FRIEND_REQUEST	AGENA Jean Rony vous a envoyé une demande d'ami	f	cmq77yvut0008bcet0c0nyn58	2026-06-19 00:53:41.161	cmq77dloo000bpxuowxpsldav	\N	cmqk7ts4i001b8hl6ebwbpron	friendship
cmqk7tll000118hl6xhhavhh6	FRIEND_REQUEST	AGENA Jean Rony vous a envoyé une demande d'ami	t	cmq730pur00001ocoehlt7oy5	2026-06-19 00:53:32.676	cmq77dloo000bpxuowxpsldav	\N	cmqk7tlkq000z8hl634ilfubx	friendship
cmqk8sez000017e1no5wc0p76	FRIEND_ACCEPTED	Mc-Pentester  a accepté votre demande d'ami	f	cmq77dloo000bpxuowxpsldav	2026-06-19 01:20:37.069	cmq730pur00001ocoehlt7oy5	\N	cmqk7tlkq000z8hl634ilfubx	friendship
cmqkbm62r000b14i94lul0vhv	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	f	cmqk21mao00001dj663osgrex	2026-06-19 02:39:44.452	cmq7khlek000062b1q0akn0zl	\N	cmqkbm62j000914i9o4cj0y2l	friendship
cmqkyx0lo00037xln01l5pjo7	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq89ibbd000011dhpkx3gd47	2026-06-19 13:32:01.741	cmq730pur00001ocoehlt7oy5	\N	cmqkyx0l200017xln1x43tvaz	friendship
cmqkyx27v00077xln6wf6z6yw	FRIEND_REQUEST	Mc-Pentester  vous a envoyé une demande d'ami	f	cmq8qomn200002h1ck4ruh6zk	2026-06-19 13:32:03.835	cmq730pur00001ocoehlt7oy5	\N	cmqkyx27j00057xln8l85c2ih	friendship
cmqkbltmi000314i9tvgtaj1f	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	t	cmqfqc5r8000011rrsw26a8p5	2026-06-19 02:39:28.315	cmq7khlek000062b1q0akn0zl	\N	cmqkbltm2000114i9piifttcm	friendship
cmql0z4tk000tyagng8zynb46	FRIEND_ACCEPTED	ChurchFace a accepté votre demande d'ami	f	cmq7khlek000062b1q0akn0zl	2026-06-19 14:29:39.752	cmqfqc5r8000011rrsw26a8p5	\N	cmqkbltm2000114i9piifttcm	friendship
cmqkblwbv000714i9xaie8wu4	FRIEND_REQUEST	Mémé Dieumaitre  vous a envoyé une demande d'ami	t	cmq7dmrnw00086yd893iticrr	2026-06-19 02:39:31.819	cmq7khlek000062b1q0akn0zl	\N	cmqkblwbn000514i98ci7kc0s	friendship
\.


--
-- Data for Name: Playlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Playlist" (id, title, description, "isAutoDJ", category, "isActive", shuffle, loop, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PlaylistItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PlaylistItem" (id, title, url, type, duration, "order", "playlistId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, content, "createdAt", "authorId", hashtags, "imageUrl", "videoUrl", "isHidden", "isPinned") FROM stdin;
cmq7334xd00011oco76exdmta	Bienvenue sur ChurchFace	2026-06-09 20:19:59.28	cmq730pur00001ocoehlt7oy5	{}	\N	\N	f	f
cmq76l0lp0000pxuo513i5ui2	Hello World	2026-06-09 21:57:52.331	cmq730pur00001ocoehlt7oy5	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1XRmMzjcJAJj2ty9CH0DidBQTfnzxYosOL8V4	\N	f	f
cmq76nysc0001pxuoyy3ebs0o	Soyez sobre. Veillez. Votre adversaire le diable rode comme un lion rugissant, cherchant qui il dévorera.	2026-06-09 22:00:09.947	cmq730pur00001ocoehlt7oy5	{}	\N	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1g2vsPmRxMsl9eqIKWmncXzP02vdSCVgrN6LQ	f	f
cmq7bh0pj00026yd89vlwmvjf		2026-06-10 00:14:43.924	cmq730pur00001ocoehlt7oy5	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1xtaeRKqz6jSpFUPdZGNWmX54Y9LInE0xbgKc	\N	f	f
cmq7drsrd00096yd8fw7cltor	Hello every. One	2026-06-10 01:19:06.072	cmq7dmrnw00086yd893iticrr	{}	\N	\N	f	f
cmq8djb3k00027i3l03wquwnl		2026-06-10 18:00:16.11	cmq730pur00001ocoehlt7oy5	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1zdoW1SNHxr9kHg3At6XZJKCjbw1P4IlRMEoU	\N	f	f
cmq8j2cpe000cfmjlyy1q1o2a		2026-06-10 20:35:02.735	cmq7khlek000062b1q0akn0zl	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1jN8klE2f7exvqOkZ05RQ1GVJAhiBWdPKt94C	\N	f	f
cmq8kik9q000tfmjl4pj5m5py	Léo Saveur Plus	2026-06-10 21:15:38.653	cmq730pur00001ocoehlt7oy5	{}	\N	\N	f	f
cmq8qtoty00052h1caos1htse		2026-06-11 00:12:15.477	cmq7dmrnw00086yd893iticrr	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1zdFwXvKHxr9kHg3At6XZJKCjbw1P4IlRMEoU	\N	f	f
cmq8vmmjw0006ao4y1uzfvxk1	« Quand tout semble perdu, souviens-toi que Dieu ouvre toujours un chemin là où l'homme ne voit aucune issue. Fais-lui confiance. » 🙏✨	2026-06-11 02:26:44.012	cmq7khlek000062b1q0akn0zl	{}	\N	\N	f	f
cmqb63858000412v6660mjmiw	Bonsoir	2026-06-12 16:55:07.003	cmq730pur00001ocoehlt7oy5	{}	\N	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1sww0jEP4FIJpUaEw8C7HRzghtPOsQX1ZmNLi	f	f
cmqfqchb3000111rry83avuc8	Hello World	2026-06-15 21:33:15.806	cmqfqc5r8000011rrsw26a8p5	{}	\N	\N	f	f
cmqk8zghv00027e1n8gjx3j69		2026-06-19 01:26:05.636	cmq730pur00001ocoehlt7oy5	{}	\N	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo1twPjAATKA96Oa3Xy1qw7VfYgxbLJGBCR2lci	f	f
cmqkcbfu8000c14i9fe9zctht		2026-06-19 02:59:23.505	cmq7khlek000062b1q0akn0zl	{}	https://3e7fd2anch.ufs.sh/f/R9tKs71vXjo16KeT5GjJXoYA2CQge4aisPm0WMy7t6jNvnTF	\N	f	f
cmql4lxii0004syr9k5iucbh0	Je travaille sur le systeme de partage de posts.	2026-06-19 16:11:22.217	cmqfqc5r8000011rrsw26a8p5	{}	\N	\N	f	f
cmql505j30000fvvqplunf7r9	Je galere	2026-06-19 16:22:25.791	cmqfqc5r8000011rrsw26a8p5	{}	\N	\N	f	f
cmql52yuq0001fvvqkjc7spps	Je travaille sur les notifications	2026-06-19 16:24:37.104	cmqfqc5r8000011rrsw26a8p5	{}	\N	\N	f	f
cmqlbfzse00004woymz1gqh2s	Aujourd'hui j'ai bien galéré	2026-06-19 19:22:42.541	cmqfqc5r8000011rrsw26a8p5	{}	\N	\N	f	f
\.


--
-- Data for Name: PrayerChain; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerChain" (id, "prayerRequestId", title, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PrayerChainLink; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerChainLink" (id, "chainId", "userId", message, "createdAt") FROM stdin;
\.


--
-- Data for Name: PrayerLiveRoom; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerLiveRoom" (id, title, description, "isPublic", "isActive", "moderatorId", "createdAt", "endedAt") FROM stdin;
\.


--
-- Data for Name: PrayerReaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerReaction" (id, "prayerRequestId", "userId", type, "createdAt") FROM stdin;
cmqlbxkc000024woy0tq4vd31	cmqbdyt370003rm836b3sfts5	cmq730pur00001ocoehlt7oy5	PRAY	2026-06-19 19:36:22.32
\.


--
-- Data for Name: PrayerRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerRequest" (id, "userId", title, content, category, "isUrgent", "isAnswered", "createdAt", "updatedAt") FROM stdin;
cmqbdyt370003rm836b3sfts5	cmq730pur00001ocoehlt7oy5	Prière pour ChurchFace	Que Dieu permette la réussite du développement de ChurchFace avec l'appui de tous ses membres.	MINISTERE	t	f	2026-06-12 20:35:37.794	2026-06-12 20:35:37.794
\.


--
-- Data for Name: PrayerResponse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerResponse" (id, "prayerRequestId", "userId", content, type, "createdAt") FROM stdin;
\.


--
-- Data for Name: PrayerRoomParticipant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerRoomParticipant" (id, "roomId", "userId", "isMuted", "hasHandRaised", "joinedAt") FROM stdin;
\.


--
-- Data for Name: PrayerTestimony; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerTestimony" (id, "prayerRequestId", "userId", content, "imageUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: PrayerVerse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrayerVerse" (id, "prayerRequestId", "userId", reference, text, "createdAt") FROM stdin;
\.


--
-- Data for Name: Preaching; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Preaching" (id, title, description, thumbnail, "videoUrl", duration, views, "authorId", "categoryId", "seriesId", "publishedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreachingBookmark; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingBookmark" (id, "preachingId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PreachingCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingCategory" (id, name, slug, description, icon, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreachingComment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingComment" (id, "preachingId", "userId", content, "parentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreachingLike; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingLike" (id, "preachingId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PreachingNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingNote" (id, "preachingId", "userId", content, "timestamp", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreachingSeries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingSeries" (id, title, description, thumbnail, "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreachingVerse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingVerse" (id, "preachingId", book, chapter, verse, text, "createdAt") FROM stdin;
\.


--
-- Data for Name: PreachingView; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreachingView" (id, "preachingId", "userId", "watchedAt", duration) FROM stdin;
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PushSubscription" (id, "userId", endpoint, p256dh, auth, "createdAt") FROM stdin;
\.


--
-- Data for Name: Radio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Radio" (id, title, description, "isLive", "isAutoDJ", "startedAt", "endedAt", "listenerCount", "peakListeners", "totalDuration", "streamUrl", "rtmpUrl", "currentTrackId", "userId", "playlistId") FROM stdin;
\.


--
-- Data for Name: RadioChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RadioChatMessage" (id, "radioId", "userId", name, content, "isPinned", "isDeleted", "createdAt") FROM stdin;
\.


--
-- Data for Name: RadioSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RadioSchedule" (id, "radioId", "playlistId", title, description, "hostName", "startTime", "endTime", duration, "isRecurring", recurrence, "isLive", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Report" (id, "reporterId", "targetId", "targetType", reason, description, status, "createdAt", "resolvedAt", "resolvedBy") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Share; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Share" (id, "userId", "postId", "createdAt") FROM stdin;
cmq8ijq1g0005fmjlr5tv0smw	cmq7dmrnw00086yd893iticrr	cmq7bh0pj00026yd89vlwmvjf	2026-06-10 20:20:33.556
cmql2ly5n0003z08gnkcia79a	cmqfqc5r8000011rrsw26a8p5	cmqk8zghv00027e1n8gjx3j69	2026-06-19 15:15:23.82
cmql3f70o000hz08grpdu2bcy	cmq77acgv0006pxuov2w22d15	cmqb63858000412v6660mjmiw	2026-06-19 15:38:08.329
\.


--
-- Data for Name: Story; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Story" (id, "imageUrl", "videoUrl", content, "createdAt", "expiresAt", "authorId", "isHidden") FROM stdin;
\.


--
-- Data for Name: StoryView; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StoryView" (id, "storyId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Stream; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Stream" (id, title, description, "isLive", "startedAt", "endedAt", "viewerCount", "userId") FROM stdin;
cmqb972nc0001tdjo9z0ax9yc	df	\N	f	2026-06-12 18:22:05.274	2026-06-12 18:24:17.039	0	cmq730pur00001ocoehlt7oy5
cmqb9a4ds0003tdjotl4nr8lq	df	\N	f	2026-06-12 18:24:27.569	2026-06-12 18:24:38.086	0	cmq730pur00001ocoehlt7oy5
cmqbd04xg0001rm83avemkdjc	fd	\N	f	2026-06-12 20:08:40.179	2026-06-12 20:08:45.852	0	cmq730pur00001ocoehlt7oy5
cmqbl4uii0001o330b8qc820v	Je suis la	\N	f	2026-06-12 23:56:16.888	2026-06-12 23:59:26.121	0	cmq730pur00001ocoehlt7oy5
cmqbnhbxl0001129t7x0ninw8	Hey	\N	f	2026-06-13 01:01:58.565	2026-06-15 01:43:40.119	0	cmq730pur00001ocoehlt7oy5
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, "createdAt", image, name, bio, role, church, city, "bannedAt", "isBanned", "isSuspended", "suspendedAt") FROM stdin;
cmq730pur00001ocoehlt7oy5	mcintoshfr@gmail.com	$2b$10$VrAnfjY8fJ46Bf5YrT8f4udtLkzMlMO9qft2K6KrZJLNLy0k9BCcG	2026-06-09 20:18:06.435	\N	Mc-Pentester 	\N	USER	\N	\N	\N	f	f	\N
cmq7768k70003pxuoieu51r9z	chawinsonladouceur10@gmail.com	$2b$10$.2kOy1jXl0bh80DXmBH.4uSEN94vR9hFpIpHX01k/pFOEaxgL61cq	2026-06-09 22:14:22.424	\N	Ladouceur Chawinson 	\N	USER	\N	\N	\N	f	f	\N
cmq77dloo000bpxuowxpsldav	agenastar02@gmail.com	$2b$10$Irqqob0MUntvFAsINIFlNOGr1fs1cAd5bkMzNUYInswbRrI595PuS	2026-06-09 22:20:06.025	\N	AGENA Jean Rony	\N	USER	\N	\N	\N	f	f	\N
cmq77yvut0008bcet0c0nyn58	dacarlito07@gmail.com	$2b$10$CmVTb88RD4NmMYtdVMqGD.gZsF.aH25wt033Sl9VkqzLDHgH/DcAW	2026-06-09 22:36:38.981	\N	Charles Daniel 	\N	USER	\N	\N	\N	f	f	\N
cmq78cx9n000bbceti8ts85va	pierreisaac1967@gmail.com	$2b$10$XRSAbe5tL36kBujAc/EiLegYtLJIzFZmDLFKoozQsvCJq1LRwCxZ.	2026-06-09 22:47:33.995	\N	Pierre Isaac 	\N	USER	\N	\N	\N	f	f	\N
cmq78hj2u000cbcetcrawney2	isaacpierre1967@gmail.com	$2b$10$MKjMwVUwhqZ4IGazNVCFUOc1TwapGie9///vm7TnlZ6voZ6cFISdm	2026-06-09 22:51:08.886	\N	Pierre Isaac 	\N	USER	\N	\N	\N	f	f	\N
cmq7bvapj00036yd8jau70m95	ingabsalon037@gmail.com	$2b$10$jIxG/vACo.1aKo5uO3Ieieim/jtNaiRQEpa4sck9bndQq8GHaMBZS	2026-06-10 00:25:50.071	\N	Absalon SAMEDI 	\N	USER	\N	\N	\N	f	f	\N
cmq7c06pk00046yd8vfiyh2w9	samediabsalon@gmail.com	$2b$10$6sp2ciQWH6eKUWmm/iUqeOc4gW/Pvg.X.qX0W63be96ME4ubRoHZ6	2026-06-10 00:29:38.169	\N	Absalon SAMEDI 	\N	USER	\N	\N	\N	f	f	\N
cmq7cr0dl00076yd8ea9oqoqw	gesmygeffrard26@gmail.com	$2b$10$LA3slMqDUEdH2WwBSdoS6OlJBGCEwdKTrte6vC.FiEdPgmGLUN9LG	2026-06-10 00:50:29.673	\N	Gesmy Geffrard 	\N	USER	\N	\N	\N	f	f	\N
cmq7dmrnw00086yd893iticrr	msheilafr@gmail.com	$2b$10$bmyL5CFdAzVe1Py3b3xZEurCtxJiL02zDPLWkjK9WQF8NCE4iFJBK	2026-06-10 01:15:11.372	\N	Babe	\N	USER	\N	\N	\N	f	f	\N
cmq7khlek000062b1q0akn0zl	dmllex6@gmail.com	$2b$10$RPXw34Eh1E5h6v31kJ90VubiBZPZFP2P/QPJ2pnaKCX1DgvBJ0O4i	2026-06-10 04:27:07.292	\N	Mémé Dieumaitre 	\N	USER	\N	\N	\N	f	f	\N
cmq89ibbd000011dhpkx3gd47	francoismax1980@gmail.com	$2b$10$c8na2/Qc9meoqRas31J7LOyPYANr558VS6YyzKMRt5pPHGntiqdkK	2026-06-10 16:07:31.273	\N	François max guillion 	\N	USER	\N	\N	\N	f	f	\N
cmq8qomn200002h1ck4ruh6zk	damasclaudehenry@gmail.com	$2b$10$PBum4CFB/sSjeBJvjGs4bOIiF00zX5wa6Qilt6cuqZOAULGSLCyYS	2026-06-11 00:08:19.358	\N	Claude Henry DAMAS 	\N	USER	\N	\N	\N	f	f	\N
cmq772mjb0002pxuodunvxjd0	jensclyftonchristy@gmail.com	$2b$10$0m6q5IYjrUE0TciNeuFv4u4koHragsqPZrvmVWI6OZKMM9pilHpZS	2026-06-09 22:11:33.911		TANISMA Jens Clyfton Christy	Ing informatique 💻	USER	\N	\N	\N	f	f	\N
cmqbl7url0002o330ayew4j0m	nidasaintfleur@gmail.com	$2b$10$XhldP8bZlVKPnY4a3/q3c.5b7HeE3EKUO9xif.1LiQCZTK3OJhQcq	2026-06-12 23:58:37.186	\N	Selimon Nida saint fleur 	\N	USER	\N	\N	\N	f	f	\N
cmqcc04730002129timdmbu4e	judefrantz18@gmail.com	$2b$10$wAg8oJSmgX8CpAL81jPR/.SBMfHl4yo9RkrUDIoZHdENvDmrUJYcq	2026-06-13 12:28:25.792	\N	Jude Pierre	\N	USER	\N	\N	\N	f	f	\N
cmqe1yibx0003129tp8v5rwkp	churchface07@gmail.com	$2b$10$zTq.2jRKcIxXYh/3FIOG9OTYcakuBb5WASL9ReD9KU4ZH8M74RNOC	2026-06-14 17:22:46.989	\N	Church Face	\N	USER	\N	\N	\N	f	f	\N
cmqfqc5r8000011rrsw26a8p5	churchface26@gmail.com	$2b$10$aczGk.UE1r4btp22fplKmu5p8S4oe2A6aihTS3TnljVxlwcVdCBfO	2026-06-15 21:33:00.836	\N	ChurchFace	\N	USER	\N	\N	\N	f	f	\N
cmqh5zzqw0000x9wzxdb4c02i	sidrackjosue@gmail..com	$2b$10$SXH1mSsB6F/EZHVtINQVQu2zrcrb2/lm0OQfHyM/qMcF9qkBXk8I2	2026-06-16 21:39:13.208	\N	Josue sidrack	\N	USER	\N	\N	\N	f	f	\N
cmqk21mao00001dj663osgrex	oseesteloi90@gmail.com	$2b$10$Ei0I9uuV6BpkX09X8Fc85O6K/35Bn0beQXI8fFHk01.eO9gqLZLci	2026-06-18 22:11:49.152	\N	ST-Eloi Osée	\N	USER	\N	\N	\N	f	f	\N
cmq77acgv0006pxuov2w22d15	pascaleliphete1992@gmail.com	$2b$10$HSY1Q44SRZj4lEVwj5rDYeT649P1cUBQse6IXxNXPdFprmk4uX6wS	2026-06-09 22:17:34.112		IT solution	C'est une entreprise informatique qui forme des jeunes et qui donne des solutions à des pannes techniques	USER	\N	\N	\N	f	f	\N
\.


--
-- Data for Name: UserFollow; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserFollow" (id, "followerId", "followingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2a7cac9a-de11-42a2-a67d-903f435fa7b0	851be5b763061c048ea914bb71368c184ba3cb2c0babeeb6b898628d0adec402	2026-06-16 22:47:42.636011+00	20260616222658_add_friendship_and_user_fields	\N	\N	2026-06-16 22:47:42.621109+00	1
d834780a-0a2e-46b3-8442-c5b47898cc1a	74ff07c2a40417ac9fc509a39b11fa6bb4526b4ded526f8caf8cf46aafa53be4	2026-06-09 18:38:13.8245+00	20260522184151_init	\N	\N	2026-06-09 18:38:13.812461+00	1
5f3deb3f-f6bf-49f5-98b1-57b159652f8d	2a6086042c40b3ff7b008dc50269fbff9fca91ff612e95df03fa4981cab78421	2026-06-09 18:38:13.912201+00	20260523155712_chat_system	\N	\N	2026-06-09 18:38:13.82814+00	1
5c8e0f93-315d-4a0c-bcc5-d300689bb206	a0801e3b6090292fcde459e9362770e4ac197f19fd82782333cbcc19c7111e9c	2026-06-09 18:38:14.004395+00	20260523193313_add_search	\N	\N	2026-06-09 18:38:13.915791+00	1
b615e084-6497-4cb1-b792-97c20d58cd80	4a71804ab02760210b8a8f843982f96390de96d20e6fdf8dddec720510684d52	\N	20260620165710_add_user_follow	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260620165710_add_user_follow\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "isHidden" of relation "Comment" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"isHidden\\" of relation \\"Comment\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7686), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260620165710_add_user_follow"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260620165710_add_user_follow"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-07-07 13:31:20.768937+00	2026-06-20 17:09:53.269086+00	0
3b20f92e-257c-42d4-8fcf-0e57afc1c578	663d4fc9488166df5ba4b863c3f27cbaf0516514da43dc5a08d9abd3e13486a5	2026-06-09 18:38:14.022162+00	20260523195956_notifications	\N	\N	2026-06-09 18:38:14.009479+00	1
60031dce-90b8-4a64-ad5f-02f50e88b52d	99b82d55ae3d6ac70b6ad80265fdd4b90d3005e4f4cfe63900246e5e5861b55d	2026-07-07 13:31:21.087904+00	20260620165710_add_user_follow		\N	2026-07-07 13:31:21.087904+00	0
d3d68715-c671-4119-a827-2b68e8d02ad4	d9ab6725cf5ee6871a85ae314c0c55f6a25dc85628da4c020ee8613c45e7526b	2026-06-09 18:38:14.03835+00	20260523200527_notifications_fixed	\N	\N	2026-06-09 18:38:14.026062+00	1
05f1bb0e-bfa6-48c5-aa53-97c7fc8212ca	4978301906f3efc9f09aeaa93924faf4fc58e52aa38da63ba33e84f5385e9317	2026-06-09 18:38:14.118126+00	20260523212837_posts	\N	\N	2026-06-09 18:38:14.042195+00	1
e9d52094-eeae-471f-926d-092fd90df0b2	614d902ca0592a02164546b2dca24952e9524e257e3acc9aab549fb5d3f90252	2026-06-09 18:38:14.218702+00	20260523215400_init	\N	\N	2026-06-09 18:38:14.122518+00	1
076dda5b-61a0-4823-ae71-0bc51889d086	597fa185544127575fb0675177c02220ebbabca5961d198b1d37113605c47c69	2026-07-07 13:34:59.534662+00	202607040001_add_generated_fields_to_churchpost	\N	\N	2026-07-07 13:34:58.384504+00	1
b7530b09-7b12-4585-96eb-fb9f9cfc8e53	6125de31a02c66c7f9b12cc1ddb9a295c6fdd69dfdd6066ef8c3033016a1b41d	2026-06-09 18:38:14.404563+00	20260524173334_full_social_system	\N	\N	2026-06-09 18:38:14.222463+00	1
1fe277b3-379f-4675-9837-a52a45fc5223	be48806f1ace708f52251aa9209d0be07b2d17bfea618f01a935f075edc292bd	2026-06-09 18:38:14.513183+00	20260524195201_init	\N	\N	2026-06-09 18:38:14.408367+00	1
67ffddb8-4f81-4d26-9957-492f0753c5de	e10ad9a8fa343d84cec2b9cf2b392f210b994f79ff1bb5cf1b06b9d1a6bcfe96	2026-06-09 18:38:14.529571+00	20260526181004_new	\N	\N	2026-06-09 18:38:14.516675+00	1
67ca5162-647a-4b18-bfd1-306d445dc162	5ce6ad914d6ac5166423e9c42d7308a5d63e2ec917d6370ecb8dfcc0b40f9d5e	2026-06-09 18:38:14.627392+00	20260601131218_add_user_role	\N	\N	2026-06-09 18:38:14.605336+00	1
ccc186cb-cb50-4e64-9a2b-7566a5bf4148	75b97b18d75f9af0adb310ed3fbc17ad437e83359df2c6c66f383b8f5745ee34	2026-06-12 18:18:44.71206+00	20260612155831_add_notification_fields	\N	\N	2026-06-12 18:18:44.085267+00	1
e5a0d14e-d7c3-4843-9be6-0d30a0e56d3f	44569d5d435c1323a7940f50a5b477d574f901de5b9cbad2659d47abfd1ccdb8	2026-06-16 22:47:42.617569+00	20260612211133_add_friendship_system	\N	\N	2026-06-16 22:47:42.504729+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AdminLog AdminLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminLog"
    ADD CONSTRAINT "AdminLog_pkey" PRIMARY KEY (id);


--
-- Name: AudioTrack AudioTrack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudioTrack"
    ADD CONSTRAINT "AudioTrack_pkey" PRIMARY KEY (id);


--
-- Name: ChatMember ChatMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMember"
    ADD CONSTRAINT "ChatMember_pkey" PRIMARY KEY (id);


--
-- Name: Chat Chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY (id);


--
-- Name: ChurchAdmin ChurchAdmin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchAdmin"
    ADD CONSTRAINT "ChurchAdmin_pkey" PRIMARY KEY (id);


--
-- Name: ChurchCourseEnrollment ChurchCourseEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchCourseEnrollment"
    ADD CONSTRAINT "ChurchCourseEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: ChurchCourse ChurchCourse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchCourse"
    ADD CONSTRAINT "ChurchCourse_pkey" PRIMARY KEY (id);


--
-- Name: ChurchEventAttendee ChurchEventAttendee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchEventAttendee"
    ADD CONSTRAINT "ChurchEventAttendee_pkey" PRIMARY KEY (id);


--
-- Name: ChurchEvent ChurchEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchEvent"
    ADD CONSTRAINT "ChurchEvent_pkey" PRIMARY KEY (id);


--
-- Name: ChurchFollow ChurchFollow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchFollow"
    ADD CONSTRAINT "ChurchFollow_pkey" PRIMARY KEY (id);


--
-- Name: ChurchLive ChurchLive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchLive"
    ADD CONSTRAINT "ChurchLive_pkey" PRIMARY KEY (id);


--
-- Name: ChurchMedia ChurchMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchMedia"
    ADD CONSTRAINT "ChurchMedia_pkey" PRIMARY KEY (id);


--
-- Name: ChurchMember ChurchMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchMember"
    ADD CONSTRAINT "ChurchMember_pkey" PRIMARY KEY (id);


--
-- Name: ChurchPostComment ChurchPostComment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostComment"
    ADD CONSTRAINT "ChurchPostComment_pkey" PRIMARY KEY (id);


--
-- Name: ChurchPostLike ChurchPostLike_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostLike"
    ADD CONSTRAINT "ChurchPostLike_pkey" PRIMARY KEY (id);


--
-- Name: ChurchPost ChurchPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPost"
    ADD CONSTRAINT "ChurchPost_pkey" PRIMARY KEY (id);


--
-- Name: ChurchRadio ChurchRadio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchRadio"
    ADD CONSTRAINT "ChurchRadio_pkey" PRIMARY KEY (id);


--
-- Name: Church Church_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Church"
    ADD CONSTRAINT "Church_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Friendship Friendship_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Friendship"
    ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY (id);


--
-- Name: Like Like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_pkey" PRIMARY KEY (id);


--
-- Name: LiveBroadcast LiveBroadcast_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LiveBroadcast"
    ADD CONSTRAINT "LiveBroadcast_pkey" PRIMARY KEY (id);


--
-- Name: MessageSeen MessageSeen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageSeen"
    ADD CONSTRAINT "MessageSeen_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PlaylistItem PlaylistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlaylistItem"
    ADD CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY (id);


--
-- Name: Playlist Playlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Playlist"
    ADD CONSTRAINT "Playlist_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: PrayerChainLink PrayerChainLink_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerChainLink"
    ADD CONSTRAINT "PrayerChainLink_pkey" PRIMARY KEY (id);


--
-- Name: PrayerChain PrayerChain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerChain"
    ADD CONSTRAINT "PrayerChain_pkey" PRIMARY KEY (id);


--
-- Name: PrayerLiveRoom PrayerLiveRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerLiveRoom"
    ADD CONSTRAINT "PrayerLiveRoom_pkey" PRIMARY KEY (id);


--
-- Name: PrayerReaction PrayerReaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerReaction"
    ADD CONSTRAINT "PrayerReaction_pkey" PRIMARY KEY (id);


--
-- Name: PrayerRequest PrayerRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerRequest"
    ADD CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY (id);


--
-- Name: PrayerResponse PrayerResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerResponse"
    ADD CONSTRAINT "PrayerResponse_pkey" PRIMARY KEY (id);


--
-- Name: PrayerRoomParticipant PrayerRoomParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerRoomParticipant"
    ADD CONSTRAINT "PrayerRoomParticipant_pkey" PRIMARY KEY (id);


--
-- Name: PrayerTestimony PrayerTestimony_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerTestimony"
    ADD CONSTRAINT "PrayerTestimony_pkey" PRIMARY KEY (id);


--
-- Name: PrayerVerse PrayerVerse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerVerse"
    ADD CONSTRAINT "PrayerVerse_pkey" PRIMARY KEY (id);


--
-- Name: PreachingBookmark PreachingBookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingBookmark"
    ADD CONSTRAINT "PreachingBookmark_pkey" PRIMARY KEY (id);


--
-- Name: PreachingCategory PreachingCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingCategory"
    ADD CONSTRAINT "PreachingCategory_pkey" PRIMARY KEY (id);


--
-- Name: PreachingComment PreachingComment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingComment"
    ADD CONSTRAINT "PreachingComment_pkey" PRIMARY KEY (id);


--
-- Name: PreachingLike PreachingLike_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingLike"
    ADD CONSTRAINT "PreachingLike_pkey" PRIMARY KEY (id);


--
-- Name: PreachingNote PreachingNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingNote"
    ADD CONSTRAINT "PreachingNote_pkey" PRIMARY KEY (id);


--
-- Name: PreachingSeries PreachingSeries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingSeries"
    ADD CONSTRAINT "PreachingSeries_pkey" PRIMARY KEY (id);


--
-- Name: PreachingVerse PreachingVerse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingVerse"
    ADD CONSTRAINT "PreachingVerse_pkey" PRIMARY KEY (id);


--
-- Name: PreachingView PreachingView_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingView"
    ADD CONSTRAINT "PreachingView_pkey" PRIMARY KEY (id);


--
-- Name: Preaching Preaching_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preaching"
    ADD CONSTRAINT "Preaching_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: RadioChatMessage RadioChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RadioChatMessage"
    ADD CONSTRAINT "RadioChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: RadioSchedule RadioSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RadioSchedule"
    ADD CONSTRAINT "RadioSchedule_pkey" PRIMARY KEY (id);


--
-- Name: Radio Radio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Radio"
    ADD CONSTRAINT "Radio_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Share Share_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_pkey" PRIMARY KEY (id);


--
-- Name: StoryView StoryView_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryView"
    ADD CONSTRAINT "StoryView_pkey" PRIMARY KEY (id);


--
-- Name: Story Story_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_pkey" PRIMARY KEY (id);


--
-- Name: Stream Stream_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Stream"
    ADD CONSTRAINT "Stream_pkey" PRIMARY KEY (id);


--
-- Name: UserFollow UserFollow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFollow"
    ADD CONSTRAINT "UserFollow_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: AdminLog_action_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminLog_action_createdAt_idx" ON public."AdminLog" USING btree (action, "createdAt");


--
-- Name: AdminLog_adminId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminLog_adminId_createdAt_idx" ON public."AdminLog" USING btree ("adminId", "createdAt");


--
-- Name: AdminLog_targetType_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminLog_targetType_createdAt_idx" ON public."AdminLog" USING btree ("targetType", "createdAt");


--
-- Name: AudioTrack_isActive_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AudioTrack_isActive_createdAt_idx" ON public."AudioTrack" USING btree ("isActive", "createdAt");


--
-- Name: AudioTrack_playCount_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AudioTrack_playCount_idx" ON public."AudioTrack" USING btree ("playCount");


--
-- Name: AudioTrack_type_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AudioTrack_type_category_idx" ON public."AudioTrack" USING btree (type, category);


--
-- Name: ChatMember_userId_chatId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChatMember_userId_chatId_key" ON public."ChatMember" USING btree ("userId", "chatId");


--
-- Name: ChurchAdmin_churchId_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchAdmin_churchId_role_idx" ON public."ChurchAdmin" USING btree ("churchId", role);


--
-- Name: ChurchAdmin_churchId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchAdmin_churchId_userId_key" ON public."ChurchAdmin" USING btree ("churchId", "userId");


--
-- Name: ChurchAdmin_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchAdmin_userId_idx" ON public."ChurchAdmin" USING btree ("userId");


--
-- Name: ChurchCourseEnrollment_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchCourseEnrollment_courseId_idx" ON public."ChurchCourseEnrollment" USING btree ("courseId");


--
-- Name: ChurchCourseEnrollment_courseId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchCourseEnrollment_courseId_userId_key" ON public."ChurchCourseEnrollment" USING btree ("courseId", "userId");


--
-- Name: ChurchCourseEnrollment_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchCourseEnrollment_userId_idx" ON public."ChurchCourseEnrollment" USING btree ("userId");


--
-- Name: ChurchCourse_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchCourse_category_idx" ON public."ChurchCourse" USING btree (category);


--
-- Name: ChurchCourse_churchId_isPublished_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchCourse_churchId_isPublished_idx" ON public."ChurchCourse" USING btree ("churchId", "isPublished");


--
-- Name: ChurchCourse_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchCourse_level_idx" ON public."ChurchCourse" USING btree (level);


--
-- Name: ChurchEventAttendee_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchEventAttendee_eventId_idx" ON public."ChurchEventAttendee" USING btree ("eventId");


--
-- Name: ChurchEventAttendee_eventId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchEventAttendee_eventId_userId_key" ON public."ChurchEventAttendee" USING btree ("eventId", "userId");


--
-- Name: ChurchEventAttendee_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchEventAttendee_userId_idx" ON public."ChurchEventAttendee" USING btree ("userId");


--
-- Name: ChurchEvent_churchId_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchEvent_churchId_startDate_idx" ON public."ChurchEvent" USING btree ("churchId", "startDate");


--
-- Name: ChurchEvent_isPublic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchEvent_isPublic_idx" ON public."ChurchEvent" USING btree ("isPublic");


--
-- Name: ChurchEvent_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchEvent_startDate_idx" ON public."ChurchEvent" USING btree ("startDate");


--
-- Name: ChurchFollow_churchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchFollow_churchId_idx" ON public."ChurchFollow" USING btree ("churchId");


--
-- Name: ChurchFollow_churchId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchFollow_churchId_userId_key" ON public."ChurchFollow" USING btree ("churchId", "userId");


--
-- Name: ChurchFollow_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchFollow_userId_idx" ON public."ChurchFollow" USING btree ("userId");


--
-- Name: ChurchLive_churchId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchLive_churchId_status_idx" ON public."ChurchLive" USING btree ("churchId", status);


--
-- Name: ChurchLive_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchLive_status_idx" ON public."ChurchLive" USING btree (status);


--
-- Name: ChurchMedia_churchId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchMedia_churchId_order_idx" ON public."ChurchMedia" USING btree ("churchId", "order");


--
-- Name: ChurchMedia_churchId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchMedia_churchId_type_idx" ON public."ChurchMedia" USING btree ("churchId", type);


--
-- Name: ChurchMember_churchId_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchMember_churchId_role_idx" ON public."ChurchMember" USING btree ("churchId", role);


--
-- Name: ChurchMember_churchId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchMember_churchId_userId_key" ON public."ChurchMember" USING btree ("churchId", "userId");


--
-- Name: ChurchMember_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchMember_userId_idx" ON public."ChurchMember" USING btree ("userId");


--
-- Name: ChurchPostComment_churchPostId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPostComment_churchPostId_createdAt_idx" ON public."ChurchPostComment" USING btree ("churchPostId", "createdAt");


--
-- Name: ChurchPostComment_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPostComment_parentId_idx" ON public."ChurchPostComment" USING btree ("parentId");


--
-- Name: ChurchPostComment_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPostComment_userId_createdAt_idx" ON public."ChurchPostComment" USING btree ("userId", "createdAt");


--
-- Name: ChurchPostLike_churchPostId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPostLike_churchPostId_idx" ON public."ChurchPostLike" USING btree ("churchPostId");


--
-- Name: ChurchPostLike_churchPostId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChurchPostLike_churchPostId_userId_key" ON public."ChurchPostLike" USING btree ("churchPostId", "userId");


--
-- Name: ChurchPostLike_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPostLike_userId_idx" ON public."ChurchPostLike" USING btree ("userId");


--
-- Name: ChurchPost_churchId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPost_churchId_createdAt_idx" ON public."ChurchPost" USING btree ("churchId", "createdAt");


--
-- Name: ChurchPost_generatedType_generatedId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPost_generatedType_generatedId_idx" ON public."ChurchPost" USING btree ("generatedType", "generatedId");


--
-- Name: ChurchPost_isPinned_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchPost_isPinned_idx" ON public."ChurchPost" USING btree ("isPinned");


--
-- Name: ChurchRadio_churchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchRadio_churchId_idx" ON public."ChurchRadio" USING btree ("churchId");


--
-- Name: ChurchRadio_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChurchRadio_isActive_idx" ON public."ChurchRadio" USING btree ("isActive");


--
-- Name: Church_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Church_city_idx" ON public."Church" USING btree (city);


--
-- Name: Church_country_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Church_country_idx" ON public."Church" USING btree (country);


--
-- Name: Church_isVerified_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Church_isVerified_idx" ON public."Church" USING btree ("isVerified");


--
-- Name: Church_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Church_slug_idx" ON public."Church" USING btree (slug);


--
-- Name: Church_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Church_slug_key" ON public."Church" USING btree (slug);


--
-- Name: Comment_isHidden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_isHidden_idx" ON public."Comment" USING btree ("isHidden");


--
-- Name: Comment_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_parentId_idx" ON public."Comment" USING btree ("parentId");


--
-- Name: Comment_postId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_postId_createdAt_idx" ON public."Comment" USING btree ("postId", "createdAt");


--
-- Name: Comment_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_userId_createdAt_idx" ON public."Comment" USING btree ("userId", "createdAt");


--
-- Name: Friendship_receiverId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Friendship_receiverId_status_idx" ON public."Friendship" USING btree ("receiverId", status);


--
-- Name: Friendship_senderId_receiverId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Friendship_senderId_receiverId_key" ON public."Friendship" USING btree ("senderId", "receiverId");


--
-- Name: Friendship_senderId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Friendship_senderId_status_idx" ON public."Friendship" USING btree ("senderId", status);


--
-- Name: Friendship_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Friendship_status_createdAt_idx" ON public."Friendship" USING btree (status, "createdAt");


--
-- Name: Like_userId_postId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Like_userId_postId_key" ON public."Like" USING btree ("userId", "postId");


--
-- Name: LiveBroadcast_authorId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LiveBroadcast_authorId_status_idx" ON public."LiveBroadcast" USING btree ("authorId", status);


--
-- Name: LiveBroadcast_status_scheduledAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LiveBroadcast_status_scheduledAt_idx" ON public."LiveBroadcast" USING btree (status, "scheduledAt");


--
-- Name: LiveBroadcast_status_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LiveBroadcast_status_startedAt_idx" ON public."LiveBroadcast" USING btree (status, "startedAt");


--
-- Name: MessageSeen_messageId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MessageSeen_messageId_userId_key" ON public."MessageSeen" USING btree ("messageId", "userId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_createdAt_idx" ON public."Notification" USING btree ("userId", "createdAt");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: PlaylistItem_playlistId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PlaylistItem_playlistId_order_idx" ON public."PlaylistItem" USING btree ("playlistId", "order");


--
-- Name: Playlist_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Playlist_category_idx" ON public."Playlist" USING btree (category);


--
-- Name: Playlist_isAutoDJ_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Playlist_isAutoDJ_isActive_idx" ON public."Playlist" USING btree ("isAutoDJ", "isActive");


--
-- Name: Post_authorId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_authorId_createdAt_idx" ON public."Post" USING btree ("authorId", "createdAt");


--
-- Name: Post_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_createdAt_idx" ON public."Post" USING btree ("createdAt");


--
-- Name: Post_isHidden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_isHidden_idx" ON public."Post" USING btree ("isHidden");


--
-- Name: Post_isPinned_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_isPinned_idx" ON public."Post" USING btree ("isPinned");


--
-- Name: PrayerChainLink_chainId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerChainLink_chainId_createdAt_idx" ON public."PrayerChainLink" USING btree ("chainId", "createdAt");


--
-- Name: PrayerChainLink_chainId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrayerChainLink_chainId_userId_key" ON public."PrayerChainLink" USING btree ("chainId", "userId");


--
-- Name: PrayerChainLink_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerChainLink_userId_idx" ON public."PrayerChainLink" USING btree ("userId");


--
-- Name: PrayerChain_isActive_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerChain_isActive_createdAt_idx" ON public."PrayerChain" USING btree ("isActive", "createdAt");


--
-- Name: PrayerChain_prayerRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrayerChain_prayerRequestId_key" ON public."PrayerChain" USING btree ("prayerRequestId");


--
-- Name: PrayerLiveRoom_isActive_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerLiveRoom_isActive_createdAt_idx" ON public."PrayerLiveRoom" USING btree ("isActive", "createdAt");


--
-- Name: PrayerLiveRoom_isPublic_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerLiveRoom_isPublic_isActive_idx" ON public."PrayerLiveRoom" USING btree ("isPublic", "isActive");


--
-- Name: PrayerReaction_prayerRequestId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerReaction_prayerRequestId_type_idx" ON public."PrayerReaction" USING btree ("prayerRequestId", type);


--
-- Name: PrayerReaction_userId_prayerRequestId_type_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrayerReaction_userId_prayerRequestId_type_key" ON public."PrayerReaction" USING btree ("userId", "prayerRequestId", type);


--
-- Name: PrayerRequest_category_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerRequest_category_createdAt_idx" ON public."PrayerRequest" USING btree (category, "createdAt");


--
-- Name: PrayerRequest_isAnswered_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerRequest_isAnswered_createdAt_idx" ON public."PrayerRequest" USING btree ("isAnswered", "createdAt");


--
-- Name: PrayerRequest_isUrgent_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerRequest_isUrgent_createdAt_idx" ON public."PrayerRequest" USING btree ("isUrgent", "createdAt");


--
-- Name: PrayerRequest_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerRequest_userId_createdAt_idx" ON public."PrayerRequest" USING btree ("userId", "createdAt");


--
-- Name: PrayerResponse_prayerRequestId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerResponse_prayerRequestId_createdAt_idx" ON public."PrayerResponse" USING btree ("prayerRequestId", "createdAt");


--
-- Name: PrayerResponse_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerResponse_userId_idx" ON public."PrayerResponse" USING btree ("userId");


--
-- Name: PrayerRoomParticipant_roomId_joinedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerRoomParticipant_roomId_joinedAt_idx" ON public."PrayerRoomParticipant" USING btree ("roomId", "joinedAt");


--
-- Name: PrayerRoomParticipant_roomId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrayerRoomParticipant_roomId_userId_key" ON public."PrayerRoomParticipant" USING btree ("roomId", "userId");


--
-- Name: PrayerTestimony_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerTestimony_createdAt_idx" ON public."PrayerTestimony" USING btree ("createdAt");


--
-- Name: PrayerTestimony_prayerRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrayerTestimony_prayerRequestId_key" ON public."PrayerTestimony" USING btree ("prayerRequestId");


--
-- Name: PrayerTestimony_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerTestimony_userId_createdAt_idx" ON public."PrayerTestimony" USING btree ("userId", "createdAt");


--
-- Name: PrayerVerse_prayerRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerVerse_prayerRequestId_idx" ON public."PrayerVerse" USING btree ("prayerRequestId");


--
-- Name: PrayerVerse_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrayerVerse_userId_idx" ON public."PrayerVerse" USING btree ("userId");


--
-- Name: PreachingBookmark_preachingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingBookmark_preachingId_idx" ON public."PreachingBookmark" USING btree ("preachingId");


--
-- Name: PreachingBookmark_preachingId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PreachingBookmark_preachingId_userId_key" ON public."PreachingBookmark" USING btree ("preachingId", "userId");


--
-- Name: PreachingBookmark_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingBookmark_userId_createdAt_idx" ON public."PreachingBookmark" USING btree ("userId", "createdAt");


--
-- Name: PreachingCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PreachingCategory_name_key" ON public."PreachingCategory" USING btree (name);


--
-- Name: PreachingCategory_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingCategory_order_idx" ON public."PreachingCategory" USING btree ("order");


--
-- Name: PreachingCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PreachingCategory_slug_key" ON public."PreachingCategory" USING btree (slug);


--
-- Name: PreachingComment_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingComment_parentId_idx" ON public."PreachingComment" USING btree ("parentId");


--
-- Name: PreachingComment_preachingId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingComment_preachingId_createdAt_idx" ON public."PreachingComment" USING btree ("preachingId", "createdAt");


--
-- Name: PreachingComment_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingComment_userId_createdAt_idx" ON public."PreachingComment" USING btree ("userId", "createdAt");


--
-- Name: PreachingLike_preachingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingLike_preachingId_idx" ON public."PreachingLike" USING btree ("preachingId");


--
-- Name: PreachingLike_preachingId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PreachingLike_preachingId_userId_key" ON public."PreachingLike" USING btree ("preachingId", "userId");


--
-- Name: PreachingLike_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingLike_userId_idx" ON public."PreachingLike" USING btree ("userId");


--
-- Name: PreachingNote_preachingId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingNote_preachingId_userId_idx" ON public."PreachingNote" USING btree ("preachingId", "userId");


--
-- Name: PreachingNote_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingNote_userId_createdAt_idx" ON public."PreachingNote" USING btree ("userId", "createdAt");


--
-- Name: PreachingSeries_authorId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingSeries_authorId_createdAt_idx" ON public."PreachingSeries" USING btree ("authorId", "createdAt");


--
-- Name: PreachingVerse_book_chapter_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingVerse_book_chapter_idx" ON public."PreachingVerse" USING btree (book, chapter);


--
-- Name: PreachingVerse_preachingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingVerse_preachingId_idx" ON public."PreachingVerse" USING btree ("preachingId");


--
-- Name: PreachingView_preachingId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PreachingView_preachingId_userId_key" ON public."PreachingView" USING btree ("preachingId", "userId");


--
-- Name: PreachingView_preachingId_watchedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingView_preachingId_watchedAt_idx" ON public."PreachingView" USING btree ("preachingId", "watchedAt");


--
-- Name: PreachingView_userId_watchedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PreachingView_userId_watchedAt_idx" ON public."PreachingView" USING btree ("userId", "watchedAt");


--
-- Name: Preaching_authorId_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Preaching_authorId_publishedAt_idx" ON public."Preaching" USING btree ("authorId", "publishedAt");


--
-- Name: Preaching_categoryId_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Preaching_categoryId_publishedAt_idx" ON public."Preaching" USING btree ("categoryId", "publishedAt");


--
-- Name: Preaching_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Preaching_publishedAt_idx" ON public."Preaching" USING btree ("publishedAt");


--
-- Name: Preaching_seriesId_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Preaching_seriesId_publishedAt_idx" ON public."Preaching" USING btree ("seriesId", "publishedAt");


--
-- Name: Preaching_views_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Preaching_views_idx" ON public."Preaching" USING btree (views);


--
-- Name: PushSubscription_endpoint_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON public."PushSubscription" USING btree (endpoint);


--
-- Name: PushSubscription_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PushSubscription_userId_idx" ON public."PushSubscription" USING btree ("userId");


--
-- Name: RadioChatMessage_isPinned_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RadioChatMessage_isPinned_idx" ON public."RadioChatMessage" USING btree ("isPinned");


--
-- Name: RadioChatMessage_radioId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RadioChatMessage_radioId_createdAt_idx" ON public."RadioChatMessage" USING btree ("radioId", "createdAt");


--
-- Name: RadioSchedule_isActive_startTime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RadioSchedule_isActive_startTime_idx" ON public."RadioSchedule" USING btree ("isActive", "startTime");


--
-- Name: RadioSchedule_isLive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RadioSchedule_isLive_idx" ON public."RadioSchedule" USING btree ("isLive");


--
-- Name: RadioSchedule_radioId_startTime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RadioSchedule_radioId_startTime_idx" ON public."RadioSchedule" USING btree ("radioId", "startTime");


--
-- Name: Radio_isLive_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Radio_isLive_startedAt_idx" ON public."Radio" USING btree ("isLive", "startedAt");


--
-- Name: Radio_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Radio_userId_idx" ON public."Radio" USING btree ("userId");


--
-- Name: Report_reporterId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Report_reporterId_createdAt_idx" ON public."Report" USING btree ("reporterId", "createdAt");


--
-- Name: Report_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Report_status_createdAt_idx" ON public."Report" USING btree (status, "createdAt");


--
-- Name: Report_targetType_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Report_targetType_status_idx" ON public."Report" USING btree ("targetType", status);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Share_userId_postId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Share_userId_postId_key" ON public."Share" USING btree ("userId", "postId");


--
-- Name: StoryView_storyId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StoryView_storyId_userId_key" ON public."StoryView" USING btree ("storyId", "userId");


--
-- Name: Story_authorId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Story_authorId_createdAt_idx" ON public."Story" USING btree ("authorId", "createdAt");


--
-- Name: Story_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Story_expiresAt_idx" ON public."Story" USING btree ("expiresAt");


--
-- Name: Story_isHidden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Story_isHidden_idx" ON public."Story" USING btree ("isHidden");


--
-- Name: Stream_isLive_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Stream_isLive_startedAt_idx" ON public."Stream" USING btree ("isLive", "startedAt");


--
-- Name: Stream_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Stream_userId_idx" ON public."Stream" USING btree ("userId");


--
-- Name: UserFollow_followerId_followingId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON public."UserFollow" USING btree ("followerId", "followingId");


--
-- Name: UserFollow_followerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserFollow_followerId_idx" ON public."UserFollow" USING btree ("followerId");


--
-- Name: UserFollow_followingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserFollow_followingId_idx" ON public."UserFollow" USING btree ("followingId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AdminLog AdminLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminLog"
    ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMember ChatMember_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMember"
    ADD CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMember ChatMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMember"
    ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChurchAdmin ChurchAdmin_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchAdmin"
    ADD CONSTRAINT "ChurchAdmin_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchAdmin ChurchAdmin_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchAdmin"
    ADD CONSTRAINT "ChurchAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchCourseEnrollment ChurchCourseEnrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchCourseEnrollment"
    ADD CONSTRAINT "ChurchCourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."ChurchCourse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchCourseEnrollment ChurchCourseEnrollment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchCourseEnrollment"
    ADD CONSTRAINT "ChurchCourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchCourse ChurchCourse_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchCourse"
    ADD CONSTRAINT "ChurchCourse_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchEventAttendee ChurchEventAttendee_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchEventAttendee"
    ADD CONSTRAINT "ChurchEventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."ChurchEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchEventAttendee ChurchEventAttendee_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchEventAttendee"
    ADD CONSTRAINT "ChurchEventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchEvent ChurchEvent_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchEvent"
    ADD CONSTRAINT "ChurchEvent_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchFollow ChurchFollow_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchFollow"
    ADD CONSTRAINT "ChurchFollow_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchFollow ChurchFollow_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchFollow"
    ADD CONSTRAINT "ChurchFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchLive ChurchLive_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchLive"
    ADD CONSTRAINT "ChurchLive_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchMedia ChurchMedia_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchMedia"
    ADD CONSTRAINT "ChurchMedia_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchMember ChurchMember_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchMember"
    ADD CONSTRAINT "ChurchMember_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchMember ChurchMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchMember"
    ADD CONSTRAINT "ChurchMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPostComment ChurchPostComment_churchPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostComment"
    ADD CONSTRAINT "ChurchPostComment_churchPostId_fkey" FOREIGN KEY ("churchPostId") REFERENCES public."ChurchPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPostComment ChurchPostComment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostComment"
    ADD CONSTRAINT "ChurchPostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."ChurchPostComment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPostComment ChurchPostComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostComment"
    ADD CONSTRAINT "ChurchPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPostLike ChurchPostLike_churchPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostLike"
    ADD CONSTRAINT "ChurchPostLike_churchPostId_fkey" FOREIGN KEY ("churchPostId") REFERENCES public."ChurchPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPostLike ChurchPostLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPostLike"
    ADD CONSTRAINT "ChurchPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchPost ChurchPost_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchPost"
    ADD CONSTRAINT "ChurchPost_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChurchRadio ChurchRadio_churchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChurchRadio"
    ADD CONSTRAINT "ChurchRadio_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES public."Church"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Friendship Friendship_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Friendship"
    ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Friendship Friendship_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Friendship"
    ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Like Like_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Like Like_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LiveBroadcast LiveBroadcast_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LiveBroadcast"
    ADD CONSTRAINT "LiveBroadcast_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MessageSeen MessageSeen_messageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageSeen"
    ADD CONSTRAINT "MessageSeen_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES public."Message"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MessageSeen MessageSeen_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageSeen"
    ADD CONSTRAINT "MessageSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PlaylistItem PlaylistItem_playlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlaylistItem"
    ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES public."Playlist"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerChainLink PrayerChainLink_chainId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerChainLink"
    ADD CONSTRAINT "PrayerChainLink_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES public."PrayerChain"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerChainLink PrayerChainLink_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerChainLink"
    ADD CONSTRAINT "PrayerChainLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerChain PrayerChain_prayerRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerChain"
    ADD CONSTRAINT "PrayerChain_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES public."PrayerRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PrayerReaction PrayerReaction_prayerRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerReaction"
    ADD CONSTRAINT "PrayerReaction_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES public."PrayerRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerReaction PrayerReaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerReaction"
    ADD CONSTRAINT "PrayerReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerRequest PrayerRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerRequest"
    ADD CONSTRAINT "PrayerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerResponse PrayerResponse_prayerRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerResponse"
    ADD CONSTRAINT "PrayerResponse_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES public."PrayerRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerResponse PrayerResponse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerResponse"
    ADD CONSTRAINT "PrayerResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerRoomParticipant PrayerRoomParticipant_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerRoomParticipant"
    ADD CONSTRAINT "PrayerRoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."PrayerLiveRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerRoomParticipant PrayerRoomParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerRoomParticipant"
    ADD CONSTRAINT "PrayerRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerTestimony PrayerTestimony_prayerRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerTestimony"
    ADD CONSTRAINT "PrayerTestimony_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES public."PrayerRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerTestimony PrayerTestimony_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerTestimony"
    ADD CONSTRAINT "PrayerTestimony_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrayerVerse PrayerVerse_prayerRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerVerse"
    ADD CONSTRAINT "PrayerVerse_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES public."PrayerRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrayerVerse PrayerVerse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrayerVerse"
    ADD CONSTRAINT "PrayerVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PreachingBookmark PreachingBookmark_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingBookmark"
    ADD CONSTRAINT "PreachingBookmark_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingBookmark PreachingBookmark_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingBookmark"
    ADD CONSTRAINT "PreachingBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingComment PreachingComment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingComment"
    ADD CONSTRAINT "PreachingComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."PreachingComment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingComment PreachingComment_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingComment"
    ADD CONSTRAINT "PreachingComment_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingComment PreachingComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingComment"
    ADD CONSTRAINT "PreachingComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingLike PreachingLike_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingLike"
    ADD CONSTRAINT "PreachingLike_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingLike PreachingLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingLike"
    ADD CONSTRAINT "PreachingLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingNote PreachingNote_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingNote"
    ADD CONSTRAINT "PreachingNote_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingNote PreachingNote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingNote"
    ADD CONSTRAINT "PreachingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingSeries PreachingSeries_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingSeries"
    ADD CONSTRAINT "PreachingSeries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingVerse PreachingVerse_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingVerse"
    ADD CONSTRAINT "PreachingVerse_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingView PreachingView_preachingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingView"
    ADD CONSTRAINT "PreachingView_preachingId_fkey" FOREIGN KEY ("preachingId") REFERENCES public."Preaching"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PreachingView PreachingView_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PreachingView"
    ADD CONSTRAINT "PreachingView_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Preaching Preaching_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preaching"
    ADD CONSTRAINT "Preaching_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Preaching Preaching_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preaching"
    ADD CONSTRAINT "Preaching_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."PreachingCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Preaching Preaching_seriesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preaching"
    ADD CONSTRAINT "Preaching_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES public."PreachingSeries"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PushSubscription PushSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RadioChatMessage RadioChatMessage_radioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RadioChatMessage"
    ADD CONSTRAINT "RadioChatMessage_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES public."Radio"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RadioSchedule RadioSchedule_playlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RadioSchedule"
    ADD CONSTRAINT "RadioSchedule_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES public."Playlist"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RadioSchedule RadioSchedule_radioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RadioSchedule"
    ADD CONSTRAINT "RadioSchedule_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES public."Radio"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Radio Radio_playlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Radio"
    ADD CONSTRAINT "Radio_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES public."Playlist"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Radio Radio_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Radio"
    ADD CONSTRAINT "Radio_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Report Report_reporterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Share Share_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StoryView StoryView_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryView"
    ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public."Story"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StoryView StoryView_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryView"
    ADD CONSTRAINT "StoryView_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Story Story_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Stream Stream_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Stream"
    ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserFollow UserFollow_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFollow"
    ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserFollow UserFollow_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFollow"
    ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict F7038RvQPvNnLvngYzUofPjTztyqq8l5NpXgypeSfeag9IDhRhsH6YGd0P1cAFk

