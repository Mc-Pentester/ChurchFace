export type PrayerCategory =
  | "SANTE"
  | "FAMILLE"
  | "TRAVAIL"
  | "ETUDES"
  | "MINISTERE"
  | "FINANCES"
  | "MARIAGE"
  | "EVANGELISATION";

export type PrayerContextType =
  | "PERSONAL"
  | "CAMPAIGN"
  | "CHAIN"
  | "ROOM";

export interface PrayerRequestWithUser {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: PrayerCategory;
  isUrgent: boolean;
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;

  churchId?: string;
  prayerChainId?: string;
  prayerCampaignId?: string;
  // Integrations futures
  groupId?: string;
  ministryId?: string;
  eventId?: string;
  liveBroadcastId?: string;
  prayerRoomId?: string;
  scheduledAt?: string;
  status?: "ACTIVE" | "ANSWERED" | "ARCHIVED";
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };

  church?: {
    id: string;
    name: string;
    slug: string;
  };
  prayerChain?: {
    id: string;
    title: string;
  };
  prayerCampaign?: {
    id: string;
    title: string;
  };
  // Relations futures
  liveBroadcast?: {
    id: string;
    title: string;
  };
  prayerRoom?: {
    id: string;
    title: string;
  };
  _count?: {
    reactions: number;
    responses: number;
    verses: number;
    engagements?: number;
  };

  reactions?: PrayerReactionWithUser[];
  responses?: PrayerResponseWithUser[];
  verses?: PrayerVerseWithUser[];
  testimony?: PrayerTestimony | null;
  engagements?: PrayerEngagement[];
}

