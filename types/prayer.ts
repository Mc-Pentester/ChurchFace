export type PrayerCategory =
  | "SANTE"
  | "FAMILLE"
  | "TRAVAIL"
  | "ETUDES"
  | "MINISTERE"
  | "FINANCES"
  | "MARIAGE"
  | "EVANGELISATION";

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
  // NOUVEAUX CHAMPS pour intégrations
  groupId?: string;
  ministryId?: string;
  eventId?: string;
  liveBroadcastId?: string;
  prayerCampaignId?: string;
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
  // Relations futures (à activer quand les modèles seront créés)
  // group?: { id: string; name: string };
  // ministry?: { id: string; name: string };
  // event?: { id: string; name: string };
  liveBroadcast?: { id: string; title: string };
  prayerCampaign?: { id: string; title: string };
  prayerRoom?: { id: string; title: string };
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

// ===== NOUVEAUX TYPES POUR L'ÉVOLUTION DU MODULE PRIÈRES =====

export interface PrayerParticipant {
  id: string;
  prayerChainId: string;
  userId: string;
  role: "PARTICIPANT" | "INTERCESSOR" | "MODERATOR" | "ADMIN";
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

export interface PrayerRoom {
  id: string;
  prayerChainId?: string | null;
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
  moderator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  prayerChain?: {
    id: string;
    title: string;
  };
  _count?: {
    participants: number;
  };
}

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
    logo: string | null;
  };
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    chains: number;
  };
}

export interface PrayerEngagement {
  id: string;
  prayerRequestId: string;
  userId: string;
  type: "PRAYED" | "CONTINUING" | "SHARED_VERSE" | "ENCOURAGED";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerChainWithLinks {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  // NOUVEAUX CHAMPS
  ownerId?: string | null;
  ownerType?: "USER" | "CHURCH" | "GROUP" | "MINISTRY" | "EVENT";
  churchId?: string | null;
  groupId?: string | null;
  ministryId?: string | null;
  eventId?: string | null;
  imageUrl?: string | null;
  visibility?: "PUBLIC" | "PRIVATE" | "CHURCH_ONLY";
  prayerCampaignId?: string | null;
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
  // Relations futures (à activer quand les modèles seront créés)
  // group?: { id: string; name: string };
  // ministry?: { id: string; name: string };
  // event?: { id: string; name: string };
  prayerCampaign?: { id: string; title: string };
  _count?: {
    links: number;
    participants?: number;
  };
  links?: {
    id: string;
    message: string | null;
    createdAt: string;
    role?: "PARTICIPANT" | "INTERCESSOR" | "MODERATOR" | "ADMIN";
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

export const PRAYER_CATEGORIES: { key: PrayerCategory; label: string; emoji: string }[] = [
  { key: "SANTE", label: "Santé", emoji: "💊" },
  { key: "FAMILLE", label: "Famille", emoji: "👨‍👩‍👧‍👦" },
  { key: "TRAVAIL", label: "Travail", emoji: "💼" },
  { key: "ETUDES", label: "Études", emoji: "📚" },
  { key: "MINISTERE", label: "Ministère", emoji: "⛪" },
  { key: "FINANCES", label: "Finances", emoji: "💰" },
  { key: "MARIAGE", label: "Mariage", emoji: "💍" },
  { key: "EVANGELISATION", label: "Évangélisation", emoji: "📢" },
];