export interface PrayerReactionWithUser {
  id: string;
  type: "PRAY" | "ENCOURAGE";
  userId: string;
  createdAt: string;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerResponseWithUser {
  id: string;
  content: string;
  type: "COMMENT" | "ENCOURAGEMENT";
  userId: string;
  createdAt: string;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerVerseWithUser {
  id: string;
  reference: string;
  text: string | null;
  userId: string;
  createdAt: string;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerTestimony {
  id: string;
  content: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  createdAt: string;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// ============================================================
// PRAYER PARTICIPANTS
// ============================================================

export interface PrayerParticipant {
  id: string;
  prayerChainId: string;
  userId: string;

  role:
    | "PARTICIPANT"
    | "INTERCESSOR"
    | "MODERATOR"
    | "ADMIN";

  joinedAt: string;
  lastPrayedAt?: string | null;
  prayerCount: number;
  notificationEnabled: boolean;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// ============================================================
// PRAYER SCHEDULE
// ============================================================

export interface PrayerSchedule {
  id: string;
  prayerChainId: string;
  userId: string;
  hour: number;
  dayOfWeek?: number | null;
  isActive: boolean;
  createdAt: string;

  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// ============================================================
// PRAYER ROOMS
// ============================================================

export interface PrayerRoom {
  id: string;
  prayerChainId?: string | null;
  churchId?: string | null;
  title: string;
  description?: string | null;
  roomType: "TEXT" | "AUDIO" | "VIDEO";
  isPublic: boolean;
  isActive: boolean;
  moderatorId: string;
  maxParticipants?: number | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  createdAt: string;
  endedAt?: string | null;
  moderator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  prayerChain?: {
    id: string;
    title: string;
  };
  church?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    participants?: number;
  };
}

// ============================================================
// PRAYER CAMPAIGNS
// ============================================================

export interface PrayerCampaign {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  type: "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";
  startDate: string;
  endDate: string;
  isActive: boolean;
  churchId?: string | null;
  createdBy: string;
  createdAt: string;
  church?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    chains?: number; // @deprecated: Use campaignChains count instead
  };
  campaignChains?: PrayerCampaignChain[];
}

// ============================================================
// PRAYER ENGAGEMENTS
// ============================================================

export interface PrayerEngagement {
  id: string;
  prayerRequestId: string;
  userId: string;

  type:
    | "PRAYED"
    | "CONTINUING"
    | "ENCOURAGED"
    | "SHARED_VERSE"
    | "SHARED_TESTIMONY";

  createdAt: string;

  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// ============================================================
// PRAYER CHAIN
// ============================================================

export interface PrayerChainWithLinks {
  id: string;
  title: string;
  description: string | null;

  isActive: boolean;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" | "DELETED";
  suspendedAt?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  // Champs optionnels
  ownerId?: string | null;
  ownerType?: "USER" | "CHURCH" | "GROUP" | "MINISTRY" | "EVENT";
  churchId?: string | null;
  groupId?: string | null;
  ministryId?: string | null;
  eventId?: string | null;
  imageUrl?: string | null;
  visibility?: "PUBLIC" | "PRIVATE" | "CHURCH_ONLY" | "CHURCH_MEMBERS";
  prayerCampaignId?: string | null; // @deprecated: Use campaigns instead
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  owner?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  church?: {
    id: string;
    name: string;
    slug: string;
  };
  prayerCampaign?: {
    id: string;
    title: string;
  };
  campaigns?: PrayerCampaignChain[];
  _count?: {
    links: number;
    participants?: number;
  };

  links?: {
    id: string;
    message: string | null;
    createdAt: string;

    role?:
      | "PARTICIPANT"
      | "INTERCESSOR"
      | "MODERATOR"
      | "ADMIN";

    joinedAt?: string;
    lastPrayedAt?: string | null;
    prayerCount?: number;

    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
}

// ============================================================
// PRAYER CAMPAIGN CHAIN (Many-to-Many)
// ============================================================

export interface PrayerCampaignChain {
  id: string;
  campaignId: string;
  chainId: string;
  joinedAt: string;
  campaign?: PrayerCampaign;
  chain?: PrayerChainWithLinks;
}

export interface PrayerLiveRoomWithCount {
  id: string;
  title: string;
  description: string | null;

  isPublic: boolean;
  isActive: boolean;

  moderatorId: string;

  createdAt: string;
  endedAt: string | null;

  _count?: {
    participants: number;
  };
}

// ============================================================
// PRAYER CATEGORIES
// ============================================================

export const PRAYER_CATEGORIES: {
  key: PrayerCategory;
  label: string;
  emoji: string;
}[] = [
  {
    key: "SANTE",
    label: "Santé",
    emoji: "💊",
  },
  {
    key: "FAMILLE",
    label: "Famille",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    key: "TRAVAIL",
    label: "Travail",
    emoji: "💼",
  },
  {
    key: "ETUDES",
    label: "Études",
    emoji: "📚",
  },
  {
    key: "MINISTERE",
    label: "Ministère",
    emoji: "⛪",
  },
  {
    key: "FINANCES",
    label: "Finances",
    emoji: "💰",
  },
  {
    key: "MARIAGE",
    label: "Mariage",
    emoji: "💍",
  },
  {
    key: "EVANGELISATION",
    label: "Évangélisation",
    emoji: "📢",
  },
];

// ============================================
// TYPES UNIFIÉS PRIÈRE (PHASE 4 MIGRATION)
// ============================================

export type PrayerType = "INDIVIDUAL" | "COLLABORATIVE_CHAIN" | "COLLABORATIVE_CAMPAIGN" | "LIVE_ROOM";
export type PrayerVisibility = "PUBLIC" | "PRIVATE" | "CHURCH_MEMBERS";
export type RoomType = "TEXT" | "AUDIO" | "VIDEO";
export type CampaignType = "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";

export interface UnifiedPrayer {
  id: string;
  type: PrayerType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  visibility: PrayerVisibility | null;
  churchId: string | null;
  groupId: string | null;
  ministryId: string | null;
  eventId: string | null;
  createdBy: string;
  createdAt: string;
  
  // Champs individuels (type = "INDIVIDUAL")
  content: string | null;
  category: string | null;
  isUrgent: boolean;
  isAnswered: boolean;
  
  // Champs collaboratifs
  isActive: boolean;
  roomType: RoomType | null;
  isPublic: boolean;
  maxParticipants: number | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  endedAt: string | null;
  
  // Champs campagne (type = "COLLABORATIVE_CAMPAIGN")
  campaignType: CampaignType | null;
  startDate: string | null;
  endDate: string | null;
  
  // Relations hiérarchiques
  parentPrayerId: string | null;
  childPrayers?: UnifiedPrayer[];
  
  // Relations communes
  prayerCreator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  prayerChurch?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface UnifiedPrayerFilters {
  type?: PrayerType | "ALL";
  category?: string;
  filter?: "recent" | "popular" | "urgent" | "answered";
  churchId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
